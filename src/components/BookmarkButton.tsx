import { useTranslation } from "react-i18next";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useReadingList } from "@/hooks/useReadingList";

interface Props {
  pmid: string;
  variant?: "compact" | "full";
}

export function BookmarkButton({ pmid, variant = "compact" }: Props) {
  const { t } = useTranslation();
  const { has, toggle } = useReadingList();
  const saved = has(pmid);

  const base = "inline-flex items-center gap-1.5 editorial text-[11px] tracking-[0.15em] border rounded-sm transition-colors";
  const compact = "px-2.5 py-1";
  const full = "px-3 py-1.5";
  const enabled = saved
    ? "text-blood border-blood hover:bg-blood hover:text-cream"
    : "text-brass hover:text-cream border-brass/40 hover:border-brass";

  return (
    <button
      type="button"
      onClick={() => toggle(pmid)}
      aria-pressed={saved}
      aria-label={saved ? t("save.remove") : t("save.add")}
      className={`${base} ${variant === "full" ? full : compact} ${enabled}`}
    >
      {saved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
      {saved ? t("save.saved") : t("save.save")}
    </button>
  );
}
