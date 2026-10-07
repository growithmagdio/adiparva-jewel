# ADI PARVA — Technical Build & Architecture Report

> **Target Audience:** Engineering Team / Lead Developers  
> **Repository:** Adi Parva (Luxury Indian Heritage Jewellery House)  
> **Current Build State:** Client-Facing Functional Prototype / Demo Build  
> **Data Storage:** Typed Local Data Layer persisted to `localStorage` (`adi_parva_store_v1`)

---

## 1. Technical Stack & Versions

| Layer | Technology | Exact Version | Implementation Role |
|---|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | `^15.1.0` | React server/client architecture, routing, metadata |
| **UI Library** | React | `^19.0.0` | Declarative UI rendering |
| **Styling** | Tailwind CSS (CSS-first config) | `^4.0.0` | Styling system configured via `@theme` in `globals.css` |
| **Motion** | Framer Motion | `^11.15.0` | Sanctioned micro-animations, transitions, draw drawers |
| **Icons** | Lucide React | `^0.469.0` | UI icon set |
| **State Management** | Zustand | `^5.0.2` | Cart & Wishlist persistence (`localStorage` middleware) |
| **Form Management** | React Hook Form + Zod | `^7.54.2` / `^3.24.1` | Form state, validation schemas, error handling |
| **Charts** | Recharts | `^2.15.0` | Admin dashboard analytics & order trends |
| **Date Utilities** | Date-fns | `^4.1.0` | Date formatting and timeline calculations |
| **Backend SDK** | Firebase JS SDK | `^11.4.0` | Initialized in `src/lib/firebase/config.ts` (`adiparva-jewel`) |
| **Database** | *Local Mock Layer / Firestore Ready* | `N/A` | Local JS data store backed by `localStorage` |
| **Auth** | *Local Mock Auth* | `N/A` | Simulated OTP & Admin session state |
| **Storage** | *Local File System* | `N/A` | Static images in `/public/images/` |
| **Payment Gateway**| *Simulated Gateway* | `N/A` | 2.2s simulated progress arc & order emission |

---

## 2. Directory Structure & Component Architecture

```
Adaparva/
├── public/                     # Static media assets, brand logo, and seed imagery
│   ├── images/                 # Product, category, hero, and journal photos
│   ├── icon.svg                # Brand emblem favicon
│   └── logo.jpeg               # Primary brand logo image
├── src/
│   ├── app/                    # Next.js 15 App Router pages & route definitions
│   │   ├── (storefront routes) # Public shopping, heritage, journal, & checkout pages
│   │   ├── admin/              # Admin curatorial console routes
│   │   ├── globals.css         # CSS-first theme configuration (@theme tokens)
│   │   ├── layout.tsx          # Root font loading and global layout wrapper
│   │   └── page.tsx            # Storefront homepage
│   ├── components/             # Reusable UI component modules
│   │   ├── admin/              # Sidebar, command palette, dashboard widgets
│   │   ├── brand/              # LogoLockup, EmblemLogo brand identity components
│   │   ├── primitives/         # BicameralHeading, MicroLabel, StatusPill, Card
│   │   ├── storefront/         # Header, Footer, GopuramArch, ProductCard, CartSheet
│   │   └── ui/                 # Helper image and visual primitives
│   └── lib/                    # Core business logic & data access facade
│       ├── data/               # Data layer types, seed data, queries, & store
│       │   ├── format.ts       # Currency (lakhs formatting) & date formatters
│       │   ├── queries.ts      # Query facade (components ONLY import from here)
│       │   ├── seed/           # Seeding modules for products, categories, orders, etc.
│       │   ├── store.ts        # localStorage read/write persistence facade
│       │   └── types.ts        # TypeScript data models and interfaces
│       └── store/              # Zustand global client stores
│           ├── use-cart-store.ts     # Cart items & sheet visibility store
│           └── use-wishlist-store.ts # Wishlist saved items store
├── AGENTS.md                   # Comprehensive project specification document
└── package.json                # Project dependencies and script definitions
```

---

## 3. All Pages & Routes Directory

| Route URL | Page Purpose | Access Level |
|---|---|---|
| `/` | Storefront Homepage with Hero, Masterpieces, Vitrines | Public |
| `/collections` | Complete Collection Catalog with filters & sorting | Public |
| `/collections/[slug]` | Category-specific product collection view | Public |
| `/piece/[slug]` | Detailed Product view with specs, story & add-to-cart | Public |
| `/product/[slug]` | Secondary route alias for product detail | Public |
| `/cart` | Standalone Cart Management page | Public |
| `/checkout` | 3-Step Checkout: Details → Delivery → Payment | Public |
| `/checkout/confirmed/[orderId]` | Order Confirmation & delivery tracking timeline | Public |
| `/wishlist` | Saved Pieces collection page | Public |
| `/account` | User Account Overview dashboard | Public (Mock) |
| `/account/orders` | Customer Order History listing | Public (Mock) |
| `/account/orders/[id]` | Detailed Order Tracking & itemized breakdown | Public (Mock) |
| `/account/addresses` | Customer Address Book management | Public (Mock) |
| `/heritage` | The House Story & editorial brand narrative | Public |
| `/craft` | 6-Stage Craftsmanship process timeline | Public |
| `/journal` | Editorial magazine index | Public |
| `/journal/[slug]` | Individual Journal Article reading view | Public |
| `/care` | Jewellery care notes, BIS hallmarking & ethics | Public |
| `/contact` | Atelier contacts & location details | Public |
| `/search` | Global Product Search Results page | Public |
| `/login` | Customer Sign-In (Mock 6-digit OTP verification) | Public |
| `/register` | Customer Account Registration | Public |
| `/about` | Alias for heritage & house history | Public |
| `/shop` | Alias for collection catalog | Public |
| `/collection` | Category listing overview | Public |
| `/collection/[slug]` | Category-specific alias | Public |
| `/dev/kitchen-sink` | Design System primitive & UI component gallery | Developer |
| `/admin` | Admin Curatorial Dashboard with analytics | Admin / Staff |
| `/admin/products` | Collection Product Register list | Admin / Staff |
| `/admin/products/new` | Add New Product form | Admin / Staff |
| `/admin/products/[id]` | Edit Product & Inventory management form | Admin / Staff |
| `/admin/orders` | Order Register with status management | Admin / Staff |
| `/admin/orders/[id]` | Detailed Order & Shipping update console | Admin / Staff |
| `/admin/hero` | Hero Banner Slide manager | Admin / Staff |
| `/admin/offers` | Seasonal Offers manager | Admin / Staff |
| `/admin/coupons` | Offer Instruments (Coupons) manager | Admin / Staff |
| `/admin/users` | Admin Staff & Role Management | Admin / Staff |
| `/admin/content` | Site Editorial Content editor | Admin / Staff |
| `/admin/login` | Admin Console Sign-In | Public / Staff |

---

## 4. Database Architecture & Data Models

> **Current Implementation Note:** No external database (such as Firebase Firestore, PostgreSQL, or MongoDB) is currently connected. All data is managed in a typed, local client-side data layer (`src/lib/data/store.ts`) and persisted in `localStorage` under the key `adi_parva_store_v1`.

### Data Collections (Local Store Schemas)

#### 1. `products`
- **Fields:** `id`, `slug`, `name`, `plateNumber`, `categoryId`, `collectionTag`, `collection`, `shortDescription`, `story`, `price`, `compareAtPrice`, `images[]`, `variants[]` (`id`, `label`, `metal`, `sizeLabel`, `priceDelta`, `stock`, `sku`), `specs[]` (`label`, `value`), `craftTime`, `artisanCluster`, `certification[]`, `careNotes[]`, `status` (`live` | `draft` | `archived`), `totalStock`, `rating`, `reviewCount`, `createdAt`, `weightGrams`, `plating`, `baseMetal`, `stones[]`, `closure`, `lengthInches`, `occasion[]`.
- **Relations:** References `categoryId` from `categories`. Included in `orders.items`.

#### 2. `categories`
- **Fields:** `id`, `slug`, `name`, `tagline`, `description`, `heroImage`, `pieceCount`, `order`, `featured`.
- **Relations:** Referenced by `products.categoryId` and `coupons.appliesTo`.

#### 3. `orders`
- **Fields:** `id` (e.g. `ORD-7721`), `customerId`, `customerName`, `customerEmail`, `items[]` (`productId`, `variantId`, `name`, `image`, `unitPrice`, `qty`), `subtotal`, `discount`, `shipping`, `gst`, `total`, `couponCode`, `status` (`pending` | `confirmed` | `shipped` | `delivered` | `cancelled` | `returned`), `timeline[]` (`status`, `at`, `note`), `shippingAddress` (`id`, `label`, `line1`, `line2`, `city`, `state`, `pincode`, `phone`, `isDefault`), `paymentMethod` (`Card` | `UPI` | `Net banking` | `Cash on delivery`), `placedAt`, `expectedBy`.
- **Relations:** References `customerId` from `customers`, `productId` and `variantId` from `products`.

#### 4. `customers`
- **Fields:** `id`, `name`, `email`, `phone`, `addresses[]`, `orderCount`, `lifetimeValue`, `tier` (`Patron` | `Collector` | `Guest`), `joinedAt`.
- **Relations:** Referenced by `orders.customerId`.

#### 5. `coupons`
- **Fields:** `id`, `code`, `type` (`percent` | `flat`), `value`, `minOrder`, `maxDiscount`, `usageLimit`, `usedCount`, `startsAt`, `endsAt`, `status` (`active` | `scheduled` | `expired` | `paused`), `appliesTo`.
- **Relations:** Referenced by `orders.couponCode`.

#### 6. `offers` (Seasonal Offers)
- **Fields:** `id`, `title`, `subtitle`, `bannerImage`, `discountPercent`, `categoryIds[]`, `startsAt`, `endsAt`, `status` (`live` | `scheduled` | `ended`).

#### 7. `heroSlides`
- **Fields:** `id`, `eyebrow`, `headingItalic`, `headingRoman`, `body`, `ctaLabel`, `ctaHref`, `image`, `order`, `active`.

#### 8. `adminUsers`
- **Fields:** `id`, `name`, `email`, `role` (`Chief Curator` | `Curator` | `Registrar` | `Support`), `avatarInitials`, `lastActive`, `status` (`active` | `invited` | `suspended`), `permissions[]`.

#### 9. `journalArticles`
- **Fields:** `id`, `slug`, `title`, `subtitle`, `author`, `publishedAt`, `readTime`, `heroImage`, `excerpt`, `content[]`, `category`, `featured`.

#### 10. `siteContent`
- **Fields:** `announcementBar`, `houseStory`, `craftOverview`, `careGuide`.

---

## 5. Feature Execution Flows

### 1. Product Codes & Identification
- **Plate Number:** Assigned via `plateNumber` field (e.g. `PLATE AP-0104`) for heritage cataloging.
- **Product ID & SKUs:** Product IDs follow `prod-[timestamp]` (or seeded identifiers). Variant SKUs follow pattern `SKU-AP-[cat]-[number]`.

### 2. Stock Changes & Movement
- **Stock Calculation:** Each product variant maintains an individual `stock` count. The product's overall availability is computed dynamically:
  $$\text{totalStock} = \sum_{v \in \text{variants}} v.\text{stock}$$
- **Stock Update:** Updating stock via `/admin/products/[id]` modifies variant numbers and updates `totalStock`.
- *Note:* Detailed audit log of stock movements (historical ledger) is not currently stored as a separate collection.

### 3. Buy Now & Payment Flow
1. **Selection:** User picks metal/variant on `/piece/[slug]` and clicks **"Reserve this piece"**.
2. **Cart Insertion:** `useCartStore.addItem()` adds item to Zustand state (persisted in `localStorage`) and opens the `CartSheet` drawer.
3. **Checkout Step 1 (Details):** User enters name, email, and phone number on `/checkout`.
4. **Checkout Step 2 (Delivery):** User specifies shipping address and pincode.
5. **Checkout Step 3 (Payment):** User selects payment method (`Card`, `UPI`, `Net banking`, or `Cash on delivery`).
6. **Processing Arc:** A 2.2-second animated circular gold arc simulates gateway authorization.
7. **Order Generation:** `createOrder()` constructs a new `Order` record with ID `#ORD-XXXX`, status `confirmed`, initial timeline event, clears cart, and redirects to `/checkout/confirmed/[orderId]`.

### 4. WhatsApp Concierge Integration
- Product pages and footer feature a direct WhatsApp concierge link (`https://wa.me/919876543210`).
- Clicking the button opens WhatsApp with a pre-filled enquiry message specifying the product name, SKU, and price.

### 5. Admin Login & Authorization
- **Sign-In:** `/admin/login` provides a simulated admin login interface.
- **Session:** State is handled locally; any credentials pass in demo mode.
- **Roles:** Data models support four curatorial roles (`Chief Curator`, `Curator`, `Registrar`, `Support`), but server-side authorization enforcement is omitted in this client-side prototype.

---

## 6. Environment Variables (Required for Production Backend Integration)

When migrating from the local store to a live backend, create `.env.local` containing:

```env
# Application Settings
NEXT_PUBLIC_APP_URL=

# Database / Firebase Backend Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Payment Gateway Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Cloud Storage / Asset Hosting
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 7. Third-Party Accounts & External Services Required

1. **Vercel / Netlify Account:** For hosting Next.js 15 App Router application with Turbopack support.
2. **Firebase or Supabase Project:** Needed to replace local `localStorage` store with live Firestore / PostgreSQL database and real authentication.
3. **Razorpay / Stripe Merchant Account:** Required to replace simulated 2.2s payment arc with real payment webhooks and payment processing.
4. **WhatsApp Business Account:** For live WhatsApp API integration and concierge chat routing.
5. **Cloudinary / AWS S3 Account:** For hosting high-resolution product image uploads from `/admin/products/new`.

---

## 8. Security & Access Rules Summary

- **Current Architecture:** All data operations are executed directly on the client side via `localStorage`. There are no server-side API endpoints or database rules active.
- **Planned Firestore Rules Structure (when backend is connected):**
  - `products`: Public read; Write restricted to authenticated Admin users (`Chief Curator`, `Curator`).
  - `categories`, `offers`, `heroSlides`, `siteContent`: Public read; Write restricted to Admin users.
  - `orders`: Create allowed for guests/customers; Read & Update restricted to order owner (`customerId`) and Admin users (`Registrar`, `Support`).
  - `customers`: Read/Write restricted to customer owner or Admin users.
  - `adminUsers`: Read/Write restricted to `Chief Curator` role.

---

## 9. Not Yet Built & Known Limitations

> [!IMPORTANT]
> The following features were specified in initial planning but are **not yet built** in the codebase:

1. **Real External Database:** No live Cloud Firestore or SQL database; uses `localStorage` (`adi_parva_store_v1`).
2. **Real Authentication Service:** No Firebase Auth, NextAuth, or JWT authentication provider implemented.
3. **Live Payment Gateway SDK:** Payment processing is simulated with a timer; no Razorpay/Stripe SDK integrated.
4. **Stock Movement Audit Log:** Historical ledger logging individual stock additions/subtractions over time is not tracked separately.
5. **Role-Based Middleware Protection:** Admin routes are accessible directly without server-side middleware authorization check.
6. **Cloud Image Upload:** Image inputs in `/admin/products/new` accept file path strings rather than direct file upload to S3/Cloudinary.
7. **Email / SMS Notifications:** No transactional email (Resend/SendGrid) or SMS service connected for order confirmation alerts.
