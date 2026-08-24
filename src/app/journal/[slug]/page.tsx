'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { GopuramArch } from '@/components/storefront/gopuram-arch';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { getJournalArticles } from '@/lib/data/queries';
import { JournalArticle } from '@/lib/data/types';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';

export default function JournalArticlePage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [article, setArticle] = React.useState<JournalArticle | null>(null);
  const [related, setRelated] = React.useState<JournalArticle[]>([]);

  React.useEffect(() => {
    async function loadArticle() {
      const all = await getJournalArticles();
      const item = all.find((a) => a.slug === slug) || all[0];
      setArticle(item);
      setRelated(all.filter((a) => a.id !== item?.id).slice(0, 3));
    }
    if (slug) loadArticle();
  }, [slug]);

  if (!article) return null;

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 font-marcellus text-[11px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)] hover:text-[var(--color-gold-light)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO PARVA CHRONICLE</span>
          </Link>
        </div>

        {/* Article Header */}
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <span className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
            {article.category}
          </span>
          <h1 className="font-serif font-light text-3xl sm:text-5xl text-[var(--color-ivory)] leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-center gap-6 font-jost text-xs text-[var(--color-sandal)]/70 pt-2">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[var(--color-temple-gold)]" />
              <span>{article.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-temple-gold)]" />
              <span>{article.publishedAt}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--color-temple-gold)]" />
              <span>{article.readTime}</span>
            </span>
          </div>
        </div>

        {/* Hero Arch Vitrine Image */}
        <div className="max-w-4xl mx-auto">
          <GopuramArch
            src={article.heroImage || '/images/journal/anatomy-temple-necklace.jpg'}
            alt={article.title}
            aspect="wide"
            sizes="(max-width: 1024px) 100vw, 900px"
            className="shadow-2xl"
          />
        </div>

        {/* Article Content */}
        <article className="max-w-2xl mx-auto space-y-6 font-jost text-base sm:text-lg text-[var(--color-sandal)]/90 leading-relaxed font-light">
          {article.content.map((paragraph, index) => (
            <p key={index} className="first-letter:text-4xl first-letter:font-serif first-letter:text-[var(--color-temple-gold)] first-letter:mr-2 first-letter:float-left">
              {paragraph}
            </p>
          ))}
        </article>

        <KolamDivider />

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6 pt-6">
            <h3 className="font-marcellus text-[12px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)] text-center">
              FURTHER READINGS FROM THE ARCHIVE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/journal/${rel.slug}`}
                  className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-5 rounded-[4px] space-y-3 hover:border-[var(--color-temple-gold)]/60 transition-all group"
                >
                  <h4 className="font-serif text-base text-[var(--color-ivory)] font-light group-hover:text-[var(--color-gold-light)] line-clamp-2">
                    {rel.title}
                  </h4>
                  <div className="font-marcellus text-[9px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                    {rel.category}
                  </div>
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
