'use client';

import * as React from 'react';
import Link from 'next/link';
import { MicroLabel, Button, Input } from '@/components/primitives';
import { ArrowRight, Check } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubscribed(true);
  };

  return (
    <footer className="bg-[var(--color-ink-900)] text-[var(--color-cream-100)] pt-16 pb-12 border-t border-[var(--color-ink-800)] select-none">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 space-y-16">
        {/* 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Col 1: Brand & House Philosophy */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-medium tracking-[0.06em] text-white">
                ADI PARVA
              </span>
              <MicroLabel className="text-[var(--color-gold-500)] text-[10px] tracking-[0.2em] mt-1">
                HERITAGE JEWELLERY
              </MicroLabel>
            </Link>
            <p className="text-xs font-sans text-[var(--color-cream-300)]/80 leading-relaxed max-w-sm">
              Custodians of South Indian temple gold, Kundan, and royal Polki heirlooms. We describe ourselves as keeping pieces rather than selling them.
            </p>
          </div>

          {/* Col 2: The Collection */}
          <div className="space-y-3 font-sans">
            <MicroLabel className="text-[var(--color-gold-500)] mb-4">THE COLLECTION</MicroLabel>
            <ul className="space-y-2 text-xs text-[var(--color-cream-300)]/80">
              <li>
                <Link href="/collections/temple-jewellery" className="hover:text-white transition-colors">
                  Temple Jewellery
                </Link>
              </li>
              <li>
                <Link href="/collections/kundan" className="hover:text-white transition-colors">
                  Kundan & Polki
                </Link>
              </li>
              <li>
                <Link href="/collections/jadau" className="hover:text-white transition-colors">
                  Jadau Stone Setting
                </Link>
              </li>
              <li>
                <Link href="/collections/meenakari" className="hover:text-white transition-colors">
                  Meenakari Enamelwork
                </Link>
              </li>
              <li>
                <Link href="/collections/bridal-sets" className="hover:text-white transition-colors">
                  Grand Bridal Parures
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Custodial Care & Heritage */}
          <div className="space-y-3 font-sans">
            <MicroLabel className="text-[var(--color-gold-500)] mb-4">CUSTODIAL & CARE</MicroLabel>
            <ul className="space-y-2 text-xs text-[var(--color-cream-300)]/80">
              <li>
                <Link href="/heritage" className="hover:text-white transition-colors">
                  The House Story
                </Link>
              </li>
              <li>
                <Link href="/craft" className="hover:text-white transition-colors">
                  Craftsmanship Stages
                </Link>
              </li>
              <li>
                <Link href="/care" className="hover:text-white transition-colors">
                  Jewellery Care & Certification
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-white transition-colors">
                  Editorial Journal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Atelier Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Field */}
          <div className="space-y-4">
            <MicroLabel className="text-[var(--color-gold-500)]">THE PARVA CHRONICLE</MicroLabel>
            <p className="text-xs font-sans text-[var(--color-cream-300)]/80 leading-relaxed">
              Receive private invitations to new masterpiece unveilings and heritage craft dispatches.
            </p>

            {subscribed ? (
              <div className="p-4 bg-[var(--color-ink-800)] border border-[var(--color-gold-600)]/40 rounded-[var(--radius-card)] text-xs text-[var(--color-gold-100)] flex items-center gap-3">
                <Check className="w-5 h-5 text-[var(--color-gold-400)] shrink-0" />
                <span>You are subscribed to the Parva Chronicle repository.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[var(--color-ink-800)] border-[var(--color-ink-700)] text-white placeholder-[var(--color-text-500)] focus:border-[var(--color-gold-500)] py-2 text-xs"
                  />
                  <Button type="submit" variant="primary" size="sm" className="shrink-0">
                    Subscribe
                  </Button>
                </div>
                {error && <p className="text-[11px] text-[var(--color-risk-fg)] font-sans">{error}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Hairline & Legal Bar */}
        <div className="pt-8 border-t border-[var(--color-ink-800)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--color-cream-300)]/60 font-sans gap-4">
          <div>
            © {new Date().getFullYear()} ADI PARVA HERITAGE JEWELLERY HOUSE. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/admin" className="text-[var(--color-gold-400)] hover:text-white font-medium flex items-center gap-1">
              <span>Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
