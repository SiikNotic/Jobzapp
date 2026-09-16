import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic instant-loading fallback shown while a route segment's data
 * fetches (via Next.js loading.tsx). Mirrors the shape most pages share:
 * a title/subtitle header followed by a few card-sized blocks.
 */
export function PageLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}
