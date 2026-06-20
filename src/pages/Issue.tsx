import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronLeft, ChevronRight, Archive as ArchiveIcon } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { supabaseConfigured } from "@/lib/supabase";
import { ArticleCard } from "@/components/ArticleCard";
import { PodiumTop3 } from "@/components/PodiumTop3";
import { CardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function shiftDay(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

function issueNumberForDate(iso: string): number {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  if (!y || !m || !d) return 0;
  const start = new Date(Date.UTC(y, 0, 0));
  const date = new Date(Date.UTC(y, m - 1, d));
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

function formatDate(iso: string, lang: "tr" | "en"): string {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  if (!y || !m || !d) return iso;
  const monthsTr = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const monthsEn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${d} ${(lang === "tr" ? monthsTr : monthsEn)[m - 1]} ${y}`;
}

export function Issue() {
  const { date = "" } = useParams<{ date: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  const isValid = DATE_RE.test(date);

  const filters = useMemo(
    () => ({ entrezDate: isValid ? date : undefined, limit: 100 }),
    [date, isValid]
  );

  const { loading, articles, error } = useArticles(filters);

  if (!isValid) return <Navigate to="/archive" replace />;

  if (!supabaseConfigured) {
    return (
      <div className="container-prose py-10">
        <EmptyState
          title={t("state.supabase_missing_title")}
          body={t("state.supabase_missing_body")}
        />
      </div>
    );
  }

  const today = todayIso();
  const isToday = date === today;
  const isFuture = date > today;
  const prev = shiftDay(date, -1);
  const next = isFuture || isToday ? null : shiftDay(date, +1);

  const podiumArticles = articles.slice(0, 3);
  const rest = articles.slice(3);

  const navBtn = "inline-flex items-center gap-1 editorial text-[11px] tracking-[0.18em] text-brass hover:text-cream border border-brass/40 hover:border-brass hover:bg-brass rounded-sm px-2.5 py-1 transition-colors";
  const navBtnDisabled = "inline-flex items-center gap-1 editorial text-[11px] tracking-[0.18em] text-ink-2/40 dark:text-leaf/40 border border-divider/30 rounded-sm px-2.5 py-1 cursor-not-allowed";

  return (
    <div>
      <section className="container-prose pt-7 sm:pt-9 pb-6 border-b border-divider">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Link to="/archive" className="editorial text-[11px] tracking-[0.22em] text-blood hover:text-navy dark:hover:text-cream inline-flex items-center gap-1">
            <ArrowLeft size={14} /> {lang === "tr" ? "ARŞİVE DÖN" : "BACK TO ARCHIVE"}
          </Link>
        </div>
        <div className="editorial text-[11px] tracking-[0.3em] text-blood font-medium">
          {lang === "tr" ? "ARŞİV" : "ARCHIVE"} · FOLIO I · {lang === "tr" ? "NO." : "NO."} {issueNumberForDate(date)}
        </div>
        <h1 className="display text-[44px] sm:text-[56px] leading-none text-navy dark:text-cream mt-2">
          {formatDate(date, lang)}
        </h1>
        <div className="w-[72px] border-t-2 border-brass my-4" />
        <p className="body-serif text-[14px] sm:text-[15px] text-ink dark:text-cream/80 max-w-xl leading-relaxed">
          {lang === "tr"
            ? `Bu sayı, PubMed'in ${formatDate(date, "tr")} tarihinde indekslediği ortopedi makalelerini içerir, skora göre sıralanmıştır.`
            : `This issue lists orthopaedic articles PubMed indexed on ${formatDate(date, "en")}, ranked by score.`}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link to={`/issue/${prev}`} className={navBtn}>
            <ChevronLeft size={12} />
            {formatDate(prev, lang).toUpperCase()}
          </Link>
          {next ? (
            <Link to={`/issue/${next}`} className={navBtn}>
              {formatDate(next, lang).toUpperCase()}
              <ChevronRight size={12} />
            </Link>
          ) : (
            <span className={navBtnDisabled} aria-disabled>
              {lang === "tr" ? "DAHA YENİ YOK" : "NO NEWER"}
              <ChevronRight size={12} />
            </span>
          )}
          {!isToday && (
            <Link to="/" className={navBtn}>
              {lang === "tr" ? "BUGÜNE GİT" : "JUMP TO TODAY"} →
            </Link>
          )}
          <Link to="/archive" className="inline-flex items-center gap-1 editorial text-[11px] tracking-[0.18em] text-ink-2 dark:text-leaf hover:text-brass transition-colors ml-auto">
            <ArchiveIcon size={12} />
            {lang === "tr" ? "TÜM SAYILAR" : "ALL ISSUES"}
          </Link>
        </div>
      </section>

      {/* Podium top 3 */}
      {!loading && podiumArticles.length > 0 && <PodiumTop3 articles={podiumArticles} />}

      {/* List header */}
      <div className="container-prose pt-5 sm:pt-6 pb-1 flex items-baseline justify-between">
        <span className="editorial text-[12px] tracking-[0.3em] text-blood font-medium">
          {t("list.title")}
        </span>
        <span className="editorial text-[10.5px] tracking-[0.2em] text-ink-2 dark:text-leaf">
          {articles.length} {lang === "tr" ? "KAYIT" : "RECORDS"}
        </span>
      </div>

      <section className="container-prose py-3 pb-12">
        {loading && (
          <ul className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <li key={i}><CardSkeleton /></li>)}
          </ul>
        )}
        {!loading && error && <EmptyState title="Error" body={error} />}
        {!loading && !error && articles.length === 0 && (
          <EmptyState
            title={lang === "tr" ? "Bu gün kayıt yok" : "No records for this day"}
            body={lang === "tr"
              ? "PubMed o gün ortopedi alanında yeni makale indekslememiş olabilir veya cron o sayı için çalışmadan önce."
              : "PubMed may not have indexed any orthopaedic article that day, or the daily cron didn't capture this issue."}
          />
        )}
        {!loading && !error && rest.length > 0 && (
          <ul className="space-y-3">
            {rest.map((a, idx) => (
              <li key={a.pmid}>
                <ArticleCard article={a} rank={idx + 4} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
