import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Article } from "@/types";
import { articleTypeLabel, decodeEntities, formatAuthors, relativeDate } from "@/lib/format";

interface Props { article: Article; rank: number }

export function ArticleCard({ article, rank }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";
  const subLabel = t(`subspecialties.${article.subspecialty}`);
  const type = articleTypeLabel(article.publication_types);
  const isT3 = article.tier === 3;

  return (
    <Link
      to={`/a/${article.pmid}`}
      className={`group block rounded-sm border-l-4 bg-navy hover:bg-navy-2 text-cream px-5 py-4 transition-colors ${
        isT3 ? "border-l-ink-2" : "border-l-brass hover:border-l-blood"
      }`}
    >
      <div className="grid grid-cols-[58px_minmax(0,1fr)_60px] sm:grid-cols-[72px_minmax(0,1fr)_68px] gap-3 sm:gap-5 items-start">
        {/* Rank */}
        <div
          className={`font-serif italic font-bold text-[32px] sm:text-[40px] leading-none pt-1 ${
            isT3 ? "text-leaf" : "text-brass"
          }`}
        >
          <span className="text-[12px] align-[10px] mr-0.5">№</span>
          {String(rank).padStart(2, "0")}
        </div>

        {/* Body */}
        <div className="min-w-0">
          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`font-serif italic font-bold text-[12px] px-2 py-[1px] rounded-sm border ${
                isT3 ? "text-leaf border-ink-2" : "text-brass border-brass bg-brass/[.12]"
              }`}
            >
              T{article.tier ?? "—"}
            </span>
            <span className="font-mono text-[10.5px] tracking-[0.18em] text-brass uppercase">
              {subLabel}
            </span>
            {type && (
              <span className="font-mono text-[10.5px] tracking-[0.15em] text-leaf uppercase">
                · {type}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="body-serif font-semibold text-[15px] sm:text-[16.5px] leading-tight text-cream mb-1.5 -tracking-[0.005em]">
            {decodeEntities(article.title)}
          </h3>

          {/* Authors */}
          <p className="body-serif italic text-[12.5px] text-cream/70 mb-2">
            {formatAuthors(article, 4)}
          </p>

          {/* Foot */}
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-mono text-[10.5px] tracking-[0.05em] pt-2 border-t border-navy-3 text-cream/55">
            <span className="text-leaf uppercase">
              {article.journal_title ?? article.journal_title_raw}
            </span>
            <span className="text-ink-2">·</span>
            <span>{relativeDate(article.entrez_date ?? article.pub_date, lang)}</span>
            <span className="text-ink-2">·</span>
            <span className="text-brass group-hover:text-cream transition-colors">
              {t("card.open_pubmed")}
            </span>
            {article.doi && (
              <>
                <span className="text-ink-2">·</span>
                <span className="text-brass group-hover:text-cream transition-colors">
                  {t("card.open_doi")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="text-right pt-1">
          <div className="font-mono text-[9px] tracking-[0.25em] text-cream/55 uppercase">
            {t("card.score")}
          </div>
          <div
            className={`font-serif italic font-bold text-[24px] sm:text-[28px] leading-none mt-1 ${
              isT3 ? "text-leaf" : "text-brass"
            }`}
          >
            {Math.round(article.score)}
          </div>
        </div>
      </div>
    </Link>
  );
}
