import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { listArchiveDates } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";

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

export function Archive() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  const [dates, setDates] = useState<Array<{ date: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listArchiveDates(60)
      .then((d) => setDates(d))
      .catch((e) => setError((e as Error).message ?? String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="container-prose pt-7 sm:pt-9 pb-6 border-b border-divider">
        <Link to="/" className="editorial text-[11px] tracking-[0.22em] text-blood hover:text-navy dark:hover:text-cream inline-flex items-center gap-1 mb-3">
          <ArrowLeft size={14} /> {t("detail.back")}
        </Link>
        <div className="editorial text-[11px] tracking-[0.3em] text-blood font-medium">
          {lang === "tr" ? "ARŞİV" : "ARCHIVE"}
        </div>
        <h1 className="display text-[44px] sm:text-[56px] leading-none text-navy dark:text-cream mt-2">
          {lang === "tr" ? "Geçmiş sayılar" : "Past issues"}
        </h1>
        <div className="w-[72px] border-t-2 border-brass my-4" />
        <p className="body-serif text-[14px] sm:text-[15px] text-ink dark:text-cream/80 max-w-xl leading-relaxed">
          {lang === "tr"
            ? "PubMed'in günlük indeksleme tarihine göre gruplandı. Her sayıyı açıp o gün ortopedi literatürünün üst sıralamasını gör."
            : "Grouped by PubMed's daily indexing date. Open any issue to see that day's top orthopaedic ranking."}
        </p>
      </section>

      <section className="container-prose py-6 pb-12">
        {loading && (
          <div className="editorial text-[11px] tracking-[0.22em] text-ink-2 dark:text-leaf py-6">
            {lang === "tr" ? "YÜKLENİYOR…" : "LOADING…"}
          </div>
        )}
        {!loading && error && <EmptyState title="Error" body={error} />}
        {!loading && !error && dates.length === 0 && <EmptyState />}
        {!loading && !error && dates.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dates.map((d) => (
              <li key={d.date}>
                <Link
                  to={`/issue/${d.date}`}
                  className="block surface px-4 py-3.5 hover:border-brass transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="editorial text-[10.5px] tracking-[0.2em] text-blood">
                      №&nbsp;{issueNumberForDate(d.date)}
                    </div>
                    <div className="editorial text-[10px] tracking-[0.18em] text-ink-2 dark:text-leaf">
                      {d.count} {lang === "tr" ? "KAYIT" : "RECORDS"}
                    </div>
                  </div>
                  <div className="body-serif text-[15px] font-semibold text-ink dark:text-cream mt-1">
                    {formatDate(d.date, lang)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 editorial text-[10px] tracking-[0.18em] text-brass">
                    <FileText size={11} />
                    {lang === "tr" ? "SAYIYI AÇ" : "OPEN ISSUE"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
