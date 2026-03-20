-- ==============================================
-- Wizard Of Light — Fix Policies, Storage & Categories
-- ==============================================
-- Fixes:
--   1. product_categories was missing RLS policies (broken category filters)
--   2. Adds is_visible column to categories (hide cosplay from SFW shop)
--   3. Adds short_description to products if missing
--   4. Ensures storage buckets exist with correct config
--   5. Drops & recreates storage policies (idempotent)
--   6. Adds additional admin helper functions
-- ==============================================

-- ============================================
-- 1. product_categories — Add missing policies
-- ============================================

-- Allow anyone to see what categories products belong to
create policy "Anyone can view product category assignments"
  on public.product_categories for select
  using (true);

-- Allow admins to manage product category assignments
create policy "Admins can manage product category assignments"
  on public.product_categories for all
  using (public.is_admin());

-- ============================================
-- 2. Categories — Add is_visible column
-- ============================================

alter table public.categories
  add column if not exists is_visible boolean not null default true;

-- Hide cosplay from the SFW shop filter (can be re-enabled via admin)
update public.categories
  set is_visible = false
  where slug = 'cosplay';

-- ============================================
-- 3. Products — Ensure short_description exists
-- ============================================
-- (Already in initial schema, this is defensive)
alter table public.products
  add column if not exists short_description text;

-- ============================================
-- 4. Storage — Ensure buckets exist
-- ============================================

-- Product images bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  52428800,  -- 50 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 52428800,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- User avatars bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ============================================
-- 5. Storage RLS — Drop old & recreate
-- ============================================

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Admins Upload" on storage.objects;
drop policy if exists "Admins Update" on storage.objects;
drop policy if exists "Admins Delete" on storage.objects;

-- Public read access for product and avatar buckets
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id in ('products', 'avatars'));

-- Admins can upload product images
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'products'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('owner', 'manager', 'content_editor')
    )
  );

-- Admins can update product images
create policy "Admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'products'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('owner', 'manager', 'content_editor')
    )
  );

-- Admins can delete product images
create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'products'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('owner', 'manager', 'content_editor')
    )
  );

-- Users can manage their own avatars
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 6. Add is_content_editor helper function
-- ============================================

create or replace function public.is_content_editor()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('owner', 'manager', 'content_editor')
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- 7. Add indexes for new columns
-- ============================================

create index if not exists idx_categories_visible on public.categories (is_visible);
create index if not exists idx_products_nsfw_published on public.products (is_nsfw, is_published);
