import { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { listSubspecialties } from "@/lib/api";
import { supabaseConfigured } from "@/lib/supabase";
import type { SubspecialtySlug, Subspecialty } from "@/types";
import { useArticles } from "@/hooks/useArticles";
import { ArticleCard } from "@/components/ArticleCard";
import { PodiumTop3 } from "@/components/PodiumTop3";
import { CardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { TierFilter } from "@/components/TierFilter";
import { DateFilter, type DateWindow } from "@/components/DateFilter";
import { SearchBar } from "@/components/SearchBar";

const VALID_SLUGS: SubspecialtySlug[] = [
  "trauma", "sports", "arthroplasty", "spine", "pediatric",
  "hand-upper", "foot-ankle", "shoulder-elbow", "onc", "basic", "general",
];

function windowToFromDate(w: DateWindow): string | undefined {
  if (w === "all") return undefined;
  const days = w === "24h" ? 1 : w === "7d" ? 7 : 30;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export function SubspecialtyHome() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  const [subs, setSubs] = useState<Subspecialty[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<number[]>([]);
  const [dateWindow, setDateWindow] = useState<DateWindow>("30d");
  const [q, setQ] = useState("");

  useEffect(() => {
    listSubspecialties().then(setSubs).catch(() => setSubs([]));
  }, []);

  const isValid = (VALID_SLUGS as string[]).includes(slug);

  const filters = useMemo(
    () => ({
      subspecialties: isValid ? [slug] : undefined,
      tiers: selectedTiers.length ? selectedTiers : undefined,
      fromDate: windowToFromDate(dateWindow),
      q: q.trim() || undefined,
      limit: 80,
    }),
    [slug, isValid, selectedTiers, dateWindow, q]
  );

  const { loading, articles, error } = useArticles(filters);

  if (!isValid) {
    return <Navigate to="/" replace />;
  }

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

  const subLabel = t(`subspecialties.${slug}`);
  const podiumArticles = articles.slice(0, 3);
  const rest = articles.slice(3);
  const hasFiltersActive = selectedTiers.length || dateWindow !== "30d" || q;

  // Per-subspecialty editorial blurb. English text below, TR aliases above.
  const blurbs: Partial<Record<string, { tr: string; en: string }>> = {
    trauma:          { tr: "Kırık, dislokasyon, politravma — en güncel kanıtlar.",                          en: "Fractures, dislocations, polytrauma — the latest evidence." },
    sports:          { tr: "Spor yaralanmaları, ligament ve menisküs — saha ve klinik.",                  en: "Sports injuries, ligament and meniscal — field and clinic." },
    arthroplasty:    { tr: "Diz, kalça, omuz — protez teknik ve uzun dönem sonuçları.",                  en: "Knee, hip, shoulder — replacement technique and long-term outcomes." },
    spine:           { tr: "Servikal'den lomber'e — dejeneratif, deformite, travma.",                      en: "Cervical to lumbar — degenerative, deformity, trauma." },
    pediatric:       { tr: "Gelişimsel ortopedi, çocuk kırıkları, deformite düzeltimi.",                  en: "Developmental orthopaedics, pediatric fractures, deformity correction." },
    "hand-upper":    { tr: "El, el bileği, dirsek ve üst ekstremite cerrahisi.",                            en: "Hand, wrist, elbow and upper-extremity surgery." },
    "foot-ankle":    { tr: "Ayak bileği instabilitesi, halluks, plantar patoloji.",                          en: "Ankle instability, hallux disorders, plantar pathology." },
    "shoulder-elbow":{ tr: "Rotator cuff, instabilite, dirsek artroplastisi.",                              en: "Rotator cuff, instability, elbow arthroplasty." },
    onc:             { tr: "Kemik ve yumuşak doku tümörleri, sarkom, metastatik hastalık.",              en: "Bone and soft-tissue tumours, sarcoma, metastatic disease." },
    basic:           { tr: "Hücresel, biyomekanik, kemik metabolizması, biyomateryaller.",                en: "Cellular, biomechanical, bone metabolism, biomaterials." },
    general:         { tr: "Çok-yan-dallı çalışmalar, klinik epidemiyoloji, sağlık politikası.",          en: "Cross-subspecialty studies, clinical epidemiology, health policy." },
  };
  const blurb = blurbs[slug]?.[lang] ?? "";

  return (
    <div>
      {/* Hero */}
      <section className="container-prose pt-7 sm:pt-9 pb-6 border-b border-brass">
        <Link to="/" className="editorial text-[11px] tracking-[0.22em] text-blood hover:text-navy dark:hover:text-cream inline-flex items-center gap-1 mb-3">
          <ArrowLeft size={14} /> {t("detail.back")}
        </Link>
        <div className="editorial text-[11px] tracking-[0.3em] text-blood font-medium">
          {lang === "tr" ? "YAN DAL SAYFASI" : "SUBSPECIALTY DESK"}
        </div>
        <h1 className="display text-[44px] sm:text-[60px] leading-none text-navy dark:text-cream mt-2">
          {subLabel}
        </h1>
        <div className="w-[72px] border-t-2 border-brass my-4" />
        {blurb && (
          <p className="body-serif text-[14px] sm:text-[15px] text-ink dark:text-cream/80 max-w-xl leading-relaxed">
            {blurb}
          </p>
        )}
        {/* Sibling subspecialty pills (quick jump) */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {subs
            .filter((s) => s.slug !== slug)
            .slice(0, 11)
            .map((s) => (
              <Link
                key={s.slug}
                to={`/sub/${s.slug}`}
                className="pill text-[11px] uppercase hover:bg-brass hover:text-cream transition-colors"
              >
                {lang === "tr" ? s.name_tr : s.name_en}
              </Link>
            ))}
        </div>
      </section>

      {/* Podium — top 3 in subspecialty */}
      {!loading && podiumArticles.length > 0 && <PodiumTop3 articles={podiumArticles} />}

      {/* Filters */}
      <section className="container-prose py-4 border-b border-brass">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="editorial text-[10px] tracking-[0.3em] text-ink dark:text-leaf min-w-[60px] hidden sm:block">
              {t("filters.search")}
            </label>
            <SearchBar value={q} onChange={setQ} />
            {hasFiltersActive ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedTiers([]);
                  setDateWindow("30d");
                  setQ("");
                }}
                className="editorial text-[10px] tracking-[0.2em] text-blood hover:text-navy dark:hover:text-cream transition-colors"
              >
                {t("filters.clear")}
              </button>
            ) : null}
          </div>

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
