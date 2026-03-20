# Wizard Of Light — Architecture & Developer Reference

> **Version**: 2.0
> **Last Updated**: March 20, 2026
> **Status**: Active — Phase 1 Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Supabase Setup Guide](#supabase-setup-guide)
6. [Admin Access Control (RBAC)](#admin-access-control-rbac)
7. [Product System](#product-system)
8. [Image Upload Pipeline](#image-upload-pipeline)
9. [18+ / NSFW Content](#18--nsfw-content)
10. [Payment Processing](#payment-processing)
11. [Shipping](#shipping)
12. [Authentication](#authentication)
13. [Admin API Routes](#admin-api-routes)
14. [Known Issues & Resolutions](#known-issues--resolutions)
15. [Environment Variables](#environment-variables)
16. [Deployment (Netlify)](#deployment-netlify)

---

## Overview

**Wizard Of Light (WOL)** is a Nebraska-based leather studio selling handcrafted goods across three categories:

- **Everyday carry** — belts, wallets, accessories
- **Armor & props** — Renaissance faire, LARP, convention
- **18+ leather goods** — BDSM-adjacent adult products (age-gated)

The site is a fully serverless Next.js 16 application hosted on Netlify, backed by Supabase (PostgreSQL + Auth + Storage).

**Key constraints driving technical decisions:**
- Small operation — minimal DevOps overhead required
- Dual SFW/NSFW content with age verification
- Stripe prohibits adult/BDSM products → dual payment processor strategy
- Non-technical staff must be able to manage content via admin panel
- Images must be optimised automatically (WebP conversion on upload)

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js App Router | 16.1.6 | SSR/SSG, routing, API routes |
| **Language** | TypeScript | 5 | Full-stack type safety |
| **Styling** | CSS Modules + Variables | — | Component-scoped styles |
| **Database** | Supabase (PostgreSQL 17) | — | Data + Row Level Security |
| **Auth** | Supabase Auth | — | Email/password + OAuth |
| **Storage** | Supabase Storage (S3) | — | Product images, avatars |
| **Image Processing** | Sharp | 0.33+ | Auto-WebP conversion on upload |
| **Payments (SFW)** | Stripe | 20+ | Cards, Apple Pay, Google Pay |
| **Payments (NSFW)** | PaymentCloud | — | High-risk adult processor |
| **Payments (Alt)** | PayPal | — | SFW fallback |
| **Email** | Resend | 6+ | Order confirmation emails |
| **Hosting** | Netlify | — | CDN, serverless functions |
| **State** | React Context + TanStack Query | — | Cart + data fetching |
| **Forms** | React Hook Form + Zod | — | Validation |
| **Animations** | Framer Motion | — | Page transitions |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, signup, forgot/reset password
│   ├── (account)/           # Protected: account, orders, wishlist
│   ├── admin/               # Admin dashboard (role-protected)
│   │   ├── layout.tsx       # RBAC sidebar + auth check
│   │   ├── products/        # Product CRUD
│   │   ├── orders/          # Order management
│   │   ├── categories/      # Collections CRUD
│   │   ├── customers/
│   │   └── settings/
│   ├── shop/
│   │   ├── page.tsx         # SFW product listing (is_visible categories)
│   │   ├── [slug]/          # Product detail
│   │   └── nsfw/            # 18+ product listing (age-gated)
│   ├── api/
│   │   ├── admin/
│   │   │   ├── upload/      # POST: image upload + WebP conversion
│   │   │   ├── products/    # POST: create product
│   │   │   │   └── [id]/    # PUT/DELETE: update/delete product
│   │   │   └── categories/  # GET/POST: list/create categories
│   │   │       └── [id]/    # PUT/DELETE: update/delete category
│   │   ├── checkout/        # Stripe + PayPal session creation
│   │   └── webhook/stripe/  # Stripe payment webhooks
│   └── layout.tsx           # Root layout (Header, Footer)
│
├── components/
│   ├── layout/Header.tsx    # Sticky nav + working mobile menu drawer
│   ├── admin/ProductForm.tsx # Product create/edit with WebP upload
│   ├── AgeGate.tsx          # 18+ modal (localStorage cookie)
│   └── CartDrawer.tsx       # Slide-out cart
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client (anon key)
│   │   ├── server.ts        # Server component client (cookies)
│   │   ├── service.ts       # Service role client (bypasses RLS)
│   │   └── middleware.ts    # Session refresh middleware
│   └── utils.ts             # formatPrice, getStockLabel
│
└── middleware.ts             # Route protection (account, admin)
```

---

## Database Schema

### Core Tables

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | id, email, role, nsfw_enabled | Auto-created on signup via trigger |
| `products` | id, slug, is_nsfw, is_published, is_custom_order | Filtered by RLS |
| `product_variants` | product_id, sku, price (cents), stock_count | At least 1 per product |
| `product_images` | product_id, url, is_primary, sort_order | Supabase Storage URLs |
| `product_categories` | product_id, category_id | Many-to-many join |
| `categories` | id, slug, is_nsfw, **is_visible**, sort_order | `is_visible` controls shop filter display |
| `orders` | user_id, status, payment_processor, order_number | WOL-1001+ sequence |
| `order_items` | order_id, product_id, variant_id, quantity, unit_price | Snapshot of product at purchase |

### is_visible Column (categories)

Added in migration `20260320000000`. Controls whether a category appears as a filter button in the public shop.

- `is_visible = true` → shows in `/shop` filter bar
- `is_visible = false` → hidden from shop (admin can still see all)

Use this to hide internal/legacy categories without deleting them.

### Row Level Security Overview

| Table | Public Access | Admin Access |
|---|---|---|
| `products` | Published SFW only | All (via `is_admin()`) |
| `products` (NSFW) | Only if `nsfw_enabled = true` in profile | All |
| `product_categories` | SELECT allowed | Full CRUD |
| `categories` | SELECT allowed | Full CRUD (manager+) |
| `orders` | Own orders only | All |
| storage/products | Public read | Upload/update/delete (content_editor+) |

**Important**: The NSFW shop page (`/shop/nsfw`) uses `createServiceClient()` to bypass RLS entirely, so all published NSFW products appear regardless of the viewer's `nsfw_enabled` flag. Age verification is handled client-side.

---

## Supabase Setup Guide

### 1. Run Migrations

Apply all migration files in order from the Supabase dashboard SQL editor or via CLI:

```
supabase/migrations/
  20260212000000_initial_schema.sql          ← Core tables, RLS, indexes
  20260212050000_checkout_additions.sql      ← Order numbers, guest checkout
  20260212060000_add_video_url.sql           ← Product video URL field
  20260212070000_storage_setup.sql           ← Storage bucket (old, superseded)
  20260320000000_fix_policies_storage_categories.sql  ← APPLY THIS LAST
```

The `20260320000000` migration is the most important for production:
- Adds missing `product_categories` RLS policies (fixes broken category filters)
- Adds `is_visible` to categories (removes cosplay from shop filter)
- Recreates storage policies with correct `with check` clauses
- Creates `products` and `avatars` storage buckets idempotently

### 2. Storage Bucket Verification

After running migrations, verify the bucket exists in Supabase Dashboard → Storage:

- `products` — public bucket, 50 MB limit, WebP/JPEG/PNG/GIF allowed
- `avatars` — public bucket, 5 MB limit (optional)

If the bucket is missing, the migration will create it. If it already exists with wrong settings, the migration will update it via `ON CONFLICT DO UPDATE`.

### 3. Set User Roles

To grant admin access to a user, update their profile directly in the Supabase dashboard:

```sql
UPDATE public.profiles
SET role = 'owner'   -- or 'manager', 'content_editor', 'fulfillment'
WHERE email = 'your@email.com';
```

Roles are not settable by users themselves — only via direct database access or a future staff management UI.

---

## Admin Access Control (RBAC)

### Role Hierarchy

| Role | Dashboard | Products | Orders | Collections | Customers | Settings |
|---|---|---|---|---|---|---|
| `fulfillment` | — | — | ✓ | — | — | — |
| `content_editor` | — | ✓ | — | ✓ | — | — |
| `manager` | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `owner` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### How It Works

Access control happens at two layers:

1. **Middleware** (`src/middleware.ts`) — checks auth on every `/admin` request, redirects to `/login` if not authenticated or not an admin role.

2. **Layout** (`src/app/admin/layout.tsx`) — checks the specific role and renders only the nav items the user's role allows. Accessing a page directly that isn't in your nav is caught by the middleware.

3. **API Routes** (`/api/admin/*`) — each route independently verifies admin status using `createClient()` before performing any action with `createServiceClient()`.

### Visual Indicator

The admin sidebar shows a colour-coded role badge:
- Orange — Owner
- Plum — Manager
- Blue — Content Editor
- Green — Fulfillment

---

## Product System

### Creating a Product (Admin Flow)

1. Navigate to `/admin/products/new`
2. Fill in name, slug (auto-generated), descriptions
3. Upload images — automatically converted to WebP via `POST /api/admin/upload`
4. Set price (USD) and stock count
5. Toggle Published, 18+ Only, Custom Order as needed
6. Select one or more Collections
7. Save — creates product, default variant, images, and category assignments via `POST /api/admin/products`

### 18+ Products

Check the "18+ Only" checkbox when creating a product. This sets `is_nsfw = true`. The product will:
- NOT appear on `/shop` (filtered out by `is_nsfw = false` query)
- Appear on `/shop/nsfw` (fetched via service role, bypasses RLS)
- Be labelled with an 18+ badge if somehow visible in SFW context

### Product Images

All images uploaded through the admin form are automatically:
1. Auto-rotated (EXIF orientation corrected)
2. Resized to max 2000×2000px (preserves aspect ratio, never upscaled)
3. Converted to WebP at quality 85
4. Uploaded to the `products` Supabase Storage bucket
5. URL saved to `product_images` table

### Collections (Categories)

Collections are managed at `/admin/categories`. Each collection has:
- `is_visible` — whether it shows as a filter button on the public shop
- `is_nsfw` — whether it appears in the 18+ section
- `sort_order` — display order in filter bar

---

## Image Upload Pipeline

```
Admin uploads file
       ↓
POST /api/admin/upload
       ↓
Verify admin role (createClient)
       ↓
Read file buffer
       ↓
sharp: auto-rotate → resize(2000×2000, fit:inside) → webp(quality:85)
       ↓
supabase.storage.from('products').upload(filename.webp, buffer)   [service role]
       ↓
Return public URL
       ↓
ProductForm adds URL to images[] state
       ↓
On form save: POST /api/admin/products includes images[]
       ↓
product_images rows inserted via service role
```

---

## 18+ / NSFW Content

### Age Verification Flow

1. User visits `/shop/nsfw`
2. Client checks `localStorage.wol_age_verified`
3. If not set → `<AgeGate>` modal blocks the page
4. User confirms age → `localStorage.wol_age_verified = 'true'` set (30-day effective, no expiry on key)
5. `NsfwShopClient` polls localStorage every 500ms and re-renders once verified

### NSFW Products in RLS

The Supabase RLS policy for NSFW products requires `nsfw_enabled = true` in the user's profile to view them via the regular client. However:

- The `/shop/nsfw` page uses `createServiceClient()` — bypasses RLS entirely
- The admin products page uses a server client with the logged-in admin's session — admin role policy allows viewing all products

**User NSFW preference** is toggled at `/account` and stored in `profiles.nsfw_enabled`. This affects the regular shop page only — the NSFW shop is always accessible after age verification.

---

## Payment Processing

| Cart Contents | Processor | Notes |
|---|---|---|
| SFW only | Stripe | Standard checkout session |
| NSFW only | PaymentCloud | High-risk processor for adult content |
| Mixed | Both | Cart splits into two orders |

PayPal is available as an alternative for SFW orders only.

Order numbers follow the `WOL-1001` format, auto-assigned by a PostgreSQL sequence trigger on insert.

---

## Shipping

Shipping zones configured in `shipping_zones` table:

| Zone | Countries | Rate |
|---|---|---|
| Domestic (Continental US) | US | $7.99 (free over $100) |
| Alaska & Hawaii | US-AK, US-HI | $14.99 (free over $150) |
| Canada | CA | $19.99 |
| International | * | $29.99 |

---

## Authentication

| Provider | Status |
|---|---|
| Email/Password | Active |
| Google OAuth | Configured via Supabase |
| Discord OAuth | Configured via Supabase |

Auth callbacks handled at `/auth/callback`. Sign out via `/auth/signout`.

Email templates (confirmation, password recovery) are in `/resources/email_templates/`. These must be manually uploaded to Supabase Auth → Email Templates in the dashboard.

---

## Admin API Routes

All admin routes live under `/api/admin/`. They independently verify the caller is an authenticated admin before executing.

| Route | Method | Role Required | Purpose |
|---|---|---|---|
| `/api/admin/upload` | POST | content_editor+ | Upload image, returns WebP URL |
| `/api/admin/products` | POST | content_editor+ | Create product with variant + images |
| `/api/admin/products/[id]` | PUT | content_editor+ | Update product |
| `/api/admin/products/[id]` | DELETE | manager+ | Delete product |
| `/api/admin/categories` | GET | any admin | List all categories |
| `/api/admin/categories` | POST | content_editor+ | Create category |
| `/api/admin/categories/[id]` | PUT | content_editor+ | Update category |
| `/api/admin/categories/[id]` | DELETE | manager+ | Delete category |

---

## Known Issues & Resolutions

### Issue: Hamburger menu (three lines) did nothing on mobile
**Root cause**: The `<button>` had no `onClick` handler and no state.
**Fix**: Added `isMenuOpen` state to `Header.tsx`, slide-down drawer with overlay, body scroll lock, and route-change auto-close.

### Issue: 18+ items not appearing after being published
**Root causes**:
1. `ProductForm` was using the anon browser client directly for database writes — if the user's session wasn't perfectly in sync, the admin RLS check could fail silently.
2. The `products` storage bucket may not have existed on the remote Supabase instance.
**Fix**: All admin writes now go through server-side API routes (`/api/admin/products`) that use the service role key, bypassing RLS entirely for admin operations. Storage bucket creation is idempotent in the new migration.

### Issue: Product photos not appearing
**Root causes**:
1. Storage bucket may not exist on remote Supabase.
2. Images uploaded via anon client could fail if storage RLS policies weren't applied.
**Fix**: New migration ensures bucket exists. Image upload now goes through `/api/admin/upload` (server-side, service role). Images are also auto-converted to WebP.

### Issue: Category filter showing "Cosplay"
**Fix**: Added `is_visible` column to categories. Migration sets `cosplay.is_visible = false`. Shop page now filters `is_visible = true`.

### Issue: Admin categories page was read-only
**Fix**: Full CRUD implemented in `CategoryManager.tsx` client component with modal form. Supports create, edit, delete, and visibility toggle.

### Issue: Blurbs on homepage and About page didn't describe WOL accurately
**Fix**: Updated `page.tsx` and `about/page.tsx` copy to reference all three product lines (everyday carry, armor/convention, 18+ leather goods) and reflect the Nebraska studio context.

### Issue: No policies on product_categories table (broken category filter queries)
**Root cause**: RLS was enabled on `product_categories` but no policies were defined → all queries using `product_categories!inner` in joins returned 0 results.
**Fix**: Migration adds `"Anyone can view product category assignments"` (SELECT, `using(true)`) and `"Admins can manage product category assignments"` (ALL, `using(is_admin())`).

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Server-side only, never expose to client

# Stripe (SFW payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# PaymentCloud (NSFW payments)
PAYMENTCLOUD_API_KEY=...
PAYMENTCLOUD_WEBHOOK_SECRET=...

# PayPal (SFW alternative)
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...

# Email
RESEND_API_KEY=re_...                   # Requires domain verification

# Site
NEXT_PUBLIC_SITE_URL=https://wizardoflight.com
```

---

## Deployment (Netlify)

Build config in `netlify.toml`:
- Build command: `npm run build`
- Publish dir: `.next`
- Node: 20
- Plugin: `@netlify/plugin-nextjs`

**Sharp requires native binaries** — Netlify builds on Linux so this works correctly in production. For local development on Apple Silicon (M1/M2/M3), `npm install` downloads the correct macOS ARM binary automatically.

### Post-deployment checklist

1. Run all Supabase migrations (especially `20260320000000`)
2. Verify `products` storage bucket exists and is public
3. Set admin user role in profiles table
4. Upload email templates to Supabase Auth dashboard
5. Configure Stripe webhook endpoint: `https://yourdomain.com/api/webhook/stripe`
6. Set all environment variables in Netlify dashboard
