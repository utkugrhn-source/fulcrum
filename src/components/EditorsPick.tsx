import { useTranslation } from "react-i18next";
import type { Article } from "@/types";
import { EditorSeal } from "./BrandMark";
import { articleTypeLabel, formatAuthors, pubmedUrl, doiUrl, relativeDate } from "@/lib/format";

interface Props { article: Article }

export function EditorsPick({ article }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";
  const subLabel = t(`subspecialties.${article.subspecialty}`);
  const type = articleTypeLabel(article.publication_types);

  const note = article.abstract
    ? article.abstract.replace(/\s+/g, " ").trim().slice(0, 240) + "…"
    : formatAuthors(article, 6);

  return (
    <section className="bg-cream-2 dark:bg-navy-2 border-b border-brass px-5 sm:px-7 py-6">
      <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
        <span className="editorial text-[11px] tracking-[0.3em] text-blood font-medium">
          ★ {t("pick.title")}
        </span>
        <span className="text-brass">·</span>
        <span className="editorial text-[11px] tracking-[0.2em] text-ink-2 dark:text-leaf">
          {t("pick.context")} · {relativeDate(article.entrez_date ?? article.pub_date, lang).toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[100px_minmax(0,1fr)_130px] gap-5 items-center">
        <EditorSeal size={84} className="shrink-0" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <span className="font-serif italic font-bold text-[13px] text-navy dark:text-cream border border-brass bg-brass/20 px-2 py-[1px] rounded-sm">
              T{article.tier ?? "—"}
            </span>
            <span className="editorial text-[11px] tracking-[0.2em] text-blood font-medium">
              {subLabel} {type ? `· ${type}` : ""}
            </span>
          </div>
          <h2 className="body-serif font-bold text-[20px] sm:text-[23px] leading-snug text-navy dark:text-cream mb-2 -tracking-[0.01em]">
            {article.title}
          </h2>
          <p className="body-serif italic text-[13.5px] text-ink dark:text-cream/70 leading-relaxed max-w-[460px]">
            {note}
          </p>
          <div className="flex flex-wrap gap-3 mt-3 editorial text-[10.5px] tracking-[0.12em] text-ink-2 dark:text-leaf">
            <a
              href={pubmedUrl(article.pmid)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blood hover:text-navy dark:hover:text-brass transition-colors"
            >
              {t("card.open_pubmed")}
            </a>
            {article.doi && (
              <>
                <span>·</span>
                <a
                  href={doiUrl(article.doi)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blood hover:text-navy dark:hover:text-brass transition-colors"
                >
                  {t("card.open_doi")}
                </a>
              </>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 sm:text-right">
          <div className="editorial text-[10px] tracking-[0.3em] text-ink-2 dark:text-leaf order-2 sm:order-1">
            {t("card.score")}
          </div>
          <div className="font-serif italic font-bold text-[40px] sm:text-[44px] leading-none text-blood order-1 sm:order-2">
            {Math.round(article.score)}
          </div>
          <div className="body-serif italic text-[12.5px] text-navy dark:text-cream sm:max-w-[120px] sm:leading-tight sm:mt-1.5 order-3">
            {article.journal_title ?? article.journal_title_raw}
          </div>
        </div>
      </div>
    </section>
  );
}
