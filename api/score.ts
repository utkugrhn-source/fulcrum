// POST /api/score?token=<CRON_SECRET>
// Re-score every article in the DB with the v0.3 formula
// (JIF × OCEBM × Recency × N × OA). Also opportunistically extracts
// PMC ID + sample size from existing rows that didn't have them at ingest.
//
// Returns rich diagnostics so we can debug without runtime logs.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient } from "./_lib/supabase-admin.js";
import { buildJournalIndex, matchJournal } from "./_lib/journals.js";
import { classifySubspecialty } from "./_lib/subspecialty.js";
import { scoreArticle } from "./_lib/scoring.js";
import { extractSampleSize } from "./_lib/pubmed.js";
import { requireCronSecret, setCors } from "./_lib/auth.js";
import type { JournalRow, PubMedArticle } from "./_lib/types.js";

interface ScoreReport {
  ok: boolean;
  rescored: number;
  journals_loaded: number;
  articles_total: number | null;
  batches: number;
  upsert_errors: string[];
  duration_ms: number;
  error?: string;
}

const PAGE_SIZE = 100;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ ok: false, error: "method not allowed" });
    return;
  }
  if (!requireCronSecret(req, res)) return;

  const t0 = Date.now();
  const report: ScoreReport = {
    ok: true,
    rescored: 0,
    journals_loaded: 0,
    articles_total: null,
    batches: 0,
    upsert_errors: [],
    duration_ms: 0,
  };

  try {
    const sb = adminClient();

    // Load journals once (small table, <100 rows).
    const { data: journals, error: jErr } = await sb
      .from("journals")
      .select("*")
      .eq("active", true);
    if (jErr) throw new Error(`journals.select: ${jErr.message}`);
    report.journals_loaded = (journals ?? []).length;
    const idx = buildJournalIndex((journals ?? []) as JournalRow[]);

    // First — get a precise count of articles so we know how many pages to walk.
    // PostgREST supports HEAD count via { count: "exact" } header.
    const { count: total, error: cErr } = await sb
      .from("articles")
      .select("pmid", { count: "exact", head: true });
    if (cErr) throw new Error(`articles.count: ${cErr.message}`);
    report.articles_total = total ?? 0;
    if (!total || total === 0) {
      report.duration_ms = Date.now() - t0;
      res.status(200).json(report);
      return;
    }

    // Walk the table in PAGE_SIZE chunks using .range() so we don't depend on
    // PostgREST's default 0-999 cap.
    const now = new Date();
    for (let offset = 0; offset < total; offset += PAGE_SIZE) {
      const { data: chunk, error: aErr } = await sb
        .from("articles")
        .select("pmid, doi, pmc_id, title, abstract, authors, journal_title_raw, publication_types, mesh_headings, keywords, pub_date, entrez_date, sample_size")
        .order("pmid", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);
      if (aErr) throw new Error(`articles.select page=${offset}: ${aErr.message}`);
      if (!chunk || chunk.length === 0) break;
      report.batches += 1;

      const updates = (chunk as Array<PubMedArticle & { journal_title_raw: string }>).map((a) => {
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
          // Pass-through identity + NOT NULL fields so the upsert's INSERT path
          // doesn't fail validation. These won't actually change on conflict.
          pmid: a.pmid,
          title: a.title,
          journal_title_raw: a.journal_title_raw,
          // Updated scoring + classification
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

      // UPDATE-only semantics via per-row .update().eq() — we don't have to
      // ship NOT NULL columns like an upsert would require. Run the chunk in
      // parallel so each batch is fast.
      const results = await Promise.all(updates.map(async (u) => {
        const { pmid, ...patch } = u;
        const { error: uErr } = await sb
          .from("articles")
          .update(patch)
          .eq("pmid", pmid);
        return uErr ? uErr.message : null;
      }));
      const errs = results.filter((m): m is string => m !== null);
      const ok = results.length - errs.length;
      report.rescored += ok;
      if (errs.length > 0) {
        report.upsert_errors.push(`page=${offset}: ${errs.length}/${results.length} failed — first error: ${errs[0]}`);
      }
    }

    report.duration_ms = Date.now() - t0;
    res.status(200).json(report);
  } catch (e) {
    report.ok = false;
    report.error = (e as Error)?.message ?? String(e);
    report.duration_ms = Date.now() - t0;
    res.status(500).json(report);
  }
}
