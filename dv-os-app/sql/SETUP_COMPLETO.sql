-- DV / SPACE: crea le tabelle mancanti e completa quelle esistenti.
-- Non elimina righe. Le righe senza user_id restano invisibili finché il proprietario non viene assegnato esplicitamente.
-- Eseguire nel SQL Editor del progetto Supabase già usato dal sito.
begin;
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  all_day boolean default false,
  location text,
  category text default 'Personale',
  color text default '#8ce9ff',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.events add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.events add column if not exists title text;
alter table public.events add column if not exists description text;
alter table public.events add column if not exists start_at timestamptz;
alter table public.events add column if not exists end_at timestamptz;
alter table public.events add column if not exists all_day boolean default false;
alter table public.events add column if not exists location text;
alter table public.events add column if not exists category text default 'Personale';
alter table public.events add column if not exists color text default '#8ce9ff';
alter table public.events add column if not exists created_at timestamptz default now();
alter table public.events add column if not exists updated_at timestamptz default now();
create index if not exists events_dv_user_idx on public.events(user_id);
alter table public.events enable row level security;
grant select, insert, update, delete on public.events to authenticated;
revoke all on public.events from anon;
drop policy if exists dv_space_owner_access on public.events;
create policy dv_space_owner_access on public.events for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists dv_space_owner_guard on public.events;
create policy dv_space_owner_guard on public.events as restrictive for all to public using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.career_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_title text,
  organization text,
  period text,
  description text,
  sort_order integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.career_entries add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.career_entries add column if not exists role_title text;
alter table public.career_entries add column if not exists organization text;
alter table public.career_entries add column if not exists period text;
alter table public.career_entries add column if not exists description text;
alter table public.career_entries add column if not exists sort_order integer;
alter table public.career_entries add column if not exists created_at timestamptz default now();
alter table public.career_entries add column if not exists updated_at timestamptz default now();
create index if not exists career_entries_dv_user_idx on public.career_entries(user_id);
alter table public.career_entries enable row level security;
grant select, insert, update, delete on public.career_entries to authenticated;
revoke all on public.career_entries from anon;
drop policy if exists dv_space_owner_access on public.career_entries;
create policy dv_space_owner_access on public.career_entries for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists dv_space_owner_guard on public.career_entries;
create policy dv_space_owner_guard on public.career_entries as restrictive for all to public using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.contacts add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.contacts add column if not exists email text;
alter table public.contacts add column if not exists phone text;
alter table public.contacts add column if not exists created_at timestamptz default now();
alter table public.contacts add column if not exists updated_at timestamptz default now();
create index if not exists contacts_dv_user_idx on public.contacts(user_id);
alter table public.contacts enable row level security;
grant select, insert, update, delete on public.contacts to authenticated;
revoke all on public.contacts from anon;
drop policy if exists dv_space_owner_access on public.contacts;
create policy dv_space_owner_access on public.contacts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists dv_space_owner_guard on public.contacts;
create policy dv_space_owner_guard on public.contacts as restrictive for all to public using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  price numeric,
  currency text default 'EUR',
  image_url text,
  product_url text,
  site_name text,
  category text,
  notes text,
  in_cart boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.wishlist_items add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.wishlist_items add column if not exists title text;
alter table public.wishlist_items add column if not exists price numeric;
alter table public.wishlist_items add column if not exists currency text default 'EUR';
alter table public.wishlist_items add column if not exists image_url text;
alter table public.wishlist_items add column if not exists product_url text;
alter table public.wishlist_items add column if not exists site_name text;
alter table public.wishlist_items add column if not exists category text;
alter table public.wishlist_items add column if not exists notes text;
alter table public.wishlist_items add column if not exists in_cart boolean default false;
alter table public.wishlist_items add column if not exists created_at timestamptz default now();
alter table public.wishlist_items add column if not exists updated_at timestamptz default now();
create index if not exists wishlist_items_dv_user_idx on public.wishlist_items(user_id);
alter table public.wishlist_items enable row level security;
grant select, insert, update, delete on public.wishlist_items to authenticated;
revoke all on public.wishlist_items from anon;
drop policy if exists dv_space_owner_access on public.wishlist_items;
create policy dv_space_owner_access on public.wishlist_items for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists dv_space_owner_guard on public.wishlist_items;
create policy dv_space_owner_guard on public.wishlist_items as restrictive for all to public using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text,
  amount numeric,
  category text default 'Altro',
  expense_date date default current_date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.expenses add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.expenses add column if not exists description text;
alter table public.expenses add column if not exists amount numeric;
alter table public.expenses add column if not exists category text default 'Altro';
alter table public.expenses add column if not exists expense_date date default current_date;
alter table public.expenses add column if not exists notes text;
alter table public.expenses add column if not exists created_at timestamptz default now();
alter table public.expenses add column if not exists updated_at timestamptz default now();
create index if not exists expenses_dv_user_idx on public.expenses(user_id);
alter table public.expenses enable row level security;
grant select, insert, update, delete on public.expenses to authenticated;
revoke all on public.expenses from anon;
drop policy if exists dv_space_owner_access on public.expenses;
create policy dv_space_owner_access on public.expenses for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists dv_space_owner_guard on public.expenses;
create policy dv_space_owner_guard on public.expenses as restrictive for all to public using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
commit;
