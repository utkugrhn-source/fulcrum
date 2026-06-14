// Fulcrum scoring formula.
//
//   score = tier_weight * type_weight * recency_weight * 100
//
// EM Pulse uses the same multiplicative composition. We tune the constants
// so a "fresh RCT in a T1 journal" reliably tops the list (~225)
// and "month-old editorial in a T3" floors near 5.

import type { PubMedArticle, Tier } from "./types.js";

export interface ScoreInput {
  article: PubMedArticle;
  tier: Tier | null;
  now: Date;
}

export interface ScoreOutput {
  tier: Tier | null;
  type_weight: number;
  recency_weight: number;
  score: number;
}

// ---------------------------------------------------------------------------
// Tier weights.  Generalist T1 journals get a small bump over T2 to reflect
// real readership/citation patterns.
// ---------------------------------------------------------------------------
const TIER_WEIGHT: Record<1 | 2 | 3, number> = {
  1: 1.50,
  2: 1.10,
  3: 0.75,
};
// Articles whose journal we couldn't match drop to a soft default.
const UNKNOWN_TIER_WEIGHT = 0.50;

// ---------------------------------------------------------------------------
// MEDLINE Publication Type → weight.
// We keep the highest matching weight per article (an RCT also tagged
// "Comparative Study" should not be penalised).
// ---------------------------------------------------------------------------
const TYPE_WEIGHT_TABLE: Array<[string, number]> = [
  ["Randomized Controlled Trial", 1.50],
  ["Meta-Analysis",               1.40],
  ["Systematic Review",           1.30],
  ["Practice Guideline",          1.25],
  ["Guideline",                   1.20],
  ["Clinical Trial, Phase III",   1.20],
  ["Clinical Trial, Phase II",    1.10],
  ["Clinical Trial",              1.10],
  ["Multicenter Study",           1.10],
  ["Comparative Study",           1.05],
  ["Observational Study",         1.00],
  ["Journal Article",             0.95],
  ["Review",                      0.95],   // narrative review — lower than systematic
  ["Case Reports",                0.70],
  ["Editorial",                   0.60],
  ["Letter",                      0.50],
  ["Comment",                     0.50],
  ["Published Erratum",           0.20],
];

export function typeWeight(publicationTypes: string[]): number {
  if (publicationTypes.length === 0) return 0.90;
  let best = 0;
  const lc = new Set(publicationTypes.map((t) => t.toLowerCase()));
  for (const [label, w] of TYPE_WEIGHT_TABLE) {
    if (lc.has(label.toLowerCase())) {
      if (w > best) best = w;
    }
  }
  return best || 0.90;
}

// ---------------------------------------------------------------------------
// Recency.  We use Entrez date when present (more reliable for "appeared on
// PubMed"), falling back to pub_date.
//
//    0..24h  → 1.50
//   24..72h  → 1.30
//   3..7d    → 1.20
//   7..30d   → 1.00
//   30..90d  → exp decay from 0.85 → 0.40
//   >90d     → 0.30
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
    // 30..90 days: linear decay 0.85 → 0.40
    const k = (hours - 720) / (2160 - 720);
    return Math.max(0.40, 0.85 - k * 0.45);
  }
  return 0.30;
}

// ---------------------------------------------------------------------------
// Final composer.
// ---------------------------------------------------------------------------
export function scoreArticle(input: ScoreInput): ScoreOutput {
  const tw = input.tier ? TIER_WEIGHT[input.tier] : UNKNOWN_TIER_WEIGHT;
  const typew = typeWeight(input.article.publication_types);
  const recw = recencyWeight(input.article, input.now);
  const raw = tw * typew * recw * 100;
  return {
    tier: input.tier,
    type_weight: round3(typew),
    recency_weight: round3(recw),
    score: round2(raw),
  };
}

function round2(n: number): number { return Math.round(n * 100) / 100; }
function round3(n: number): number { return Math.round(n * 1000) / 1000; }
