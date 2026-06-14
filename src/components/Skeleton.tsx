export function CardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-bg-subtle" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-12 rounded-full bg-bg-subtle" />
            <div className="h-5 w-20 rounded-full bg-bg-subtle" />
            <div className="h-5 w-32 rounded-full bg-bg-subtle" />
          </div>
          <div className="h-5 w-4/5 rounded bg-bg-subtle" />
          <div className="h-4 w-2/3 rounded bg-bg-subtle" />
          <div className="h-3 w-full rounded bg-bg-subtle" />
          <div className="h-3 w-5/6 rounded bg-bg-subtle" />
        </div>
      </div>
    </div>
  );
}
