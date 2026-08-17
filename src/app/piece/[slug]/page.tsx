'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import {
  BicameralHeading,
  MicroLabel,
  Price,
  Button,
  ArchFrame,
  Skeleton,
} from '@/components/primitives';
import { getProductBySlug, getProducts } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';
import { Heart, ShoppingBag, ShieldCheck, Truck, RefreshCw, Star, Check } from 'lucide-react';
import { clsx } from 'clsx';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [product, setProduct] = React.useState<Product | null>(null);
  const [related, setRelated] = React.useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>('');
  const [qty, setQty] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState<'provenance' | 'specs' | 'care' | 'certification'>('provenance');
  const [isReserved, setIsReserved] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => (product ? state.isInWishlist(product.id) : false));

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const item = await getProductBySlug(slug);
      setProduct(item);

      if (item) {
        setSelectedImage(item.images[0] || '');
        if (item.variants.length > 0) setSelectedVariantId(item.variants[0].id);

        const all = await getProducts({ status: 'live' });
        const rel = all.filter((p) => p.id !== item.id && p.categoryId === item.categoryId).slice(0, 4);
        setRelated(rel.length > 0 ? rel : all.filter((p) => p.id !== item.id).slice(0, 4));
      }
      setLoading(false);
    }
    if (slug) loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream-100)] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-6">
              <Skeleton variant="arch" className="w-full aspect-[4/5]" />
            </div>
            <div className="lg:col-span-6 space-y-6">
              <Skeleton variant="text" className="w-1/3 h-4" />
              <Skeleton variant="text" className="w-3/4 h-10" />
              <Skeleton variant="text" className="w-1/2 h-8" />
              <Skeleton variant="rect" className="w-full h-32" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--color-cream-100)] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <h2 className="font-serif text-3xl text-[var(--color-text-900)]">Piece Not Found</h2>
          <p className="text-xs text-[var(--color-text-500)] mt-2">The requested heritage piece is no longer in the live collection.</p>
          <Link href="/collections" className="mt-6">
            <Button variant="primary">Return to Collection</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0] || {
    id: 'default-variant',
    label: '22K Gold Standard',
  };

  const handleReserve = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: selectedImage || product.images[0],
      price: product.price,
      qty: qty,
      variantLabel: selectedVariant.label,
    });

    setIsReserved(true);
    setTimeout(() => setIsReserved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-16">
        {/* Main Product Display Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Gallery (Left 6 Cols) */}
          <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={clsx(
                    'w-16 h-16 rounded-[var(--radius-card)] overflow-hidden relative border transition-all cursor-pointer shrink-0',
                    selectedImage === img
                      ? 'border-[var(--color-gold-600)] ring-1 ring-[var(--color-gold-600)]'
                      : 'border-[var(--color-cream-300)] opacity-70 hover:opacity-100'
                  )}
                >
                  <ImageWithFallback src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Primary Arch Frame Display */}
            <div className="flex-1">
              <ArchFrame ratio="portrait" className="w-full aspect-[4/5] shadow-2xl">
                <ImageWithFallback
                  src={selectedImage || product.images[0]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover"
                />
              </ArchFrame>
            </div>
          </div>

          {/* Product Details (Right 6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <MicroLabel className="text-[var(--color-gold-600)] text-[11px]">
                {product.artisanCluster || 'TEMPLE JEWELLERY'}
              </MicroLabel>
              <h1 className="font-serif font-medium text-3xl sm:text-4xl text-[var(--color-text-900)] mt-1">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-[var(--color-gold-500)] text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[var(--color-gold-500)]" />
                  ))}
                  <span className="font-sans text-[var(--color-text-700)] ml-1 font-semibold">
                    {product.rating || 5.0} ({product.reviewCount || 12} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-y border-[var(--color-cream-200)] py-4">
              <Price amount={product.price} compareAtAmount={product.compareAtPrice} size="xl" />
              <p className="text-[11px] text-[var(--color-text-500)] mt-1">
                Price includes 3% GST. Armored transit shipping calculated at checkout.
              </p>
            </div>

            {/* Short Description */}
            <p className="font-sans text-sm text-[var(--color-text-700)] leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-3 pt-2">
                <MicroLabel>SELECT VARIANT & METAL SPECIFICATION</MicroLabel>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={clsx(
                        'px-4 py-2 rounded-[var(--radius-card)] text-xs font-sans font-medium border transition-colors cursor-pointer',
                        selectedVariantId === v.id
                          ? 'bg-[var(--color-ink-900)] text-white border-[var(--color-ink-900)]'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-900)] border-[var(--color-cream-300)] hover:border-[var(--color-gold-500)]'
                      )}
                    >
                      {v.label} ({v.metal})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Reserve Button */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-[var(--color-cream-300)] rounded-[var(--radius-card)] bg-[var(--color-surface)] h-[48px]">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 text-[var(--color-text-700)] hover:bg-[var(--color-cream-100)] h-full cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 font-sans text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-3 text-[var(--color-text-700)] hover:bg-[var(--color-cream-100)] h-full cursor-pointer"
                >
                  +
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleReserve}
                className="flex-1 justify-center h-[48px]"
                leftIcon={isReserved ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              >
                {isReserved ? 'RESERVED IN BAG' : 'RESERVE THIS PIECE'}
              </Button>

              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist"
                className="w-[48px] h-[48px] rounded-[var(--radius-card)] border border-[var(--color-cream-300)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-700)] hover:text-[var(--color-risk-fg)] transition-colors cursor-pointer"
              >
                <Heart className={clsx('w-5 h-5', isWishlisted && 'fill-[var(--color-risk-fg)] text-[var(--color-risk-fg)]')} />
              </button>
            </div>

            {/* Availability Line */}
            <div className="text-xs font-sans text-[var(--color-ok-fg)] font-medium">
              ✓ {product.totalStock} units remain available in atelier vault.
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--color-cream-200)] text-center text-xs font-sans text-[var(--color-text-500)]">
              <div className="space-y-1">
                <ShieldCheck className="w-5 h-5 text-[var(--color-gold-600)] mx-auto" />
                <span className="block font-medium text-[var(--color-text-900)]">BIS Hallmarked</span>
                <span className="text-[10px]">22K 916 Assayed</span>
              </div>
              <div className="space-y-1">
                <Truck className="w-5 h-5 text-[var(--color-gold-600)] mx-auto" />
                <span className="block font-medium text-[var(--color-text-900)]">Armored Transit</span>
                <span className="text-[10px]">Fully Insured</span>
              </div>
              <div className="space-y-1">
                <RefreshCw className="w-5 h-5 text-[var(--color-gold-600)] mx-auto" />
                <span className="block font-medium text-[var(--color-text-900)]">7-Day Inspection</span>
                <span className="text-[10px]">Guaranteed Authenticity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Editorial Section */}
        <div className="border border-[var(--color-cream-200)] rounded-[var(--radius-card)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
          <div className="flex border-b border-[var(--color-cream-200)] bg-[var(--color-cream-50)] overflow-x-auto">
            {(['provenance', 'specs', 'care', 'certification'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-6 py-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer border-b-2 shrink-0',
                  activeTab === tab
                    ? 'border-[var(--color-gold-600)] text-[var(--color-gold-600)] bg-[var(--color-surface)]'
                    : 'border-transparent text-[var(--color-text-500)] hover:text-[var(--color-text-900)]'
                )}
              >
                {tab === 'provenance' && 'Provenance Story'}
                {tab === 'specs' && 'Specifications'}
                {tab === 'care' && 'Jewellery Care'}
                {tab === 'certification' && 'Certification'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'provenance' && (
              <div className="space-y-4 font-serif text-lg text-[var(--color-text-700)] leading-relaxed max-w-4xl">
                {product.story.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between py-2 border-b border-[var(--color-cream-200)] text-xs font-sans">
                    <span className="font-semibold text-[var(--color-text-900)]">{spec.label}</span>
                    <span className="text-[var(--color-text-500)]">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'care' && (
              <ul className="space-y-2 text-xs font-sans text-[var(--color-text-700)] list-disc pl-5">
                {product.careNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            )}

            {activeTab === 'certification' && (
              <div className="space-y-4 text-xs font-sans text-[var(--color-text-700)] max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[var(--color-gold-100)] text-[var(--color-gold-700)] font-semibold rounded text-xs">
                    BIS 916 HALLMARKED
                  </span>
                  <span className="px-3 py-1 bg-[var(--color-cream-200)] text-[var(--color-text-900)] font-semibold rounded text-xs">
                    CERTIFICATE OF AUTHENTICITY INCLUDED
                  </span>
                </div>
                <p>
                  Every piece is subjected to non-destructive XRF assay verification and arrives stamped with official Bureau of Indian Standards hallmarks.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Pieces */}
        {related.length > 0 && (
          <div className="space-y-8 pt-6">
            <div className="border-b border-[var(--color-cream-200)] pb-4">
              <MicroLabel className="text-[var(--color-gold-600)]">SAME ARTISAN CLUSTER</MicroLabel>
              <BicameralHeading italicPart="Related" romanPart="Heirlooms" size="lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
