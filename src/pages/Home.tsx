import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { listSubspecialties } from "@/lib/api";
import { supabaseConfigured } from "@/lib/supabase";
import type { Subspecialty } from "@/types";
import { useArticles } from "@/hooks/useArticles";
import { ArticleCard } from "@/components/ArticleCard";
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

export function Home() {
  const { t } = useTranslation();
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

  return (
    <div className="container-prose py-6 sm:py-8">
      <section className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-fg">
          {t("app.title")}
        </h1>
        <p className="mt-2 text-fg-muted max-w-2xl">{t("app.subtitle")}</p>
      </section>

      <section className="space-y-4 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={q} onChange={setQ} />
          <button
            type="button"
            onClick={() => {
              setSelectedSubs([]);
              setSelectedTiers([]);
              setDateWindow("7d");
              setQ("");
            }}
            className="text-xs text-fg-subtle hover:text-fg transition-colors"
          >
            {t("filters.clear")}
          </button>
        </div>
        <SubspecialtyFilter options={subs} selected={selectedSubs} onChange={setSelectedSubs} />
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <TierFilter selected={selectedTiers} onChange={setSelectedTiers} />
          <DateFilter selected={dateWindow} onChange={setDateWindow} />
        </div>
      </section>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && (
        <EmptyState title="Error" body={error} />
      )}

      {!loading && !error && articles.length === 0 && <EmptyState />}

      {!loading && !error && articles.length > 0 && (
        <ul className="space-y-3">
          {articles.map((a) => (
            <li key={a.pmid}><ArticleCard article={a} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
