import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Share2, Link2, Quote, Check } from "lucide-react";
import type { Article } from "@/types";
import { decodeEntities, formatAuthors } from "@/lib/format";

interface Props { article: Article }

function buildCitation(article: Article): string {
  // Vancouver-ish: Authors (up to 6 + et al). Title. Journal. Year. PMID. DOI.
  const authors = formatAuthors(article, 6);
  const title = decodeEntities(article.title).replace(/\.$/, "");
  const journal = article.journal_title ?? article.journal_title_raw;
  const year = (article.pub_date ?? article.entrez_date ?? "").slice(0, 4);
  const pmid = `PMID: ${article.pmid}`;
  const doi = article.doi ? ` doi: ${article.doi}.` : "";
  return `${authors}. ${title}. ${journal}. ${year}. ${pmid}.${doi}`;
}

export function ShareBar({ article }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  const [copiedKey, setCopiedKey] = useState<"link" | "citation" | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  // Reset the "copied" flash after 1.6s.
  useEffect(() => {
    if (!copiedKey) return;
    const id = window.setTimeout(() => setCopiedKey(null), 1600);
    return () => window.clearTimeout(id);
  }, [copiedKey]);

  const url = typeof window !== "undefined" ? window.location.href : `https://fulcrum.cyprusorthopaedics.com/a/${article.pmid}`;
  const title = decodeEntities(article.title);

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} · Fulcrum`,
          text: `${title} — Score ${Math.round(article.score)}`,
          url,
        });
      }
    } catch {
      // User canceled or unsupported — silent.
    }
  }

  async function copyText(text: string, key: "link" | "citation") {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
    } catch {
      // Last-resort: select via textarea (very old browsers).
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopiedKey(key); } catch {/* ignore */}
      document.body.removeChild(ta);
    }
  }

  const btn = "inline-flex items-center gap-1.5 editorial text-[11px] tracking-[0.15em] text-brass hover:text-cream border border-brass/40 hover:border-brass rounded-sm px-2.5 py-1 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canShare && (
        <button type="button" onClick={nativeShare} className={btn} aria-label={t("share.share")}>
          <Share2 size={12} />
          {t("share.share")}
        </button>
      )}
      <button type="button" onClick={() => copyText(url, "link")} className={btn} aria-label={t("share.copy_link")}>
        {copiedKey === "link" ? <Check size={12} /> : <Link2 size={12} />}
        {copiedKey === "link" ? t("share.copied") : t("share.copy_link")}
      </button>
      <button type="button" onClick={() => copyText(buildCitation(article), "citation")} className={btn} aria-label={t("share.copy_citation")}>
        {copiedKey === "citation" ? <Check size={12} /> : <Quote size={12} />}
        {copiedKey === "citation" ? t("share.copied") : t("share.copy_citation")}
      </button>
      <span className="sr-only" aria-live="polite">
        {copiedKey ? (lang === "tr" ? "Panoya kopyalandı" : "Copied to clipboard") : ""}
      </span>
    </div>
  );
}
