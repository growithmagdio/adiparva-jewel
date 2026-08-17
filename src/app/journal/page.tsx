'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { BicameralHeading, MicroLabel, Button } from '@/components/primitives';
import { getJournalArticles } from '@/lib/data/queries';
import { JournalArticle } from '@/lib/data/types';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function JournalIndexPage() {
  const [articles, setArticles] = React.useState<JournalArticle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadJournal() {
      setLoading(true);
      const data = await getJournalArticles();
      setArticles(data);
      setLoading(false);
    }
    loadJournal();
  }, []);

  const leadArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-16">
        {/* Header Title */}
        <div className="border-b border-[var(--color-cream-200)] pb-8 space-y-3">
          <MicroLabel className="text-[var(--color-gold-600)]">THE PARVA CHRONICLE</MicroLabel>
          <BicameralHeading italicPart="Editorial" romanPart="Journal" size="xl" />
          <p className="font-sans text-sm text-[var(--color-text-500)] max-w-2xl leading-relaxed">
            Dispatches on South Indian temple gold, Kundan stone setting, royal Polki diamonds, and heritage craft preservation.
          </p>
        </div>

        {/* Hero Lead Article */}
        {leadArticle && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group">
            <div className="lg:col-span-7 relative aspect-[16/10] bg-[var(--color-cream-100)] overflow-hidden">
              <ImageWithFallback
                src={leadArticle.heroImage || '/images/journal/anatomy-temple-necklace.jpg'}
                alt={leadArticle.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="lg:col-span-5 p-8 lg:p-12 space-y-4">
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-500)] font-sans">
                <MicroLabel className="text-[var(--color-gold-600)]">{leadArticle.category}</MicroLabel>
                <span>•</span>
                <span>{leadArticle.readTime}</span>
              </div>

              <Link href={`/journal/${leadArticle.slug}`}>
                <h2 className="font-serif text-3xl font-medium text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors leading-tight">
                  {leadArticle.title}
                </h2>
              </Link>

              <p className="font-sans text-sm text-[var(--color-text-500)] leading-relaxed line-clamp-3">
                {leadArticle.excerpt}
              </p>

              <div className="pt-2">
                <Link href={`/journal/${leadArticle.slug}`}>
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    READ DISPATCH
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Grid of Other Articles */}
        <div className="space-y-8">
          <div className="border-b border-[var(--color-cream-200)] pb-4">
            <MicroLabel className="text-[var(--color-gold-600)]">LATEST DISPATCHES</MicroLabel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherArticles.map((art) => (
              <article key={art.id} className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs group flex flex-col justify-between">
                <div>
                  <Link href={`/journal/${art.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-[var(--color-cream-100)]">
                    <ImageWithFallback
                      src={art.heroImage || '/images/journal/kundan-polki-guide.jpg'}
                      alt={art.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-sans text-[var(--color-text-500)]">
                      <MicroLabel className="text-[var(--color-gold-600)]">{art.category}</MicroLabel>
                      <span>{art.readTime}</span>
                    </div>

                    <Link href={`/journal/${art.slug}`}>
                      <h4 className="font-serif text-xl font-medium text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors line-clamp-2">
                        {art.title}
                      </h4>
                    </Link>

                    <p className="text-xs font-sans text-[var(--color-text-500)] line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/journal/${art.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors"
                  >
                    <span>READ ARTICLE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
