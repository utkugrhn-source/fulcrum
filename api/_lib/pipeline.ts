// End-to-end ingest + score pipeline, shared between /api/ingest, /api/score,
// /api/cron-daily and scripts/run-ingest-local.ts.

import { esearch, efetch } from "./pubmed.js";
import { buildJournalIndex, matchJournal } from "./journals.js";
import { classifySubspecialty } from "./subspecialty.js";
import { scoreArticle } from "./scoring.js";
import { adminClient } from "./supabase-admin.js";
import type { JournalRow, PubMedArticle, ScoredArticle } from "./types.js";

export interface PipelineOptions {
  reldays?: number;
  retmax?: number;
  dryRun?: boolean;
  trigger?: "cron" | "manual" | "smoke";
}

export interface PipelineResult {
  fetched: number;
  upserted: number;
  scored: number;
  topPmids: string[];
  errors: Array<{ pmid?: string; message: string }>;
}

async function fetchJournalIndex() {
  const sb = adminClient();
  const { data, error } = await sb.from("journals").select("*").eq("active", true);
  if (error) throw new Error(`journals fetch failed: ${error.message}`);
  return buildJournalIndex((data ?? []) as JournalRow[]);
}

export async function runPipeline(opts: PipelineOptions = {}): Promise<PipelineResult> {
  const trigger = opts.trigger ?? "manual";
  const sb = adminClient();
  const errors: PipelineResult["errors"] = [];

  // -------- 1. Open scoring_runs row -----------------------------------
  let runId: string | null = null;
  if (!opts.dryRun) {
    const { data: runRow, error: runErr } = await sb
      .from("scoring_runs")
      .insert({ trigger, pubmed_query: "ortho-daily" })
      .select("id")
      .single();
    if (runErr) throw new Error(`scoring_runs insert: ${runErr.message}`);
    runId = runRow!.id as string;
  }

  // -------- 2. PubMed esearch + efetch ---------------------------------
  const pmids = await esearch({
    reldays: opts.reldays ?? 2,
    retmax: opts.retmax ?? 200,
  });
  const articles = await efetch(pmids);

  // -------- 3. Match journals + classify + score -----------------------
  const idx = await fetchJournalIndex();
  const now = new Date();
  const scored: ScoredArticle[] = articles.map((a: PubMedArticle) => {
    const journal = matchJournal(idx, {
      title_raw: a.journal_title_raw,
      iso: a.journal_iso,
      issn: a.issn,
    });
    const cls = classifySubspecialty(a, journal);
    const s = scoreArticle({
      article: a,
      tier: journal?.tier ?? null,
      impact_factor: journal?.impact_factor ?? null,
      now,
    });
    return {
      ...a,
      tier: s.tier,
      type_weight: s.type_weight,
      ocebm_weight: s.ocebm_weight,
      ocebm_level: s.ocebm_level,
      jif_weight: s.jif_weight,
      n_weight: s.n_weight,
      oa_bonus: s.oa_bonus,
      recency_weight: s.recency_weight,
      score: s.score,
      subspecialty: cls.slug,
      subspecialty_source: cls.source,
      journal_id: journal?.id ?? null,
    };
  });

  // -------- 4. Persist via upsert (idempotent on PMID) -----------------
  let upserted = 0;
  if (!opts.dryRun && scored.length > 0) {
    const rows = scored.map((s) => ({
      pmid: s.pmid,
      doi: s.doi ?? null,
      pmc_id: s.pmc_id ?? null,
      title: s.title,
      abstract: s.abstract ?? null,
      authors: s.authors,
      journal_id: s.journal_id,
      journal_title_raw: s.journal_title_raw,
      publication_types: s.publication_types,
      mesh_headings: s.mesh_headings,
      keywords: s.keywords,
      pub_date: s.pub_date ?? null,
      entrez_date: s.entrez_date ?? null,
      sample_size: s.sample_size ?? null,
      tier: s.tier,
      ocebm_level: s.ocebm_level,
      type_weight: s.type_weight,
      ocebm_weight: s.ocebm_weight,
      jif_weight: s.jif_weight,
      n_weight: s.n_weight,
      oa_bonus: s.oa_bonus,
      recency_weight: s.recency_weight,
      score: s.score,
      subspecialty: s.subspecialty,
      subspecialty_source: s.subspecialty_source,
      scored_at: new Date().toISOString(),
    }));
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100);
      const { error } = await sb.from("articles").upsert(chunk, {
        onConflict: "pmid",
        ignoreDuplicates: false,
      });
      if (error) {
        errors.push({ message: `upsert chunk ${i}: ${error.message}` });
      } else {
        upserted += chunk.length;
      }
    }
  }

  // -------- 5. Close run row -------------------------------------------
  const topPmids = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.pmid);

  if (runId) {
    await sb
      .from("scoring_runs")
      .update({
        finished_at: new Date().toISOString(),
        ok: errors.length === 0,
        fetched: articles.length,
        inserted: upserted,
        updated: upserted,
        scored: scored.length,
        errors,
      })
      .eq("id", runId);
  }

  return {
    fetched: articles.length,
    upserted,
    scored: scored.length,
    topPmids,
    errors,
  };
}
