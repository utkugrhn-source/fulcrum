import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { Subspecialty } from "@/types";

interface Props {
  options: Subspecialty[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function SubspecialtyFilter({ options, selected, onChange }: Props) {
  const { t } = useTranslation();
  const toggle = (slug: string) => {
    if (selected.includes(slug)) onChange(selected.filter((s) => s !== slug));
    else onChange([...selected, slug]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onChange([])}
        className={cn("pill", selected.length === 0 && "pill-active")}
      >
        {t("filters.all_subspecialties")}
      </button>
      {options.map((o) => (
        <button
          key={o.slug}
          type="button"
          onClick={() => toggle(o.slug)}
          className={cn("pill", selected.includes(o.slug) && "pill-active")}
        >
          {t(`subspecialties.${o.slug}`)}
        </button>
      ))}
    </div>
  );
}
