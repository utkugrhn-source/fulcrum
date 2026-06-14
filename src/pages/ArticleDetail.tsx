import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getArticle } from "@/lib/api";
import type { Article } from "@/types";
import { TierBadge } from "@/components/TierBadge";
import { ScoreBadge } from "@/components/ScoreBadge";
import { articleTypeLabel, formatAuthors, pubmedUrl } from "@/lib/format";

export function ArticleDetail() {
  const { pmid = "" } = useParams();
  const { t } = useTranslation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getArticle(pmid)
      .then((a) => setArticle(a))
      .catch((e) => setError(e?.message ?? String(e)))
      .finally(() => setLoading(false));
  }, [pmid]);

  if (loading) {
    return <div className="container-prose py-8 text-fg-muted">…</div>;
  }
  if (error || !article) {
    return (
      <div className="container-prose py-8">
        <Link to="/" className="text-sm text-fg-muted hover:text-fg inline-flex items-center gap-1">
          <ArrowLeft size={14} /> {t("detail.back")}
        </Link>
        <div className="mt-4 text-fg-muted">{error ?? "Not found."}</div>
      </div>
    );
  }
  const type = articleTypeLabel(article.publication_types);
  return (
    <div className="container-prose py-6 sm:py-8">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg inline-flex items-center gap-1">
        <ArrowLeft size={14} /> {t("detail.back")}
      </Link>

      <header className="mt-4 flex items-start gap-4">
        <ScoreBadge score={article.score} />
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
            <TierBadge tier={article.tier} />
            <span className="pill">{t(`subspecialties.${article.subspecialty}`)}</span>
            {type && <span className="pill">{type}</span>}
          </div>
          <h1 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold leading-tight text-fg">
            {article.title}
          </h1>
          <div className="mt-2 text-sm text-fg-muted">
            {formatAuthors(article, 8)}
          </div>
          <div className="mt-1 text-sm text-fg-muted">
            <span className="italic">{article.journal_title ?? article.journal_title_raw}</span>
            {article.pub_date && <> · {article.pub_date}</>}
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <a href={pubmedUrl(article.pmid)} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-accent hover:underline">
              PubMed <ExternalLink size={12} />
            </a>
            {article.doi && (
              <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1 text-accent hover:underline">
                DOI <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </header>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="font-serif text-lg font-semibold mb-3">{t("detail.abstract")}</h2>
        {article.abstract ? (
          <div className="prose-fulcrum whitespace-pre-line text-fg-muted leading-relaxed">
            {article.abstract}
          </div>
        ) : (
          <div className="text-fg-subtle italic">{t("card.no_abstract")}</div>
        )}
      </section>

      <section className="card mt-4 p-5">
        <h2 className="font-serif text-lg font-semibold mb-3">{t("detail.scoring_breakdown")}</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-fg-subtle text-xs uppercase tracking-wide">{t("detail.tier_label")}</dt>
            <dd className="mt-1 font-mono">T{article.tier ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle text-xs uppercase tracking-wide">{t("detail.type_weight")}</dt>
            <dd className="mt-1 font-mono">×{article.type_weight}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle text-xs uppercase tracking-wide">{t("detail.recency_weight")}</dt>
            <dd className="mt-1 font-mono">×{article.recency_weight}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle text-xs uppercase tracking-wide">{t("detail.final_score")}</dt>
            <dd className="mt-1 font-mono text-accent text-lg">{Math.round(article.score)}</dd>
          </div>
        </dl>
      </section>

      {article.mesh_headings.length > 0 && (
        <section className="card mt-4 p-5">
          <h2 className="font-serif text-lg font-semibold mb-3">{t("detail.mesh")}</h2>
          <div className="flex flex-wrap gap-1.5">
            {article.mesh_headings.map((m) => (
              <span key={m} className="pill text-[11px]">{m}</span>
            ))}
          </div>
        </section>
      )}

      {article.keywords.length > 0 && (
        <section className="card mt-4 p-5">
          <h2 className="font-serif text-lg font-semibold mb-3">{t("detail.keywords")}</h2>
          <div className="flex flex-wrap gap-1.5">
            {article.keywords.map((k) => (
              <span key={k} className="pill text-[11px]">{k}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
