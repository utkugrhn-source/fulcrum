import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-brass text-navy dark:text-cream hover:bg-brass/15 transition-colors"
      aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
    >
      <Icon size={14} strokeWidth={1.75} />
    </button>
  );
}
