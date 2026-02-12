-- Enable Storage Extension (if not already)
-- storage schema is usually available by default in full Supabase instances

-- 1. Create 'products' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. RLS Policies for Storage

-- Allow public access to view product images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'products' );

-- Allow admins to upload images
create policy "Admins Upload"
on storage.objects for insert
with check (
  bucket_id = 'products'
  and (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('owner', 'manager', 'content_editor')
    )
  )
);

-- Allow admins to update images
create policy "Admins Update"
on storage.objects for update
using (
  bucket_id = 'products'
  and (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('owner', 'manager', 'content_editor')
    )
  )
);

-- Allow admins to delete images
create policy "Admins Delete"
on storage.objects for delete
using (
  bucket_id = 'products'
  and (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('owner', 'manager', 'content_editor')
    )
  )
);
