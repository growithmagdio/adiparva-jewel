'use client';

import * as React from 'react';
import { Search, Bell, RotateCcw, Menu, ChevronDown, Check } from 'lucide-react';
import { MicroLabel } from '@/components/primitives';
import { CommandPalette } from './command-palette';
import { resetDemoData } from '@/lib/data/queries';

export interface AdminTopbarProps {
  onOpenMobileNav?: () => void;
}

export function AdminTopbar({ onOpenMobileNav }: AdminTopbarProps) {
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);

  const handleResetData = async () => {
    setIsResetting(true);
    await resetDemoData();
    setIsResetting(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      window.location.reload();
    }, 800);
  };

  return (
    <>
      <header className="h-[84px] bg-[var(--color-surface)] border-b border-[var(--color-cream-200)] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 select-none">
        {/* Left: Mobile Toggle & Pill Search */}
        <div className="flex items-center gap-4">
          {onOpenMobileNav && (
            <button
              onClick={onOpenMobileNav}
              className="lg:hidden p-2 text-[var(--color-text-700)] hover:text-[var(--color-text-900)]"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {/* Pill Search Input (400px) */}
          <div
            onClick={() => setIsCommandOpen(true)}
            className="w-[280px] sm:w-[340px] md:w-[400px] h-[44px] bg-[var(--color-cream-100)] hover:bg-[var(--color-cream-200)]/60 rounded-[999px] px-4 flex items-center justify-between cursor-pointer transition-colors border border-transparent hover:border-[var(--color-cream-300)]"
          >
            <div className="flex items-center gap-3 text-[var(--color-text-500)] text-sm font-sans">
              <Search className="w-4 h-4 shrink-0" />
              <span>Search resources…</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-sans font-semibold text-[var(--color-text-500)] bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[4px]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Notifications, Divider, Identity Block */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Unread Bell */}
          <button
            className="relative p-2 text-[var(--color-text-700)] hover:text-[var(--color-text-900)] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-risk-fg)]" />
          </button>

          {/* 1px Vertical Divider */}
          <div className="h-8 w-[1px] bg-[var(--color-cream-200)]" aria-hidden="true" />

          {/* Identity Block */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-3 cursor-pointer group text-left"
            >
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="font-sans font-semibold text-[13px] uppercase tracking-[0.06em] text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors">
                  ADMIN USER
                </span>
                <MicroLabel className="text-[var(--color-gold-600)] text-[10px] tracking-[0.08em] leading-none">
                  CHIEF CURATOR
                </MicroLabel>
              </div>

              {/* 44px Circular Avatar */}
              <div className="w-[44px] h-[44px] rounded-full bg-[var(--color-ink-800)] text-white font-sans font-medium text-sm flex items-center justify-center shrink-0 border-2 border-[var(--color-gold-500)]/30 group-hover:border-[var(--color-gold-500)] transition-colors">
                AD
              </div>

              <ChevronDown className="w-4 h-4 text-[var(--color-text-500)] group-hover:text-[var(--color-text-900)]" />
            </button>

            {/* Identity Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-3 w-56 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-[var(--color-cream-200)]">
                  <p className="text-xs font-semibold text-[var(--color-text-900)]">Admin User</p>
                  <p className="text-[11px] text-[var(--color-text-500)]">chief.curator@adaparva.in</p>
                </div>

                <button
                  onClick={handleResetData}
                  disabled={isResetting || resetSuccess}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-[var(--radius-card)] text-xs font-sans text-[var(--color-text-900)] hover:bg-[var(--color-cream-100)] transition-colors cursor-pointer text-left"
                >
                  {resetSuccess ? (
                    <Check className="w-4 h-4 text-[var(--color-ok-fg)]" />
                  ) : (
                    <RotateCcw className={`w-4 h-4 text-[var(--color-gold-600)] ${isResetting ? 'animate-spin' : ''}`} />
                  )}
                  <span>{resetSuccess ? 'Restored Seed Data' : 'Reset Demo Data'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
