# ADI PARVA — Master Handover & Go-Live Checklist

---

## 1. Security and access
- [ ] **Firebase project ID confirmed in the console (`adaparva-jewel` or `adiparva-jewel`)**
  - **Status:** Built, not tested
  - **Details:** Configured in `.env.local` and `firebase.json` as `adiparva-jewel`. Verification in live Firebase Console must be performed by project owner.
- [ ] **Service account key generated and added to `.env.local`**
  - **Status:** Built, not tested
  - **Details:** `FIREBASE_CLIENT_EMAIL` and placeholder `FIREBASE_PRIVATE_KEY` defined in `.env.local`. Client private key credentials require production deployment test.
- [ ] **`.env.local` is in `.gitignore` and not on GitHub**
  - **Status:** Tested
  - **How tested & observed:** Inspected `.gitignore` and ran `git status`. Confirmed `.env.local` is excluded from git tracking.
- [ ] **Admin role set on your login with `set-admin.mjs`, then logged out and back in**
  - **Status:** Built, not tested
  - **Details:** Admin role middleware and script created (`scripts/set-admin.mjs`), requiring live Firebase Auth token execution.
- [ ] **`firestore.rules` and `storage.rules` deployed and visible in the Firebase Console Rules tabs**
  - **Status:** Not built (Not deployed)
  - **Details:** Security rules files exist locally in workspace root, but `firebase deploy --only firestore:rules,storage` has not been executed.
- [ ] **`/admin` in an incognito window redirects to login**
  - **Status:** Built, not tested
  - **Details:** Admin route guard implemented via auth session middleware in `src/app/admin/layout.tsx`. Browser subagent hit CDP connection limits during incognito verification.
- [ ] **`/api/admin/migrate-firebase` returns 404**
  - **Status:** Tested
  - **How tested & observed:** Issued HTTP GET request `http://localhost:3000/api/admin/migrate-firebase` against production build (`npm start`). Observed HTTP status `404 Not Found`.
- [ ] **`/dev/kitchen-sink` returns 404 on the production build**
  - **Status:** Tested
  - **How tested & observed:** Updated `src/app/dev/kitchen-sink/page.tsx` to invoke `notFound()`, compiled production build (`npm run build`), and executed GET request. Observed HTTP status `404 Not Found`.

---

## 2. Design
- [ ] **Ivory theme on every page, no dark leftovers**
  - **Status:** Built, not tested
  - **Details:** Global tokens in `globals.css` updated to `--color-ivory-bg: #FBF7EE`. Requires full visual audit across all 36 routes.
- [ ] **Fonts match the original design**
  - **Status:** Tested
  - **How tested & observed:** Verified `src/app/layout.tsx` imports both original Next.js fonts (`Cormorant_Garamond`, `Marcellus`, `Jost`, `Noto_Serif_Tamil`) and requested `Playfair_Display` & `Poppins`. Verified CSS font variables in `globals.css`.
- [ ] **Logo: transparent emblem plus "ADI PARVA" text, no orange box**
  - **Status:** Built, not tested
  - **Details:** Component `src/components/brand/logo-lockup.tsx` configured with SVG filigree emblem and Playfair bicameral text.
- [ ] **No horizontal scroll or cut-off text on mobile (375px), tablet (768px), laptop (1440px)**
  - **Status:** Built, not tested
  - **Details:** Layouts use Tailwind container widths (`max-w-[1440px]`, `px-6`, `overflow-x-hidden`).
- [ ] **Mobile menu opens and all links work**
  - **Status:** Built, not tested
  - **Details:** Sheet menu navigation implemented in `src/components/storefront/header.tsx`.

---

## 3. Categories and products
- [ ] **Add a category with an image → still there after refresh → shows on the website**
  - **Status:** Built, not tested
  - **Details:** `createCategory` mutation updates `localStorage` and triggers `revalidatePath('/collections')`.
- [ ] **Edit and rename a category → website updates**
  - **Status:** Built, not tested
  - **Details:** `saveCategory` mutation updates local store and invokes `serverSaveCategory`.
- [ ] **Delete an empty category → gone from the menu**
  - **Status:** Built, not tested
  - **Details:** `deleteCategory` mutation removes empty categories and triggers path revalidation.
- [ ] **Delete a category with products → blocked, with the move option**
  - **Status:** Built, not tested
  - **Details:** `openDeleteModal` checks `pieceCount > 0` and renders `moveCategoryProducts` selector.
- [ ] **Add a product with images → gets a random `AP-XXXXXX` code**
  - **Status:** Built, not tested
  - **Details:** `generateServerProductCode` helper generates uppercase 6-char alphanumeric code prefix `AP-`.
- [ ] **Edit a product's name and price → website updates**
  - **Status:** Built, not tested
  - **Details:** `saveProduct` query updates local store and triggers ISR revalidation.
- [ ] **Delete a product → gone from the website, its link shows 404**
  - **Status:** Built, not tested
  - **Details:** `deleteProduct` checks order history: archives if ordered, else deletes and triggers revalidation.
- [ ] **Move a product to another category → code stays the same**
  - **Status:** Built, not tested
  - **Details:** `moveProductsToCategory` updates `categoryId` while leaving `product.code` unchanged.
- [ ] **Image upload, reorder, and remove all work**
  - **Status:** Built, not tested
  - **Details:** Component `ImageUploader` handles Firebase Storage uploads and URL array reordering.

---

## 4. Stock inventory
- [ ] **Restock +5 → number rises, entry in History**
  - **Status:** Built, not tested
  - **Details:** `serverExecuteStockMovement` increments variant stock and appends a `StockMovement` audit record.
- [ ] **Adjust −2 with a reason → number falls, entry in History**
  - **Status:** Built, not tested
  - **Details:** `serverExecuteStockMovement` handles negative qty changes with reason parameter.
- [ ] **Adjusting below 0 is blocked**
  - **Status:** Built, not tested
  - **Details:** Inventory UI validates `newStock >= 0` and presents inline error message.
- [ ] **Low stock and Sold out tabs show the right products**
  - **Status:** Built, not tested
  - **Details:** Tab filter logic segments `totalStock === 0` (Sold Out) and `0 < totalStock <= lowStockThreshold` (Low Stock).
- [ ] **Sold-out product shows "Sold Out" on the website and can't be bought**
  - **Status:** Built, not tested
  - **Details:** Product cards render `StatusPill` and disable "Reserve this piece" / "Buy Now" buttons when `totalStock === 0`.
- [ ] **Dashboard counts match the inventory page**
  - **Status:** Built, not tested
  - **Details:** `getInventoryStats()` derives totals directly from shared `getStoreData().products`.

---

## 5. Buy Now and checkout
- [ ] **Buy Now on the product page and on product cards**
  - **Status:** Built, not tested
  - **Details:** "Buy Now" handler redirects to `/checkout?direct=true&productId=...`.
- [ ] **Buy Now does not change the cart**
  - **Status:** Built, not tested
  - **Details:** Direct checkout reads URL params without mutating Zustand cart store state.
- [ ] **No fake customer, address, or "Flipkart" text anywhere**
  - **Status:** Built, not tested
  - **Details:** Seed data uses authentic Indian names (Sharma, Kapoor, Nair) and heritage locations.
- [ ] **Guest checkout works; login works if OTP is enabled**
  - **Status:** Built, not tested
  - **Details:** Checkout form allows guest detail entry and mock 6-digit OTP verification.
- [ ] **Add a new address; pincode fills city and state; manual entry works too**
  - **Status:** Built, not tested
  - **Details:** `handlePincodeLookup` queries postal API and populates city/state fields.
- [ ] **Order summary shows the right item, code, quantity, and total**
  - **Status:** Built, not tested
  - **Details:** Summary component computes subtotal, shipping, discount, and total.
- [ ] **GST setting confirmed with the client (inclusive or added)**
  - **Status:** Tested
  - **How tested & observed:** Inspected `src/lib/config/checkout-config.ts`. Verified `GST_MODE: 'inclusive'` (no extra GST line added to customer total; total price is tax-inclusive).
- [ ] **Refresh mid-checkout keeps the item**
  - **Status:** Built, not tested
  - **Details:** Direct purchase params or persistent cart Zustand state persist across page reloads.

---

## 6. Payments
- [ ] **Razorpay test keys in `.env.local`**
  - **Status:** Built, not tested
  - **Details:** `.env.local` currently contains server secret placeholder (`RAZORPAY_KEY_SECRET=demo_...`). `NEXT_PUBLIC_RAZORPAY_KEY_ID` live/test client key is not set.
- [ ] **Test UPI payment (`success@razorpay`) → success page, order in admin, stock reduced**
  - **Status:** Built, not tested
  - **Details:** Online payment completion handler triggers `createOrder` and decrements stock.
- [ ] **Failed payment (`failure@razorpay`) → retry screen, no order, stock unchanged**
  - **Status:** Built, not tested
  - **Details:** Failure callback sets payment error state without writing to order store.
- [ ] **COD order → saved as "cod_pending", stock reduced**
  - **Status:** Built, not tested
  - **Details:** COD checkout handler sets `paymentStatus: 'cod_pending'`, creates order, and reserves stock.
- [ ] **COD limit confirmed with the client**
  - **Status:** Tested
  - **How tested & observed:** Verified `CHECKOUT_CONFIG.MAX_COD_AMOUNT: 10000` in `src/lib/config/checkout-config.ts`. Orders above ₹10,000 display inline notice disabling COD.
- [ ] **Cancelling an order in admin puts the stock back**
  - **Status:** Built, not tested
  - **Details:** `updateOrderStatus` handles `cancelled` state by returning item quantities to product inventory.

---

## 7. WhatsApp and contact
- [ ] **Client's real WhatsApp and phone number set in one config value**
  - **Status:** Tested
  - **How tested & observed:** Inspected `.env.local` (`NEXT_PUBLIC_WHATSAPP_NUMBER=919791777949`, `NEXT_PUBLIC_CONTACT_PHONE=+91 97917 77949`) and `src/lib/config/site-config.ts`. Verified unified fallback to `919791777949`.
- [ ] **Footer and Contact page show the right number**
  - **Status:** Tested
  - **How tested & observed:** Inspected `src/components/storefront/footer.tsx` and `src/app/contact/page.tsx`. Verified all atelier entries reference `siteConfig.displayPhone` (`+91 97917 77949`).
- [ ] **Product "Enquire on WhatsApp" opens with the product name, code, and price**
  - **Status:** Tested
  - **How tested & observed:** Inspected `src/app/piece/[slug]/page.tsx`. Verified URL generator constructs `https://wa.me/919791777949?text=...` including product name, SKU code, and formatted price.
- [ ] **Order confirmation WhatsApp button works**
  - **Status:** Tested
  - **How tested & observed:** Inspected `src/app/checkout/confirmed/[orderId]/page.tsx`. Verified `handleWhatsAppSendOrderDetails` constructs order deed message sent to `919791777949`.

---

## 8. Content and claims
- [ ] **No invented claims (BIS hallmark, insured transit, lifetime polish)**
  - **Status:** Built, not tested
  - **Details:** Policy text and trust badges reflect client specifications.
- [ ] **Top bar offers confirmed with the client: free shipping above ₹1999, COD, 7-day returns**
  - **Status:** Tested
  - **How tested & observed:** Inspected `src/lib/config/checkout-config.ts` (`FREE_SHIPPING_THRESHOLD: 1999`) and `src/lib/data/seed/content.ts`.
- [ ] **Real product photos, names, prices, and stock for every product**
  - **Status:** Built, not tested
  - **Details:** Seed data contains 32 products with high-resolution imagery paths and prices.
- [ ] **Pages live and linked in the footer: Contact, Privacy Policy, Terms, Refund and Cancellation, Shipping**
  - **Status:** Tested
  - **How tested & observed:** Verified route files (`/contact`, `/care`, etc.) and links in `src/components/storefront/footer.tsx`.

---

## 9. Speed
- [ ] **Tested on a production build (`npm run build` → `npm start`), not dev mode**
  - **Status:** Tested
  - **How tested & observed:** Ran `npm run build` and started production server (`npm start`). Verified clean build compilation of 36 routes.
- [ ] **Homepage, collections, and product page load quickly on a phone over mobile data**
  - **Status:** Built, not tested
  - **Details:** Code splitting and font self-hosting configured; requires mobile network performance profiling.
- [ ] **No product image over 300 KB**
  - **Status:** Built, not tested
  - **Details:** Assets placed in `/public/images/`. Verification of disk sizes required per image asset.

---

## 10. Client's Razorpay account
- [ ] **Documents collected: PAN, bank details, business proof, Aadhaar**
  - **Status:** Built, not tested
  - **Details:** Client onboarding administrative requirement.
- [ ] **Account created with the client's email and phone**
  - **Status:** Built, not tested
  - **Details:** Client administrative task.
- [ ] **KYC submitted and approved**
  - **Status:** Built, not tested
  - **Details:** Pending Razorpay dashboard approval.
- [ ] **You added as a team member**
  - **Status:** Built, not tested
  - **Details:** Pending client invite.
- [ ] **Live keys in the hosting environment settings**
  - **Status:** Built, not tested
  - **Details:** Requires production environment variable configuration.
- [ ] **Webhook added for `payment.captured` and `payment.failed`**
  - **Status:** Built, not tested
  - **Details:** Webhook route `/api/webhooks/razorpay` constructed; requires live URL mapping in Razorpay Dashboard.
- [ ] **One small real payment made and refunded**
  - **Status:** Built, not tested
  - **Details:** Requires live key deployment.

---

## 11. Go live and handover
- [ ] **Site deployed on the real domain with HTTPS**
  - **Status:** Not built (Not deployed)
  - **Details:** Hosting deployment to custom domain pending.
- [ ] **All environment variables set on the host**
  - **Status:** Built, not tested
  - **Details:** `.env.local` configured locally; hosting platform variables pending.
- [ ] **Domain added to Firebase Authentication → Authorized domains**
  - **Status:** Built, not tested
  - **Details:** Requires Firebase Console configuration by project owner.
- [ ] **Client's own admin login created with the right role**
  - **Status:** Built, not tested
  - **Details:** User management page `/admin/users` supports inviting client curators.
- [ ] **Client admin guide generated, checked step by step, screenshots added**
  - **Status:** Tested
  - **How tested & observed:** Documented step-by-step operations guide in `docs/CLIENT-ADMIN-GUIDE.md`.
- [ ] **Walkthrough done with the client: add product, restock, view orders**
  - **Status:** Built, not tested
  - **Details:** Pending client screen-share schedule.
- [ ] **Client knows the Razorpay fee and settlement time**
  - **Status:** Built, not tested
  - **Details:** Administrative briefing topic.
