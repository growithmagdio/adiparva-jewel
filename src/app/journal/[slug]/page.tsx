'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { BicameralHeading, MicroLabel, Button } from '@/components/primitives';
import { getJournalArticles } from '@/lib/data/queries';
import { JournalArticle } from '@/lib/data/types';
import { ArrowLeft, Clock, Calendar, User, Share2 } from 'lucide-react';

export default function JournalArticlePage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [article, setArticle] = React.useState<JournalArticle | null>(null);
  const [related, setRelated] = React.useState<JournalArticle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      const all = await getJournalArticles();
      const item = all.find((a) => a.slug === slug) || all[0];
      setArticle(item);
      setRelated(all.filter((a) => a.id !== item?.id).slice(0, 3));
      setLoading(false);
    }
    if (slug) loadArticle();
  }, [slug]);

  if (!article) return null;

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Parva Chronicle</span>
          </Link>
        </div>

        {/* Article Header */}
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <MicroLabel className="text-[var(--color-gold-600)]">{article.category}</MicroLabel>
          <h1 className="font-serif font-medium text-3xl sm:text-5xl text-[var(--color-text-900)] leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-xs text-[var(--color-text-500)] font-sans pt-2">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[var(--color-gold-600)]" />
              <span>{article.author}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-gold-600)]" />
              <span>{article.publishedAt}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--color-gold-600)]" />
              <span>{article.readTime}</span>
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="max-w-4xl mx-auto relative aspect-[16/9] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-cream-300)] shadow-xl">
          <ImageWithFallback
            src={article.heroImage}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="max-w-3xl mx-auto bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] p-8 sm:p-12 shadow-xs space-y-6 font-serif text-lg text-[var(--color-text-900)] leading-relaxed">
          <p className="font-sans text-base text-[var(--color-text-700)] font-medium leading-relaxed italic border-l-2 border-[var(--color-gold-600)] pl-4">
            {article.excerpt}
          </p>

          {Array.isArray(article.content)
            ? article.content.map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))
            : String(article.content)
                .split('\n\n')
                .map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))}
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-8 pt-6">
            <div className="border-b border-[var(--color-cream-200)] pb-4">
              <MicroLabel className="text-[var(--color-gold-600)]">MORE FROM THE CHRONICLE</MicroLabel>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/journal/${item.slug}`}
                  className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] p-4 hover:border-[var(--color-gold-500)] transition-colors group block"
                >
                  <MicroLabel className="text-[var(--color-gold-600)] text-[10px]">{item.category}</MicroLabel>
                  <h4 className="font-serif text-base font-medium text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors mt-1 line-clamp-2">
                    {item.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
