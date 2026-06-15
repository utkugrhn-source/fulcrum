export function CardSkeleton() {
  return (
    <div className="rounded-sm border-l-4 border-l-brass bg-navy text-cream px-5 py-4 animate-pulse">
      <div className="grid grid-cols-[58px_minmax(0,1fr)_60px] sm:grid-cols-[72px_minmax(0,1fr)_68px] gap-3 sm:gap-5 items-start">
        <div className="h-10 w-12 bg-navy-2 rounded" />
        <div className="space-y-2.5">
          <div className="flex gap-2">
            <div className="h-4 w-10 bg-navy-2 rounded" />
            <div className="h-4 w-20 bg-navy-2 rounded" />
            <div className="h-4 w-24 bg-navy-2 rounded" />
          </div>
          <div className="h-5 w-5/6 bg-navy-2 rounded" />
          <div className="h-4 w-2/3 bg-navy-2 rounded" />
          <div className="h-3 w-full bg-navy-2 rounded" />
        </div>
        <div className="h-10 bg-navy-2 rounded" />
      </div>
    </div>
  );
}
