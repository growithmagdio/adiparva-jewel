'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  FolderTree,
  Boxes,
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
  { label: 'Stock Inventory', href: '/admin/inventory', icon: Boxes },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
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
        'w-[264px] h-screen bg-[#F4EEDF] text-[#2A1E17] flex flex-col shrink-0 select-none sticky top-0 overflow-y-auto z-40 border-r border-[#E2D6BC]',
        className
      )}
    >
      {/* Brand Block */}
      <div className="p-6 pb-6 flex items-center justify-between border-b border-[#E2D6BC]">
        <Link href="/admin" className="flex items-center space-x-3.5 group">
          <Image
            src="/logo.jpeg"
            alt="Adi Parva Admin"
            width={200}
            height={60}
            className="h-12 w-auto object-contain rounded-[2px]"
            priority
          />
          <div className="flex flex-col">
            <MicroLabel className="text-[#8A6A1F] text-[10px] tracking-[0.14em] font-semibold">
              HERITAGE ADMIN
            </MicroLabel>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-[#6B5B4E] hover:text-[#2A1E17] p-1 cursor-pointer"
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
                'relative flex items-center h-[44px] px-3.5 rounded-[4px] font-sans font-medium text-[13px] uppercase tracking-[0.08em] transition-colors duration-140 group',
                isActive
                  ? 'text-[#FBF7EE] font-semibold'
                  : 'text-[#6B5B4E] hover:text-[#2A1E17] hover:bg-[#E2D6BC]/50'
              )}
            >
              {/* Active Maroon Background with Shared Framer-Motion layoutId */}
              {isActive && (
                <motion.div
                  layoutId="admin-nav-active"
                  className="absolute inset-0 bg-[#5C1A1B] rounded-[4px] z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-3">
                <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-[#FBF7EE]' : 'text-[#8A6A1F] group-hover:text-[#2A1E17]')} />
                <span>{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Pinned Footer */}
      <div className="p-4 px-6 border-t border-[#E2D6BC] mt-auto">
        <span className="font-sans font-medium text-[10px] tracking-[0.14em] uppercase text-[#6B5B4E] block">
          IMPERIAL TRADITION V1.0
        </span>
      </div>
    </aside>
  );
}
