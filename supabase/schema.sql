-- Run this in your Supabase project's SQL Editor (Dashboard → SQL → New query).
-- It creates a `profiles` table linked to auth.users, enables Row Level
-- Security, and auto-creates a profile row whenever a user signs up.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can only read their OWN profile row.
create policy "Users can read their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Users can only update their OWN profile row.
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Users can only insert their OWN profile row.
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Auto-create a profile row on every new signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
