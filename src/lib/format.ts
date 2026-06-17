import type { Article } from "@/types";

export function formatAuthors(article: Article, max = 3): string {
  const list = article.authors ?? [];
  if (list.length === 0) return "—";
  const names = list.map((a) => {
    const last = a.last_name ?? "";
    const initials = a.initials ?? "";
    return [last, initials].filter(Boolean).join(" ");
  });
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} et al.`;
}

export function pubmedUrl(pmid: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
}

export function doiUrl(doi: string | null): string | null {
  if (!doi) return null;
  return `https://doi.org/${doi}`;
}

export function relativeDate(iso: string | null, locale: "en" | "tr"): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "—";
  const diffMs = Date.now() - t;
  const hr = diffMs / 3_600_000;
  if (hr < 24) {
    const h = Math.max(1, Math.round(hr));
    return locale === "tr" ? `${h} saat önce` : `${h}h ago`;
  }
  const days = Math.round(hr / 24);
  if (days < 30) {
    return locale === "tr" ? `${days} gün önce` : `${days}d ago`;
  }
  const months = Math.round(days / 30);
  if (months < 12) {
    return locale === "tr" ? `${months} ay önce` : `${months}mo ago`;
  }
  const years = Math.round(months / 12);
  return locale === "tr" ? `${years} yıl önce` : `${years}y ago`;
}

/**
 * Decode HTML entities found in PubMed abstracts.
 * PubMed XML preserves numeric character references like &#x2009; (thin space),
 * &#x003C; (<), &#x2265; (≥), etc., which React renders as literal text.
 * Also handles a handful of named entities.
 */
const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&apos;": "'",
  "&nbsp;": " ",
  "&ndash;": "–",
  "&mdash;": "—",
  "&hellip;": "…",
  "&deg;": "°",
  "&plusmn;": "±",
  "&times;": "×",
  "&middot;": "·",
  "&alpha;": "α",
  "&beta;": "β",
  "&gamma;": "γ",
  "&delta;": "δ",
  "&mu;": "μ",
  "&omega;": "ω",
  "&le;": "≤",
  "&ge;": "≥",
  "&ne;": "≠",
  "&minus;": "−",
};

export function decodeEntities(text: string | null | undefined): string {
  if (!text) return "";
  return text
    // hex numeric: &#x2009; &#x003C; etc.
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const cp = parseInt(hex, 16);
      return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : "";
    })
    // decimal numeric: &#8201; etc.
    .replace(/&#(\d+);/g, (_, dec) => {
      const cp = parseInt(dec, 10);
      return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : "";
    })
    // named entities
    .replace(/&[a-zA-Z]+;/g, (m) => NAMED_ENTITIES[m] ?? m);
}

export function articleTypeLabel(types: string[]): string | null {
  const priority = [
    "Randomized Controlled Trial",
    "Meta-Analysis",
    "Systematic Review",
    "Clinical Trial",
    "Practice Guideline",
    "Case Reports",
    "Editorial",
    "Letter",
    "Review",
  ];
  const set = new Set(types);
  for (const p of priority) if (set.has(p)) return p;
  return types[0] ?? null;
}
