// POST /api/score — re-score every article already in the DB with the v0.3
// formula (JIF × OCEBM × Recency × N × OA). Also opportunistically extracts
// PMC ID + sample size from existing rows that didn't have them at ingest.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient } from "./_lib/supabase-admin.js";
import { buildJournalIndex, matchJournal } from "./_lib/journals.js";
import { classifySubspecialty } from "./_lib/subspecialty.js";
import { scoreArticle } from "./_lib/scoring.js";
import { extractSampleSize } from "./_lib/pubmed.js";
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
    .select("pmid, doi, pmc_id, title, abstract, authors, journal_title_raw, publication_types, mesh_headings, keywords, pub_date, entrez_date, sample_size");
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
      const n = a.sample_size ?? extractSampleSize(a.abstract);
      const enriched = { ...a, sample_size: n };
      const s = scoreArticle({
        article: enriched,
        tier: journal?.tier ?? null,
        impact_factor: journal?.impact_factor ?? null,
        now,
      });
      return {
        pmid: a.pmid,
        journal_id: journal?.id ?? null,
        sample_size: n ?? null,
        tier: s.tier,
        ocebm_level: s.ocebm_level,
        type_weight: s.type_weight,
        ocebm_weight: s.ocebm_weight,
        jif_weight: s.jif_weight,
        n_weight: s.n_weight,
        oa_bonus: s.oa_bonus,
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
