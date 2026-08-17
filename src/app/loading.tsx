import { Skeleton, ProductCardSkeleton } from '@/components/primitives';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] p-6 sm:p-12 space-y-12 max-w-[1440px] mx-auto">
      {/* Hero Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8">
        <div className="space-y-6">
          <Skeleton variant="text" className="w-1/3 h-4" />
          <Skeleton variant="text" className="w-3/4 h-12" />
          <Skeleton variant="text" className="w-full h-16" />
          <div className="flex gap-4 pt-4">
            <Skeleton variant="rect" className="w-36 h-10" />
            <Skeleton variant="rect" className="w-28 h-10" />
          </div>
        </div>
        <Skeleton variant="arch" className="w-full max-w-md mx-auto aspect-[4/5]" />
      </div>

      {/* Grid Skeleton */}
      <div className="space-y-6">
        <Skeleton variant="text" className="w-1/4 h-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
