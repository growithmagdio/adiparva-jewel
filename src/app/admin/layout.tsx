'use client';

import * as React from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] flex text-[var(--color-text-700)] antialiased font-sans">
      {/* Desktop Fixed Sidebar (264px) */}
      <AdminSidebar className="hidden lg:flex" />

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />
          <AdminSidebar
            onCloseMobile={() => setMobileNavOpen(false)}
            className="relative z-10 w-[264px] h-full shadow-2xl"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-5 sm:p-8 max-w-[1440px] w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
