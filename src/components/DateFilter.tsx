import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type DateWindow = "24h" | "7d" | "30d" | "all";

interface Props {
  selected: DateWindow;
  onChange: (next: DateWindow) => void;
}

export function DateFilter({ selected, onChange }: Props) {
  const { t } = useTranslation();
  const opts: Array<{ key: DateWindow; label: string }> = [
    { key: "24h", label: t("filters.since_24h") },
    { key: "7d",  label: t("filters.since_7d") },
    { key: "30d", label: t("filters.since_30d") },
    { key: "all", label: t("filters.all_time") },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn("pill", selected === o.key && "pill-active")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
