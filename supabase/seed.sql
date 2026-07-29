-- Real Local — seed data (mirrors the old src/data/mockData.ts)
-- Run this AFTER schema.sql, once, in the Supabase SQL Editor.
-- Uses fixed UUIDs + ON CONFLICT DO NOTHING so it's safe to re-run.

-- Seed curators (no real auth accounts — per PRD, curator approval is a
-- manual step the client does later for real curators; these three are
-- demo/mock curators only, matching the original mock data).
insert into public.profiles (id, email, name, role) values
  ('00000000-0000-0000-0000-000000000001', 'isop@reallocal.dev', 'Isop', 'curator'),
  ('00000000-0000-0000-0000-000000000002', 'junho@reallocal.dev', 'Junho', 'curator'),
  ('00000000-0000-0000-0000-000000000003', 'minji@reallocal.dev', 'Minji', 'curator'),
  ('00000000-0000-0000-0000-000000000011', 'traveler_kim@reallocal.dev', '@traveler_kim', 'user'),
  ('00000000-0000-0000-0000-000000000012', 'noodle_hunter@reallocal.dev', '@noodle_hunter', 'user')
on conflict (id) do nothing;

insert into public.maps (id, curator_id, title, description, region, center_lat, center_lng, created_at) values
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001',
   'Euljiro Local Map', 'Hidden bars & grills real locals actually go to in Euljiro.', 'Euljiro',
   37.5663, 126.9915, '2026-07-10'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001',
   'Ramen Concept Map', 'Best ramen spots across Seoul, ranked by locals.', 'Myeongdong',
   37.5551, 126.9707, '2026-07-14'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000002',
   'Mapo Late Night Eats', 'Where to eat after midnight in Mapo-gu.', 'Mapo-gu',
   37.5546, 126.9086, '2026-07-19'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000003',
   'Gangnam Brunch Spots', 'Slow mornings and good coffee, picked by a Gangnam local.', 'Gangnam',
   37.4979, 127.0276, '2026-07-23')
on conflict (id) do nothing;

insert into public.places (id, map_id, name, category, price_tier, lat, lng) values
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'Jinhwa Grill', 'Korean BBQ', '$$', 37.5665, 126.9918),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'Euljiro Noraebang Bar', 'Bar', '$', 37.566, 126.9908),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001', 'Sunhwa Ramen', 'Noodles', '$', 37.5668, 126.9925),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000002', 'Golden Broth Ramen', 'Noodles', '$$', 37.5553, 126.971),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000002', 'Myeongdong Tonkotsu', 'Noodles', '$', 37.5548, 126.9702),
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002', 'Local''s Shoyu House', 'Noodles', '$$', 37.5557, 126.9715),
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000003', 'Mapo Galbi Alley', 'Korean BBQ', '$$', 37.5548, 126.909),
  ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000003', '24h Sundae Guk', 'Soup', '$', 37.5543, 126.9082),
  ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000003', 'Riverside Pocha', 'Bar', '$', 37.555, 126.9095),
  ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000004', 'Slow Sunday Cafe', 'Cafe', '$$', 37.4982, 127.0279),
  ('00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000004', 'Garosu Brunch Table', 'Brunch', '$$$', 37.4975, 127.027)
on conflict (id) do nothing;

insert into public.map_reviews (id, map_id, user_id, content, created_at) values
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000011',
   'Exactly the local spots I wanted — no tourist traps!', '2026-07-20'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000012',
   'Golden Broth Ramen alone was worth the trip. Trustworthy list.', '2026-07-22')
on conflict (id) do nothing;
