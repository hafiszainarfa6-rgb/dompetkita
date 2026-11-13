-- DOMPETKITA: Run this WHOLE script once in Supabase Dashboard > SQL Editor.
-- Each authenticated user can access ONLY their own records (RLS).
-- Demo mode does not use this database.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  family_name text not null default '',
  monthly_budget numeric(12,2) not null default 0 check (monthly_budget >= 0),
  savings_target_pct numeric(5,2) not null default 15 check (savings_target_pct between 0 and 100),
  locale text not null default 'ms' check (locale in ('ms','en')),
  avatar_path text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense','savings')),
  category text not null,
  amount numeric(12,2) not null check (amount > 0 and amount <= 999999999),
  occurred_on date not null,
  note text not null default '' check (char_length(note) <= 200),
  member text not null default '' check (char_length(member) <= 80),
  created_at timestamptz not null default now(),
  constraint valid_category_for_type check (
    (type='income' and category in ('salary','allowance','wages','loan_ptptn','loan_other')) or
    (type='expense' and category in ('groceries','snacks','toiletries','laundry','clothing','gadgets','fuel','motor','bill_astro','bill_water','bill_electricity')) or
    (type='savings' and category in ('saving_daily','saving_weekly','saving_monthly','saving_other'))
  )
);

create index if not exists tx_user_date_idx on public.transactions(user_id,occurred_on desc);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  target_amount numeric(12,2) not null check (target_amount > 0),
  saved_amount numeric(12,2) not null default 0 check (saved_amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists goals_user_idx on public.savings_goals(user_id);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.savings_goals enable row level security;

-- Users can SELECT, INSERT, UPDATE and DELETE only their own data.
drop policy if exists "Own profile only" on public.profiles;
create policy "Own profile only" on public.profiles for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Own transactions only" on public.transactions;
create policy "Own transactions only" on public.transactions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Own goals only" on public.savings_goals;
create policy "Own goals only" on public.savings_goals for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Create the profile automatically when an auth account is registered.
create or replace function public.create_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id,full_name)
  values (new.id,coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists after_auth_user_created on auth.users;
create trigger after_auth_user_created
  after insert on auth.users for each row execute function public.create_user_profile();

-- For accounts registered before this SQL was executed (if any).
insert into public.profiles(user_id,full_name)
select id,coalesce(raw_user_meta_data->>'full_name','') from auth.users
on conflict (user_id) do nothing;

-- PRIVATE user profile pictures: signed URLs, not publicly accessible.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',false,2097152,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=false,file_size_limit=2097152,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Read own avatars" on storage.objects;
create policy "Read own avatars" on storage.objects for select to authenticated
  using (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "Upload own avatars" on storage.objects;
create policy "Upload own avatars" on storage.objects for insert to authenticated
  with check (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "Update own avatars" on storage.objects;
create policy "Update own avatars" on storage.objects for update to authenticated
  using (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text)
  with check (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "Delete own avatars" on storage.objects;
create policy "Delete own avatars" on storage.objects for delete to authenticated
  using (bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
