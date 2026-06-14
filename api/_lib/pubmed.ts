// PubMed E-utilities client (esearch + efetch).
// Docs: https://www.ncbi.nlm.nih.gov/books/NBK25497/

import { XMLParser } from "fast-xml-parser";
import type { PubMedArticle, PubMedAuthor } from "./types.js";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

interface EutilsContext {
  apiKey?: string;
  tool: string;
  email: string;
}

function ctxFromEnv(): EutilsContext {
  return {
    apiKey: process.env.NCBI_API_KEY || undefined,
    tool: process.env.NCBI_TOOL || "fulcrum",
    email: process.env.NCBI_EMAIL || "noreply@fulcrum.local",
  };
}

function withAuth(url: URL, ctx: EutilsContext): URL {
  url.searchParams.set("tool", ctx.tool);
  url.searchParams.set("email", ctx.email);
  if (ctx.apiKey) url.searchParams.set("api_key", ctx.apiKey);
  return url;
}

// ---------------------------------------------------------------------------
// Search query — broad orthopaedic net across MeSH + free text.
// We intentionally use reldate (relative days) + datetype=edat (Entrez date)
// so each cron run sees only NEW indexings rather than weeks-old reprints.
// ---------------------------------------------------------------------------
export const ORTHO_QUERY = [
  '("Orthopedics"[MeSH Terms]',
  'OR "Orthopedic Procedures"[MeSH Terms]',
  'OR "Bone Diseases"[MeSH Terms]',
  'OR "Joint Diseases"[MeSH Terms]',
  'OR "Athletic Injuries"[MeSH Terms]',
  'OR "Arthroplasty, Replacement"[MeSH Terms]',
  'OR "Spinal Diseases"[MeSH Terms]',
  'OR "Bone Neoplasms"[MeSH Terms]',
  'OR "Fractures, Bone"[MeSH Terms]',
  'OR "Hand"[MeSH Terms:noexp]',
  'OR "Foot"[MeSH Terms:noexp]',
  'OR "Shoulder"[MeSH Terms:noexp]',
  'OR orthopedic[Title]',
  'OR orthopaedic[Title]',
  'OR arthroplasty[Title]',
  'OR arthroscopy[Title])',
].join(" ");

export interface SearchOptions {
  reldays?: number;       // default 2 (last 48h)
  retmax?: number;        // default 200
  datetype?: "edat" | "pdat";
}

export async function esearch(opts: SearchOptions = {}): Promise<string[]> {
  const ctx = ctxFromEnv();
  const url = new URL(`${EUTILS}/esearch.fcgi`);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("term", ORTHO_QUERY);
  url.searchParams.set("reldate", String(opts.reldays ?? 2));
  url.searchParams.set("datetype", opts.datetype ?? "edat");
  url.searchParams.set("retmax", String(opts.retmax ?? 200));
  url.searchParams.set("retmode", "json");
  withAuth(url, ctx);

  const res = await fetch(url.toString(), { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`esearch ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { esearchresult?: { idlist?: string[] } };
  return json.esearchresult?.idlist ?? [];
}

// ---------------------------------------------------------------------------
// efetch — pull full XML, then parse.
// We chunk to 50 IDs/request to keep responses sane.
// ---------------------------------------------------------------------------
export async function efetch(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];
  const ctx = ctxFromEnv();
  const out: PubMedArticle[] = [];
  const chunkSize = 50;

  for (let i = 0; i < pmids.length; i += chunkSize) {
    const chunk = pmids.slice(i, i + chunkSize);
    const url = new URL(`${EUTILS}/efetch.fcgi`);
    url.searchParams.set("db", "pubmed");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("retmode", "xml");
    url.searchParams.set("rettype", "abstract");
    withAuth(url, ctx);

    const res = await fetch(url.toString(), { headers: { accept: "application/xml" } });
    if (!res.ok) throw new Error(`efetch ${res.status}: ${await res.text()}`);
    const xml = await res.text();
    out.push(...parsePubmedXml(xml));

    // Throttle: 3 req/s without key, 10 req/s with key.
    if (i + chunkSize < pmids.length) {
      await new Promise((r) => setTimeout(r, ctx.apiKey ? 110 : 350));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// XML parsing.
// ---------------------------------------------------------------------------
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  isArray: (name) =>
    [
      "PubmedArticle",
      "Author",
      "PublicationType",
      "MeshHeading",
      "Keyword",
      "AbstractText",
      "ArticleId",
      "ELocationID",
    ].includes(name),
});

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function pickText(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, unknown>;
    if ("#text" in o) return String(o["#text"]);
  }
  return undefined;
}

function joinAbstract(node: unknown): string | undefined {
  if (!node || typeof node !== "object") return undefined;
  const o = node as Record<string, unknown>;
  const parts = asArray(o.AbstractText);
  if (parts.length === 0) return undefined;
  return parts
    .map((p) => {
      if (typeof p === "string") return p;
      const obj = p as Record<string, unknown>;
      const label = obj["@_Label"] as string | undefined;
      const text = obj["#text"] != null ? String(obj["#text"]) : "";
      return label ? `${label.toUpperCase()}: ${text}` : text;
    })
    .join("\n\n")
    .trim() || undefined;
}

function parsePubDate(article: any): string | undefined {
  const journal = article?.Journal?.JournalIssue?.PubDate;
  if (!journal) return undefined;
  const year = pickText(journal.Year);
  const month = pickText(journal.Month);
  const day = pickText(journal.Day);
  const medlineDate = pickText(journal.MedlineDate);
  if (year) {
    const mm = monthToNum(month) ?? "01";
    const dd = day ? day.padStart(2, "0") : "01";
    return `${year}-${mm}-${dd}`;
  }
  if (medlineDate) {
    const m = medlineDate.match(/(\d{4})/);
    if (m) return `${m[1]}-01-01`;
  }
  return undefined;
}

function monthToNum(m?: string): string | undefined {
  if (!m) return undefined;
  if (/^\d+$/.test(m)) return m.padStart(2, "0");
  const map: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  return map[m.slice(0, 3).toLowerCase()];
}

function parseEntrezDate(pubmedData: any): string | undefined {
  const hist = pubmedData?.History?.PubMedPubDate;
  if (!hist) return undefined;
  const items = asArray(hist);
  const entrez = items.find((it: any) => it?.["@_PubStatus"] === "entrez")
              ?? items.find((it: any) => it?.["@_PubStatus"] === "pubmed");
  if (!entrez) return undefined;
  const y = pickText(entrez.Year);
  const mo = pickText(entrez.Month);
  const d = pickText(entrez.Day);
  if (!y) return undefined;
  const mm = monthToNum(mo) ?? "01";
  const dd = d ? d.padStart(2, "0") : "01";
  return `${y}-${mm}-${dd}T00:00:00.000Z`;
}

function parseAuthors(authorList: any): PubMedAuthor[] {
  const items = asArray(authorList?.Author);
  return items.map((a: any) => ({
    last_name: pickText(a.LastName),
    fore_name: pickText(a.ForeName),
    initials: pickText(a.Initials),
    affiliation: pickText(a.AffiliationInfo?.Affiliation),
  }));
}

function parseMesh(meshHeadingList: any): string[] {
  const items = asArray(meshHeadingList?.MeshHeading);
  const out: string[] = [];
  for (const m of items) {
    const desc = pickText(m?.DescriptorName);
    if (desc) out.push(desc);
  }
  return out;
}

function parseKeywords(keywordList: any): string[] {
  const items = asArray(keywordList?.Keyword);
  return items.map((k) => pickText(k)).filter((s): s is string => !!s);
}

function parsePublicationTypes(ptl: any): string[] {
  const items = asArray(ptl?.PublicationType);
  return items.map((p) => pickText(p)).filter((s): s is string => !!s);
}

function parseArticleIds(pubmedData: any): { doi?: string; pmid?: string } {
  const items = asArray(pubmedData?.ArticleIdList?.ArticleId);
  let doi: string | undefined;
  let pmid: string | undefined;
  for (const it of items) {
    const idType = (it as any)["@_IdType"];
    const val = pickText(it);
    if (idType === "doi" && val) doi = val;
    if (idType === "pubmed" && val) pmid = val;
  }
  return { doi, pmid };
}

function parsePubmedXml(xml: string): PubMedArticle[] {
  const parsed = parser.parse(xml);
  const set = parsed?.PubmedArticleSet;
  const articles = asArray(set?.PubmedArticle);
  return articles
    .map((node: any) => mapArticle(node))
    .filter((a): a is PubMedArticle => a !== null);
}

function mapArticle(node: any): PubMedArticle | null {
  const med = node?.MedlineCitation;
  if (!med) return null;
  const article = med.Article;
  if (!article) return null;

  const pmid = pickText(med.PMID);
  if (!pmid) return null;

  const titleRaw = pickText(article.ArticleTitle);
  if (!titleRaw) return null;

  const journalRaw =
    pickText(article.Journal?.Title) ||
    pickText(med.MedlineJournalInfo?.MedlineTA) ||
    "Unknown Journal";

  const ids = parseArticleIds(node.PubmedData);
  const entrezDate = parseEntrezDate(node.PubmedData);

  return {
    pmid,
    doi: ids.doi,
    title: stripTrailingDot(titleRaw),
    abstract: joinAbstract(article.Abstract),
    authors: parseAuthors(article.AuthorList),
    journal_title_raw: journalRaw,
    journal_iso: pickText(article.Journal?.ISOAbbreviation),
    issn: pickText(article.Journal?.ISSN),
    publication_types: parsePublicationTypes(article.PublicationTypeList),
    mesh_headings: parseMesh(med.MeshHeadingList),
    keywords: parseKeywords(med.KeywordList),
    pub_date: parsePubDate(article),
    entrez_date: entrezDate,
  };
}

function stripTrailingDot(s: string): string {
  return s.endsWith(".") ? s.slice(0, -1) : s;
}

// Export internals so the local smoke script can re-use them.
export { parsePubmedXml };
