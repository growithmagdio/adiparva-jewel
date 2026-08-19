'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { InscriptionPlate } from '@/components/storefront/InscriptionPlate';
import { Button } from '@/components/primitives/button';
import { GopuramRule } from '@/components/ui/GopuramRule';
import { getProductBySlug, getProducts } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';
import { Heart, Check, MessageSquare, Maximize2, X } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [product, setProduct] = React.useState<Product | null>(null);
  const [related, setRelated] = React.useState<Product[]>([]);
  const [completeSet, setCompleteSet] = React.useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>('');
  const [qty, setQty] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState<'description' | 'craft' | 'reviews' | 'shipping'>('description');
  const [isAdded, setIsAdded] = React.useState(false);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const [pincode, setPincode] = React.useState('');
  const [pincodeResult, setPincodeResult] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => (product ? state.isInWishlist(product.id) : false));

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const item = await getProductBySlug(slug);
      setProduct(item);

      if (item) {
        setSelectedImage(item.images[0] || '/images/products/maharani-temple-necklace-1.jpg');
        if (item.variants.length > 0) setSelectedVariantId(item.variants[0].id);

        const all = await getProducts({ status: 'live' });
        const rel = all.filter((p) => p.id !== item.id && p.categoryId === item.categoryId).slice(0, 4);
        setRelated(rel.length > 0 ? rel : all.filter((p) => p.id !== item.id).slice(0, 4));
        setCompleteSet(all.filter((p) => p.id !== item.id && p.categoryId !== item.categoryId).slice(0, 3));
      }
      setLoading(false);
    }
    if (slug) loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-ivory)] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 aspect-[4/5] bg-[var(--color-bone)] animate-pulse" />
            <div className="lg:col-span-5 space-y-6">
              <div className="h-4 w-1/3 bg-[var(--color-bone)] animate-pulse" />
              <div className="h-10 w-3/4 bg-[var(--color-bone)] animate-pulse" />
              <div className="h-8 w-1/2 bg-[var(--color-bone)] animate-pulse" />
              <div className="h-48 w-full bg-[var(--color-bone)] animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--color-ivory)] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-4">
          <h2 className="font-bodoni text-3xl text-[var(--color-ink)]">Piece Not Found</h2>
          <p className="font-karla text-sm text-[var(--color-ink)]/70">The requested heritage piece is no longer in the active vault.</p>
          <Link href="/collections">
            <Button variant="gold">Return to Collection</Button>
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

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: selectedImage || product.images[0],
      price: product.price,
      qty: qty,
      variantLabel: selectedVariant.label,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    toggleCart();
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setPincodeResult('Enter a valid 6-digit pincode.');
      return;
    }
    const days = ['Fri, 21 Aug', 'Sat, 22 Aug', 'Sun, 23 Aug'];
    const randomDay = days[Math.floor(Math.random() * days.length)];
    setPincodeResult(`Delivers to ${pincode} by ${randomDay} · Cash on delivery available.`);
  };

  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hello Adi Parva Atelier, I am interested in inquiring about ${product.name} (Code: ${product.id}).`
  )}`;

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-24">
        {/* Breadcrumb */}
        <div className="font-karla text-[12px] text-[var(--color-ink)]/60 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <span className="text-[var(--color-hairline)]">/</span>
          <Link href="/collections" className="hover:text-[var(--color-gold)] transition-colors">Collections</Link>
          <span className="text-[var(--color-hairline)]">/</span>
          <span className="text-[var(--color-ink)] font-medium">{product.name}</span>
        </div>

        {/* Two Column Layout: Left 58% Gallery / Right 42% Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Gallery (Left 58% -> lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 sticky top-28">
            {/* Thumbnail Rail Vertical Left (Desktop 5 thumbs) */}
            <div className="flex md:flex-col gap-3 overflow-x-auto shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 relative bg-[var(--color-vault)] overflow-hidden transition-all cursor-pointer border ${
                    selectedImage === img
                      ? 'border-[var(--color-gold)] opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${product.name} view ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>

            {/* Main 4:5 Display Image on Vault */}
            <div className="flex-1 relative aspect-[4/5] bg-[var(--color-vault)] overflow-hidden group">
              <Image
                src={selectedImage || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-transform duration-560 group-hover:scale-[1.02]"
              />
              <button
                onClick={() => setZoomOpen(true)}
                className="absolute top-4 right-4 p-2 bg.vault/80 text-[var(--color-ivory)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
                aria-label="Zoom image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Detail Column (Right 42% -> lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Category Eyebrow */}
            <span className="block font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
              {product.collectionTag || 'TEMPLE JEWELLERY'}
            </span>

            {/* 2. Bodoni Product Name */}
            <h1 className="font-bodoni text-[32px] sm:text-[40px] text-[var(--color-ink)] leading-tight">
              {product.name}
            </h1>

            {/* 3. Price Row */}
            <div className="space-y-1 border-b border-[var(--color-hairline)] pb-4">
              <div className="flex items-baseline gap-3">
                <span className="font-karla text-[24px] font-medium text-[var(--color-ink)] [font-variant-numeric:tabular-nums]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice && (
                  <span className="font-karla text-[16px] text-[var(--color-hairline)] line-through [font-variant-numeric:tabular-nums]">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="font-karla text-[11px] text-[var(--color-ink)]/60">
                Inclusive of all taxes · Insured delivery calculated at checkout
              </p>
            </div>

            {/* 4. Rating Text Link */}
            <a href="#reviews" className="inline-block font-karla text-[13px] text-[var(--color-ink)]/70 hover:text-[var(--color-gold)] transition-colors">
              {product.rating || 4.8} · {product.reviewCount || 42} reviews
            </a>

            {/* 5. Short Description */}
            <p className="font-karla text-[15px] text-[var(--color-ink)]/80 leading-relaxed max-w-[62ch]">
              {product.shortDescription}
            </p>

            {/* 6. The Inscription Plate */}
            <InscriptionPlate product={product} />

            {/* 7. Quantity Stepper + Add to Bag + Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Hairline Stepper 44px Tall */}
                <div className="flex items-center border border-[var(--color-hairline)] h-[44px] bg-[var(--color-bone)] text-sm font-karla">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors h-full"
                  >
                    -
                  </button>
                  <span className="px-3 font-medium text-[var(--color-ink)]">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3 text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors h-full"
                  >
                    +
                  </button>
                </div>

                {/* Gold Add to Bag */}
                <Button
                  variant="gold"
                  className="flex-1 h-[52px]"
                  onClick={handleAddToCart}
                >
                  {isAdded ? 'Added to Bag' : 'Add to Bag'}
                </Button>

                {/* Ghost Buy Now */}
                <Button
                  variant="ghost"
                  className="h-[52px] px-6"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>

              {/* Secondary Row: Wishlist + WhatsApp */}
              <div className="flex items-center justify-between pt-2 text-xs font-karla">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex items-center gap-1.5 hover:text-[var(--color-gold)] transition-colors cursor-pointer ${
                    isWishlisted ? 'text-[var(--color-gold)] font-medium' : 'text-[var(--color-ink)]/70'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : ''}`} />
                  <span>{isWishlisted ? 'Saved in Wishlist' : 'Save to wishlist'}</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--color-leaf)] text-[var(--color-leaf)] font-marcellus text-[11px] uppercase tracking-[0.14em] hover:bg-[var(--color-leaf)]/5 transition-colors rounded-[2px]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* 9. Delivery Pincode Check */}
            <div className="border-t border-[var(--color-hairline)] pt-4 space-y-2 font-karla">
              <span className="block font-marcellus text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Estimate Delivery & Serviceability
              </span>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2 bg-[var(--color-bone)] border-b border-[var(--color-hairline)] focus:border-[var(--color-gold)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/40 outline-none rounded-[2px]"
                />
                <Button type="submit" variant="ghost" size="sm">
                  Check
                </Button>
              </form>
              {pincodeResult && (
                <p className="text-xs text-[var(--color-leaf)] font-medium pt-1">
                  {pincodeResult}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section: Description · Craft & care · Reviews (42) · Shipping & returns */}
        <section id="reviews" className="space-y-8 pt-12 border-t border-[var(--color-hairline)]">
          <div className="flex border-b border-[var(--color-hairline)] space-x-8 font-marcellus text-[12px] uppercase tracking-[0.18em] overflow-x-auto">
            {(['description', 'craft', 'reviews', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 relative transition-colors cursor-pointer ${
                  activeTab === tab ? 'text-[var(--color-gold)]' : 'text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]'
                }`}
              >
                {tab === 'description' && 'Description'}
                {tab === 'craft' && 'Craft & Care'}
                {tab === 'reviews' && `Reviews (${product.reviewCount || 42})`}
                {tab === 'shipping' && 'Shipping & Returns'}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--color-gold)]" />
                )}
              </button>
            ))}
          </div>

          <div className="max-w-[62ch] font-karla text-[16px] text-[var(--color-ink)]/80 leading-[1.65] space-y-6">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>{product.story || product.shortDescription}</p>
                <p>
                  Forged in traditional 22kt gold plating over brass with hand-rubbed antique terracotta patina. Every central plaque is raised by master sthapatis to preserve temple art traditions.
                </p>
              </div>
            )}

            {activeTab === 'craft' && (
              <div className="space-y-4 text-sm">
                <h4 className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                  Care Guidelines
                </h4>
                <ul className="space-y-2 list-disc pl-5">
                  {product.careNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 text-sm">
                <div className="flex items-center gap-4 border-b border-[var(--color-hairline)] pb-4">
                  <span className="font-bodoni text-[36px] text-[var(--color-ink)]">{product.rating || 4.8}</span>
                  <div className="text-xs text-[var(--color-ink)]/70">
                    <p className="font-semibold text-[var(--color-ink)]">Overall Rating</p>
                    <p>Based on {product.reviewCount || 42} verified patron reviews</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between font-medium text-[var(--color-ink)] text-xs">
                      <span>Meenakshi S.</span>
                      <span className="text-[var(--color-ink)]/40">Verified Buyer · 12 Aug 2026</span>
                    </div>
                    <p className="text-[14px]">
                      The weight and antique terracotta patina are exquisite. It feels like an heirloom passed down through generations.
                    </p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-[var(--color-hairline)]/40">
                    <div className="flex justify-between font-medium text-[var(--color-ink)] text-xs">
                      <span>Ananya R.</span>
                      <span className="text-[var(--color-ink)]/40">Verified Buyer · 04 Jul 2026</span>
                    </div>
                    <p className="text-[14px]">
                      Arrived in a handcrafted wooden repository with hallmarked certificates. Outstanding craft precision.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3 text-sm">
                <p>
                  Complimentary armored transit across India for reservations over ₹1,999. Every shipment is fully insured against damage or loss in transit.
                </p>
                <p>
                  7-day inspection window: If the piece does not meet your expectations upon delivery, return it in original condition for a full refund or exchange.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Related Section: "You may also like" (4 cards) */}
        {related.length > 0 && (
          <section className="space-y-8 pt-8">
            <GopuramRule size="md" />
            <div className="space-y-1 text-center">
              <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Curated Suggestions
              </span>
              <h2 className="font-bodoni text-[32px] text-[var(--color-ink)]">
                You may also like
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[32px] gap-y-[56px]">
              {related.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Complete the Set (3 cards) */}
        {completeSet.length > 0 && (
          <section className="space-y-8 pt-8">
            <div className="space-y-1 text-center">
              <span className="font-marcellus text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Harmonious Pairings
              </span>
              <h2 className="font-bodoni text-[32px] text-[var(--color-ink)]">
                Complete the set
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[32px] gap-y-[56px]">
              {completeSet.map((setItem) => (
                <ProductCard key={setItem.id} product={setItem} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Full Screen Zoom Lightbox */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--color-vault)] flex items-center justify-center p-4">
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-6 right-6 p-3 text-[var(--color-ivory)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-4xl aspect-[4/5] max-h-[85vh]">
            <Image
              src={selectedImage || product.images[0]}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
