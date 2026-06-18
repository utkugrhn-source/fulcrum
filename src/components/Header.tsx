import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { BrandMark } from "./BrandMark";

export function Header() {
  const { t } = useTranslation();
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `editorial text-[11px] tracking-[0.22em] transition-colors ${
      isActive
        ? "text-blood"
        : "text-ink-2 dark:text-leaf hover:text-navy dark:hover:text-cream"
    }`;

  return (
    <header className="border-b border-brass bg-cream dark:bg-navy sticky top-0 z-30">
      <div className="container-prose flex items-center justify-between h-[68px]">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Fulcrum">
          <BrandMark size={42} className="shrink-0" />
          <span
            className="text-[28px] sm:text-[32px] leading-none tracking-[-0.04em] font-display text-navy dark:text-cream"
            style={{ fontStyle: "italic", fontWeight: 700 }}
          >
            <span className="text-blood">F</span>ulcrum
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-5">
          <NavLink to="/" end className={navClass}>{t("nav.home")}</NavLink>
          <NavLink to="/scoring" className={navClass}>{t("nav.scoring")}</NavLink>
          <NavLink to="/about" className={navClass}>{t("nav.about")}</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
