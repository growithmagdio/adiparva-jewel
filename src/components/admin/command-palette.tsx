'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ShoppingBag, Sliders, Tag, Ticket, Users, FileText, ArrowRight } from 'lucide-react';
import { MicroLabel } from '@/components/primitives';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered externally
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { label: 'Admin Dashboard', href: '/admin', icon: Sliders },
    { label: 'Products Collection', href: '/admin/products', icon: Package },
    { label: 'Order Register', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Seasonal Offers', href: '/admin/offers', icon: Tag },
    { label: 'Coupons & Discounts', href: '/admin/coupons', icon: Ticket },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Site Content', href: '/admin/content', icon: FileText },
    { label: 'Storefront Homepage', href: '/', icon: ArrowRight },
  ];

  const filteredNav = quickNav.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase().trim())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-[var(--color-cream-200)] bg-[var(--color-cream-50)]">
          <Search className="w-5 h-5 text-[var(--color-text-400)] shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search resource..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 bg-transparent font-sans text-sm text-[var(--color-text-900)] placeholder-[var(--color-text-400)] outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-sans font-semibold text-[var(--color-text-500)] bg-[var(--color-cream-200)] rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <MicroLabel className="px-3 py-2 text-[var(--color-gold-600)]">QUICK NAVIGATION</MicroLabel>

          {filteredNav.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--color-text-500)]">
              No matching resources found.
            </div>
          ) : (
            filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-card)] text-sm font-sans text-[var(--color-text-900)] hover:bg-[var(--color-cream-100)] transition-colors cursor-pointer text-left group"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[var(--color-text-500)] group-hover:text-[var(--color-gold-600)]" />
                    <span>{item.label}</span>
                  </span>
                  <span className="text-xs text-[var(--color-text-400)] group-hover:text-[var(--color-text-700)]">
                    Jump to
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-[var(--color-cream-100)] border-t border-[var(--color-cream-200)] flex justify-between text-[11px] text-[var(--color-text-400)] font-sans">
          <span>Navigate with mouse or keyboard</span>
          <span>ADI PARVA COMMAND</span>
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
