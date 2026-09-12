export default function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <div className="aspect-[4/3] w-full animate-pulse bg-ink-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-ink-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-ink-100" />
      </div>
    </div>
  );
}
