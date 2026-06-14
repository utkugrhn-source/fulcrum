import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("filters.search_placeholder")}
        className="w-full sm:w-72 pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-bg-subtle focus:bg-bg-card focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
      />
    </div>
  );
}
