import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FileX } from "lucide-react";

export function NotFound() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  return (
    <div className="container-prose pt-12 sm:pt-20 pb-16 max-w-xl">
      <div className="rounded-2xl bg-cream-2 dark:bg-navy-2 border border-divider/30 p-7 sm:p-9 text-center">
        <FileX size={36} className="text-blood mx-auto mb-4" aria-hidden />
        <div className="editorial text-[11px] tracking-[0.3em] text-blood font-medium mb-2">
          404
        </div>
        <h1 className="display text-[36px] sm:text-[44px] leading-tight text-navy dark:text-cream mb-3">
          {lang === "tr" ? "Bu sayı yok" : "Issue not found"}
        </h1>
        <p className="body-serif text-base text-ink dark:text-cream/80 leading-relaxed mb-6 max-w-md mx-auto">
          {lang === "tr"
            ? "Aradığın sayfa elimizdeki ranking'de yer almıyor — yanlış bir bağlantı izlemiş olabilirsin ya da o makale kaldırıldı."
            : "The page you're looking for isn't in our ranking — you may have followed a stale link or the article was removed."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 editorial text-[11px] tracking-[0.18em] bg-brass text-cream hover:bg-brass-2 rounded-lg px-4 py-2 transition-colors"
          >
            <ArrowLeft size={12} />
            {t("detail.back")}
          </Link>
          <Link
            to="/archive"
            className="editorial text-[11px] tracking-[0.18em] text-blood hover:text-navy dark:hover:text-cream transition-colors"
          >
            {lang === "tr" ? "ARŞİVİ AÇ" : "OPEN ARCHIVE"}
          </Link>
        </div>
      </div>
    </div>
  );
}
