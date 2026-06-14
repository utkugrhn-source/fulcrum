// POST /api/score — re-score every article already in the DB.
// Useful when journal tiers change or the formula is tweaked.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient } from "./_lib/supabase-admin.js";
import { buildJournalIndex, matchJournal } from "./_lib/journals.js";
import { classifySubspecialty } from "./_lib/subspecialty.js";
import { scoreArticle } from "./_lib/scoring.js";
import { requireCronSecret, setCors } from "./_lib/auth.js";
import type { JournalRow, PubMedArticle } from "./_lib/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ ok: false, error: "method not allowed" });
    return;
  }
  if (!requireCronSecret(req, res)) return;

  const sb = adminClient();
  const { data: journals, error: jErr } = await sb.from("journals").select("*").eq("active", true);
  if (jErr) { res.status(500).json({ ok: false, error: jErr.message }); return; }
  const idx = buildJournalIndex((journals ?? []) as JournalRow[]);

  const { data: articles, error: aErr } = await sb
    .from("articles")
    .select("pmid, doi, title, abstract, authors, journal_title_raw, publication_types, mesh_headings, keywords, pub_date, entrez_date");
  if (aErr) { res.status(500).json({ ok: false, error: aErr.message }); return; }
  if (!articles || articles.length === 0) {
    res.status(200).json({ ok: true, rescored: 0 });
    return;
  }

  const now = new Date();
  let rescored = 0;
  for (let i = 0; i < articles.length; i += 100) {
    const chunk = articles.slice(i, i + 100) as Array<PubMedArticle & { journal_title_raw: string }>;
    const updates = chunk.map((a) => {
      const journal = matchJournal(idx, { title_raw: a.journal_title_raw });
      const cls = classifySubspecialty(a, journal);
      const s = scoreArticle({ article: a, tier: journal?.tier ?? null, now });
      return {
        pmid: a.pmid,
        journal_id: journal?.id ?? null,
        tier: s.tier,
        type_weight: s.type_weight,
        recency_weight: s.recency_weight,
        score: s.score,
        subspecialty: cls.slug,
        subspecialty_source: cls.source,
        scored_at: new Date().toISOString(),
      };
    });
    const { error } = await sb.from("articles").upsert(updates, { onConflict: "pmid" });
    if (!error) rescored += updates.length;
  }

  res.status(200).json({ ok: true, rescored });
}
