-- ===================================================================
-- WISHLIST_ITEMS — da eseguire una sola volta nel SQL Editor di Supabase
-- (Project → SQL Editor → New query → incolla tutto → RUN)
-- ===================================================================

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  price numeric,
  currency text default 'EUR',
  image_url text,
  product_url text,
  site_name text,
  category text,
  notes text,
  in_cart boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wishlist_items_user_id_idx on public.wishlist_items(user_id);

-- Row Level Security: ogni utente vede/modifica solo le proprie righe,
-- esattamente come per "events", "career_entries" e "contacts".
alter table public.wishlist_items enable row level security;

drop policy if exists "wishlist_select_own" on public.wishlist_items;
create policy "wishlist_select_own" on public.wishlist_items
  for select using (auth.uid() = user_id);

drop policy if exists "wishlist_insert_own" on public.wishlist_items;
create policy "wishlist_insert_own" on public.wishlist_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "wishlist_update_own" on public.wishlist_items;
create policy "wishlist_update_own" on public.wishlist_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "wishlist_delete_own" on public.wishlist_items;
create policy "wishlist_delete_own" on public.wishlist_items
  for delete using (auth.uid() = user_id);
