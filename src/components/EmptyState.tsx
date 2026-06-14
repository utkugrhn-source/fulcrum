import { useTranslation } from "react-i18next";
import { Inbox } from "lucide-react";

interface Props { title?: string; body?: string }

export function EmptyState({ title, body }: Props) {
  const { t } = useTranslation();
  return (
    <div className="card p-10 text-center">
      <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-bg-subtle text-fg-subtle">
        <Inbox size={22} />
      </div>
      <div className="mt-3 font-serif text-lg text-fg">{title ?? t("state.empty_title")}</div>
      <div className="mt-1 text-sm text-fg-muted">{body ?? t("state.empty_body")}</div>
    </div>
  );
}
