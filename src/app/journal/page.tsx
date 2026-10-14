'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { GopuramArch } from '@/components/storefront/gopuram-arch';
import { getJournalArticles } from '@/lib/data/queries';
import { JournalArticle } from '@/lib/data/types';
import { ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-16">
        {/* Header Title */}
        <div className="border-b border-[#E7D7C0] pb-8 space-y-3">
          <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#B68A3A] font-semibold">
            THE PARVA CHRONICLE
          </div>
          <h1 className="font-serif text-[36px] sm:text-[52px] font-normal text-[#5B1018]">
            Editorial <em className="italic font-normal text-[#B68A3A]">Journal</em>
          </h1>
          <p className="font-jost text-[16px] text-[#765E55] max-w-2xl leading-relaxed">
            Dispatches on South Indian temple gold, Kundan stone setting, royal Polki diamonds, and heritage craft preservation.
          </p>
        </div>

        {/* Hero Lead Article */}
        {leadArticle && (
          <div className="bg-white border border-[#E7D7C0] rounded-[4px] overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group">
            <div className="lg:col-span-7 p-6 sm:p-8">
              <GopuramArch
                src={leadArticle.heroImage || '/images/journal/anatomy-temple-necklace.jpg'}
                alt={leadArticle.title}
                aspect="wide"
                sizes="(max-width: 768px) 100vw, 60vw"
                className="shadow-sm"
              />
            </div>

            <div className="lg:col-span-5 p-6 lg:p-10 space-y-4">
              <div className="flex items-center gap-3 font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
                <span>{leadArticle.category}</span>
                <span>•</span>
                <span>{leadArticle.readTime}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#5B1018] font-normal leading-snug group-hover:text-[#B68A3A] transition-colors">
                <Link href={`/journal/${leadArticle.slug}`}>
                  {leadArticle.title}
                </Link>
              </h2>

              <p className="font-jost text-sm text-[#765E55] leading-relaxed">
                {leadArticle.excerpt}
              </p>

              <div className="pt-2">
                <Link
                  href={`/journal/${leadArticle.slug}`}
                  className="h-10 px-5 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-marcellus text-[11px] uppercase tracking-[0.2em] inline-flex items-center gap-2 rounded-[2px] transition-colors"
                >
                  <span>READ ARTICLE</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Other Journal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherArticles.map((art) => (
            <Link
              key={art.id}
              href={`/journal/${art.slug}`}
              className="bg-white border border-[#E7D7C0] p-6 rounded-[4px] space-y-4 hover:border-[#B68A3A] transition-all flex flex-col justify-between group shadow-xs"
            >
              <div className="space-y-4">
                <GopuramArch
                  src={art.heroImage || '/images/journal/anatomy-temple-necklace.jpg'}
                  alt={art.title}
                  aspect="wide"
                  sizes="400px"
                  className="shadow-xs"
                />

                <div className="flex items-center gap-3 font-marcellus text-[9px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
                  <span>{art.category}</span>
                  <span>•</span>
                  <span>{art.readTime}</span>
                </div>

                <h3 className="font-serif text-xl text-[#5B1018] font-normal group-hover:text-[#B68A3A] transition-colors">
                  {art.title}
                </h3>

                <p className="font-jost text-xs text-[#765E55] line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-2 font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold inline-flex items-center gap-1">
                <span>READ MORE</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
