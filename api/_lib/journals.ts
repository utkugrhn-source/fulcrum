// Journal matcher — given a raw journal title from PubMed, find a row in
// public.journals. We tolerate punctuation, case and abbreviation noise.

import type { JournalRow } from "./types.js";

export interface JournalIndex {
  rows: JournalRow[];
  byNormFull: Map<string, JournalRow>;
  byNormIso: Map<string, JournalRow>;
  byIssn: Map<string, JournalRow>;
}

function normalize(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildJournalIndex(rows: JournalRow[]): JournalIndex {
  const byNormFull = new Map<string, JournalRow>();
  const byNormIso = new Map<string, JournalRow>();
  const byIssn = new Map<string, JournalRow>();
  for (const r of rows) {
    byNormFull.set(normalize(r.title_full), r);
    if (r.title_iso) byNormIso.set(normalize(r.title_iso), r);
    if (r.issn_print) byIssn.set(r.issn_print, r);
    if (r.issn_electronic) byIssn.set(r.issn_electronic, r);
  }
  return { rows, byNormFull, byNormIso, byIssn };
}

export function matchJournal(
  idx: JournalIndex,
  args: { title_raw: string; iso?: string; issn?: string }
): JournalRow | null {
  if (args.issn) {
    const hit = idx.byIssn.get(args.issn);
    if (hit) return hit;
  }
  const nfull = normalize(args.title_raw);
  if (nfull) {
    const hit = idx.byNormFull.get(nfull) || idx.byNormIso.get(nfull);
    if (hit) return hit;
  }
  if (args.iso) {
    const niso = normalize(args.iso);
    const hit = idx.byNormIso.get(niso) || idx.byNormFull.get(niso);
    if (hit) return hit;
  }
  // Loose contains-match as last resort (only when raw is unusually short)
  if (nfull.length > 8) {
    for (const r of idx.rows) {
      const nf = normalize(r.title_full);
      if (nf && (nfull.includes(nf) || nf.includes(nfull))) return r;
    }
  }
  return null;
}
