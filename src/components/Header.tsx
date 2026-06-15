import { Link } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { BrandMark } from "./BrandMark";

export function Header() {
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
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
