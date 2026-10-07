import * as React from 'react';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#1C0F07] text-[#FAF0E4] flex flex-col font-sans select-none">
      {/* Top Bar Skeleton */}
      <div className="h-20 bg-[#2C1810] border-b border-[#3D2418] px-8 flex items-center justify-between">
        <div className="h-6 w-32 bg-[#3D2418] animate-pulse rounded" />
        <div className="h-6 w-48 bg-[#3D2418] animate-pulse rounded hidden sm:block" />
        <div className="h-6 w-24 bg-[#3D2418] animate-pulse rounded" />
      </div>

      {/* Hero Skeleton */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="h-4 w-36 bg-[#2C1810] animate-pulse rounded" />
            <div className="h-16 w-3/4 bg-[#2C1810] animate-pulse rounded" />
            <div className="h-8 w-1/2 bg-[#2C1810] animate-pulse rounded" />
            <div className="h-12 w-48 bg-[#3D2418] animate-pulse rounded" />
          </div>
          <div className="lg:col-span-6 aspect-[3/4] bg-[#2C1810] animate-pulse rounded-[4px]" />
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-[#2C1810] border border-[#3D2418] rounded-[4px] animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
