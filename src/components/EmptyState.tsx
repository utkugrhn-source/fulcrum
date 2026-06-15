import { useTranslation } from "react-i18next";

interface Props { title?: string; body?: string }

export function EmptyState({ title, body }: Props) {
  const { t } = useTranslation();
  return (
    <div className="border border-brass border-dashed rounded-sm bg-cream-2 dark:bg-navy-2 px-6 py-12 text-center">
      <div className="body-serif italic text-[18px] text-navy dark:text-cream">
        {title ?? t("state.empty_title")}
      </div>
      <div className="mt-2 body-serif italic text-[13.5px] text-ink dark:text-cream/70 max-w-md mx-auto leading-relaxed">
        {body ?? t("state.empty_body")}
      </div>
    </div>
  );
}
