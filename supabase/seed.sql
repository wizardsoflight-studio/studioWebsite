-- ==============================================
-- Wizard Of Light — Seed Data
-- ==============================================

-- ---- Categories ----
insert into public.categories (id, name, slug, description, is_nsfw, sort_order) values
  ('a1000000-0000-0000-0000-000000000001', 'Leather Goods', 'leather-goods', 'Premium handcrafted leather goods for everyday carry', false, 1),
  ('a1000000-0000-0000-0000-000000000002', 'Cosplay', 'cosplay', 'Armor, gauntlets, and props for cosplay enthusiasts', false, 2),
  ('a1000000-0000-0000-0000-000000000003', 'BDSM', 'bdsm', 'Handcrafted BDSM leather goods (18+ only)', true, 3);

-- ---- Products ----
-- SFW Products
insert into public.products (id, name, slug, description, short_description, is_nsfw, is_published) values
  ('b1000000-0000-0000-0000-000000000001', 'Classic Leather Belt', 'classic-leather-belt',
   'A timeless belt handcrafted from premium full-grain leather. Hand-stitched with waxed linen thread for durability that lasts generations. Available in multiple widths and finishes.',
   'Premium full-grain leather belt, hand-stitched',
   false, true),
  ('b1000000-0000-0000-0000-000000000002', 'Viking Shield Arm Bracer', 'viking-shield-arm-bracer',
   'Inspired by Norse warrior tradition, this arm bracer features embossed knotwork patterns and heavy-duty riveted construction. Perfect for LARP, cosplay, or Renaissance faires.',
   'Embossed Norse-style leather arm bracer',
   false, true),
  ('b1000000-0000-0000-0000-000000000003', 'Leather Card Wallet', 'leather-card-wallet',
   'A slim, minimalist card wallet that fits in your front pocket. Crafted from vegetable-tanned leather that develops a beautiful patina over time. Holds 6 cards + cash.',
   'Slim minimalist card wallet, veg-tanned leather',
   false, true),
  ('b1000000-0000-0000-0000-000000000004', 'Dragon Scale Pauldron', 'dragon-scale-pauldron',
   'A stunning shoulder armor piece featuring hand-tooled dragon scale patterns. Built on heavy-gauge leather with adjustable straps. A showstopper at any convention.',
   'Hand-tooled dragon scale shoulder armor',
   false, true);

-- NSFW Product
insert into public.products (id, name, slug, description, short_description, is_nsfw, is_published) values
  ('b1000000-0000-0000-0000-000000000005', 'Leather Wrist Cuffs', 'leather-wrist-cuffs',
   'Premium leather wrist cuffs with D-ring hardware. Handcrafted with reinforced stitching and adjustable buckle closure. Padded interior for comfort during extended wear.',
   'Handcrafted leather cuffs with D-ring hardware',
   true, true);

-- Custom Order Product
insert into public.products (id, name, slug, description, short_description, is_nsfw, is_custom_order, is_published) values
  ('b1000000-0000-0000-0000-000000000006', 'Custom Leather Commission', 'custom-leather-commission',
   'Have something unique in mind? Work directly with Bryan to design and create your one-of-a-kind leather piece. From cosplay armor to personalized gifts, the possibilities are endless.',
   'Work with Bryan on your dream leather project',
   false, true, true);

-- ---- Product Categories ----
insert into public.product_categories (product_id, category_id) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001');

-- ---- Product Variants ----
-- Classic Belt variants
insert into public.product_variants (product_id, sku, name, price, stock_count, weight_grams, sort_order, options) values
  ('b1000000-0000-0000-0000-000000000001', 'BELT-BLK-S', 'Small / Black', 8500, 15, 200, 1, '{"size": "S", "color": "Black"}'),
  ('b1000000-0000-0000-0000-000000000001', 'BELT-BLK-M', 'Medium / Black', 8500, 12, 220, 2, '{"size": "M", "color": "Black"}'),
  ('b1000000-0000-0000-0000-000000000001', 'BELT-BLK-L', 'Large / Black', 8500, 8, 240, 3, '{"size": "L", "color": "Black"}'),
  ('b1000000-0000-0000-0000-000000000001', 'BELT-BRN-S', 'Small / Brown', 8500, 5, 200, 4, '{"size": "S", "color": "Brown"}'),
  ('b1000000-0000-0000-0000-000000000001', 'BELT-BRN-M', 'Medium / Brown', 8500, 3, 220, 5, '{"size": "M", "color": "Brown"}'),
  ('b1000000-0000-0000-0000-000000000001', 'BELT-BRN-L', 'Large / Brown', 8500, 0, 240, 6, '{"size": "L", "color": "Brown"}');

-- Viking Bracer variants
insert into public.product_variants (product_id, sku, name, price, stock_count, weight_grams, sort_order, options) values
  ('b1000000-0000-0000-0000-000000000002', 'VIK-BRC-S', 'Small', 12000, 6, 350, 1, '{"size": "S"}'),
  ('b1000000-0000-0000-0000-000000000002', 'VIK-BRC-M', 'Medium', 12000, 4, 380, 2, '{"size": "M"}'),
  ('b1000000-0000-0000-0000-000000000002', 'VIK-BRC-L', 'Large', 12000, 2, 410, 3, '{"size": "L"}');

-- Card Wallet (single variant)
insert into public.product_variants (product_id, sku, name, price, stock_count, weight_grams, sort_order, options) values
  ('b1000000-0000-0000-0000-000000000003', 'WALLET-NAT', 'Natural', 4500, 20, 60, 1, '{"color": "Natural"}'),
  ('b1000000-0000-0000-0000-000000000003', 'WALLET-BLK', 'Black', 4500, 18, 60, 2, '{"color": "Black"}');

-- Dragon Scale Pauldron
insert into public.product_variants (product_id, sku, name, price, stock_count, weight_grams, sort_order, options) values
  ('b1000000-0000-0000-0000-000000000004', 'DRAG-PAU-M', 'Medium', 25000, 3, 500, 1, '{"size": "M"}'),
  ('b1000000-0000-0000-0000-000000000004', 'DRAG-PAU-L', 'Large', 27500, 2, 550, 2, '{"size": "L"}');

-- NSFW: Wrist Cuffs
insert into public.product_variants (product_id, sku, name, price, stock_count, weight_grams, sort_order, options) values
  ('b1000000-0000-0000-0000-000000000005', 'CUFF-BLK-S', 'Small / Black', 6500, 8, 150, 1, '{"size": "S", "color": "Black"}'),
  ('b1000000-0000-0000-0000-000000000005', 'CUFF-BLK-M', 'Medium / Black', 6500, 5, 170, 2, '{"size": "M", "color": "Black"}');

-- Custom Commission (placeholder)
insert into public.product_variants (product_id, sku, name, price, stock_count, weight_grams, sort_order, options) values
  ('b1000000-0000-0000-0000-000000000006', 'CUSTOM-001', 'Starting at', 15000, 999, 0, 1, '{}');

-- ---- Shipping Zones ----
insert into public.shipping_zones (name, countries, flat_rate, weight_rate, free_shipping_threshold) values
  ('Domestic (Continental US)', '{"US"}', 799, null, 10000),
  ('Alaska & Hawaii', '{"US-AK", "US-HI"}', 1499, null, 15000),
  ('Canada', '{"CA"}', 1999, null, null),
  ('International', '{}', 2999, null, null);

-- ---- Events ----
insert into public.events (title, description, start_date, end_date, venue_name, address, is_published) values
  ('Nebraska Renaissance Festival', 'Come visit us at the Nebraska Renaissance Festival! We''ll have our full line of leather goods, cosplay armor, and custom order consultations available.', '2026-05-16 10:00:00-05', '2026-05-17 18:00:00-05', 'Nebraska Renaissance Festival', '14209 S 252nd St, Gretna, NE 68028', true),
  ('Midwest FurFest 2026', 'Find us in the Dealers Den with our latest leather creations. Custom orders welcome — bring your ideas!', '2026-12-04 09:00:00-06', '2026-12-06 17:00:00-06', 'Hyatt Regency O''Hare', '9300 Bryn Mawr Ave, Rosemont, IL 60018', true);
