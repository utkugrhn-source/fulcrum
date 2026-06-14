import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-bg-subtle p-0.5 text-xs">
      <button
        type="button"
        onClick={() => i18n.changeLanguage("en")}
        className={cn(
          "px-2.5 py-1 rounded-full transition-colors",
          lang === "en" ? "bg-bg-card text-fg shadow-sm" : "text-fg-muted hover:text-fg"
        )}
        aria-label="English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("tr")}
        className={cn(
          "px-2.5 py-1 rounded-full transition-colors",
          lang === "tr" ? "bg-bg-card text-fg shadow-sm" : "text-fg-muted hover:text-fg"
        )}
        aria-label="Türkçe"
      >
        TR
      </button>
    </div>
  );
}
