import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Article, OcebmLevel } from "@/types";
import { articleTypeLabel, decodeEntities, formatAuthors, relativeDate } from "@/lib/format";

interface Props { articles: Article[] }

type Position = 1 | 2 | 3;

const POSITION_RING: Record<Position, string> = {
  1: "#9E2A2B",     // blood red ring for № 1
  2: "#B89968",     // brass ring for № 2
  3: "#8E7A4D",     // dimmed brass / bronze for № 3
};

const POSITION_INNER: Record<Position, string> = {
  1: "#B89968",     // brass face
  2: "#C5BDA0",     // leaf face
  3: "#8E7A4D",     // dimmed brass face
};

function Medal({ pos, size = 56 }: { pos: Position; size?: number }) {
  const ringColor = POSITION_RING[pos];
  const innerColor = POSITION_INNER[pos];
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label={`№ ${pos}`}>
      <polygon points="20,40 28,52 36,40" fill={ringColor} opacity="0.85" />
      <polygon points="22,40 28,49 34,40" fill={ringColor} />
      <circle cx="28" cy="22" r="18" fill={ringColor} />
      <circle cx="28" cy="22" r="14.5" fill={innerColor} />
      <circle cx="28" cy="22" r="14.5" fill="none" stroke="#F4ECDB" strokeWidth="0.8" />
      <text
        x="28"
        y="28"
        textAnchor="middle"
        fontFamily="Source Serif Pro, Georgia, serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="18"
        fill="#0F2540"
      >
        {pos}
      </text>
    </svg>
  );
}

function ocebmLabel(level: OcebmLevel | null): string | null {
  if (!level) return null;
  return `OCEBM ${level}`;
}

function FeatureCard({ article, pos }: { article: Article; pos: Position }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";
  const sub = t(`subspecialties.${article.subspecialty}`);
  const type = articleTypeLabel(article.publication_types);
  const ocebm = ocebmLabel(article.ocebm_level);
  const note = article.abstract
    ? decodeEntities(article.abstract).replace(/\s+/g, " ").trim().slice(0, 220) + "…"
    : formatAuthors(article, 6);

  return (
    <Link
      to={`/a/${article.pmid}`}
      className="group block bg-cream-2 dark:bg-navy-2 border border-brass rounded-sm px-5 sm:px-6 py-5 hover:border-blood transition-colors"
    >
      <div className="grid grid-cols-[64px_minmax(0,1fr)_92px] gap-4 items-start">
        <Medal pos={pos} size={64} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-serif italic font-bold text-[13px] text-navy dark:text-cream border border-brass bg-brass/20 px-2 py-[1px] rounded-sm">
              T{article.tier ?? "—"}
            </span>
            <span className="editorial text-[11px] tracking-[0.2em] text-blood font-medium">
              {sub}
            </span>
            {type && (
              <span className="editorial text-[10.5px] tracking-[0.15em] text-ink-2 dark:text-leaf">
                · {type}
              </span>
            )}
            {ocebm && (
              <span className="editorial text-[10.5px] tracking-[0.15em] text-ink-2 dark:text-leaf">
                · {ocebm}
              </span>
            )}
          </div>
          <h2 className="body-serif font-bold text-[20px] sm:text-[23px] leading-snug text-navy dark:text-cream mb-2 -tracking-[0.01em] group-hover:text-blood transition-colors">
            {decodeEntities(article.title)}
          </h2>
          <p className="body-serif italic text-[13px] text-ink dark:text-cream/70 leading-relaxed max-w-[460px] line-clamp-3">
            {note}
          </p>
          <div className="flex flex-wrap gap-2 mt-3 editorial text-[10.5px] tracking-[0.12em] text-ink-2 dark:text-leaf">
            <span>{(article.journal_title ?? article.journal_title_raw).toUpperCase()}</span>
            <span>·</span>
            <span>{relativeDate(article.entrez_date ?? article.pub_date, lang)}</span>
          </div>
        </div>
        <div className="text-right pt-1">
          <div className="editorial text-[10px] tracking-[0.3em] text-ink-2 dark:text-leaf">
            {t("card.score")}
          </div>
          <div className="font-serif italic font-bold text-[40px] sm:text-[44px] leading-none text-blood mt-1">
            {Math.round(article.score)}
          </div>
        </div>
      </div>
    </Link>
  );
}

function MiniCard({ article, pos }: { article: Article; pos: Position }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";
  const sub = t(`subspecialties.${article.subspecialty}`);

  return (
    <Link
      to={`/a/${article.pmid}`}
      className="group flex bg-navy dark:bg-navy-2 text-cream border-l-4 border-l-brass rounded-sm px-4 py-3.5 gap-3 hover:border-l-blood transition-colors"
    >
      <Medal pos={pos} size={42} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-serif italic font-bold text-[11.5px] text-brass border border-brass bg-brass/[.12] px-1.5 py-[1px] rounded-sm">
            T{article.tier ?? "—"}
          </span>
          <span className="editorial text-[10px] tracking-[0.18em] text-brass">
            {sub.toUpperCase()}
          </span>
        </div>
        <h3 className="body-serif font-semibold text-[14.5px] leading-snug text-cream group-hover:text-brass transition-colors line-clamp-2">
          {decodeEntities(article.title)}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 editorial text-[10px] tracking-[0.1em] text-cream/55">
          <span className="text-leaf truncate max-w-[160px]">
            {(article.journal_title ?? article.journal_title_raw).toUpperCase()}
          </span>
          <span>·</span>
          <span>{relativeDate(article.entrez_date ?? article.pub_date, lang)}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="editorial text-[9px] tracking-[0.25em] text-cream/55">
          {t("card.score")}
        </div>
        <div className="font-serif italic font-bold text-[22px] leading-none text-brass mt-1">
          {Math.round(article.score)}
        </div>
      </div>
    </Link>
  );
}

export function PodiumTop3({ articles }: Props) {
  const { t } = useTranslation();
  if (!articles || articles.length === 0) return null;
  const [first, second, third] = articles;

  return (
    <section className="bg-cream dark:bg-navy border-b border-brass px-5 sm:px-7 py-6">
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <span className="editorial text-[11px] tracking-[0.3em] text-blood font-medium">
          ★ {t("podium.title")}
        </span>
        <span className="text-brass">·</span>
        <span className="editorial text-[11px] tracking-[0.2em] text-ink-2 dark:text-leaf">
          {t("podium.context")}
        </span>
      </div>

      {first && <FeatureCard article={first} pos={1} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {second && <MiniCard article={second} pos={2} />}
        {third && <MiniCard article={third} pos={3} />}
      </div>
    </section>
  );
}
