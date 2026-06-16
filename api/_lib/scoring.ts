// Fulcrum scoring formula — v0.3 (evidence-based).
//
//   score = JIF × OCEBM × Recency × N × OA × 100
//
// References (see docs/SCORING.md for the full write-up):
//   - OCEBM Levels of Evidence (Oxford CEBM)
//   - Wu et al., 2015, PMC4320734 — applicability equation
//   - 2024 JCR Impact Factor data for orthopaedic journals
//
// Each weight is clamped so a single signal can not dominate.

import type { PubMedArticle, Tier, OcebmLevel } from "./types.js";

// ---------------------------------------------------------------------------
// JIF weight — derived from the journal's JCR Impact Factor.
// Log-curve so a 4×IF difference isn't a 4× score difference.
// Fallback to tier when IF is missing.
//   IF=0  → 0.30
//   IF=1  → 0.40
//   IF=3  → 0.65
//   IF=6  → 0.92
//   IF=10 → 1.10
//   IF=15 → 1.25
//   capped at 1.50
// ---------------------------------------------------------------------------
export function jifWeight(impactFactor: number | null, tier: Tier | null): number {
  if (impactFactor === null || impactFactor === undefined) {
    if (tier === 1) return 1.10;
    if (tier === 2) return 0.80;
    if (tier === 3) return 0.55;
    return 0.40;
  }
  const w = 0.30 + 0.32 * Math.log2(impactFactor + 1);
  return round3(Math.min(1.50, Math.max(0.25, w)));
}

// ---------------------------------------------------------------------------
// OCEBM weight + level — mapped from MEDLINE publication types.
// ---------------------------------------------------------------------------
const OCEBM_FROM_PUBTYPE: Array<[string, OcebmLevel, number]> = [
  ["Meta-Analysis",                 "1a", 1.50],
  ["Systematic Review",             "1a", 1.40],
  ["Randomized Controlled Trial",   "1b", 1.40],
  ["Practice Guideline",            "1a", 1.35],
  ["Guideline",                     "1a", 1.30],
  ["Clinical Trial, Phase III",     "1b", 1.30],
  ["Clinical Trial, Phase II",      "2a", 1.15],
  ["Multicenter Study",             "2a", 1.15],
  ["Clinical Trial",                "2a", 1.10],
  ["Comparative Study",             "2b", 1.05],
  ["Observational Study",           "2b", 1.00],
  ["Review",                        "3",  0.95],
  ["Journal Article",               "3",  0.90],
  ["Case Reports",                  "4",  0.70],
  ["Editorial",                     "5",  0.55],
  ["Letter",                        "5",  0.50],
  ["Comment",                       "5",  0.50],
  ["Published Erratum",             "5",  0.20],
];

export function ocebmFromTypes(types: string[]): { level: OcebmLevel | null; weight: number } {
  if (!types || types.length === 0) return { level: "3", weight: 0.85 };
  const lc = new Set(types.map((t) => t.toLowerCase()));
  let best: { level: OcebmLevel | null; weight: number } = { level: null, weight: 0 };
  for (const [label, level, weight] of OCEBM_FROM_PUBTYPE) {
    if (lc.has(label.toLowerCase()) && weight > best.weight) {
      best = { level, weight };
    }
  }
  if (best.weight === 0) return { level: "3", weight: 0.85 };
  return best;
}

// ---------------------------------------------------------------------------
// Recency weight — unchanged from v0.1.
// ---------------------------------------------------------------------------
export function recencyWeight(article: PubMedArticle, now: Date): number {
  const dateStr = article.entrez_date ?? (article.pub_date ? `${article.pub_date}T00:00:00.000Z` : null);
  if (!dateStr) return 0.50;
  const t = new Date(dateStr).getTime();
  if (isNaN(t)) return 0.50;
  const hours = Math.max(0, (now.getTime() - t) / 3_600_000);

  if (hours <= 24) return 1.50;
  if (hours <= 72) return 1.30;
  if (hours <= 168) return 1.20;
  if (hours <= 720) return 1.00;
  if (hours <= 2160) {
    const k = (hours - 720) / (2160 - 720);
    return Math.max(0.40, 0.85 - k * 0.45);
  }
  return 0.30;
}

// ---------------------------------------------------------------------------
// Sample size weight — meaningful for clinical studies.
//   N < 30   → 0.80
//   N = 100  → 0.95
//   N = 500  → 1.02
//   N = 2000 → 1.08
//   N ≥ 10000→ 1.15
//   missing  → 1.00 (no penalty)
// ---------------------------------------------------------------------------
export function sampleSizeWeight(n: number | null | undefined): number {
  if (n === null || n === undefined || !Number.isFinite(n) || n <= 0) return 1.00;
  if (n < 30) return 0.80;
  const w = 0.70 + 0.10 * Math.log10(n + 1);
  return round3(Math.min(1.25, Math.max(0.80, w)));
}

// ---------------------------------------------------------------------------
// Open access bonus — PMC full-text = ×1.08
// ---------------------------------------------------------------------------
export function oaBonus(pmcId: string | null | undefined): number {
  return pmcId ? 1.08 : 1.00;
}

// ---------------------------------------------------------------------------
// Composer.
// ---------------------------------------------------------------------------
export interface ScoreInput {
  article: PubMedArticle;
  tier: Tier | null;
  impact_factor: number | null;
  now: Date;
}

export interface ScoreOutput {
  tier: Tier | null;
  jif_weight: number;
  ocebm_level: OcebmLevel | null;
  ocebm_weight: number;
  recency_weight: number;
  n_weight: number;
  oa_bonus: number;
  /** Backward-compatibility alias equal to ocebm_weight. */
  type_weight: number;
  score: number;
}

export function scoreArticle(input: ScoreInput): ScoreOutput {
  const jif = jifWeight(input.impact_factor, input.tier);
  const { level, weight: ocebm } = ocebmFromTypes(input.article.publication_types);
  const rec = recencyWeight(input.article, input.now);
  const n = sampleSizeWeight(input.article.sample_size);
  const oa = oaBonus(input.article.pmc_id);
  const raw = jif * ocebm * rec * n * oa * 100;

  return {
    tier: input.tier,
    jif_weight: jif,
    ocebm_level: level,
    ocebm_weight: round3(ocebm),
    recency_weight: round3(rec),
    n_weight: round3(n),
    oa_bonus: round3(oa),
    type_weight: round3(ocebm),
    score: round2(raw),
  };
}

/** Legacy export kept so any callers that still import `typeWeight` continue to compile. */
export function typeWeight(publicationTypes: string[]): number {
  return ocebmFromTypes(publicationTypes).weight;
}

function round2(n: number): number { return Math.round(n * 100) / 100; }
function round3(n: number): number { return Math.round(n * 1000) / 1000; }
