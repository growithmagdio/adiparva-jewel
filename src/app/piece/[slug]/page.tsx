'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { GopuramArch } from '@/components/storefront/gopuram-arch';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { getProductBySlug, getProducts } from '@/lib/data/queries';
import { Product, ProductVariant } from '@/lib/data/types';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useWishlistStore } from '@/lib/store/use-wishlist-store';
import { Heart, Check, MessageSquare, ShieldCheck, Truck, RotateCcw, Award, Zap, AlertCircle } from 'lucide-react';

import { getSiteConfig } from '@/lib/config/site-config';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';
  const siteConfig = getSiteConfig();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [related, setRelated] = React.useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>('');
  const [qty, setQty] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState<'description' | 'details' | 'reviews' | 'shipping'>('description');
  const [isAdded, setIsAdded] = React.useState(false);
  const [variantError, setVariantError] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => (product ? state.isInWishlist(product.id) : false));

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const item = await getProductBySlug(slug);

      if (item && item.status === 'live') {
        setProduct(item);
        setSelectedImage(item.images[0] || '/images/products/maharani-temple-necklace-1.jpg');
        if (item.variants && item.variants.length > 0) {
          setSelectedVariantId(item.variants[0].id);
        }

        const all = await getProducts({ status: 'live' });
        const rel = all.filter((p) => p.id !== item.id && p.categoryId === item.categoryId).slice(0, 4);
        setRelated(rel.length > 0 ? rel : all.filter((p) => p.id !== item.id).slice(0, 4));
      } else {
        setProduct(null);
      }
      setLoading(false);
    }
    if (slug) loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-6 aspect-[3/4] bg-[var(--color-sanctum)] animate-pulse rounded-[4px]" />
            <div className="lg:col-span-6 space-y-6">
              <div className="h-4 w-1/3 bg-[var(--color-sanctum)] animate-pulse" />
              <div className="h-10 w-3/4 bg-[var(--color-sanctum)] animate-pulse" />
              <div className="h-8 w-1/2 bg-[var(--color-sanctum)] animate-pulse" />
              <div className="h-48 w-full bg-[var(--color-sanctum)] animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-4">
          <KolamDivider />
          <h2 className="font-serif text-3xl text-[var(--color-ivory)]">Archive Plate Not Found</h2>
          <p className="font-jost text-sm text-[var(--color-sandal)]/70">The requested heritage plate is no longer in the active vault.</p>
          <Link
            href="/collections"
            className="h-10 px-6 border border-[var(--color-temple-gold)] text-[var(--color-temple-gold)] font-marcellus text-xs uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px]"
          >
            RETURN TO ARCHIVE
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const plateNo =
    product.plateNumber ||
    `PLATE AP-${String(Math.abs(product.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800 + 100).padStart(4, '0')}`;

  const isSoldOut = product.totalStock === 0 || (selectedVariant && selectedVariant.stock === 0);

  const handleAddToCart = () => {
    if (!selectedVariantId && product.variants.length > 0) {
      setVariantError('Please select a size/option before adding to cart.');
      return;
    }
    setVariantError('');

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || 'default-variant',
      name: product.name,
      image: selectedImage,
      price: product.price + (selectedVariant?.priceDelta || 0),
      variantLabel: selectedVariant?.label || 'Standard',
      qty,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (!selectedVariantId && product.variants.length > 0) {
      setVariantError('Select a size/option before proceeding to Buy Now.');
      return;
    }
    setVariantError('');

    const variantId = selectedVariant?.id || 'default-variant';
    router.push(`/checkout?buyNow=${product.id}&variant=${variantId}&qty=${qty}`);
  };

  const handleWhatsAppOrder = () => {
    if (!product || !siteConfig.isWhatsAppEnabled) return;
    const text = encodeURIComponent(
      `Greetings Adi Parva Atelier, I wish to reserve this piece:\n\n*Product:* ${product.name}\n*Plate:* ${plateNo}\n*Price:* ₹${product.price.toLocaleString('en-IN')}\n\nKindly assist with order confirmation.`
    );
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 pb-24 lg:pb-0">
        {/* Breadcrumb Navigation */}
        <div className="bg-[var(--color-sanctum)] border-b border-[var(--color-temple-gold)]/20 py-4 px-6 sm:px-8">
          <div className="max-w-[1440px] mx-auto font-marcellus text-[11px] uppercase tracking-[0.25em] text-[var(--color-temple-gold)] flex items-center gap-2">
            <Link href="/" className="hover:text-[var(--color-gold-light)] transition-colors">HOME</Link>
            <span className="text-[var(--color-sandal)]/40">/</span>
            <Link href="/collections" className="hover:text-[var(--color-gold-light)] transition-colors">SHOP</Link>
            <span className="text-[var(--color-sandal)]/40">/</span>
            <span className="text-[var(--color-ivory)]">{product.name}</span>
          </div>
        </div>

        {/* Product Details Section */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Gallery Left */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6">
              {/* Thumbnail Rail */}
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 scrollbar-none">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-20 aspect-[3/4] rounded-[4px] overflow-hidden border transition-all cursor-pointer ${
                      selectedImage === imgUrl
                        ? 'border-[var(--color-gold-light)] ring-1 ring-[var(--color-gold-light)]'
                        : 'border-[var(--color-temple-gold)]/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={imgUrl} alt={`${product.name} detail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image Gopuram Arch Vitrine */}
              <div className="flex-1">
                <GopuramArch
                  src={selectedImage}
                  alt={product.name}
                  aspect="portrait"
                  priority
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-[var(--color-temple-gold)]/30"
                />
              </div>
            </div>

            {/* Product Information Right */}
            <div className="lg:col-span-5 space-y-6">
              <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)] font-medium">
                {plateNo}
              </div>

              <h1 className="font-serif text-[36px] sm:text-[44px] font-light leading-tight text-[var(--color-ivory)]">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 text-[12px] text-[var(--color-temple-gold)]">
                <span className="tracking-widest">★★★★★</span>
                <span className="font-marcellus text-[11px] text-[var(--color-sandal)]">
                  4.8 ({product.reviewCount || 42} Patron Reviews)
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 border-y border-[var(--color-temple-gold)]/20 py-4">
                <span className="font-sans text-[28px] font-normal text-[var(--color-ivory)] tabular-nums">
                  ₹{(product.price + (selectedVariant?.priceDelta || 0)).toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice && (
                  <span className="font-sans text-[16px] text-[#7A6F60] line-through tabular-nums">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="font-marcellus text-[10px] uppercase tracking-wider font-semibold text-[var(--color-kemp-red)] border border-[var(--color-kemp-red)]/40 px-2 py-0.5">
                    {discountPercent}% OFF
                  </span>
                )}
                {isSoldOut ? (
                  <span className="ml-auto font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#B3261E] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B3261E]" />
                    SOLD OUT
                  </span>
                ) : product.totalStock <= (product.lowStockThreshold ?? 3) ? (
                  <span className="ml-auto font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#9A6A05] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#9A6A05] animate-pulse" />
                    ONLY {product.totalStock} LEFT
                  </span>
                ) : (
                  <span className="ml-auto font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-temple-gold)] animate-pulse" />
                    IN STOCK ({product.totalStock} REMAINING)
                  </span>
                )}
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <label className="font-marcellus text-[11px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)] flex items-center justify-between">
                    <span>METAL & SPECIFICATION:</span>
                    <span className="text-[var(--color-sandal)]/60 text-[10px]">
                      {selectedVariant?.label}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {product.variants.map((v: ProductVariant) => {
                      const active = v.id === selectedVariantId;
                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedVariantId(v.id);
                            setVariantError('');
                          }}
                          disabled={v.stock === 0}
                          className={`p-2.5 rounded-[2px] border text-left transition-all cursor-pointer ${
                            v.stock === 0
                              ? 'border-[#3D2418] opacity-40 cursor-not-allowed bg-[var(--color-sanctum)]'
                              : active
                              ? 'border-[var(--color-gold-light)] bg-[#5C1A1B]/60 text-[var(--color-ivory)] shadow-md'
                              : 'border-[#3D2418] bg-[var(--color-sanctum)] text-[var(--color-sandal)] hover:border-[var(--color-temple-gold)]/50'
                          }`}
                        >
                          <div className="font-marcellus text-[10px] uppercase tracking-wider text-[var(--color-ivory)] truncate">
                            {v.label}
                          </div>
                          <div className="text-[10px] text-[var(--color-temple-gold)]">
                            {v.priceDelta !== 0 ? `+₹${v.priceDelta}` : 'Standard'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variant Selection Error Prompt */}
              {variantError && (
                <div className="p-3 bg-[#B3261E]/15 border border-[#B3261E]/40 rounded-[2px] text-[#FBE9E7] text-xs flex items-center gap-2 font-jost animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-[#B3261E] shrink-0" />
                  <span>{variantError}</span>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 pt-2">
                <span className="font-marcellus text-[11px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                  QUANTITY:
                </span>
                <div className="flex items-center border border-[var(--color-temple-gold)]/40 rounded-[2px] h-10">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={isSoldOut}
                    className="w-10 h-full flex items-center justify-center text-[var(--color-ivory)] hover:bg-[var(--color-sanctum)] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-jost text-sm text-[var(--color-ivory)]">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min((selectedVariant?.stock || product.totalStock), q + 1))}
                    disabled={isSoldOut || qty >= (selectedVariant?.stock || product.totalStock)}
                    className="w-10 h-full flex items-center justify-center text-[var(--color-ivory)] hover:bg-[var(--color-sanctum)] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Desktop Dual Buttons: Add to Cart (Outline) & Buy Now (Solid Maroon) */}
              <div className="space-y-3 pt-4">
                {isSoldOut ? (
                  <button
                    disabled
                    className="w-full h-[54px] bg-neutral-800 text-neutral-500 font-marcellus text-[11px] uppercase tracking-[0.3em] font-semibold flex items-center justify-center rounded-[2px] border border-neutral-700 cursor-not-allowed"
                  >
                    SOLD OUT
                  </button>
                ) : (
                  <div className="flex gap-4">
                    {/* Add to Cart: Gold Outline Button */}
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 h-[54px] border border-[var(--color-gold-600)] text-[var(--color-gold-400)] hover:bg-[var(--color-gold-600)]/10 font-marcellus text-[11px] uppercase tracking-[0.25em] font-semibold flex items-center justify-center gap-2 rounded-[2px] transition-colors cursor-pointer"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>RESERVED IN CART</span>
                        </>
                      ) : (
                        <span>ADD TO CART</span>
                      )}
                    </button>

                    {/* Buy Now: Solid Maroon Button */}
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 h-[54px] bg-[#5C1A1B] text-[#FAF0E4] hover:bg-[#441213] border border-[#B8761F]/40 font-marcellus text-[11px] uppercase tracking-[0.25em] font-bold flex items-center justify-center gap-2 rounded-[2px] shadow-xl transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-[#D9A441] fill-current" />
                      <span>BUY NOW</span>
                    </button>

                    {/* Wishlist Heart */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-[54px] h-[54px] border border-[var(--color-temple-gold)]/40 rounded-[2px] flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isWishlisted
                          ? 'bg-[#5C1A1B] text-[var(--color-gold-light)] border-[var(--color-gold-light)]'
                          : 'text-[var(--color-ivory)] hover:text-[var(--color-gold-light)]'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )}

                {/* WhatsApp Hairline Order Button */}
                {siteConfig.isWhatsAppEnabled && (
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full h-[48px] border border-[var(--color-temple-gold)]/50 text-[var(--color-temple-gold)] hover:bg-[var(--color-sanctum)] hover:text-[var(--color-gold-light)] font-marcellus text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 rounded-[2px] transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[var(--color-temple-gold)] stroke-[1.5]" />
                    <span>ORDER DIRECTLY ON WHATSAPP</span>
                  </button>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 border-t border-[var(--color-temple-gold)]/20 pt-6 font-jost text-xs text-[var(--color-sandal)]/80">
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-[var(--color-temple-gold)]" />
                  <span>BIS Hallmarked 22kt Gold</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[var(--color-temple-gold)]" />
                  <span>Insured Express Transit</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[var(--color-temple-gold)]" />
                  <span>7-Day Inspection Window</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-temple-gold)]" />
                  <span>Lifetime Atelier Polish</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Detail Tabs */}
          <div className="mt-20 border-t border-[var(--color-temple-gold)]/20 pt-10 space-y-8">
            <div className="flex items-center justify-center gap-8 border-b border-[var(--color-temple-gold)]/20 pb-4 overflow-x-auto">
              {[
                { id: 'description', label: 'DESCRIPTION' },
                { id: 'details', label: 'SPECIFICATIONS' },
                { id: 'reviews', label: `REVIEWS (${product.reviewCount || 42})` },
                { id: 'shipping', label: 'SHIPPING & RETURNS' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`font-marcellus text-[12px] uppercase tracking-[0.3em] pb-2 relative transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-[var(--color-gold-light)]'
                      : 'text-[var(--color-sandal)]/60 hover:text-[var(--color-ivory)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--color-temple-gold)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="max-w-[860px] mx-auto text-[15px] text-[var(--color-sandal)] font-jost leading-relaxed">
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-[var(--color-ivory)]">Provenance Notes</h3>
                  <p className="whitespace-pre-line font-light">{product.story}</p>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-[var(--color-ivory)]">Atelier Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[var(--color-temple-gold)]/20 p-6 bg-[var(--color-sanctum)] rounded-[4px]">
                    {product.specs.map((sp, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[var(--color-temple-gold)]/10 pb-2">
                        <span className="font-marcellus text-xs uppercase tracking-wider text-[var(--color-temple-gold)]">
                          {sp.label}
                        </span>
                        <span className="text-sm text-[var(--color-ivory)]">{sp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6 text-center">
                  <KolamDivider />
                  <h3 className="font-serif text-2xl text-[var(--color-ivory)]">Patron Endorsements</h3>
                  <p className="italic">“Exceptional craftsmanship. The antique gold patination is authentic to Chola era artifacts.”</p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-[var(--color-ivory)]">Transit & Assurance</h3>
                  <p>All orders are dispatched via tamper-evident insured courier service across India. Deliveries take 3–5 business days.</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Plates */}
          {related.length > 0 && (
            <div className="mt-20 border-t border-[var(--color-temple-gold)]/20 pt-16 space-y-8">
              <div className="text-center space-y-2">
                <div className="font-marcellus text-[11px] uppercase tracking-[0.3em] text-[var(--color-temple-gold)]">
                  COMPLEMENTARY TREASURES
                </div>
                <h2 className="font-serif text-[36px] font-light text-[var(--color-ivory)]">
                  Related <em className="italic text-gold-gradient font-normal">Plates</em>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Mobile Sticky Bottom Bar (Dual Buttons 50/50) */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#1C0F07] border-t border-[#3D2418] p-3 z-40 flex items-center gap-3 shadow-2xl">
          {isSoldOut ? (
            <button
              disabled
              className="w-full h-11 bg-neutral-800 text-neutral-500 font-marcellus text-[10px] uppercase tracking-[0.2em] font-semibold flex items-center justify-center rounded-[2px] cursor-not-allowed"
            >
              SOLD OUT
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                className="flex-1 h-11 border border-[var(--color-gold-600)] text-[var(--color-gold-400)] font-marcellus text-[10px] uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-1.5 rounded-[2px]"
              >
                {isAdded ? 'RESERVED' : 'ADD TO CART'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 h-11 bg-[#5C1A1B] text-[#FAF0E4] font-marcellus text-[10px] uppercase tracking-[0.15em] font-bold flex items-center justify-center gap-1.5 rounded-[2px] shadow-lg"
              >
                <Zap className="w-3.5 h-3.5 text-[#D9A441] fill-current" />
                <span>BUY NOW</span>
              </button>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
