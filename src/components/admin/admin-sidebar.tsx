'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sliders,
  Tag,
  Ticket,
  Users,
  FileText,
  X,
} from 'lucide-react';
import { MicroLabel } from '@/components/primitives';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Hero Settings', href: '/admin/hero', icon: Sliders },
  { label: 'Seasonal Offers', href: '/admin/offers', icon: Tag },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'Site Content', href: '/admin/content', icon: FileText },
];

export interface AdminSidebarProps {
  onCloseMobile?: () => void;
  className?: string;
}

export function AdminSidebar({ onCloseMobile, className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={twMerge(
        'w-[264px] h-screen bg-[var(--color-ink-800)] text-white flex flex-col shrink-0 select-none sticky top-0 overflow-y-auto z-40 border-r border-[var(--color-ink-900)]/40',
        className
      )}
    >
      {/* Brand Block */}
      <div className="p-6 pb-6 flex items-center justify-between border-b border-[var(--color-ink-700)]/50">
        <Link href="/admin" className="flex items-center space-x-3.5 group">
          {/* 34px Filigree Rosette Mark SVG */}
          <svg
            className="w-[34px] h-[34px] text-[var(--color-gold-500)] opacity-80 group-hover:opacity-100 transition-opacity"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="17" cy="17" r="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="17" cy="17" r="10" stroke="currentColor" strokeWidth="1" />
            <circle cx="17" cy="17" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M17 2V32M2 17H32M6.39 6.39L27.61 27.61M6.39 27.61L27.61 6.39" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
          </svg>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-medium tracking-[0.06em] leading-tight text-white">
              ADI PARVA
            </span>
            <MicroLabel className="text-[var(--color-gold-500)] text-[10px] tracking-[0.14em]">
              HERITAGE ADMIN
            </MicroLabel>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-[var(--color-cream-300)]/70 hover:text-white p-1"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={clsx(
                'relative flex items-center h-[44px] px-3.5 rounded-[var(--radius-card)] font-sans font-medium text-[13px] uppercase tracking-[0.08em] transition-colors duration-140 group',
                isActive
                  ? 'text-white font-semibold'
                  : 'text-[var(--color-cream-300)]/70 hover:text-white hover:bg-[var(--color-ink-700)]'
              )}
            >
              {/* Active Golden Background with Shared Framer-Motion layoutId */}
              {isActive && (
                <motion.div
                  layoutId="admin-nav-active"
                  className="absolute inset-0 bg-[var(--color-gold-600)] rounded-[var(--radius-card)] z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-3">
                <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-[var(--color-cream-300)]/70 group-hover:text-white')} />
                <span>{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Pinned Footer */}
      <div className="p-4 px-6 border-t border-[var(--color-ink-700)]/40 mt-auto">
        <span className="font-sans font-medium text-[10px] tracking-[0.14em] uppercase text-[var(--color-ink-600)] block">
          IMPERIAL TRADITION V1.0
        </span>
      </div>
    </aside>
  );
}
