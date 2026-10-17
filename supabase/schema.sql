-- Tiramisu database setup
-- Run this in Supabase SQL Editor after enabling Email auth.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text default '',
  avatar_url text,
  interests text[] not null default '{}',
  visibility text not null default 'Community' check (visibility in ('Community', 'Only people I message', 'Private')),
  location_sharing boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  voice_transcript text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists conversation_members_user_id_idx on public.conversation_members(user_id);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- Profiles: public discovery only exposes profiles that opted into Community visibility.
drop policy if exists "Community profiles are discoverable" on public.profiles;
create policy "Community profiles are discoverable"
on public.profiles for select
to authenticated
using (visibility = 'Community' or id = auth.uid());

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Conversations: a member can only see a conversation they belong to.
drop policy if exists "Members can view conversations" on public.conversations;
create policy "Members can view conversations"
on public.conversations for select
to authenticated
using (exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = auth.uid()));

drop policy if exists "Authenticated users can create conversations" on public.conversations;
create policy "Authenticated users can create conversations"
on public.conversations for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "Creators can delete conversations" on public.conversations;
create policy "Creators can delete conversations"
on public.conversations for delete
to authenticated
using (created_by = auth.uid());

-- Membership is private to members; creators may add members to conversations they created.
drop policy if exists "Members can view membership" on public.conversation_members;
create policy "Members can view membership"
on public.conversation_members for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can join a conversation" on public.conversation_members;
create policy "Users can join a conversation"
on public.conversation_members for insert
to authenticated
with check (user_id = auth.uid() or exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid()));

drop policy if exists "Users can leave their conversations" on public.conversation_members;
create policy "Users can leave their conversations"
on public.conversation_members for delete
to authenticated
using (user_id = auth.uid());

-- Messages are never public; both read and write require conversation membership.
drop policy if exists "Members can view messages" on public.messages;
create policy "Members can view messages"
on public.messages for select
to authenticated
using (exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid()));

drop policy if exists "Members can send messages" on public.messages;
create policy "Members can send messages"
on public.messages for insert
to authenticated
with check (sender_id = auth.uid() and exists (select 1 from public.conversation_members cm where cm.conversation_id = conversation_id and cm.user_id = auth.uid()));

drop policy if exists "Senders can delete their messages" on public.messages;
create policy "Senders can delete their messages"
on public.messages for delete
to authenticated
using (sender_id = auth.uid());

-- Realtime is optional and can be enabled for messages after confirming the schema.
-- alter publication supabase_realtime add table public.messages;
