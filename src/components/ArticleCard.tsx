import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import type { Article } from "@/types";
import { TierBadge } from "./TierBadge";
import { ScoreBadge } from "./ScoreBadge";
import { articleTypeLabel, formatAuthors, pubmedUrl, relativeDate } from "@/lib/format";

export function ArticleCard({ article }: { article: Article }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";
  const subLabel = t(`subspecialties.${article.subspecialty}`);
  const type = articleTypeLabel(article.publication_types);

  return (
    <article className="card p-4 sm:p-5 group">
      <div className="flex items-start gap-4">
        <ScoreBadge score={article.score} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
            <TierBadge tier={article.tier} />
            <span className="pill">{subLabel}</span>
            {type && <span className="pill">{type}</span>}
            <span className="text-fg-subtle">·</span>
            <span className="text-fg-subtle">
              {article.journal_title ?? article.journal_title_raw}
            </span>
            <span className="text-fg-subtle">·</span>
            <span className="text-fg-subtle">
              {relativeDate(article.entrez_date ?? article.pub_date, lang)}
            </span>
          </div>

          <Link
            to={`/a/${article.pmid}`}
            className="block mt-2 font-serif text-[17px] leading-snug font-semibold text-fg group-hover:text-accent transition-colors"
          >
            {article.title}
          </Link>

          <p className="mt-1 text-sm text-fg-muted">
            {formatAuthors(article)}
          </p>

          {article.abstract && (
            <p className="mt-3 text-sm leading-relaxed text-fg-muted line-clamp-3">
              {article.abstract.replace(/\n+/g, " ")}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-fg-muted">
            <a
              href={pubmedUrl(article.pmid)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-accent transition-colors"
            >
              {t("card.open_pubmed")} <ExternalLink size={12} />
            </a>
            {article.doi && (
              <a
                href={`https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-accent transition-colors"
              >
                {t("card.open_doi")} <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
