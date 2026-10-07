# ADI PARVA — Store Owner Admin Guide

Welcome to the **Adi Parva** Curatorial Admin Console guide. This document explains how to manage your jewellery collection, track incoming orders, update stock levels, and serve your customers.

---

## 1. How to Log In to the Admin Panel

1. Open your web browser.
2. Go to the address: `http://your-domain.com/admin/login` (or `http://localhost:3000/admin/login` during testing).
3. Enter your email address and password on the login screen.
4. Click **"Sign In to Atelier Console"**.

[SCREENSHOT: Admin Login Page showing email, password field, and Sign In button]

---

## 2. Understanding Your Dashboard Numbers

When you log in, you arrive at **Dashboard** (`/admin`). Here is what each figure means:

- **Total Revenue (₹):** Total value of all orders placed in your shop.
- **Active Orders:** Number of orders currently being prepared, confirmed, or shipped that need your attention.
- **Total Collectors:** Total number of registered customers and buyers in your database.
- **Masterpieces Count:** Number of highlighted flagship pieces tagged as "Masterpiece" in your store.

[SCREENSHOT: Admin Dashboard overview showing stats cards and recent order list]

---

## 3. How to Add a New Product

1. On the left menu, click **Products** → click **"Add New Piece"** (or go to `/admin/products/new`).
2. Fill in the product details:
   - **Piece Name:** Type the title (e.g. *Kanchi Temple Choker*).
   - **Category:** Select the category (e.g. *Temple Jewellery*, *Jhumkas*, *Bridal Sets*).
   - **Price (₹):** Enter the selling price in rupees.
   - **Compare At Price (₹):** (Optional) Original price if on offer.
   - **Opening Stock:** Enter the number of available physical units.
   - **Image URLs:** Add image file paths for your product photos.
   - **Short Description & Provenance Story:** Enter the craftsmanship notes and origin story.
3. Click **"Save & Publish Piece"** at the bottom right.

> **Automatic Product Code:** The system automatically creates a unique Product ID (such as `prod-1740000000`) and SKU code when saved. You can find this code listed under the product name in your product list.

[SCREENSHOT: Add New Product Form showing product name, price, stock, and Save button]

---

## 4. How to Edit, Hide, or Archive a Product

1. Click **Products** on the left menu (`/admin/products`).
2. Find the piece in the list and click **"Edit"** next to it.
3. To change details (like price or photos), update the fields and click **"Save Changes"**.
4. To change visibility on the storefront:
   - **Live:** Product is visible and available for purchase.
   - **Draft (Hide):** Product is hidden from customers on the website while you make updates.
   - **Archived:** Product is permanently hidden from the store catalog but kept in your records.

[SCREENSHOT: Edit Product Page showing Status selection dropdown with Live, Draft, and Archived options]

---

## 5. Stock Inventory Management

1. Go to **Products** (`/admin/products`) to review stock for all items.
2. **Check Current Stock:** Look at the **Stock** column next to each product.
   - **Green Pill:** Stock is healthy (more than 5 units).
   - **Amber Pill:** Low stock warning (5 or fewer units remaining).
   - **Red Pill / Out of Stock:** 0 units remaining.
3. **Updating Stock Level:**
   - Click **Edit** on any product.
   - Go to the **Variants & Stock** section.
   - Change the stock number to match your actual vault inventory.
   - Click **"Save Changes"**.

[SCREENSHOT: Product list table highlighting stock pills and Low Stock indicator]

---

## 6. How to View and Manage Orders

1. Click **Orders** on the left menu (`/admin/orders`).
2. **View New Orders:** All incoming purchases appear at the top of the list. Click on any Order Number (e.g. `#ORD-7721`) to see full details.
3. **Check Payment:** Look at the payment method listed (*Card*, *UPI*, *Net banking*, or *Cash on Delivery*).
4. **Update Order Status:**
   - Click **"Update Status"** inside the order view.
   - Select the new status: **Confirmed** → **Shipped** → **Delivered**.
   - Type a short note for the customer (e.g. *Packed and handed to courier*).
   - Click **"Save Status"**.
5. **Cash on Delivery (COD) Orders:** Verify the customer phone number before shipping. When delivered and cash is collected, mark status as **Delivered**.

[SCREENSHOT: Order Details Page showing item list, shipping address, and Update Status modal]

---

## 7. What Happens Automatically When a Customer Buys

When a customer completes a purchase on your website:

1. **Stock Decreases Automatically:** The purchased item's inventory count is immediately reduced in your database.
2. **Order Created:** A new order record (e.g. `#ORD-8842`) appears instantly in your Admin **Orders** register.
3. **Confirmation View:** The customer receives an itemized receipt with expected delivery dates.

---

## 8. How WhatsApp Enquiries Arrive

Customers browsing your jewellery can click the **"WhatsApp Concierge"** button on any product page.

- **What Happens:** It automatically opens a WhatsApp chat addressed to your atelier number (`+91 98765 43210`).
- **Customer's Pre-filled Message:** The customer's message arrives containing:
  - Product Name (e.g. *Maharani Temple Necklace*)
  - Product Price & SKU
  - Direct web link to the piece on your site

[SCREENSHOT: WhatsApp Concierge button on product page and sample incoming WhatsApp message]

---

## 9. Common Problems & Solutions

| Problem | Cause | How to Fix |
|---|---|---|
| **Product not showing on site** | Status set to "Draft" or "Archived" | Go to **Products** → Edit product → change Status to **Live** → click **Save**. |
| **Product shows "Out of Stock"** | Stock count is set to 0 | Go to **Products** → Edit product → increase Stock count → click **Save**. |
| **Order payment shows "Pending"** | Customer left during checkout | Wait 15 minutes; if unpaid, contact customer via WhatsApp to assist. |
| **Changes not updating on site** | Browser cache storing old view | Refresh your web browser page (Press `Ctrl + Shift + R` or `Cmd + Shift + R`). |

---

## 10. Rules & Support

### What You Should NEVER Do:
- **Never delete a product** if customers have already ordered it — set status to **Archived** instead.
- **Never mark a COD order as "Delivered"** before courier confirmation of cash collection.
- **Never share your Admin password** over email or messaging apps.

### Need Technical Help?
For technical assistance, system bugs, or feature additions, contact your development studio lead engineer.
