# ADI PARVA — Antigravity Build Prompt Pack
### Heritage Jewellery E-Commerce (Storefront + Admin) — Client Demo Build

> **How to use this pack**
> 1. Create an empty folder, open it in **Antigravity**.
> 2. Save this whole file as `AGENTS.md` in the project root (Antigravity reads it as standing context for every task).
> 3. Paste **Section 0 (Mission Brief)** as your first message, then say: *"Read AGENTS.md. Execute Phase 0 only. Stop and show me the plan before Phase 1."*
> 4. Run one phase per turn. After each phase, paste the phase's **Acceptance Checklist** back and ask it to self-verify with screenshots.
> 5. Never let it run more than one phase unattended — the demo quality lives in the review loop.

---

## 0. MISSION BRIEF (paste this first)

You are the lead front-end engineer and design implementer for a boutique studio. Build a complete, deployable demo of **Adi Parva** — a luxury Indian heritage jewellery house selling temple jewellery, Kundan, Polki, Jadau and Meenakari pieces. The client is presenting this to their board in one week, so it must feel like a finished product, not a wireframe.

Two surfaces, one codebase:

- **Storefront** (`/`) — public shopping experience, browsing to checkout confirmation.
- **Admin** (`/admin`) — the operations console. A reference screenshot of the approved admin dashboard is supplied; **match it closely** (Section 8.1 has the pixel checklist).

There is **no backend**. All data comes from a typed local data layer with seed content, persisted to `localStorage` so the demo feels alive across page loads. The data layer must be written so it can be swapped for a real API later by replacing one module.

Everything must be filled with real, specific, credible content. No lorem ipsum, no placeholder grey boxes, no "Product Name 1". Empty states, loading states and error states are part of the deliverable, not an afterthought.

**Do not skip the planning step.** Before writing code in any phase, output a short plan and wait for approval.

---

## 1. STACK & CONSTRAINTS

**Required**
- Next.js 15 (App Router, TypeScript strict, `src/` directory, Turbopack dev)
- Tailwind CSS v4 (CSS-first config via `@theme` in `globals.css` — no `tailwind.config.js` colour duplication)
- shadcn/ui for primitives only (Dialog, Sheet, DropdownMenu, Select, Tabs, Popover, Toast/Sonner, Command). **Restyle every primitive to the Adi Parva tokens** — default shadcn slate/zinc must not survive anywhere.
- `lucide-react` for icons
- `framer-motion` for the four sanctioned motion moments (Section 6.4) and nothing else
- `next/font/google` for Playfair Display + Poppins (self-hosted, `display: swap`)
- Zustand for cart / wishlist / admin session state (persist middleware → localStorage)
- `zod` + `react-hook-form` for every form
- `date-fns` for dates
- `recharts` for the two admin charts only

**Forbidden**
- No database, no Prisma, no auth provider, no Stripe/Razorpay SDK. All mocked.
- No `<img>` — use `next/image` everywhere with explicit sizes.
- No `any`. No `@ts-ignore`.
- No component file over ~200 lines — split it.
- No emoji anywhere in the UI.
- No stock-photo watermark URLs. Images come from `/public/images/...` (Section 4.4 tells you how to source them).

**Quality floor (non-negotiable, applies to every phase)**
- Responsive from 360px to 1920px. The admin console collapses its sidebar to an icon rail below `lg`, and to a Sheet drawer below `md`.
- Visible keyboard focus ring on every interactive element: `2px solid var(--gold-500)` with `2px` offset.
- All images have meaningful `alt`. All icon-only buttons have `aria-label`.
- `prefers-reduced-motion: reduce` disables all transforms and transitions.
- Colour contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI borders.
- `npm run build` passes with zero TypeScript errors and zero ESLint errors before any phase is called done.

---

## 2. BRAND & DESIGN SYSTEM

### 2.1 Positioning

Adi Parva — named for the first book of the Mahabharata, "the book of beginnings." The house sells heirloom-grade South Indian temple jewellery and North Indian Kundan/Polki. The voice is **custodial, not salesy**: the brand describes itself as keeping pieces rather than selling them. Admin roles are curatorial (Chief Curator, Curator, Registrar) because the client's internal language treats the catalogue as a collection. Preserve that vocabulary everywhere — it is the whole personality of the product.

Tone rules for all UI copy:
- Sentence case for sentences, ALL CAPS with wide tracking for micro-labels only.
- Active voice. A button says what happens: "Reserve this piece", not "Submit".
- The word used on the button is the word used in the confirmation toast.
- Never apologise in error states. Say what happened and what to do.
- Products are *pieces*. The catalogue is *the collection*. Stock is *availability*. Discounts are *seasonal offers*.

### 2.2 Colour tokens

Declare these once in `globals.css` under `@theme`. Every colour in the app references a token — no raw hex in components.

```css
@theme {
  /* Ink — sidebar, headings, foot */
  --color-ink-900: #1C0F07;   /* deepest, sidebar base */
  --color-ink-800: #2C1810;   /* sidebar surface */
  --color-ink-700: #3D2418;   /* sidebar hover / raised */
  --color-ink-600: #5A3A26;

  /* Gold — the house accent, used with restraint */
  --color-gold-700: #96601A;
  --color-gold-600: #B8761F;  /* primary action, active nav */
  --color-gold-500: #C8891F;
  --color-gold-400: #D9A441;
  --color-gold-100: #F6EDE1;  /* icon tile ground */

  /* Cream — page ground */
  --color-cream-50:  #FDF7EF;
  --color-cream-100: #FAF0E4;  /* app background */
  --color-cream-200: #F2E6D6;  /* hairlines, dividers */
  --color-cream-300: #E6D5BF;

  --color-surface: #FFFFFF;

  /* Type */
  --color-text-900: #1F1613;   /* headings, figures */
  --color-text-700: #4A3B33;   /* body */
  --color-text-500: #8B7D74;   /* secondary */
  --color-text-400: #9A8C82;   /* micro-labels */

  /* Status */
  --color-ok-fg:   #167A52;  --color-ok-bg:   #E4F2EA;
  --color-info-fg: #2B5FD9;  --color-info-bg: #E4EBFB;
  --color-warn-fg: #9A6A05;  --color-warn-bg: #FBEFD6;
  --color-risk-fg: #B3261E;  --color-risk-bg: #FBE9E7;

  --radius-card: 4px;
  --radius-tile: 12px;
  --radius-pill: 999px;
}
```

**Usage law:** gold is for *one* action per view. If two things on screen are gold, one of them is wrong. Status pills are the only other saturated colour permitted.

### 2.3 Typography

| Role | Face | Spec |
|---|---|---|
| Display / headings | **Playfair Display** | 400 & 500; italic reserved for the first word of a bicameral heading |
| Figures & prices | **Playfair Display** 400 | `font-variant-numeric: lining-nums`; never bold |
| UI, body, nav | **Poppins** | 300/400/500/600 |
| Micro-label | Poppins 600 | `11px / 0.14em tracking / uppercase / --color-text-400` |

Scale (rem, 16px base): `0.6875 · 0.75 · 0.875 · 1 · 1.125 · 1.375 · 1.75 · 2.25 · 3 · 4`

Body line-height 1.6; headings 1.15; micro-labels 1.

**Signature typographic device — the bicameral heading.** Every major section heading is two words in two voices: the first in Playfair Display *italic* at the larger size, the second in Poppins 400 at ~78% of that size, baseline-aligned, separated by `0.5em`. Exactly as in the reference: *Administrative* **Insights**.

Carry it through both surfaces:
- Storefront hero: *Adi* **Parva**
- Collections: *The* **Collection**
- Product story panel: *Provenance* **Notes**
- Admin orders: *Order* **Register**
- Admin products: *The* **Collection**
- Admin coupons: *Offer* **Instruments**

Use it for page-level and major-section headings only. Card titles are plain Playfair 500. If it appears more than twice in a viewport, it stops being a signature and becomes wallpaper — cut one.

### 2.4 Layout & elevation

- Grid: 12 columns, 24px gutters, max content width 1440px, page padding 32px desktop / 20px mobile.
- Vertical rhythm: 8px base. Section spacing 64px desktop / 40px mobile.
- Cards: white, `--radius-card`, `1px solid --color-cream-200`, shadow `0 1px 2px rgba(28,15,7,0.04)`. On hover for interactive cards only: shadow `0 8px 24px rgba(28,15,7,0.08)`, border → `--color-cream-300`, 180ms ease-out.
- The admin sidebar is fixed 264px, `--color-ink-800`, full height, never scrolls with content.
- Storefront uses generous negative space. Product imagery is the loudest thing on any storefront page — everything else recedes.

### 2.5 Storefront signature element — the gopuram arch

Temple jewellery comes from the gopuram, the tiered South Indian temple tower. Use a **stepped-arch frame** as the one memorable visual device on the storefront:

- An SVG mask with a pointed apex and two symmetrical shoulder steps (not a plain semicircle).
- Applied to: the homepage hero image, the primary product gallery image, and the three collection portal tiles. **Nowhere else.**
- Hairline gold stroke at 1px, 40% opacity, inset 6px from the mask edge.
- Never apply it to the admin surface. Admin is rectilinear and businesslike; the arch is the storefront's alone.

Build it as `<ArchFrame ratio="portrait" | "square">` wrapping a `next/image` fill, using `clip-path` from an inline SVG `clipPath` so it stays crisp at every size.

---

## 3. INFORMATION ARCHITECTURE

### 3.1 Storefront routes

```
/                             Home
/collections                  All pieces (filter + sort)
/collections/[slug]           Category (temple, kundan, polki, jadau, meenakari, bridal)
/piece/[slug]                 Product detail
/cart                         Cart page (plus a Sheet drawer available everywhere)
/checkout                     3-step: Details → Delivery → Payment
/checkout/confirmed/[orderId] Order confirmation
/wishlist                     Saved pieces
/account                      Overview
/account/orders               Order history
/account/orders/[id]          Order detail + status timeline
/account/addresses            Address book
/heritage                     The house story
/craft                        Craftsmanship / making process
/journal                      Editorial index
/journal/[slug]               Editorial article
/care                         Jewellery care & certification
/contact                      Contact + atelier locations
/search?q=                    Search results
/login  /register             Mock auth (OTP screen, any 6 digits pass)
```

### 3.2 Admin routes (mirror the reference sidebar exactly, in this order)

```
/admin                        Dashboard
/admin/products               Collection list
/admin/products/new           Add piece
/admin/products/[id]          Edit piece
/admin/orders                 Order register
/admin/orders/[id]            Order detail
/admin/hero                   Hero Settings
/admin/offers                 Seasonal Offers
/admin/coupons                Coupons
/admin/users                  User Management
/admin/content                Site Content
/admin/login                  Mock admin sign-in
```

Sidebar footer reads `IMPERIAL TRADITION V1.0` in Poppins 500, 10px, 0.14em tracking, `--color-ink-600`.

---

## 4. DATA LAYER

### 4.1 Structure

```
src/lib/data/
  types.ts        all interfaces
  seed/           products.ts categories.ts orders.ts customers.ts
                  coupons.ts offers.ts users.ts content.ts journal.ts
  store.ts        read/write facade over localStorage + seed hydration
  queries.ts      the ONLY module components import from
  format.ts       currency, dates, order numbers
```

**Rule:** components import from `queries.ts` only. Every query function is `async` and returns a Promise even though it resolves locally — so the swap to a real API later is a one-file change. Add a 180–320ms artificial delay in dev so skeleton states are actually visible and demoable.

### 4.2 Types

```ts
export type Currency = number; // paise-free, whole rupees

export interface Category {
  id: string; slug: string; name: string; tagline: string;
  description: string; heroImage: string; pieceCount: number;
  order: number; featured: boolean;
}

export interface ProductVariant {
  id: string; label: string;              // "Gold-tone, 18 inch"
  metal: 'Gold-plated silver' | '22K gold' | 'Silver' | 'Antique gold finish';
  sizeLabel?: string; priceDelta: Currency; stock: number; sku: string;
}

export interface Product {
  id: string; slug: string; name: string;
  categoryId: string; collectionTag?: 'Masterpiece' | 'New arrival' | 'Bridal' | 'Archive';
  shortDescription: string;               // 1 line, 90 chars max
  story: string;                          // 3 paragraphs of provenance
  price: Currency; compareAtPrice?: Currency;
  images: string[];                       // min 3 per product
  variants: ProductVariant[];
  specs: { label: string; value: string }[];  // Weight, Metal, Stones, Finish, Origin, Era
  craftTime: string;                      // "6 weeks"
  artisanCluster: string;                 // "Nagercoil, Tamil Nadu"
  certification: string[];                // ["BIS Hallmarked", "Certificate of authenticity"]
  careNotes: string[];
  status: 'live' | 'draft' | 'archived';
  totalStock: number; rating: number; reviewCount: number;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface Order {
  id: string;                             // "ORD-7721"
  customerId: string; customerName: string; customerEmail: string;
  items: { productId: string; variantId: string; name: string;
           image: string; unitPrice: Currency; qty: number }[];
  subtotal: Currency; discount: Currency; shipping: Currency;
  gst: Currency; total: Currency;
  couponCode?: string;
  status: OrderStatus;
  timeline: { status: OrderStatus; at: string; note: string }[];
  shippingAddress: Address; paymentMethod: 'Card' | 'UPI' | 'Net banking' | 'Cash on delivery';
  placedAt: string; expectedBy: string;
}

export interface Address {
  id: string; label: string; line1: string; line2?: string;
  city: string; state: string; pincode: string; phone: string; isDefault: boolean;
}

export interface Customer {
  id: string; name: string; email: string; phone: string;
  addresses: Address[]; orderCount: number; lifetimeValue: Currency;
  tier: 'Patron' | 'Collector' | 'Guest'; joinedAt: string;
}

export interface Coupon {
  id: string; code: string; type: 'percent' | 'flat';
  value: number; minOrder: Currency; maxDiscount?: Currency;
  usageLimit: number; usedCount: number;
  startsAt: string; endsAt: string; status: 'active' | 'scheduled' | 'expired' | 'paused';
  appliesTo: 'all' | { categoryIds: string[] };
}

export interface SeasonalOffer {
  id: string; title: string; subtitle: string; bannerImage: string;
  discountPercent: number; categoryIds: string[];
  startsAt: string; endsAt: string; status: 'live' | 'scheduled' | 'ended';
}

export interface HeroSlide {
  id: string; eyebrow: string; headingItalic: string; headingRoman: string;
  body: string; ctaLabel: string; ctaHref: string;
  image: string; order: number; active: boolean;
}

export type AdminRole = 'Chief Curator' | 'Curator' | 'Registrar' | 'Support';

export interface AdminUser {
  id: string; name: string; email: string; role: AdminRole;
  avatarInitials: string; lastActive: string; status: 'active' | 'invited' | 'suspended';
  permissions: string[];
}
```

### 4.3 Seed content (build all of it — this is the demo)

- **12 categories:** Temple Jewellery, Kundan, Polki, Jadau, Meenakari, Antique Gold, Bridal Sets, Jhumkas, Haarams, Bangles & Kada, Maang Tikka & Nath, Oddiyanam (waist belts).
- **32 products** with real names in the house voice. Seed these five exactly as the reference shows them, then invent 27 more in the same register:
  - `Maharani Temple Necklace` — ₹45,000 — 12 units — Temple Jewellery — tag `Masterpiece`
  - `Royal Peacock Jhumkas` — ₹18,500 — 25 units — Jhumkas
  - `Lakshmi Kasu Haaram` — ₹85,000 — 4 units — Haarams — tag `Masterpiece`
  - `Nagercoil Meenakari Bangles (pair)` — ₹12,500 — 18 units — Meenakari
  - `Chettinad Oddiyanam` — ₹58,000 — 6 units — Oddiyanam
  Others in the same spirit: `Thanjavur Nagapadam Choker`, `Polki Chandbali`, `Vanki Armlet in Antique Gold`, `Jadau Rani Haar`, `Kundan Matha Patti`, `Temple Kasu Mala`, `Swan Motif Vaddanam`, `Rudraksha & Gold Mala`, and so on.
  Prices spread ₹4,500 → ₹2,40,000. At least 3 with `compareAtPrice`. At least 2 `draft`, 1 `archived`, 3 out of stock.
- **Provenance stories:** 3 real paragraphs each. Reference actual craft vocabulary — *kasu* coins, *nakashi* repoussé work, *jadau* stone setting, *meenakari* enamelling, the Nagercoil and Vadasery artisan clusters, uncut *polki* diamonds, *kemp* stones. This is where the demo earns its price.
- **Orders:** 14 total. `ORD-7721` Priya Sharma ₹45,000 delivered · `ORD-7722` Anil Kapoor ₹12,500 shipped · `ORD-7723` Meera Nair ₹85,000 confirmed — then 11 more across all six statuses, dated across the 90 days before **30 April 2026**.
- **Customers:** 9, with Indian names and real-looking addresses across Chennai, Coimbatore, Madurai, Bengaluru, Mumbai, Hyderabad.
- **Coupons:** 6 — e.g. `PARVA10` (10%, min ₹20,000), `BRIDAL25K` (flat ₹25,000, min ₹1,50,000), one expired, one scheduled, one paused.
- **Seasonal offers:** 3 — Aadi Sale, Navaratri Collection, Wedding Season Edit.
- **Hero slides:** 3.
- **Admin users:** 5 across the four roles, including `Admin User / Chief Curator / AD` from the reference.
- **Journal:** 6 articles with real headlines and 4–6 paragraph bodies.

### 4.4 Images

Create `/public/images/{products,categories,hero,journal,craft}`. Generate placeholder assets locally with a script (`scripts/make-placeholders.mjs` using `sharp`): warm-toned gradient panels in the cream/ink palette, with the piece name set in Playfair Display, exported at 1200×1500 (products), 1600×900 (hero/journal). They must look intentional, not like grey `?` boxes. Write `public/images/README.md` listing every file so the client can drop in real photography by filename with no code change.

### 4.5 Formatting rules

- Currency: `new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 })` → `₹2,18,700`. Lakh grouping is mandatory — a Western-grouped `₹218,700` anywhere is a bug.
- Dates: `30 April 2026` long form; `30 Apr` compact.
- Order IDs always render as `#ORD-7721`.
- Percentages carry an explicit sign: `+12.5%`.

---

## 5. STOREFRONT SPECIFICATIONS

### 5.1 Home

1. **Hero** — split layout. Left: eyebrow micro-label `EST. IN THE TRADITION OF THE SOUTH`, bicameral heading *Adi* **Parva**, one-sentence positioning line, primary button "See the collection", ghost link "Read our story". Right: `ArchFrame` portrait image of a temple necklace. Ambient: a slow 12s parallax drift of ±8px on the arch image, disabled under reduced motion.
2. **Three portal tiles** — Temple, Kundan, Bridal. Arch-framed, hover lifts the image 1.03× inside a fixed frame (image scales, frame doesn't).
3. **Masterpieces strip** — horizontal scroll of `collectionTag: 'Masterpiece'` pieces, 4 visible on desktop, snap scrolling, no arrows on touch.
4. **The house line** — full-bleed ink-800 band, one Playfair sentence at 2.25rem, centred, max 20 words, plus a single ghost link. No image.
5. **New arrivals grid** — 8 pieces, 4-up desktop / 2-up mobile.
6. **Provenance strip** — four facts with micro-labels: artisan cluster, average craft time, BIS hallmarking, certificate of authenticity. Hairline dividers, no icons.
7. **Journal preview** — 3 latest articles.
8. **Footer** — 4 columns + newsletter field with inline validation and a success state that replaces the field, never a toast.

### 5.2 Collections

- Left rail filters (desktop) / bottom Sheet (mobile): category, price range slider, metal, availability, occasion. Active filters render as removable pills above the grid; "Clear all" appears only when ≥1 filter is on.
- Sort: Curated (default), Price ascending, Price descending, Recently added.
- Grid: 3-up desktop, 2-up tablet, 1-up mobile. Card = image, name (Playfair 500), category micro-label, price. Hover reveals a "Quick view" bar sliding up from the image's lower edge and a wishlist heart at top-right.
- URL state: every filter and sort value is a search param so the client can bookmark and share a filtered view during the demo.
- Empty state: "No pieces match these filters." + a "Clear all filters" button. Never a sad face, never an apology.
- Skeletons match the final card geometry exactly.

### 5.3 Product detail

- Gallery: `ArchFrame` primary image, thumbnail column on the left (desktop) / dots below (mobile). Click opens a lightbox Dialog with keyboard arrow navigation and Esc to close.
- Right column: category micro-label, name (Playfair 500, 2.25rem), price with strikethrough `compareAtPrice` where present, rating + review count, short description, variant selector (metal chips + size select), quantity stepper, **"Reserve this piece"** primary button, wishlist secondary. Below: availability line ("4 pieces remain" / "Made to order — 6 weeks").
- Tabs: **Provenance** (the 3-paragraph story, set in Playfair 400 at 1.125rem — this is editorial, not UI text), **Specifications** (spec table), **Care** (bulleted care notes), **Certification** (badge row + one paragraph).
- Trust strip: certified, insured shipping, 7-day inspection window, lifetime polish.
- "From the same cluster" — 4 related pieces by `artisanCluster`, falling back to category.
- Adding to cart opens the cart Sheet with the new line item highlighted for 1.2s, and shows a toast: "Reserved."

### 5.4 Cart & checkout

- Cart Sheet and `/cart` share one component. Line item: 88px thumbnail, name, variant label, qty stepper, line total, remove (with a 5-second Undo in the toast).
- Summary: subtotal, coupon field with real validation against seeded coupons (invalid code → inline error naming the reason: expired, minimum not met, already used), GST at 3% on jewellery, shipping free above ₹25,000 else ₹450, total in Playfair 1.75rem.
- Checkout: 3 steps with a stepper header. **Details** (name, email, phone) → **Delivery** (address form or saved-address picker, pincode with a mocked serviceability check) → **Payment** (Card / UPI / Net banking / COD — COD disabled above ₹50,000 with the reason shown inline, not hidden).
- Payment simulates a 2.2s processing state with a gold progress arc, then writes a real Order into the store and redirects.
- Confirmation page: order number, arch-framed hero of the first item, itemised summary, expected delivery date, timeline widget seeded at `confirmed`, "Track this order" → `/account/orders/[id]`.
- Guest checkout allowed; the confirmation offers account creation but does not force it.

### 5.5 Editorial pages

Real writing, not filler. `/heritage` tells the house origin story across five scroll sections with alternating image/text. `/craft` walks the six making stages (wax model → *nakashi* repoussé → stone setting → enamelling → polish → certification) as a typed timeline — and numbered markers are appropriate here *because it is a genuine sequence*. `/journal` is a magazine index with one lead article and a 2-column list.

---

## 6. ADMIN SPECIFICATIONS

### 6.1 Shell

- **Sidebar** — 264px, `--color-ink-800`, no scroll. Brand block at top: `ADI PARVA` in Playfair 500, 1.375rem, letter-spacing 0.06em, white; below it `HERITAGE ADMIN` micro-label in `--color-gold-500`. To the left, a 34px filigree rosette mark rendered as SVG (concentric dotted rings, gold at 60% opacity).
- **Nav items** — 44px tall, 16px icon + label in Poppins 500, 13px, 0.08em tracking, uppercase. Rest: `--color-cream-300` at 70% opacity. Hover: background `--color-ink-700`, label to white, 140ms. **Active: solid `--color-gold-600` fill, white label and icon, `--radius-card`, inset 12px from both sidebar edges** — matches the reference exactly.
- **Topbar** — 84px, white, bottom hairline `--color-cream-200`. Left: search input, 400px, `--color-cream-100` fill, 999px radius, magnifier icon, placeholder "Search resources…", `⌘K` opens a Command palette over it. Right: bell with a `--color-risk-fg` dot when unread, a 1px vertical divider, then the identity block — name in Poppins 600 13px 0.06em uppercase, role beneath in `--color-gold-600` 10px micro-label, then a 44px `--color-ink-800` circular avatar with white initials.
- **Content area** — `--color-cream-100`, 32px padding.
- Route change fades content 120ms. Sidebar never re-renders.

### 6.2 Dashboard (`/admin`) — match the reference

Header block: micro-label `OVERVIEW`; bicameral heading *Administrative* **Insights**; right-aligned, `SESSION ACTIVITY` micro-label above `April 30, 2026 • Live Monitoring` in Poppins 600 15px.

**Four stat cards**, equal width, 24px gap:

| Label | Value | Delta |
|---|---|---|
| TOTAL REVENUE | ₹2,18,700 | +12.5% ↗ |
| ACTIVE ORDERS | 4 | +8.2% ↗ |
| TOTAL CUSTOMERS | 3 | +15.3% ↗ |
| MASTERPIECES | 2 | Stable |

Card anatomy, top to bottom: a 56px `--radius-tile` icon tile (`--color-gold-100` ground, `--color-gold-600` icon) with the delta floated to the top-right in `--color-ok-fg` 13px 500 with an arrow glyph — "Stable" renders as text with no arrow; then 28px gap; then the micro-label; then the value in **Playfair Display 400 at 2.25rem**. Card 2 is the emphasis card: its icon tile is filled `--color-gold-600` with a white icon.

All four values are computed live from the store, never hardcoded. With the supplied seed they must resolve to exactly the figures above — tune the seed until they do.

**Recent Activity** (left, ~2/3): card titled *Recent Activity* in Playfair 500 1.375rem. Table columns ORDER · CUSTOMER · STATUS · TOTAL, headers as micro-labels, rows 68px with `--color-cream-200` bottom hairlines, order IDs in Poppins 500 `--color-text-900`, totals right-aligned Poppins 500. Status pills: 999px radius, 4px/12px padding, 11px 600 uppercase 0.08em — delivered `ok`, shipped `info`, confirmed/pending `warn`, cancelled/returned `risk`. Row hover tints `--color-cream-50`; the whole row links to the order. Card footer: "See the full register →".

**Inventory Snapshot** (right, ~1/3): rows of 56px square thumbnail + name (Poppins 600 12px uppercase 0.04em) + unit count in `--color-ok-fg` 12px + price right-aligned in `--color-gold-600` Poppins 500. Seed shows Maharani Temple Necklace (12 units, ₹45,000) and Royal Peacock Jhumkas (25 units, ₹18,500). Below the list, a "Low availability" group listing any piece under 5 units, with the count in `--color-risk-fg`.

**Below the fold** (yours to add, keep it quiet): a 30-day revenue area chart (gold line, cream fill, no gridlines except a hairline baseline, tooltip in an ink card) and a category-mix horizontal bar list. Two charts maximum for the whole admin.

### 6.3 Admin modules

**Products** — Table with bulk select, column sort, search, and filters for status/category/availability. Row: thumbnail, name, SKU, category, price, stock (red under 5), status pill, row actions menu (Edit / Duplicate / Archive). Editor is a two-column form: left = name, slug (auto from name, editable), description, provenance story, specs repeater, care notes repeater; right = status, category, pricing, variants repeater (label, metal, size, price delta, stock, SKU), image manager with drag-to-reorder and a "Primary" badge on the first. Sticky footer bar: unsaved-changes indicator, Cancel, "Save piece". Validation via zod with inline messages. Leaving with unsaved changes prompts a Dialog.

**Orders** — Register table with status tab filter, date range, search by ID or customer. Detail page: left = items, address, payment method, notes; right = status timeline as a vertical stepper with completed steps in gold, a status advance control (`pending → confirmed → shipped → delivered`, plus Cancel and Return), and a "Download invoice" button that generates a print-styled `/admin/orders/[id]/invoice` route (`@media print` rules, no nav, no shadows).

**Hero Settings** — Manage `HeroSlide[]`: drag to reorder, active toggle, and a live preview panel rendering the actual storefront hero component at 40% scale in an arch frame. Editing the italic and roman halves of the heading are two separate fields, labelled "Heading — italic word" and "Heading — roman word", so the bicameral rule survives content editing.

**Seasonal Offers** — Card grid with status ribbons. Editor: title, subtitle, banner, discount percent, applicable categories (multi-select), date range with a validity summary line ("Runs 18 days, starting in 4 days"). A live/scheduled/ended badge computed from dates, not stored blindly.

**Coupons** — Table with code (monospaced Poppins with 0.08em tracking), type, value, usage as `used / limit` with a thin gold progress bar, validity window, status pill. "Generate code" produces a readable `PARVA-XXXX` code. Copy-to-clipboard on the code with a "Copied." toast. Editor validates that `maxDiscount` is only enabled for percent coupons.

**User Management** — Table: avatar initials circle, name, email, role select, last active (relative: "2 hours ago"), status pill. "Invite curator" Dialog: email + role + a permission checklist that pre-fills from the role and can be overridden. Chief Curator rows cannot be demoted or suspended by anyone but themselves — show the reason in a tooltip on the disabled control rather than hiding it.

**Site Content** — Tabs: Navigation (reorderable links), Footer (column groups), Pages (heritage/craft/care body editors as plain textareas with a character count), Journal (article list + editor), Testimonials (CRUD), Announcement bar (message + link + on/off + date range).

### 6.4 Motion budget — four moments only

1. Dashboard load: stat cards fade + rise 8px, 60ms stagger, once per session.
2. Sidebar active indicator slides between items with a shared `layoutId`.
3. Cart Sheet slides in at 260ms `easeOut`; the new line item flashes `--color-gold-100` for 1.2s.
4. Checkout payment: gold progress arc during the simulated 2.2s.

Everything else is CSS transitions on hover/focus at 140–180ms. No scroll-jacking, no counters ticking up, no confetti. All of it respects `prefers-reduced-motion`.

---

## 7. BUILD PHASES

Execute one phase per turn. Plan first, then build, then self-verify against the checklist. Do not start the next phase without being asked.

**Phase 0 — Scaffold.** Next.js 15 + TS strict + Tailwind v4 + shadcn init. Folder structure. Fonts wired. Empty route tree for every path in Section 3 rendering only its page title, so navigation is walkable end to end.
✅ `npm run build` passes · every route in Section 3 returns 200 · no default shadcn colours in `globals.css`.

**Phase 1 — Design system.** All tokens in `@theme`. Primitives: `Button` (primary/secondary/ghost/danger), `Card`, `StatusPill`, `MicroLabel`, `BicameralHeading`, `ArchFrame`, `Price`, `Field`, `EmptyState`, `Skeleton`, `DataTable`. Build a `/dev/kitchen-sink` page showing every primitive in every state.
✅ Kitchen sink renders all states · focus rings visible on all · contrast checked · reduced-motion honoured.

**Phase 2 — Data layer.** Types, all seed files, store, queries, formatters, placeholder image script.
✅ 32 products, 14 orders, 12 categories, 9 customers, 6 coupons, 5 admin users, 6 articles · dashboard figures resolve to the exact reference values · `₹2,18,700` renders with lakh grouping · localStorage survives reload · a "Reset demo data" utility exists.

**Phase 3 — Admin shell + dashboard.** Sidebar, topbar, layout, then the dashboard against Section 8.1.
✅ Every item on the pixel checklist passes · responsive collapse works at `lg` and `md` · stat values are computed.

**Phase 4 — Admin modules.** Products, Orders in full; then Hero, Offers, Coupons, Users, Content.
✅ Full CRUD on every module persists across reload · every form validates · every table sorts, filters and paginates · invoice print route is clean.

**Phase 5 — Storefront foundation.** Header (with mega-menu), footer, cart Sheet, collections grid, filters, product cards, search.
✅ Filters are URL-driven and shareable · skeletons match final geometry · mobile filter Sheet works.

**Phase 6 — Storefront pages.** Home, product detail, editorial pages, account.
✅ ArchFrame appears in exactly the three sanctioned places · gallery lightbox is keyboard-navigable · all copy is real.

**Phase 7 — Cart to confirmation.** Cart page, 3-step checkout, coupon validation, payment simulation, confirmation, order writing back to the store.
✅ A completed checkout appears immediately in `/admin/orders` and moves the dashboard figures · coupon errors state their reason · COD rule shows its reason inline.

**Phase 8 — Polish.** Responsive sweep at 360/768/1024/1440/1920. Accessibility sweep. Motion budget enforcement. 404 and error boundaries in the house voice. Metadata + OG images per route.
✅ Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO for `/` and `/admin` · zero console errors · keyboard-only walk from home to confirmation succeeds.

**Phase 9 — Demo readiness.** `README.md` with the demo script (a 6-step click path that shows the product best), a "Reset demo data" button in the admin topbar menu, and Vercel deploy config.
✅ Fresh clone → `npm i && npm run dev` works with no env vars · reset restores seed exactly.

---

## 8. VERIFICATION

### 8.1 Dashboard pixel checklist

Compare your build against the reference screenshot and confirm each line:

- [ ] Sidebar is `--color-ink-800`, 264px, full height, no scrollbar
- [ ] Rosette mark + `ADI PARVA` (Playfair, white) + `HERITAGE ADMIN` (gold micro-label)
- [ ] Nav order: Dashboard, Products, Orders, Hero Settings, Seasonal Offers, Coupons, User Management, Site Content
- [ ] Dashboard active state is a solid gold rounded fill, inset from both sidebar edges
- [ ] Inactive labels are muted cream, uppercase, wide tracking
- [ ] `IMPERIAL TRADITION V1.0` pinned at the sidebar foot
- [ ] Topbar: pill search left, bell with red dot, vertical divider, `ADMIN USER` / `CHIEF CURATOR` / `AD` avatar right
- [ ] `OVERVIEW` micro-label above the heading
- [ ] Heading is *Administrative* (Playfair italic) + **Insights** (Poppins), baseline-aligned
- [ ] `SESSION ACTIVITY` above `April 30, 2026 • Live Monitoring`, right-aligned
- [ ] Four stat cards, equal width, correct labels, values and deltas
- [ ] Card 2's icon tile is gold-filled with a white icon; the others are gold-100 with gold icons
- [ ] Deltas sit at the card's top-right, green with an arrow; "Stable" has no arrow
- [ ] Values are Playfair, not bold, ~2.25rem
- [ ] `₹2,18,700` uses lakh grouping
- [ ] Recent Activity table matches column order, header micro-labels, hairline rows, pill colours
- [ ] Inventory Snapshot shows thumbnail, uppercase name, green unit count, gold price
- [ ] Page ground is `--color-cream-100`; cards are white with 4px radius and a hairline border

### 8.2 Global QA

- [ ] No hardcoded hex outside `@theme`
- [ ] No `any`, no `@ts-ignore`, no unused exports
- [ ] Every list has a real empty state; every async view has a skeleton; every mutation has a toast
- [ ] Every price in the app uses `formatCurrency` — grep for `₹` and confirm no manual concatenation
- [ ] Every image has meaningful `alt`; every icon-only button has `aria-label`
- [ ] Tab order is logical on `/admin`, `/collections`, `/checkout`
- [ ] No emoji, no lorem ipsum, no "Coming soon" anywhere

---

## 9. DEMO SCRIPT (write this into README.md)

The path the client should be walked through, in order:

1. Land on `/` — hero, arch frames, masterpieces strip.
2. `/collections` — apply two filters, show the shareable URL, open a piece.
3. `/piece/maharani-temple-necklace` — gallery lightbox, then the Provenance tab. *This is the emotional peak of the demo; linger here.*
4. Reserve it, apply `PARVA10`, complete checkout to confirmation.
5. `/admin` — the order just placed is now the top row of Recent Activity and the figures have moved.
6. Open that order, advance it to Shipped, then show Coupons and Hero Settings to prove the whole thing is editable.

---

## 10. STANDING RULES FOR THE AGENT

- Plan before building. Show the plan. Wait.
- If a spec here conflicts with your instinct, **the spec wins** — this design is client-approved.
- If something is genuinely underspecified, choose the option most consistent with Section 2 and note the choice in your summary. Don't stop to ask about small things.
- After each phase, report: what you built, what you chose, what you'd flag as risky, and what's next. Three sentences each, no filler.
- Screenshot the result of every visual phase and critique it against the reference before declaring it done.
- Never mark a phase complete with a failing build.
