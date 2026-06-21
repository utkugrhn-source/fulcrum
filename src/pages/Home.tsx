import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { listSubspecialties } from "@/lib/api";
import { supabaseConfigured } from "@/lib/supabase";
import type { Subspecialty } from "@/types";
import { useArticles } from "@/hooks/useArticles";
import { ArticleCard } from "@/components/ArticleCard";
import { PodiumTop3 } from "@/components/PodiumTop3";
import { CardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { SubspecialtyFilter } from "@/components/SubspecialtyFilter";
import { TierFilter } from "@/components/TierFilter";
import { DateFilter, type DateWindow } from "@/components/DateFilter";
import { SearchBar } from "@/components/SearchBar";

function windowToFromDate(w: DateWindow): string | undefined {
  if (w === "all") return undefined;
  const days = w === "24h" ? 1 : w === "7d" ? 7 : 30;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayFolio(lang: "tr" | "en"): { issueNo: number; dateLabel: string } {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const issueNo = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  const monthsTr = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const monthsEn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const months = lang === "tr" ? monthsTr : monthsEn;
  const dateLabel = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  return { issueNo, dateLabel };
}

export function Home() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";
  const [subs, setSubs] = useState<Subspecialty[]>([]);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<number[]>([]);
  const [dateWindow, setDateWindow] = useState<DateWindow>("7d");
  const [q, setQ] = useState("");

  useEffect(() => {
    listSubspecialties().then(setSubs).catch(() => setSubs([]));
  }, []);

  const filters = useMemo(
    () => ({
      subspecialties: selectedSubs.length ? selectedSubs : undefined,
      tiers: selectedTiers.length ? selectedTiers : undefined,
      fromDate: windowToFromDate(dateWindow),
      q: q.trim() || undefined,
      limit: 80,
    }),
    [selectedSubs, selectedTiers, dateWindow, q]
  );

  const { loading, articles, error } = useArticles(filters);
  const folio = todayFolio(lang);

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

  const podiumArticles = articles.slice(0, 3);
  const rest = articles.slice(3);
  const hasFiltersActive = selectedSubs.length || selectedTiers.length || dateWindow !== "7d" || q;

  return (
    <div>
      {/* Hero */}
      <section className="container-prose pt-8 sm:pt-10 pb-5 sm:pb-6 border-b border-brass relative">
        <div className="editorial text-[11px] tracking-[0.3em] text-blood mb-2">
          {t("hero.eyebrow")}
        </div>
        <h1 className="display text-[44px] sm:text-[60px] leading-none text-navy dark:text-cream">
          Fulcrum
        </h1>
        <div className="w-[72px] border-t-2 border-brass my-4" />
        <p className="body-serif text-[14px] sm:text-[15px] text-ink dark:text-cream/80 max-w-xl leading-relaxed">
          {t("app.subtitle")}
        </p>
        <Link
          to={`/issue/${new Date().toISOString().slice(0, 10)}`}
          className="sm:absolute sm:top-10 sm:right-7 mt-3 sm:mt-0 editorial text-[10.5px] sm:text-[11px] tracking-[0.25em] text-ink dark:text-leaf sm:text-right leading-relaxed hover:text-brass transition-colors block"
          title={lang === "tr" ? "Bu sayıyı arşivde gör" : "View this issue in archive"}
        >
          {t("hero.folioPrefix")} {folio.issueNo}
          <br />
          {folio.dateLabel}
        </Link>
      </section>

      {/* Podium — top 3 */}
      {!loading && podiumArticles.length > 0 && <PodiumTop3 articles={podiumArticles} />}

      {/* Filters */}
      <section className="container-prose py-4 border-b border-brass">
        <div className="flex flex-col gap-2.5">
          {/* Row: search + clear */}
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="editorial text-[10px] tracking-[0.3em] text-ink dark:text-leaf min-w-[60px] hidden sm:block">
              {t("filters.search")}
            </label>
            <SearchBar value={q} onChange={setQ} />
            {hasFiltersActive ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedSubs([]);
                  setSelectedTiers([]);
                  setDateWindow("7d");
                  setQ("");
                }}
                className="editorial text-[10px] tracking-[0.2em] text-blood hover:text-navy dark:hover:text-cream transition-colors"
              >
                {t("filters.clear")}
              </button>
            ) : null}
          </div>

          {/* Row: subspecialty */}
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="editorial text-[10px] tracking-[0.3em] text-ink dark:text-leaf min-w-[60px] hidden sm:block">
              {t("filters.subspecialty")}
            </label>
            <SubspecialtyFilter options={subs} selected={selectedSubs} onChange={setSelectedSubs} />
          </div>

          {/* Row: tier + date */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
              <label className="editorial text-[10px] tracking-[0.3em] text-ink dark:text-leaf min-w-[60px] hidden sm:block">
                {t("filters.tier")}
              </label>
              <TierFilter selected={selectedTiers} onChange={setSelectedTiers} />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="editorial text-[10px] tracking-[0.3em] text-ink dark:text-leaf hidden sm:block">
                {t("filters.date")}
              </label>
              <DateFilter selected={dateWindow} onChange={setDateWindow} />
            </div>
          </div>
        </div>
      </section>

      {/* List header */}
      <div className="container-prose pt-5 sm:pt-6 pb-1 flex items-baseline justify-between">
        <span className="editorial text-[12px] tracking-[0.3em] text-blood font-medium">
          {t("list.title")}
        </span>
        <span className="editorial text-[10.5px] tracking-[0.2em] text-ink-2 dark:text-leaf">
          {articles.length} {lang === "tr" ? "KAYIT" : "RECORDS"}
        </span>
      </div>

      {/* List */}
      <section className="container-prose py-3 pb-12">
        {loading && (
          <ul className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <li key={i}><CardSkeleton /></li>)}
          </ul>
        )}

        {!loading && error && <EmptyState title="Error" body={error} />}

        {!loading && !error && articles.length === 0 && <EmptyState />}

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
