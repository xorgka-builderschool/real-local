-- Real Local — schema for Supabase (Postgres)
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

-- ── profiles ──────────────────────────────────────────────────────────────
-- One row per app user. Not FK'd to auth.users so the seed curators (who
-- don't have real auth accounts) can exist; real signups get a row inserted
-- automatically by the trigger below, with id = auth.uid().
create table if not exists public.profiles (
  id uuid primary key,
  email text not null,
  name text not null,
  role text not null default 'user' check (role in ('user', 'curator')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- Curator role is never set here — per PRD, curator approval is a manual,
-- out-of-system step (client flips role = 'curator' by hand in the table).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── maps ──────────────────────────────────────────────────────────────────
create table if not exists public.maps (
  id uuid primary key default gen_random_uuid(),
  curator_id uuid not null references public.profiles(id),
  title text not null,
  description text not null default '',
  region text not null default '',
  center_lat double precision not null,
  center_lng double precision not null,
  created_at timestamptz not null default now()
);

alter table public.maps enable row level security;

create policy "Maps are viewable by everyone"
  on public.maps for select using (true);

create policy "Curators can create their own maps"
  on public.maps for insert
  with check (
    auth.uid() = curator_id
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'curator')
  );

create policy "Curators can update their own maps"
  on public.maps for update using (auth.uid() = curator_id);

create policy "Curators can delete their own maps"
  on public.maps for delete using (auth.uid() = curator_id);

-- ── places ────────────────────────────────────────────────────────────────
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references public.maps(id) on delete cascade,
  name text not null,
  category text not null default '',
  price_tier text not null default '$',
  lat double precision not null,
  lng double precision not null
);

alter table public.places enable row level security;

create policy "Places are viewable by everyone"
  on public.places for select using (true);

create policy "Curators can manage places on their own maps"
  on public.places for all
  using (exists (select 1 from public.maps where maps.id = places.map_id and maps.curator_id = auth.uid()))
  with check (exists (select 1 from public.maps where maps.id = places.map_id and maps.curator_id = auth.uid()));

-- ── saved_maps ────────────────────────────────────────────────────────────
create table if not exists public.saved_maps (
  user_id uuid not null references public.profiles(id) on delete cascade,
  map_id uuid not null references public.maps(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, map_id)
);

alter table public.saved_maps enable row level security;

create policy "Users manage their own saved maps"
  on public.saved_maps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── saved_places ──────────────────────────────────────────────────────────
create table if not exists public.saved_places (
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

alter table public.saved_places enable row level security;

create policy "Users manage their own saved places"
  on public.saved_places for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── map_reviews ───────────────────────────────────────────────────────────
create table if not exists public.map_reviews (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references public.maps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.map_reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.map_reviews for select using (true);

create policy "Authenticated users can post their own reviews"
  on public.map_reviews for insert with check (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.map_reviews for delete using (auth.uid() = user_id);

-- ── save counts ───────────────────────────────────────────────────────────
-- Computed on the fly instead of a stored counter column, so it can never
-- drift out of sync with the actual saved_maps rows.
create or replace view public.map_save_counts as
  select map_id, count(*)::int as save_count
  from public.saved_maps
  group by map_id;

grant select on public.map_save_counts to anon, authenticated;
