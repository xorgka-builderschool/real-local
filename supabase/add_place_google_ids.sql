-- Stores each place's resolved Google Place ID (from the same Nearby Search
-- results used for add_place_photos.sql) so the app can fetch live details
-- (hours, rating, address) from the Places API on demand.
-- Run once in the Supabase SQL Editor, after add_place_photos.sql.

alter table public.places add column if not exists google_place_id text;

update public.places set google_place_id = 'ChIJNyduCUCjfDURI3HOclQsBho' where id = '00000000-0000-0000-0002-000000000001';
update public.places set google_place_id = 'ChIJJdedccWjfDURwtDdWNcpL50' where id = '00000000-0000-0000-0002-000000000002';
update public.places set google_place_id = 'ChIJq8Pta5KjfDUR885FLv7BOBo' where id = '00000000-0000-0000-0002-000000000003';
update public.places set google_place_id = 'ChIJXwWcmmOifDURiFLaPgCbx-k' where id = '00000000-0000-0000-0002-000000000004';
update public.places set google_place_id = 'ChIJXwWcmmOifDURiFLaPgCbx-k' where id = '00000000-0000-0000-0002-000000000005';
update public.places set google_place_id = 'ChIJXwWcmmOifDURiFLaPgCbx-k' where id = '00000000-0000-0000-0002-000000000006';
update public.places set google_place_id = 'ChIJz4rT1i-ZfDURvpVlfHgPmo0' where id = '00000000-0000-0000-0002-000000000007';
update public.places set google_place_id = 'ChIJz4rT1i-ZfDURvpVlfHgPmo0' where id = '00000000-0000-0000-0002-000000000008';
update public.places set google_place_id = 'ChIJZXAr_iaZfDURBOARwSzKovo' where id = '00000000-0000-0000-0002-000000000009';
update public.places set google_place_id = 'ChIJobb671mhfDURrcE4SebLfyw' where id = '00000000-0000-0000-0002-000000000010';
update public.places set google_place_id = 'ChIJnYU40VuhfDURxScgwHj1tbs' where id = '00000000-0000-0000-0002-000000000011';
