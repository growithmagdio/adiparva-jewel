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
import { getInitialSeedData } from '@/lib/data/store';
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

  const [product, setProduct] = React.useState<Product | null>(() => {
    if (!slug) return null;
    const store = getInitialSeedData();
    return store.products.find((p) => p.slug === slug || p.id === slug) || null;
  });

  const [related, setRelated] = React.useState<Product[]>(() => {
    if (!slug) return [];
    const store = getInitialSeedData();
    const item = store.products.find((p) => p.slug === slug || p.id === slug);
    if (item) {
      const live = store.products.filter((p) => p.status === 'live');
      const rel = live.filter((p) => p.id !== item.id && p.categoryId === item.categoryId).slice(0, 4);
      return rel.length > 0 ? rel : live.filter((p) => p.id !== item.id).slice(0, 4);
    }
    return [];
  });

  const [selectedImage, setSelectedImage] = React.useState<string>(() => {
    if (!slug) return '/images/products/maharani-temple-necklace-1.jpg';
    const store = getInitialSeedData();
    const item = store.products.find((p) => p.slug === slug || p.id === slug);
    if (item?.images?.length) return item.images[0];
    return '/images/products/maharani-temple-necklace-1.jpg';
  });

  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(() => {
    if (!slug) return '';
    const store = getInitialSeedData();
    const item = store.products.find((p) => p.slug === slug || p.id === slug);
    if (item?.variants?.length) return item.variants[0].id;
    return '';
  });

  const [qty, setQty] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState<'description' | 'details' | 'reviews' | 'shipping'>('description');
  const [isAdded, setIsAdded] = React.useState(false);
  const [variantError, setVariantError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => (product ? state.isInWishlist(product.id) : false));

  React.useEffect(() => {
    async function loadData() {
      if (!slug) return;
      const item = await getProductBySlug(slug);

      if (item && item.status === 'live') {
        setProduct(item);
        if (item.images && item.images.length > 0) {
          setSelectedImage(item.images[0]);
        }
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
    loadData();
  }, [slug]);

  React.useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} | ADI PARVA`;
    } else {
      document.title = 'ADI PARVA — The Temple of Tradition';
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF5EC] text-[#5B1018] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-6 aspect-[3/4] bg-[#F2E7D7] animate-pulse rounded-[4px]" />
            <div className="lg:col-span-6 space-y-6">
              <div className="h-4 w-1/3 bg-[#F2E7D7] animate-pulse" />
              <div className="h-10 w-3/4 bg-[#F2E7D7] animate-pulse" />
              <div className="h-8 w-1/2 bg-[#F2E7D7] animate-pulse" />
              <div className="h-48 w-full bg-[#F2E7D7] animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF5EC] text-[#5B1018] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-4">
          <KolamDivider />
          <h2 className="font-serif text-3xl text-[#5B1018]">Piece Not Found</h2>
          <p className="text-sm text-[#5B1018]/85">The requested heritage piece is no longer in the active collection.</p>
          <Link
            href="/collections"
            className="h-11 px-7 bg-[#5B1018] text-[#FAF5EC] font-sans text-xs uppercase tracking-[0.2em] inline-flex items-center justify-center rounded-[2px] font-semibold hover:bg-[#3B090D] transition-colors"
          >
            RETURN TO COLLECTION
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
      setVariantError('Please select an option before adding to cart.');
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
      setVariantError('Select an option before proceeding to Buy Now.');
      return;
    }
    setVariantError('');

    const variantId = selectedVariant?.id || 'default-variant';
    router.push(
      `/checkout?buyNow=${product.id}&slug=${product.slug}&variant=${variantId}&qty=${qty}&from=${encodeURIComponent(`/piece/${product.slug}`)}`
    );
  };

  const handleWhatsAppOrder = () => {
    if (!product || !siteConfig.isWhatsAppEnabled) return;
    const text = encodeURIComponent(
      `Greetings Adi Parva Atelier, I wish to inquire about this piece:\n\n*Product:* ${product.name}\n*Identifier:* ${plateNo}\n*Price:* ₹${(product.price + (selectedVariant?.priceDelta || 0)).toLocaleString('en-IN')}\n\nKindly assist with reservation.`
    );
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#5B1018] flex flex-col font-sans selection:bg-[#5B1018] selection:text-[#FAF5EC]">
      <Header />

      <main className="flex-1 pb-24 lg:pb-0">
        {/* Breadcrumb Navigation */}
        <div className="bg-[#F2E7D7]/60 border-b border-[#E7D7C0] py-3.5 px-6 sm:px-8">
          <div className="max-w-[1440px] mx-auto text-[11px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold flex items-center gap-2">
            <Link href="/" className="hover:text-[#5B1018] transition-colors">HOME</Link>
            <span className="text-[#B68A3A]/40">/</span>
            <Link href="/collections" className="hover:text-[#5B1018] transition-colors">COLLECTION</Link>
            <span className="text-[#B68A3A]/40">/</span>
            <span className="text-[#5B1018] truncate max-w-[280px] sm:max-w-none">{product.name}</span>
          </div>
        </div>

        {/* Product Details Section */}
        <section className="max-w-[1440px] mx-auto px-6 sm:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Gallery Left */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-5">
              {/* Thumbnail Rail */}
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 scrollbar-none py-1">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-20 aspect-[3/4] rounded-[3px] overflow-hidden border transition-all cursor-pointer ${
                      selectedImage === imgUrl
                        ? 'border-[#5B1018] ring-2 ring-[#B68A3A]/60 shadow-sm'
                        : 'border-[#E7D7C0] bg-[#F2E7D7] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Image src={imgUrl} alt={`${product.name} view ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image Gopuram Arch Vitrine */}
              <div className="flex-1 bg-[#FFFFFF] p-2 sm:p-4 rounded-[6px] border border-[#E7D7C0] shadow-sm">
                <GopuramArch
                  src={selectedImage}
                  alt={product.name}
                  aspect="portrait"
                  priority
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="shadow-lg border border-[#E7D7C0]"
                />
              </div>
            </div>

            {/* Product Information Right */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.25em] text-[#B68A3A] font-semibold">
                  {plateNo}
                </div>

                <h1 className="font-serif text-[32px] sm:text-[42px] font-normal leading-tight text-[#5B1018]">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 text-xs text-[#B68A3A]">
                  <span className="tracking-widest">★★★★★</span>
                  <span className="text-[12px] text-[#5B1018]/85 font-medium">
                    4.9 ({product.reviewCount || 42} Customer Reviews)
                  </span>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 border-y border-[#E7D7C0] py-4 bg-[#F2E7D7]/30 px-3 rounded-[3px]">
                <span className="font-serif text-[30px] font-medium text-[#5B1018] tabular-nums">
                  ₹{(product.price + (selectedVariant?.priceDelta || 0)).toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice && (
                  <span className="font-sans text-[16px] text-[#5B1018]/60 line-through tabular-nums">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-[#5B1018] bg-[#F2E7D7] border border-[#B68A3A]/40 px-2.5 py-0.5 rounded-[2px]">
                    {discountPercent}% OFF
                  </span>
                )}
                {isSoldOut ? (
                  <span className="ml-auto font-sans text-[10px] uppercase tracking-[0.2em] text-[#B3261E] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B3261E]" />
                    OUT OF STOCK
                  </span>
                ) : product.totalStock <= (product.lowStockThreshold ?? 3) ? (
                  <span className="ml-auto font-sans text-[10px] uppercase tracking-[0.16em] text-[#9A6A05] font-semibold flex items-center gap-1.5 bg-[#FBEFD6] px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-[#9A6A05] animate-pulse" />
                    ONLY {product.totalStock} REMAINING
                  </span>
                ) : (
                  <span className="ml-auto font-sans text-[10px] uppercase tracking-[0.16em] text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    IN STOCK ({product.totalStock} UNITS)
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-[14.5px] text-[#5B1018] leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#5B1018] font-semibold flex items-center justify-between">
                    <span>SPECIFICATION & VARIANT:</span>
                    <span className="text-[#B68A3A] text-[11px]">
                      {selectedVariant?.label}
                    </span>
                  </div>
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
                          className={`p-2.5 rounded-[3px] border text-left transition-all cursor-pointer ${
                            v.stock === 0
                              ? 'border-[#E7D7C0] opacity-40 cursor-not-allowed bg-[#F2E7D7]'
                              : active
                              ? 'border-[#5B1018] bg-[#5B1018] text-[#FAF5EC] shadow-sm ring-1 ring-[#5B1018]'
                              : 'border-[#E7D7C0] bg-[#FFFFFF] text-[#5B1018] hover:border-[#B68A3A]'
                          }`}
                        >
                          <div className="font-sans text-[11px] font-medium truncate">
                            {v.label}
                          </div>
                          <div className={`text-[10.5px] ${active ? 'text-[#D7B56D]' : 'text-[#B68A3A]'}`}>
                            {v.priceDelta !== 0 ? `+₹${v.priceDelta.toLocaleString('en-IN')}` : 'Included'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variant Selection Error Prompt */}
              {variantError && (
                <div className="p-3 bg-[#FBE9E7] border border-[#B3261E]/40 rounded-[2px] text-[#B3261E] text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{variantError}</span>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#5B1018] font-semibold">
                  QUANTITY:
                </span>
                <div className="flex items-center border border-[#B68A3A] rounded-[2px] h-10 bg-[#FFFFFF]">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={isSoldOut}
                    className="w-10 h-full flex items-center justify-center text-[#5B1018] hover:bg-[#F2E7D7] transition-colors cursor-pointer disabled:opacity-40 font-semibold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-sans font-semibold text-sm text-[#5B1018]">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min((selectedVariant?.stock || product.totalStock), q + 1))}
                    disabled={isSoldOut || qty >= (selectedVariant?.stock || product.totalStock)}
                    className="w-10 h-full flex items-center justify-center text-[#5B1018] hover:bg-[#F2E7D7] transition-colors cursor-pointer disabled:opacity-40 font-semibold"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Desktop Dual Buttons: Add to Cart (Outline) & Buy Now (Solid Maroon) */}
              <div className="space-y-3 pt-3">
                {isSoldOut ? (
                  <button
                    disabled
                    className="w-full h-[52px] bg-[#E7D7C0] text-[#765E55] font-sans text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center rounded-[2px] cursor-not-allowed"
                  >
                    OUT OF STOCK
                  </button>
                ) : (
                  <div className="flex gap-3.5">
                    {/* Add to Cart: Outline Gold */}
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 h-[52px] border border-[#B68A3A] text-[#5B1018] bg-[#FFFFFF] hover:bg-[#F2E7D7] font-sans text-xs uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2 rounded-[2px] transition-all cursor-pointer shadow-xs"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>ADDED TO CART</span>
                        </>
                      ) : (
                        <span>ADD TO CART</span>
                      )}
                    </button>

                    {/* Buy Now: Solid Deep Maroon */}
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 h-[52px] bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2 rounded-[2px] shadow-md transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-[#D7B56D] fill-current" />
                      <span>BUY NOW</span>
                    </button>

                    {/* Wishlist Heart */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-[52px] h-[52px] border rounded-[2px] flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isWishlisted
                          ? 'bg-[#5B1018] text-[#FAF5EC] border-[#5B1018]'
                          : 'border-[#E7D7C0] bg-[#FFFFFF] text-[#5B1018] hover:border-[#B68A3A]'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )}

                {/* WhatsApp Order Button */}
                {siteConfig.isWhatsAppEnabled && (
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full h-[46px] border border-[#B68A3A] bg-[#FAF5EC] text-[#5B1018] hover:bg-[#F2E7D7] font-sans text-xs uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2.5 rounded-[2px] transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#B68A3A]" />
                    <span>INQUIRE / RESERVE VIA WHATSAPP</span>
                  </button>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3.5 border-t border-[#E7D7C0] pt-6 text-xs text-[#5B1018]">
                <div className="flex items-center gap-2.5 p-2.5 bg-[#F2E7D7]/40 rounded border border-[#E7D7C0]">
                  <Award className="w-4 h-4 text-[#B68A3A] shrink-0" />
                  <span className="font-medium">BIS Hallmarked Gold</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-[#F2E7D7]/40 rounded border border-[#E7D7C0]">
                  <Truck className="w-4 h-4 text-[#B68A3A] shrink-0" />
                  <span className="font-medium">Insured Express Delivery</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-[#F2E7D7]/40 rounded border border-[#E7D7C0]">
                  <RotateCcw className="w-4 h-4 text-[#B68A3A] shrink-0" />
                  <span className="font-medium">7-Day Return Policy</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-[#F2E7D7]/40 rounded border border-[#E7D7C0]">
                  <ShieldCheck className="w-4 h-4 text-[#B68A3A] shrink-0" />
                  <span className="font-medium">Lifetime Maintenance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Detail Tabs */}
          <div className="mt-16 sm:mt-20 border-t border-[#E7D7C0] pt-10 space-y-8">
            <div className="flex items-center justify-center gap-6 sm:gap-10 border-b border-[#E7D7C0] pb-4 overflow-x-auto">
              {[
                { id: 'description', label: 'DESCRIPTION & STORY' },
                { id: 'details', label: 'SPECIFICATIONS' },
                { id: 'reviews', label: `REVIEWS (${product.reviewCount || 42})` },
                { id: 'shipping', label: 'SHIPPING & RETURNS' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`font-sans text-[11.5px] uppercase tracking-[0.2em] pb-2 relative transition-colors cursor-pointer font-semibold ${
                    activeTab === tab.id
                      ? 'text-[#5B1018]'
                      : 'text-[#5B1018]/70 hover:text-[#5B1018]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B68A3A]" />
                  )}
                </button>
              ))}
            </div>

            <div className="max-w-[860px] mx-auto text-[15px] text-[#5B1018] leading-relaxed">
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-[#5B1018]">Heritage & Provenance</h3>
                  <p className="whitespace-pre-line text-[#5B1018]/90 font-medium">{product.story}</p>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-[#5B1018]">Piece Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#E7D7C0] p-6 bg-[#FFFFFF] rounded-[4px]">
                    {product.specs.map((sp, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[#E7D7C0] pb-2">
                        <span className="text-xs uppercase tracking-wider text-[#B68A3A] font-semibold">
                          {sp.label}
                        </span>
                        <span className="text-sm font-medium text-[#5B1018]">{sp.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-b border-[#E7D7C0] pb-2">
                      <span className="text-xs uppercase tracking-wider text-[#B68A3A] font-semibold">
                        Craft Time
                      </span>
                      <span className="text-sm font-medium text-[#5B1018]">{product.craftTime}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E7D7C0] pb-2">
                      <span className="text-xs uppercase tracking-wider text-[#B68A3A] font-semibold">
                        Artisan Cluster
                      </span>
                      <span className="text-sm font-medium text-[#5B1018]">{product.artisanCluster}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6 text-center">
                  <KolamDivider />
                  <h3 className="font-serif text-2xl text-[#5B1018]">Patron Endorsements</h3>
                  <div className="bg-[#FFFFFF] p-6 border border-[#E7D7C0] rounded max-w-xl mx-auto space-y-2">
                    <div className="text-xs text-[#B68A3A] tracking-widest">★★★★★</div>
                    <p className="italic text-[#5B1018]">
                      “Exceptional craftsmanship. The antique gold patination and stone settings are authentic to royal temple treasury artifacts.”
                    </p>
                    <div className="text-xs text-[#5B1018]/80 font-semibold uppercase tracking-wider">
                      Verified Patron Purchase — Chennai Atelier
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl text-[#5B1018]">Transit & Guarantee</h3>
                  <p className="text-[#5B1018]/90 font-medium">
                    All orders are dispatched via tamper-evident insured express courier across India. Delivery arrives in 3–5 business days in a custom velvet-lined presentation casket with BIS hallmarking certificate.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-20 border-t border-[#E7D7C0] pt-14 space-y-8">
              <div className="text-center space-y-2">
                <div className="text-[11px] uppercase tracking-[0.26em] text-[#B68A3A] font-semibold">
                  COMPLEMENTARY TREASURES
                </div>
                <h2 className="font-serif text-[32px] sm:text-[38px] font-normal text-[#5B1018]">
                  From the Same Collection
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

        {/* Mobile Sticky Bottom Bar (Dual Buttons) */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#FAF5EC]/98 backdrop-blur-md border-t border-[#E7D7C0] p-3 z-40 flex items-center gap-2.5 shadow-xl">
          {isSoldOut ? (
            <button
              disabled
              className="w-full h-11 bg-[#E7D7C0] text-[#5B1018]/70 text-[10px] uppercase tracking-[0.2em] font-semibold flex items-center justify-center rounded-[2px] cursor-not-allowed"
            >
              OUT OF STOCK
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                className="flex-1 h-11 border border-[#B68A3A] bg-[#FFFFFF] text-[#5B1018] text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center justify-center gap-1.5 rounded-[2px]"
              >
                {isAdded ? 'ADDED' : 'ADD TO CART'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 h-11 bg-[#5B1018] text-[#FAF5EC] text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center justify-center gap-1.5 rounded-[2px] shadow-md"
              >
                <Zap className="w-3.5 h-3.5 text-[#D7B56D] fill-current" />
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
