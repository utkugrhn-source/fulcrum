import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";
  return (
    <div className="inline-flex border border-brass rounded-sm overflow-hidden text-[11px] font-medium select-none">
      <button
        type="button"
        onClick={() => i18n.changeLanguage("en")}
        className={cn(
          "px-3 py-1 transition-colors",
          lang === "en"
            ? "bg-navy text-cream dark:bg-brass dark:text-navy"
            : "text-navy dark:text-cream hover:bg-brass/15"
        )}
        aria-label="English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("tr")}
        className={cn(
          "px-3 py-1 transition-colors",
          lang === "tr"
            ? "bg-navy text-cream dark:bg-brass dark:text-navy"
            : "text-navy dark:text-cream hover:bg-brass/15"
        )}
        aria-label="Türkçe"
      >
        TR
      </button>
    </div>
  );
}
