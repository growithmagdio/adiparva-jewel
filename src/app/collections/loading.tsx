import * as React from 'react';

export default function CollectionsLoading() {
  return (
    <div className="min-h-screen bg-[#1C0F07] text-[#FAF0E4] flex flex-col font-sans select-none">
      <div className="h-20 bg-[#2C1810] border-b border-[#3D2418] px-8 flex items-center justify-between">
        <div className="h-6 w-32 bg-[#3D2418] animate-pulse rounded" />
        <div className="h-6 w-48 bg-[#3D2418] animate-pulse rounded" />
      </div>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-8">
        <div className="space-y-3 border-b border-[#3D2418] pb-6">
          <div className="h-4 w-28 bg-[#2C1810] animate-pulse rounded" />
          <div className="h-10 w-64 bg-[#2C1810] animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 h-96 bg-[#2C1810] rounded-[4px] animate-pulse hidden lg:block" />
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-[#2C1810] border border-[#3D2418] rounded-[4px] animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
