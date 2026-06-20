// Citation formatters for the reading list.
// Output is plain text — caller is responsible for downloading or copying.

import type { Article } from "@/types";
import { decodeEntities } from "@/lib/format";

function authorBibtex(a: Article): string {
  const parts = (a.authors ?? []).map((au) => {
    const last = (au.last_name ?? "").trim();
    const fore = (au.fore_name ?? au.initials ?? "").trim();
    if (!last) return fore;
    if (!fore) return last;
    return `${last}, ${fore}`;
  }).filter(Boolean);
  return parts.join(" and ");
}

function authorRis(a: Article): string[] {
  return (a.authors ?? []).map((au) => {
    const last = (au.last_name ?? "").trim();
    const fore = (au.fore_name ?? au.initials ?? "").trim();
    if (!last && !fore) return null;
    if (!last) return fore;
    if (!fore) return last;
    return `${last}, ${fore}`;
  }).filter((s): s is string => !!s);
}

function year(a: Article): string {
  return (a.pub_date ?? a.entrez_date ?? "").slice(0, 4);
}

/**
 * BibTeX entry — best-effort field mapping. Uses `@article` because PubMed
 * records are journal articles. The key is `fulcrum_<PMID>`.
 */
export function toBibtex(article: Article): string {
  const key = `fulcrum_${article.pmid}`;
  const title = decodeEntities(article.title)
    .replace(/[{}]/g, "")
    .replace(/\\/g, "\\\\");
  const authors = authorBibtex(article);
  const journal = article.journal_title ?? article.journal_title_raw;
  const yr = year(article);
  const lines = [
    `@article{${key},`,
    `  title   = {${title}},`,
    authors  ? `  author  = {${authors}},` : null,
    journal  ? `  journal = {${journal}},` : null,
    yr       ? `  year    = {${yr}},` : null,
    article.doi    ? `  doi     = {${article.doi}},` : null,
    `  pmid    = {${article.pmid}},`,
    article.pmc_id ? `  pmcid   = {${article.pmc_id}},` : null,
    `  url     = {https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/},`,
    `}`,
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * RIS entry. Compatible with Zotero, Mendeley, EndNote.
 */
export function toRis(article: Article): string {
  const lines: string[] = [];
  lines.push("TY  - JOUR");
  lines.push(`TI  - ${decodeEntities(article.title)}`);
  for (const a of authorRis(article)) lines.push(`AU  - ${a}`);
  const journal = article.journal_title ?? article.journal_title_raw;
  if (journal) {
    lines.push(`JO  - ${journal}`);
    lines.push(`T2  - ${journal}`);
  }
  const yr = year(article);
  if (yr) lines.push(`PY  - ${yr}`);
  if (article.pub_date) lines.push(`DA  - ${article.pub_date.replace(/-/g, "/")}`);
  if (article.doi)    lines.push(`DO  - ${article.doi}`);
  if (article.pmid)   lines.push(`AN  - ${article.pmid}`);
  if (article.abstract) lines.push(`AB  - ${decodeEntities(article.abstract).replace(/\s+/g, " ").trim()}`);
  for (const kw of article.keywords ?? []) lines.push(`KW  - ${kw}`);
  lines.push(`UR  - https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`);
  lines.push("ER  - ");
  return lines.join("\n");
}

/**
 * CSV row — Excel/Numbers/Sheets-friendly. One row per article.
 * Fields: pmid, score, tier, ocebm_level, subspecialty, title, authors, journal, pub_date, doi, pmc_id.
 */
export function toCsvRow(article: Article): string {
  const esc = (v: string | number | null | undefined): string => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const authors = (article.authors ?? [])
    .map((au) => [au.last_name, au.fore_name ?? au.initials].filter(Boolean).join(" "))
    .filter(Boolean)
    .join("; ");
  return [
    esc(article.pmid),
    esc(Math.round(article.score)),
    esc(article.tier ?? ""),
    esc(article.ocebm_level ?? ""),
    esc(article.subspecialty_name_en ?? article.subspecialty),
    esc(decodeEntities(article.title)),
    esc(authors),
    esc(article.journal_title ?? article.journal_title_raw),
    esc(article.pub_date ?? ""),
    esc(article.doi ?? ""),
    esc(article.pmc_id ?? ""),
  ].join(",");
}

export const CSV_HEADER = "pmid,score,tier,ocebm_level,subspecialty,title,authors,journal,pub_date,doi,pmc_id";

export function toBibtexFile(articles: Article[]): string {
  return articles.map(toBibtex).join("\n\n") + "\n";
}

export function toRisFile(articles: Article[]): string {
  return articles.map(toRis).join("\n\n") + "\n";
}

export function toCsvFile(articles: Article[]): string {
  return [CSV_HEADER, ...articles.map(toCsvRow)].join("\n") + "\n";
}

/**
 * Trigger a client-side file download with the given filename and content.
 */
export function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportFilename(prefix: string, ext: "bib" | "ris" | "csv"): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  return `${prefix}-${date}.${ext}`;
}
