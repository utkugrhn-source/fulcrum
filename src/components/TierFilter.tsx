import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Props {
  selected: number[];
  onChange: (next: number[]) => void;
}

export function TierFilter({ selected, onChange }: Props) {
  const { t } = useTranslation();
  const toggle = (n: number) => {
    if (selected.includes(n)) onChange(selected.filter((x) => x !== n));
    else onChange([...selected, n]);
  };
  const labels = [t("filters.tier_t1"), t("filters.tier_t2"), t("filters.tier_t3")];
  return (
    <div className="flex flex-wrap gap-1.5">
      {[1, 2, 3].map((n, i) => (
        <button
          key={n}
          type="button"
          onClick={() => toggle(n)}
          className={cn("pill", selected.includes(n) && "pill-active")}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}
