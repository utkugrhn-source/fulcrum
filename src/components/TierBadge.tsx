import { cn } from "@/lib/utils";
import type { Tier } from "@/types";

export function TierBadge({ tier }: { tier: Tier | null }) {
  if (!tier) {
    return <span className="pill text-fg-subtle">—</span>;
  }
  const cls =
    tier === 1 ? "bg-tier-1/15 text-tier-1 border-tier-1/30"
    : tier === 2 ? "bg-tier-2/15 text-tier-2 border-tier-2/30"
    : "bg-tier-3/15 text-tier-3 border-tier-3/30";
  return (
    <span className={cn("pill", cls)}>
      T{tier}
    </span>
  );
}
