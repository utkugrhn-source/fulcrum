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
