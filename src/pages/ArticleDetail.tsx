import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getArticle } from "@/lib/api";
import type { Article } from "@/types";
import { articleTypeLabel, decodeEntities, formatAuthors, pubmedUrl } from "@/lib/format";
import { ShareBar } from "@/components/ShareBar";

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
    return <div className="container-prose py-8 body-serif italic text-ink dark:text-leaf">…</div>;
  }
  if (error || !article) {
    return (
      <div className="container-prose py-8">
        <Link to="/" className="editorial text-[11px] tracking-[0.2em] text-blood hover:text-navy dark:hover:text-cream inline-flex items-center gap-1">
          <ArrowLeft size={14} /> {t("detail.back")}
        </Link>
        <div className="mt-4 body-serif italic text-ink dark:text-leaf">{error ?? "Not found."}</div>
      </div>
    );
  }
  const type = articleTypeLabel(article.publication_types);

  const card = "bg-navy text-cream rounded-sm border-l-4 border-l-brass px-5 sm:px-6 py-5";
  const cardLight = "bg-cream-2 dark:bg-navy-2 border border-brass rounded-sm px-5 sm:px-6 py-5";

  return (
    <div className="container-prose py-6 sm:py-8">
      <Link to="/" className="editorial text-[11px] tracking-[0.2em] text-blood hover:text-navy dark:hover:text-cream inline-flex items-center gap-1">
        <ArrowLeft size={14} /> {t("detail.back")}
      </Link>

      <header className="mt-5 flex flex-col sm:flex-row items-start gap-5">
        <div className="text-right pt-1 shrink-0 sm:order-2 sm:ml-auto">
          <div className="editorial text-[10px] tracking-[0.3em] text-ink-2 dark:text-leaf">
            {t("card.score")}
          </div>
          <div className="font-serif italic font-bold text-[44px] sm:text-[52px] leading-none text-blood mt-1">
            {Math.round(article.score)}
          </div>
        </div>
        <div className="sm:order-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-serif italic font-bold text-[13px] text-navy dark:text-cream border border-brass bg-brass/20 px-2 py-[1px] rounded-sm">
              T{article.tier ?? "—"}
            </span>
            <span className="editorial text-[11px] tracking-[0.2em] text-blood font-medium">
              {t(`subspecialties.${article.subspecialty}`)}
            </span>
            {type && (
              <span className="editorial text-[10.5px] tracking-[0.15em] text-ink-2 dark:text-leaf">
                · {type}
              </span>
            )}
          </div>
          <h1 className="display text-[28px] sm:text-[36px] leading-tight text-navy dark:text-cream">
            {decodeEntities(article.title)}
          </h1>
          <div className="mt-3 body-serif italic text-[14px] text-ink dark:text-cream/80">
            {formatAuthors(article, 8)}
          </div>
          <div className="mt-1 body-serif text-[13.5px] text-ink-2 dark:text-leaf">
            <span className="italic">{article.journal_title ?? article.journal_title_raw}</span>
            {article.pub_date && <> · {article.pub_date}</>}
          </div>
          <div className="mt-3 flex items-center gap-4 editorial text-[11px] tracking-[0.15em]">
            <a href={pubmedUrl(article.pmid)} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-blood hover:text-navy dark:hover:text-cream">
              PUBMED <ExternalLink size={11} />
            </a>
            {article.doi && (
              <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1 text-blood hover:text-navy dark:hover:text-cream">
                DOI <ExternalLink size={11} />
              </a>
            )}
          </div>
          <div className="mt-3">
            <ShareBar article={article} />
          </div>
        </div>
      </header>

      <section className={`mt-6 ${cardLight}`}>
        <h2 className="editorial text-[11px] tracking-[0.3em] text-blood mb-3">{t("detail.abstract")}</h2>
        {article.abstract ? (
          <div className="body-serif whitespace-pre-line text-ink dark:text-cream/80 leading-relaxed text-[14.5px]">
            {decodeEntities(article.abstract)}
          </div>
        ) : (
          <div className="body-serif italic text-ink-2 dark:text-leaf">{t("card.no_abstract")}</div>
        )}
      </section>

      <section className={`mt-4 ${card}`}>
        <h2 className="editorial text-[11px] tracking-[0.3em] text-brass mb-4">{t("detail.scoring_breakdown")}</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <dt className="editorial text-[9px] tracking-[0.25em] text-leaf">{t("detail.jif_weight")}</dt>
            <dd className="mt-1 font-mono text-[14px] text-cream">×{Number(article.jif_weight).toFixed(2)}</dd>
            {article.journal_if != null && (
              <div className="editorial text-[9px] tracking-[0.18em] text-leaf/70 mt-0.5">IF {Number(article.journal_if).toFixed(1)}</div>
            )}
          </div>
          <div>
            <dt className="editorial text-[9px] tracking-[0.25em] text-leaf">{t("detail.ocebm_weight")}</dt>
            <dd className="mt-1 font-mono text-[14px] text-cream">×{Number(article.ocebm_weight ?? article.type_weight).toFixed(2)}</dd>
            {article.ocebm_level && (
              <div className="editorial text-[9px] tracking-[0.18em] text-leaf/70 mt-0.5">OCEBM {article.ocebm_level}</div>
            )}
          </div>
          <div>
            <dt className="editorial text-[9px] tracking-[0.25em] text-leaf">{t("detail.n_weight")}</dt>
            <dd className="mt-1 font-mono text-[14px] text-cream">×{Number(article.n_weight ?? 1).toFixed(2)}</dd>
            {article.sample_size != null && (
              <div className="editorial text-[9px] tracking-[0.18em] text-leaf/70 mt-0.5">N = {article.sample_size}</div>
            )}
          </div>
          <div>
            <dt className="editorial text-[9px] tracking-[0.25em] text-leaf">{t("detail.recency_weight")}</dt>
            <dd className="mt-1 font-mono text-[14px] text-cream">×{Number(article.recency_weight).toFixed(2)}</dd>
          </div>
          <div>
            <dt className="editorial text-[9px] tracking-[0.25em] text-leaf">{t("detail.oa_bonus")}</dt>
            <dd className="mt-1 font-mono text-[14px] text-cream">×{Number(article.oa_bonus ?? 1).toFixed(2)}</dd>
            {article.pmc_id && (
              <a href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${article.pmc_id}/`} target="_blank" rel="noopener noreferrer"
                 className="editorial text-[9px] tracking-[0.18em] text-leaf/70 hover:text-brass mt-0.5 inline-block">
                {article.pmc_id}
              </a>
            )}
          </div>
          <div>
            <dt className="editorial text-[9px] tracking-[0.25em] text-leaf">{t("detail.final_score")}</dt>
            <dd className="mt-1 font-serif italic font-bold text-blood text-[24px] leading-none">{Math.round(article.score)}</dd>
            <div className="editorial text-[9px] tracking-[0.18em] text-leaf/70 mt-1">T{article.tier ?? "—"}</div>
          </div>
        </dl>
        <div className="mt-4 pt-3 border-t border-brass/30 editorial text-[10px] tracking-[0.18em] text-leaf/80 font-mono">
          score = JIF × OCEBM × Recency × N × OA × 100
        </div>
      </section>

      {article.mesh_headings.length > 0 && (
        <section className={`mt-4 ${cardLight}`}>
          <h2 className="editorial text-[11px] tracking-[0.3em] text-blood mb-3">{t("detail.mesh")}</h2>
          <div className="flex flex-wrap gap-1.5">
            {article.mesh_headings.map((m) => (
              <span key={m} className="pill text-[11px]">{m}</span>
            ))}
          </div>
        </section>
      )}

      {article.keywords.length > 0 && (
        <section className={`mt-4 ${cardLight}`}>
          <h2 className="editorial text-[11px] tracking-[0.3em] text-blood mb-3">{t("detail.keywords")}</h2>
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
