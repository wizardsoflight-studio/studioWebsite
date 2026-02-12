-- ==============================================
-- Wizard Of Light — Initial Database Schema
-- ==============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---- Profiles ----
-- Extends Supabase auth.users with app-specific data
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'customer'
    check (role in ('customer', 'fulfillment', 'content_editor', 'manager', 'owner')),
  nsfw_enabled boolean not null default false,
  newsletter_subscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---- Categories ----
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_nsfw boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---- Products ----
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  short_description text,
  is_nsfw boolean not null default false,
  is_custom_order boolean not null default false,
  is_published boolean not null default false,
  low_stock_threshold int not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- Product Categories (many-to-many) ----
create table public.product_categories (
  product_id uuid references public.products on delete cascade,
  category_id uuid references public.categories on delete cascade,
  primary key (product_id, category_id)
);

-- ---- Product Variants ----
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products on delete cascade not null,
  sku text not null unique,
  name text not null,
  price int not null, -- in cents
  compare_at_price int, -- original price if on sale
  stock_count int not null default 0,
  weight_grams int,
  sort_order int not null default 0,
  options jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---- Product Images ----
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products on delete cascade not null,
  url text not null,
  alt text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---- Shipping Addresses ----
create table public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'US',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---- Orders ----
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete set null,
  status text not null default 'pending'
    check (status in (
      'pending', 'paid', 'processing', 'shipped', 'delivered',
      'refund_requested', 'return_requested', 'return_received',
      'refunded', 'cancelled'
    )),
  subtotal int not null default 0,
  shipping_cost int not null default 0,
  tax int not null default 0,
  total int not null default 0,
  payment_processor text check (payment_processor in ('stripe', 'paymentcloud')),
  payment_intent_id text,
  shipping_address jsonb,
  tracking_number text,
  tracking_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- Order Items ----
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products on delete set null,
  variant_id uuid references public.product_variants on delete set null,
  quantity int not null default 1,
  unit_price int not null,
  total_price int not null,
  product_name text not null,
  variant_name text not null,
  product_image text,
  created_at timestamptz not null default now()
);

-- ---- Cart Items ----
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  variant_id uuid references public.product_variants on delete cascade not null,
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, variant_id)
);

-- ---- Wishlists ----
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  notify_restock boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---- Reviews ----
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  body text,
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

-- ---- Events ----
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  start_date timestamptz not null,
  end_date timestamptz not null,
  venue_name text,
  address text,
  lat double precision,
  lng double precision,
  image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- Journal Posts ----
create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  excerpt text,
  featured_image text,
  category text,
  author_id uuid references public.profiles on delete set null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- Journal Tags ----
create table public.journal_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---- Journal Post Tags (many-to-many) ----
create table public.journal_post_tags (
  post_id uuid references public.journal_posts on delete cascade,
  tag_id uuid references public.journal_tags on delete cascade,
  primary key (post_id, tag_id)
);

-- ---- Comments ----
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.journal_posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---- Shipping Zones ----
create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  countries text[] not null default '{}',
  flat_rate int, -- in cents
  weight_rate int, -- per gram in cents
  free_shipping_threshold int, -- in cents
  created_at timestamptz not null default now()
);

-- ---- Staff Permissions ----
create table public.staff_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null unique,
  permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- Activity Log ----
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ---- Newsletter Subscribers ----
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid references public.profiles on delete set null,
  is_active boolean not null default true,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- ---- Notifications ----
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  data jsonb,
  created_at timestamptz not null default now()
);

-- ==============================================
-- Row Level Security (RLS) Policies
-- ==============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.shipping_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;
alter table public.events enable row level security;
alter table public.journal_posts enable row level security;
alter table public.journal_tags enable row level security;
alter table public.journal_post_tags enable row level security;
alter table public.comments enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.staff_permissions enable row level security;
alter table public.activity_log enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.notifications enable row level security;

-- Helper: Check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('owner', 'manager', 'content_editor', 'fulfillment')
  );
end;
$$ language plpgsql security definer;

-- Helper: Check if user is owner/manager
create or replace function public.is_manager()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('owner', 'manager')
  );
end;
$$ language plpgsql security definer;

-- ---- Profiles Policies ----
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ---- Products Policies ----
create policy "Anyone can view published SFW products"
  on public.products for select
  using (is_published = true and is_nsfw = false);

create policy "Verified users can view published NSFW products"
  on public.products for select
  using (
    is_published = true
    and is_nsfw = true
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and nsfw_enabled = true
    )
  );

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- ---- Categories Policies ----
create policy "Anyone can view categories"
  on public.categories for select
  using (true);

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_manager());

-- ---- Product Variants Policies ----
create policy "Anyone can view variants of visible products"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products
      where products.id = product_variants.product_id
      and is_published = true
    )
  );

create policy "Admins can manage variants"
  on public.product_variants for all
  using (public.is_admin());

-- ---- Product Images Policies ----
create policy "Anyone can view images of visible products"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id
      and is_published = true
    )
  );

create policy "Admins can manage images"
  on public.product_images for all
  using (public.is_admin());

-- ---- Orders Policies ----
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage orders"
  on public.orders for all
  using (public.is_admin());

-- ---- Order Items Policies ----
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins can manage order items"
  on public.order_items for all
  using (public.is_admin());

-- ---- Cart Items Policies ----
create policy "Users can manage own cart"
  on public.cart_items for all
  using (auth.uid() = user_id);

-- ---- Wishlists Policies ----
create policy "Users can manage own wishlist"
  on public.wishlists for all
  using (auth.uid() = user_id);

-- ---- Reviews Policies ----
create policy "Anyone can view approved reviews"
  on public.reviews for select
  using (is_approved = true);

create policy "Users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Admins can manage reviews"
  on public.reviews for all
  using (public.is_admin());

-- ---- Shipping Addresses Policies ----
create policy "Users can manage own addresses"
  on public.shipping_addresses for all
  using (auth.uid() = user_id);

-- ---- Events Policies ----
create policy "Anyone can view published events"
  on public.events for select
  using (is_published = true);

create policy "Admins can manage events"
  on public.events for all
  using (public.is_admin());

-- ---- Journal Policies ----
create policy "Anyone can view published posts"
  on public.journal_posts for select
  using (is_published = true);

create policy "Admins can manage posts"
  on public.journal_posts for all
  using (public.is_admin());

-- ---- Journal Tags Policies ----
create policy "Anyone can view tags"
  on public.journal_tags for select
  using (true);

create policy "Admins can manage tags"
  on public.journal_tags for all
  using (public.is_admin());

-- ---- Journal Post Tags Policies ----
create policy "Anyone can view post tags"
  on public.journal_post_tags for select
  using (true);

create policy "Admins can manage post tags"
  on public.journal_post_tags for all
  using (public.is_admin());

-- ---- Comments Policies ----
create policy "Anyone can view approved comments"
  on public.comments for select
  using (is_approved = true);

create policy "Users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage comments"
  on public.comments for all
  using (public.is_admin());

-- ---- Shipping Zones Policies ----
create policy "Anyone can view shipping zones"
  on public.shipping_zones for select
  using (true);

create policy "Admins can manage shipping zones"
  on public.shipping_zones for all
  using (public.is_manager());

-- ---- Staff Permissions Policies ----
create policy "Owners can manage staff permissions"
  on public.staff_permissions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- ---- Activity Log Policies ----
create policy "Managers can view activity log"
  on public.activity_log for select
  using (public.is_manager());

create policy "Admins can insert activity log"
  on public.activity_log for insert
  with check (public.is_admin());

-- ---- Notifications Policies ----
create policy "Users can manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

-- ---- Newsletter Policies ----
create policy "Admins can manage subscribers"
  on public.newsletter_subscribers for all
  using (public.is_admin());

create policy "Users can manage own subscription"
  on public.newsletter_subscribers for all
  using (auth.uid() = user_id);

-- ==============================================
-- Indexes for Performance
-- ==============================================

create index idx_products_slug on public.products (slug);
create index idx_products_nsfw on public.products (is_nsfw);
create index idx_products_published on public.products (is_published);
create index idx_product_variants_product on public.product_variants (product_id);
create index idx_product_images_product on public.product_images (product_id);
create index idx_orders_user on public.orders (user_id);
create index idx_orders_status on public.orders (status);
create index idx_order_items_order on public.order_items (order_id);
create index idx_cart_items_user on public.cart_items (user_id);
create index idx_wishlists_user on public.wishlists (user_id);
create index idx_reviews_product on public.reviews (product_id);
create index idx_events_start on public.events (start_date);
create index idx_journal_posts_slug on public.journal_posts (slug);
create index idx_journal_posts_published on public.journal_posts (is_published);
create index idx_activity_log_user on public.activity_log (user_id);
create index idx_activity_log_created on public.activity_log (created_at desc);
create index idx_notifications_user on public.notifications (user_id);
