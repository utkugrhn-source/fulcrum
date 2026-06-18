import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useReadingList } from "@/hooks/useReadingList";
import { getArticle } from "@/lib/api";
import type { Article } from "@/types";
import { ArticleCard } from "@/components/ArticleCard";
import { CardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";

export function ReadingList() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";
  const { pmids, clear } = useReadingList();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (pmids.length === 0) {
        setArticles([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetched = await Promise.all(
          pmids.map((pmid) => getArticle(pmid).catch(() => null))
        );
        if (cancelled) return;
        // Preserve user's saved-order (newest first as stored), drop nulls.
        const order = new Map(pmids.map((p, i) => [p, i]));
        const valid = fetched.filter((a): a is Article => !!a);
        valid.sort((a, b) => (order.get(a.pmid) ?? 0) - (order.get(b.pmid) ?? 0));
        setArticles(valid);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [pmids]);

  return (
    <div>
      <section className="container-prose pt-7 sm:pt-9 pb-6 border-b border-brass">
        <Link to="/" className="editorial text-[11px] tracking-[0.22em] text-blood hover:text-navy dark:hover:text-cream inline-flex items-center gap-1 mb-3">
          <ArrowLeft size={14} /> {t("detail.back")}
        </Link>
        <div className="editorial text-[11px] tracking-[0.3em] text-blood font-medium">
          {lang === "tr" ? "OKUMA LİSTESİ" : "READING LIST"}
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-3 mt-2">
          <h1 className="display text-[44px] sm:text-[56px] leading-none text-navy dark:text-cream">
            {lang === "tr" ? "Senin sayın" : "Your issue"}
          </h1>
          {pmids.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm(lang === "tr"
                  ? "Tüm okuma listesi silinsin mi?"
                  : "Clear the entire reading list?")) {
                  clear();
                }
              }}
              className="editorial text-[11px] tracking-[0.22em] text-blood hover:text-navy dark:hover:text-cream transition-colors"
            >
              {lang === "tr" ? "TÜMÜNÜ SİL" : "CLEAR ALL"}
            </button>
          )}
        </div>
        <div className="w-[72px] border-t-2 border-brass my-4" />
        <p className="body-serif text-[14px] sm:text-[15px] text-ink dark:text-cream/80 max-w-xl leading-relaxed">
          {lang === "tr"
            ? `Tarayıcında kayıtlı ${pmids.length} makale. Yalnız sen görüyorsun — sunucuda hiçbir kayıt yok, hesap da yok. Tarayıcı verisini silersen liste kaybolur.`
            : `${pmids.length} articles saved in this browser. Only you can see them — no server record, no account. Clearing browser data erases the list.`}
        </p>
      </section>

      <section className="container-prose py-5 pb-12">
        {pmids.length === 0 && (
          <EmptyState
            title={lang === "tr" ? "Liste boş" : "Empty list"}
            body={lang === "tr"
              ? "Bir makale sayfasında 'KAYDET' butonuyla makaleleri buraya ekleyebilirsin."
              : "Add articles here by pressing 'SAVE' on any article page."}
          />
        )}
        {loading && pmids.length > 0 && (
          <ul className="space-y-3">
            {Array.from({ length: Math.min(pmids.length, 4) }).map((_, i) => (
              <li key={i}><CardSkeleton /></li>
            ))}
          </ul>
        )}
        {!loading && error && <EmptyState title="Error" body={error} />}
        {!loading && articles.length > 0 && (
          <ul className="space-y-3">
            {articles.map((a, idx) => (
              <li key={a.pmid}>
                <ArticleCard article={a} rank={idx + 1} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
