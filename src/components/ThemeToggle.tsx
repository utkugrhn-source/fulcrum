import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-full border border-border bg-bg-subtle p-1.5 text-fg-muted hover:text-fg hover:bg-bg-card transition-colors"
      aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
}
