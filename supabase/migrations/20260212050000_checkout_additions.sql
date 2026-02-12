-- ==============================================
-- Add order_number, decrement_stock RPC, and guest checkout policy
-- ==============================================

-- ---- Order Number Sequence ----
create sequence if not exists order_number_seq start 1001;

alter table public.orders
  add column if not exists order_number text unique;

-- Auto-assign order number on insert
create or replace function public.set_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := 'WOL-' || nextval('order_number_seq')::text;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_set_order_number
  before insert on public.orders
  for each row execute function public.set_order_number();

-- ---- Decrement Stock RPC ----
-- Used by webhook to atomically decrease variant stock after payment
create or replace function public.decrement_stock(
  p_variant_id uuid,
  p_quantity int
)
returns void as $$
begin
  update public.product_variants
  set stock_count = greatest(stock_count - p_quantity, 0)
  where id = p_variant_id;
end;
$$ language plpgsql security definer;

-- ---- Product Categories: Anyone can view ----
create policy "Anyone can view product categories"
  on public.product_categories for select
  using (true);

-- ---- Guest Checkout: Allow anonymous order creation ----
-- The service role key bypasses RLS, so webhook updates work.
-- For guest checkout via the API route, we need anon insert:
create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);

-- Allow order items to be inserted alongside orders
create policy "Anyone can create order items"
  on public.order_items for insert
  with check (true);
