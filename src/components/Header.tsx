import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Scale } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useTranslation();
  return (
    <header className="border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-30">
      <div className="container-prose flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-accent/10 text-accent">
            <Scale size={18} strokeWidth={2} />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold tracking-tight text-fg">
              {t("app.title")}
            </div>
            <div className="text-[11px] text-fg-subtle hidden sm:block">{t("app.tagline")}</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
