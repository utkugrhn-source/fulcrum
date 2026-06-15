import { useTranslation } from "react-i18next";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t("filters.search_placeholder")}
      className="w-full sm:flex-1 sm:min-w-[220px] px-3 py-1.5 body-serif italic text-[13px] border border-brass bg-transparent text-navy dark:text-cream placeholder:text-ink-2 dark:placeholder:text-cream/50 rounded-sm focus:outline-none focus:border-blood transition-colors"
    />
  );
}
