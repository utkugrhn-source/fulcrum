import { cn } from "@/lib/utils";

export function ScoreBadge({ score }: { score: number }) {
  const tier =
    score >= 200 ? "high"
    : score >= 120 ? "mid"
    : "low";
  const cls =
    tier === "high" ? "text-accent border-accent/30 bg-accent/10"
    : tier === "mid" ? "text-fg border-border bg-bg-subtle"
    : "text-fg-subtle border-border bg-bg-subtle";
  return (
    <div className={cn(
      "inline-flex flex-col items-center justify-center rounded-lg border w-12 h-12 font-mono tabular-nums",
      cls
    )}>
      <div className="text-base font-semibold leading-none">{Math.round(score)}</div>
      <div className="text-[9px] tracking-wide uppercase opacity-70 mt-0.5">score</div>
    </div>
  );
}
