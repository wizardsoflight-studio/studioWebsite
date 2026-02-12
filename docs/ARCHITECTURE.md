# Wizard Of Light — Architecture & Implementation Plan

> **Version**: 1.0  
> **Date**: February 12, 2026  
> **Status**: Approved — Ready for Phase 1 Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Key Architectural Decisions](#key-architectural-decisions)
7. [E-Commerce & Product System](#e-commerce--product-system)
8. [NSFW / Age-Gated Content](#nsfw--age-gated-content)
9. [Payment Processing](#payment-processing)
10. [Shipping](#shipping)
11. [Authentication & Social Login](#authentication--social-login)
12. [User Features](#user-features)
13. [Events Calendar](#events-calendar)
14. [Journal / Blog](#journal--blog)
15. [Order Management & Returns](#order-management--returns)
16. [Admin Reporting & Dashboard](#admin-reporting--dashboard)
17. [Brand Identity & Design](#brand-identity--design)
18. [Phased Launch Plan](#phased-launch-plan)
19. [Development Workflow](#development-workflow)

---

## Overview

**Wizard Of Light** is a leather work and custom work studio selling both SFW (general leather goods, cosplay) and NSFW (BDSM) products. This document defines the complete architecture for their e-commerce website, built as a fully serverless application.

**Key constraints:**
- Small startup (garage-based studio)
- Minimal DevOps overhead
- Dual SFW/NSFW content with age gating
- Dual payment processors (Stripe prohibits BDSM products)
- Non-technical staff must be able to manage content

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR/SSG/ISR, routing, API routes |
| **Language** | TypeScript | Type safety across the codebase |
| **Styling** | Vanilla CSS + CSS Modules | Per-component styling, full control |
| **Database** | Supabase (PostgreSQL) | Products, orders, users, content |
| **Auth** | Supabase Auth | Google, Discord, Apple, Email/Password |
| **File Storage** | Supabase Storage | Product images, journal media, avatars |
| **Payments (SFW)** | Stripe | Checkout, Apple/Google Pay, PayPal |
| **Payments (NSFW)** | PaymentCloud | High-risk processor for BDSM products |
| **Email** | Resend | Order confirmations, notifications |
| **Hosting** | Netlify | CDN, serverless functions, deploy previews |
| **State Mgmt** | React Context + TanStack Query | Client-side data fetching & caching |
| **Forms** | React Hook Form + Zod | Validation |
| **Rich Text** | Tiptap | Journal/blog content editing (WYSIWYG) |
| **Calendar** | FullCalendar.js | Events display |
| **Icons** | Lucide React | Consistent icon set |
| **Animations** | Framer Motion | Page transitions, micro-animations |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────┐
│              Netlify (Frontend + Serverless)     │
│  ┌───────────────────┐  ┌────────────────────┐  │
│  │   Next.js App     │  │   API Routes       │  │
│  │   SSR / SSG / ISR │  │   (Serverless Fn)  │  │
│  └────────┬──────────┘  └─────────┬──────────┘  │
└───────────┼───────────────────────┼──────────────┘
            │                       │
            ▼                       ▼
┌───────────────────────────────────────────────────┐
│              Supabase (Backend-as-a-Service)       │
│  ┌──────┐  ┌──────────┐  ┌─────────┐  ┌───────┐ │
│  │ Auth │  │PostgreSQL│  │ Storage │  │ Edge  │  │
│  │      │  │  (DB)    │  │ (Files) │  │  Fn   │  │
│  └──────┘  └──────────┘  └─────────┘  └───────┘ │
└───────────────────────────────────────────────────┘
            │                       │
            ▼                       ▼
┌────────────────────┐  ┌────────────────────────┐
│      Stripe        │  │     PaymentCloud       │
│   (SFW Payments)   │  │   (NSFW Payments)      │
└────────────────────┘  └────────────────────────┘
```

### Data Flow: Purchase

1. Customer browses products (SSG/ISR pages)
2. Adds items to cart (localStorage for guests, Supabase for logged-in)
3. Proceeds to checkout
4. System checks cart for NSFW items:
   - **SFW only** → Stripe Checkout Session
   - **NSFW only** → PaymentCloud checkout
   - **Mixed** → Split into two separate orders
5. Customer completes payment on processor's page
6. Webhook fires → Supabase Edge Function updates order status
7. Customer receives order confirmation email via Resend
8. Customer redirected to order confirmation page

---

## Project Structure

```
BryanLeather/
├── docs/                            # Documentation
│   └── ARCHITECTURE.md              # This file
├── public/                          # Static assets
│   ├── fonts/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (storefront)/            # Public-facing route group
│   │   │   ├── page.tsx             # Homepage / Landing
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx         # Product listing (SFW/NSFW filter)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     # Product detail
│   │   │   ├── cart/
│   │   │   │   └── page.tsx         # Shopping cart
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx         # Checkout flow
│   │   │   │   └── success/
│   │   │   │       └── page.tsx     # Order confirmation
│   │   │   ├── events/
│   │   │   │   └── page.tsx         # Events calendar
│   │   │   ├── journal/
│   │   │   │   ├── page.tsx         # Blog listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     # Blog post
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts         # OAuth callback handler
│   │   ├── (account)/               # Logged-in user area
│   │   │   ├── layout.tsx           # Account layout (sidebar nav)
│   │   │   ├── account/
│   │   │   │   └── page.tsx         # Profile & settings
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx         # Order history
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Order detail + tracking
│   │   │   ├── wishlist/
│   │   │   │   └── page.tsx
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx         # Saved shipping addresses
│   │   │   └── preferences/
│   │   │       └── page.tsx         # NSFW toggle, notifications
│   │   ├── admin/                   # Admin dashboard (role-protected)
│   │   │   ├── layout.tsx           # Admin layout with sidebar
│   │   │   ├── page.tsx             # Dashboard overview
│   │   │   ├── products/
│   │   │   │   ├── page.tsx         # Product management
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Edit product
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx         # Order management
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Order detail + status update
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   └── page.tsx         # Manage events
│   │   │   ├── journal/
│   │   │   │   ├── page.tsx         # Manage journal posts
│   │   │   │   └── new/
│   │   │   │       └── page.tsx     # New post editor
│   │   │   ├── shipping/
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   └── page.tsx
│   │   │   ├── staff/
│   │   │   │   ├── page.tsx         # Staff list + role assignment
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Edit staff member
│   │   │   ├── settings/
│   │   │   │   └── page.tsx         # Store settings, tax, etc.
│   │   │   └── activity-log/
│   │   │       └── page.tsx         # Audit trail of staff actions
│   │   ├── api/                     # API routes (serverless)
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/
│   │   │   │   │   └── route.ts     # Create Stripe checkout session
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts     # Stripe webhook handler
│   │   │   ├── paymentcloud/
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts     # PaymentCloud webhook handler
│   │   │   └── admin/
│   │   │       └── [...]/           # Admin API endpoints
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css              # Global styles
│   │   └── not-found.tsx
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Base UI (buttons, inputs, cards)
│   │   ├── layout/                  # Header, Footer, Sidebar
│   │   ├── shop/                    # Product cards, filters, cart
│   │   ├── admin/                   # Admin-specific components
│   │   └── common/                  # Shared (modals, loaders, etc.)
│   ├── lib/                         # Utilities & configs
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser client
│   │   │   ├── server.ts            # Server client (SSR)
│   │   │   ├── admin.ts             # Service role client (API routes)
│   │   │   └── middleware.ts        # Auth middleware helper
│   │   ├── stripe.ts                # Stripe client setup
│   │   ├── paymentcloud.ts          # PaymentCloud client setup
│   │   ├── resend.ts                # Email client setup
│   │   └── utils.ts                 # General utilities
│   ├── hooks/                       # Custom React hooks
│   │   ├── useCart.ts
│   │   ├── useAuth.ts
│   │   └── useProducts.ts
│   ├── types/                       # TypeScript types
│   │   ├── database.ts              # Generated from Supabase
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── user.ts
│   ├── styles/                      # CSS Modules
│   │   ├── variables.css            # Design tokens
│   │   └── components/              # Per-component CSS modules
│   └── middleware.ts                # Next.js middleware (auth guards)
├── supabase/                        # Supabase local config
│   ├── migrations/                  # SQL migrations
│   ├── seed.sql                     # Seed data
│   └── config.toml
├── .env.local                       # Environment variables (NOT committed)
├── .env.example                     # Template for env vars
├── netlify.toml                     # Netlify config
├── next.config.ts                   # Next.js config
├── tsconfig.json
├── package.json
├── LICENSE
└── README.md
```

---

## Database Schema

### Core Tables

| Table | Purpose | Key Relations |
|---|---|---|
| `profiles` | Extended user data (name, avatar, role, NSFW pref) | FK → auth.users |
| `products` | Product catalog | Has many variants, images |
| `product_variants` | Size/color/material variants | FK → products |
| `product_images` | Gallery images per product | FK → products |
| `categories` | Product categories (SFW/NSFW, Cosplay, etc.) | Many-to-many with products |
| `product_categories` | Join table for products ↔ categories | FK → products, categories |
| `orders` | Customer orders | FK → profiles |
| `order_items` | Line items per order | FK → orders, product_variants |
| `cart_items` | Persistent cart (logged-in users) | FK → profiles, product_variants |
| `events` | Conventions/fairs the studio attends | — |
| `journal_posts` | Blog/journal entries | FK → profiles (author) |
| `journal_tags` | Tag definitions | — |
| `journal_post_tags` | Join table for posts ↔ tags | FK → journal_posts, journal_tags |
| `comments` | Comments on journal posts | FK → journal_posts, profiles |
| `wishlists` | Saved products | FK → profiles, products |
| `shipping_addresses` | Saved addresses | FK → profiles |
| `shipping_zones` | Shipping rate configuration | — |
| `reviews` | Product reviews with rating | FK → products, profiles |
| `staff_permissions` | Granular permissions per staff member | FK → profiles |
| `activity_log` | Audit trail of all admin/staff actions | FK → profiles |
| `notifications` | Back-in-stock queue, email log | FK → profiles |
| `newsletter_subscribers` | Email list with opt-in status | FK → profiles (optional) |

### Events Table Detail

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | text | Event name |
| `description` | text | Rich text description |
| `start_date` | timestamptz | Start date/time |
| `end_date` | timestamptz | End date/time |
| `venue_name` | text | Venue/convention name |
| `address` | text | Full address |
| `lat` / `lng` | float | For Google Maps embed |
| `image_url` | text | Event banner image |
| `is_published` | boolean | Draft vs live |
| `created_at` | timestamptz | Auto-set |

### Security: Row Level Security (RLS)

All tables use Supabase RLS policies:
- **Customers** can only read/write their own data (orders, wishlist, addresses, cart)
- **Staff** can access data based on their role
- **NSFW products** are filtered server-side based on age verification status
- **Admin actions** are logged to `activity_log`

---

## Key Architectural Decisions

### 1. Rendering Strategy

| Page Type | Strategy | Reason |
|---|---|---|
| Product pages | ISR (revalidate on admin change) | Fast loads, fresh data |
| Shop listing | SSR with search params | Filters, pagination |
| Admin pages | Client-side rendering | Behind auth, data-heavy |
| Journal/Events | SSG with on-demand revalidation | Content rarely changes |

### 2. Cart Strategy

- **Guest users**: Cart stored in `localStorage`
- **Logged-in users**: Cart synced to Supabase `cart_items` table
- **On login**: Local cart merges into database cart

### 3. NSFW Content Handling

- Products tagged with `is_nsfw` boolean
- Age gate modal on first visit (stored in cookie, 30-day expiry)
- NSFW filter toggle in user preferences (`/account/preferences`)
- RLS policies enforce server-side filtering

### 4. Role-Based Access Control (RBAC)

| Role | Access Level | Capabilities |
|---|---|---|
| `customer` | Public site + account area | Browse, buy, manage own orders & wishlist |
| `fulfillment` | Admin: Orders, Shipping, Inventory | View orders, update status, print labels, adjust stock |
| `content_editor` | Admin: Journal, Events | Create/edit blog posts, manage events calendar |
| `manager` | Admin: Everything except staff | All of above + products, customers, reporting |
| `owner` | Admin: Full access | All of above + staff management, store settings, activity log |

**Enforcement layers:**
1. `profiles.role` column stores the user's role (default: `customer`)
2. `staff_permissions` table allows granular overrides
3. Next.js `middleware.ts` checks role on `/admin/*` routes
4. Supabase RLS policies enforce at the database level (defense in depth)
5. All admin actions logged to `activity_log`

---

## E-Commerce & Product System

### Product Categories

| Category | Content Rating | Examples |
|---|---|---|
| General Leather Goods | SFW | Wallets, belts, bags, holsters, armor |
| Cosplay | SFW | Armor sets, gauntlets, fantasy props |
| BDSM Leather Goods | NSFW (18+) | Restraints, harnesses, collars, accessories |

### Product Variants

Each product can have multiple variant axes, configured per-product:

| Variant Axis | Example Values |
|---|---|
| **Size** | XS, S, M, L, XL, Custom |
| **Color** | Natural, Black, Brown, Oxblood, Custom |
| **Material** | Full-grain, Top-grain, Veg-tan, Exotic |

- Each unique combination = one `product_variant` row with its own price, SKU, and stock count
- Not all products need all axes (a wallet may only have color, not size)

### Custom & Made-to-Order Products

1. Customer selects a "Custom Order" product
2. Fills out custom order form (measurements, preferences, notes)
3. System creates order with status `quote_requested`
4. Admin reviews and sends quote with price & timeline (email)
5. Customer approves quote and pays deposit
6. Admin builds product, updates status along the way
7. Admin ships completed product

### Inventory Display Logic

| Internal Stock | Customer-Facing Display |
|---|---|
| > threshold (default 10) | *(nothing — appears in stock)* |
| 1–threshold | 🔥 **"Limited Supply"** badge |
| 0 units | 🚫 **"Out of Stock"** — "Add to Cart" disabled |
| Custom order | 🛠️ **"Made to Order"** — shows custom form |

- Exact stock counts are **never** visible to customers
- Low stock threshold is configurable by admin
- Admin dashboard shows full stock counts + low stock alerts

---

## NSFW / Age-Gated Content

### Flow

1. User visits site
2. If NSFW content is present → check for age verification cookie
3. If no cookie → show Age Gate Modal
4. If user confirms 18+ → set cookie (30-day expiry), show NSFW content
5. If user declines → filter out all NSFW products
6. Logged-in users can toggle NSFW visibility in `/account/preferences`
7. Supabase RLS policies enforce filtering at the database level

---

## Payment Processing

### ⚠️ Critical: Dual Processor Requirement

**Stripe explicitly prohibits BDSM and sexually-oriented products.** Using Stripe for NSFW items risks immediate account termination. **PayPal also restricts adult products.**

### Split Processor Strategy

| Product Type | Payment Processor | Fees |
|---|---|---|
| **SFW** (general leather, cosplay) | **Stripe** | ~2.9% + $0.30 |
| **NSFW** (BDSM products) | **PaymentCloud** | ~3-5% + $0.30 |

### Checkout Flow

- Cart automatically detects NSFW items
- **SFW only** → routes to Stripe Checkout
- **NSFW only** → routes to PaymentCloud
- **Mixed cart** → automatically split into two separate orders with two payment flows

### Payment Methods by Content Type

| Payment Method | SFW Products | NSFW Products |
|---|---|---|
| Credit/Debit Card | ✅ Stripe | ✅ PaymentCloud |
| Apple Pay | ✅ via Stripe | ❌ |
| Google Pay | ✅ via Stripe | ❌ |
| PayPal | ✅ | ❌ Prohibited |
| Affirm/Klarna (BNPL) | 📋 Phase 2 | ❌ Prohibited |

---

## Shipping

### Phase 1 Features

| Feature | Details |
|---|---|
| Flat rate shipping | Configurable by admin per region |
| Weight-based shipping | Calculated from product weight |
| International shipping | Separate rate table for international zones |
| Order tracking | Manual tracking number entry by admin |
| Free shipping threshold | Configurable (e.g., "$100+ = free shipping") |

### Shipping Zones

| Zone | Coverage | Rate Type |
|---|---|---|
| **Domestic** | Continental US | Flat rate or weight-based |
| **Alaska/Hawaii** | US territories | Higher flat rate |
| **Canada** | CA | International rate |
| **International** | Rest of world | Admin-configurable |

### Future Additions (Phase 2+)

- Real-time carrier rates (USPS, UPS, FedEx API)
- Shipping label providers (EasyPost or Shippo)

---

## Authentication & Social Login

### Phase 1 Providers

| Provider | Notes |
|---|---|
| **Email/Password** | Standard signup with email verification |
| **Google** | Supabase Auth built-in |
| **Discord** | Popular in cosplay community |

### Future Providers

| Provider | Notes |
|---|---|
| **Apple** | Requires Apple Developer account |
| **Facebook/Meta** | Requires Meta Business verification |

All providers handled by Supabase Auth — no custom OAuth code needed. First social login auto-creates a `profiles` row via database trigger.

---

## User Features

### Wishlist
- Heart icon on product cards for quick add/remove
- Wishlist page at `/account/wishlist`
- **Back-in-stock notifications**: Automatic email when a wishlisted item returns to stock

### Product Reviews & Ratings
- 1–5 star rating + optional text review
- "Verified Purchase" badge for confirmed buyers
- Admin moderation (approve/hide reviews)
- Average rating shown on product cards + full reviews on detail page

### Order History & Tracking
- Full order history at `/account/orders`
- Each order shows: items, totals, payment status, shipping status, tracking link
- Status progression: `pending → paid → processing → shipped → delivered`
- Email notifications at each status change

### Saved Addresses
- Multiple shipping addresses per user with default selection
- Auto-fills at checkout

### Newsletter & Notifications
- Newsletter opt-in during signup + toggle in preferences
- Unsubscribe link in every email
- Email service: **Resend** (generous free tier)

| Notification | Trigger |
|---|---|
| Order confirmation | Payment completed |
| Order shipped | Admin adds tracking number |
| Back-in-stock | Wishlisted item restocked |
| Newsletter | Admin sends campaign |
| Price drop | 📋 Future |

---

## Events Calendar

- Interactive calendar at `/events` using **FullCalendar.js**
- Each event: name, date, time, description, venue, image
- **Google Maps** embedded with "Get Directions" link
- Past events auto-archive
- Staff add events via `/admin/events` — simple form, no technical skills needed

---

## Journal / Blog

- **Authors**: Staff only (`content_editor`, `manager`, `owner`)
- **Editor**: Tiptap WYSIWYG — drag & drop images, formatting toolbar, no code needed
- **Rich media**: Images, embedded YouTube/Vimeo, image galleries
- **Categories**: E.g., "Behind the Scenes", "Conventions", "Tutorials"
- **Tags**: Freeform tags for flexible grouping
- **Comments**: Logged-in users can comment; admin moderation
- **Draft/Published**: Posts can be saved as drafts before publishing
- **SEO**: Auto-generated slugs and meta descriptions

---

## Order Management & Returns

### Order Lifecycle

```
[New Order] → pending → paid → processing → shipped → delivered
                          │                     │
                          ▼                     ▼
                   refund_requested      return_requested
                          │                     │
                          ▼                     ▼
                       refunded          return_received → refunded
```

### Automated Email Notifications

| Trigger | Email Sent | Recipient |
|---|---|---|
| Order placed | Order confirmation + receipt | Customer |
| Payment confirmed | Payment receipt | Customer |
| Order processing | "Your order is being prepared" | Customer |
| Order shipped | Shipping confirmation + tracking | Customer |
| Refund requested | Acknowledgment | Customer + Admin |
| Refund processed | Refund confirmation | Customer |
| Return approved | Return instructions | Customer |

### Refund & Return Process

1. Customer requests refund/return from `/account/orders/[id]`
2. Admin reviews in `/admin/orders/[id]`
3. Admin approves → refund processed via Stripe/PaymentCloud API
4. Customer receives email confirmation
5. For returns: admin provides return shipping instructions, marks as received, then refunds

---

## Admin Reporting & Dashboard

### Phase 1 Widgets

| Widget | Data |
|---|---|
| Revenue today/week/month | Stripe + PaymentCloud totals |
| Orders count by status | Pending, processing, shipped |
| Low stock alerts | Products below threshold |
| Recent orders | Last 10 orders quick view |

### Phase 2 Additions

| Widget | Data |
|---|---|
| Top selling products | Best sellers chart |
| Customer analytics | New vs returning, location |
| Revenue charts | Over time, by category |

---

## Brand Identity & Design

### Colors

| Name | Hex | Usage |
|---|---|---|
| **Black** | `#000000` | Primary background, text on light |
| **Orange** | `#FE602F` | CTAs, accents, hover states, prices |
| **Plum** | `#820263` | Secondary accent, headings, links |
| **Dark Gray** | `#1A1A1A` | Card backgrounds, elevated surfaces |
| **Light Gray** | `#E5E5E5` | Muted text, borders, dividers |
| **White** | `#FFFFFF` | Text on dark backgrounds |

### Fonts (Google Fonts)

| Role | Font | Style |
|---|---|---|
| **H1 / Hero** | Comforter | Flowing script — brand personality |
| **H2–H4 / Subtitles** | Charm | Decorative serif — warmth |
| **Body / UI** | Alice | Readable serif — elegant yet legible |

### Design Aesthetic: Dark Gothic

- **Dark backgrounds** (`#000000`, `#1A1A1A`) with light text
- **Orange accents** for action items — buttons, links, prices
- **Plum tones** for secondary highlights — headings, badges, hover
- **Leather textures**: Subtle leather-grain patterns as background overlays
- **Gothic elements**: Sharp borders, ornamental dividers, dramatic spacing
- **Product photography**: Dark backdrop product shots for cohesion
- **Micro-animations**: Fade-in on scroll, hover glow on products, subtle parallax
- **Cards**: Dark glass-morphism with subtle border glow

### CSS Design Tokens

```css
:root {
  /* Brand Colors */
  --color-black: #000000;
  --color-orange: #FE602F;
  --color-plum: #820263;
  --color-dark-gray: #1A1A1A;
  --color-light-gray: #E5E5E5;
  --color-white: #FFFFFF;

  /* Semantic */
  --color-bg-primary: var(--color-black);
  --color-bg-elevated: var(--color-dark-gray);
  --color-text-primary: var(--color-white);
  --color-text-muted: var(--color-light-gray);
  --color-accent-primary: var(--color-orange);
  --color-accent-secondary: var(--color-plum);
  --color-cta: var(--color-orange);

  /* Typography */
  --font-display: 'Comforter', cursive;
  --font-subtitle: 'Charm', serif;
  --font-body: 'Alice', serif;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}
```

---

## Phased Launch Plan

### Phase 1 — MVP Launch (Core Store)

- [x] Project scaffold + design system
- [ ] Landing page with brand identity
- [ ] Product catalog (SFW + NSFW with age gate)
- [ ] Product detail pages with variants
- [ ] Shopping cart + Stripe checkout (SFW)
- [ ] PaymentCloud checkout (NSFW)
- [ ] PayPal (SFW only)
- [ ] User auth (Email, Google, Discord)
- [ ] User account (profile, orders, wishlist, addresses, preferences)
- [ ] Admin: Product CRUD, order management, basic dashboard
- [ ] Shipping zones + flat rate / weight-based
- [ ] Email notifications via Resend

### Phase 2 — Content & Community

- [ ] Events calendar with Google Maps
- [ ] Journal/blog with Tiptap editor
- [ ] Product reviews & ratings
- [ ] Newsletter system
- [ ] Comments on journal posts
- [ ] Refund/return processing
- [ ] Admin reporting (charts, analytics)

### Phase 3 — Advanced

- [ ] Custom order workflow (form → quote → build → ship)
- [ ] BNPL (Affirm/Klarna) for SFW
- [ ] Real-time carrier shipping rates
- [ ] Shipping label providers (EasyPost/Shippo)
- [ ] Social login: Apple, Facebook
- [ ] Advanced analytics
- [ ] Recurring events
- [ ] Back-in-stock notifications
- [ ] Price drop alerts

---

## Development Workflow

1. **Local Development**: `supabase start` (local Supabase via Docker) + `npm run dev`
2. **Push to GitHub**: Triggers Netlify deploy preview
3. **Merge to main**: Auto-deploys to production on Netlify
4. **Database changes**: Supabase CLI migrations pushed separately

### Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (SFW payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# PaymentCloud (NSFW payments)
PAYMENTCLOUD_API_KEY=
PAYMENTCLOUD_WEBHOOK_SECRET=

# PayPal (SFW only)
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=

# Resend (email)
RESEND_API_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

*Document maintained by the development team. Last updated: February 12, 2026.*
