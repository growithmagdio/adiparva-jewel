import * as React from 'react';

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#1C0F07] text-[#FAF0E4] flex flex-col font-sans select-none">
      <div className="h-20 bg-[#2C1810] border-b border-[#3D2418] px-8 flex items-center justify-between">
        <div className="h-6 w-32 bg-[#3D2418] animate-pulse rounded" />
        <div className="h-6 w-48 bg-[#3D2418] animate-pulse rounded" />
      </div>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 aspect-[3/4] bg-[#2C1810] rounded-[4px] animate-pulse" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-4 w-32 bg-[#2C1810] animate-pulse rounded" />
            <div className="h-12 w-3/4 bg-[#2C1810] animate-pulse rounded" />
            <div className="h-8 w-1/2 bg-[#2C1810] animate-pulse rounded" />
            <div className="h-32 w-full bg-[#2C1810] animate-pulse rounded" />
            <div className="h-14 w-full bg-[#3D2418] animate-pulse rounded" />
          </div>
        </div>
      </main>
    </div>
  );
}
