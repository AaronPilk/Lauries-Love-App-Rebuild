-- Laurie's Love — Backend V2 initial schema
-- Replaces: Cognito (auth), MySQL API (data), Sendbird (chat + feed)

create extension if not exists pgcrypto;

-- ============================================================
-- Lookup taxonomy (diagnosis types/subtypes, roles, etc.)
-- ============================================================
create table public.value_definitions (
  id uuid primary key default gen_random_uuid(),
  definition_type text not null,           -- DIAGNOSIS_TYPE | DIAGNOSIS_SUB_TYPE | USER_ROLE | USER_DESIGNATION | USER_NOTIFICATIONS
  value text not null,
  description text not null,
  active boolean not null default true,
  sort integer not null default 0,
  legacy_id text,                          -- old MySQL id for migration mapping
  created_at timestamptz not null default now()
);
create index idx_valuedefs_type on public.value_definitions (definition_type) where active;

-- ============================================================
-- Profiles (1:1 with auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  display_name text,
  role_id uuid references public.value_definitions(id),
  diagnosis_type_ids uuid[] not null default '{}',
  diagnosis_subtype_ids uuid[] not null default '{}',
  diagnosis_year text,
  age_range text,
  gender text,
  description text,
  phone_number text,
  phone_number_location text,
  city text,
  state text,
  country text,
  zip_code text,
  latitude double precision,
  longitude double precision,
  avatar_path text,                        -- storage path
  push_token text,
  push_active boolean not null default false,
  device_type text,
  active boolean not null default true,
  legacy_id text,                          -- old MySQL user.id
  legacy_cognito_id text,                  -- old Cognito sub
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_geo on public.profiles (latitude, longitude) where active and latitude is not null;
create index idx_profiles_email on public.profiles (email);
create index idx_profiles_legacy_cognito on public.profiles (legacy_cognito_id);
create index idx_profiles_diag_types on public.profiles using gin (diagnosis_type_ids);

-- ============================================================
-- Friendships
-- ============================================================
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);
create index idx_friendships_addressee on public.friendships (addressee_id, status);
create index idx_friendships_requester on public.friendships (requester_id, status);

-- ============================================================
-- Groups (community groups; replaces Sendbird recommendation channels)
-- ============================================================
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_path text,
  tags text[] not null default '{}',       -- taxonomy: diagnosis/role names for recommendations
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index idx_groups_tags on public.groups using gin (tags);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('member','admin')),
  joined_at timestamptz not null default now(),
  primary key (group_id, profile_id)
);
create index idx_group_members_profile on public.group_members (profile_id);

-- ============================================================
-- Feed: posts / comments / reactions (replaces Sendbird channels-as-posts)
-- ============================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  image_path text,
  visibility text not null default 'all' check (visibility in ('all','group')),
  group_id uuid references public.groups(id) on delete set null,
  legacy_channel_url text,                 -- Sendbird channel url for migration
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_posts_created on public.posts (created_at desc);
create index idx_posts_group on public.posts (group_id, created_at desc);
create index idx_posts_author on public.posts (author_id, created_at desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index idx_comments_post on public.comments (post_id, created_at);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('post','comment','message')),
  entity_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'like',
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, user_id, kind)
);
create index idx_reactions_entity on public.reactions (entity_type, entity_id);

-- ============================================================
-- Chat: conversations / members / messages (replaces Sendbird chat)
-- ============================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean not null default false,
  group_id uuid references public.groups(id) on delete cascade,  -- set for group chats
  name text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);
create index idx_conversations_last_msg on public.conversations (last_message_at desc nulls last);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);
create index idx_conv_members_profile on public.conversation_members (profile_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  attachment_path text,
  created_at timestamptz not null default now(),
  check (body is not null or attachment_path is not null)
);
create index idx_messages_conversation on public.messages (conversation_id, created_at desc);

-- ============================================================
-- Notifications
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,               -- NEW_MESSAGE | NEW_LIKE | NEW_FRIEND_REQUEST | ...
  content text,
  meta jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_recipient on public.notifications (recipient_id, created_at desc);

-- ============================================================
-- Payments (records; writes happen via edge function w/ service role)
-- ============================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  payment_type text not null check (payment_type in ('ONE_TIME','RECURRING')),
  status text not null default 'pending',
  processor text not null default 'authorize_net',
  processor_ref text,
  in_honor_name text,
  legacy_id text,
  created_at timestamptz not null default now()
);
create index idx_payments_profile on public.payments (profile_id, created_at desc);

-- ============================================================
-- Triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_friendships_updated before update on public.friendships
  for each row execute function public.set_updated_at();
create trigger trg_posts_updated before update on public.posts
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when an auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep conversations.last_message_at fresh
create or replace function public.bump_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end $$;

create trigger trg_messages_bump after insert on public.messages
  for each row execute function public.bump_conversation();

-- ============================================================
-- RLS helper (avoids policy recursion on membership tables)
-- ============================================================
create or replace function public.is_conversation_member(conv_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv_id and profile_id = auth.uid()
  );
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.value_definitions enable row level security;
alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;

-- value_definitions: readable pre-auth (onboarding dropdowns)
create policy vd_select on public.value_definitions for select using (true);

-- profiles: community-visible; only owner writes
create policy profiles_select on public.profiles for select to authenticated using (active);
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid());

-- friendships: only the two parties
create policy friendships_select on public.friendships for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy friendships_insert on public.friendships for insert to authenticated
  with check (requester_id = auth.uid());
create policy friendships_update on public.friendships for update to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy friendships_delete on public.friendships for delete to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- groups: visible to all members of the community; joins are self-service
create policy groups_select on public.groups for select to authenticated using (true);
create policy group_members_select on public.group_members for select to authenticated using (true);
create policy group_members_insert on public.group_members for insert to authenticated
  with check (profile_id = auth.uid());
create policy group_members_delete on public.group_members for delete to authenticated
  using (profile_id = auth.uid());

-- posts: 'all' visible to everyone; 'group' visible to that group's members
create policy posts_select on public.posts for select to authenticated
  using (
    visibility = 'all'
    or (visibility = 'group' and exists (
      select 1 from public.group_members gm
      where gm.group_id = posts.group_id and gm.profile_id = auth.uid()
    ))
  );
create policy posts_insert on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy posts_update on public.posts for update to authenticated using (author_id = auth.uid());
create policy posts_delete on public.posts for delete to authenticated using (author_id = auth.uid());

-- comments / reactions
create policy comments_select on public.comments for select to authenticated using (true);
create policy comments_insert on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy comments_delete on public.comments for delete to authenticated using (author_id = auth.uid());

create policy reactions_select on public.reactions for select to authenticated using (true);
create policy reactions_insert on public.reactions for insert to authenticated with check (user_id = auth.uid());
create policy reactions_delete on public.reactions for delete to authenticated using (user_id = auth.uid());

-- chat: members only
create policy conversations_select on public.conversations for select to authenticated
  using (public.is_conversation_member(id));
create policy conversations_insert on public.conversations for insert to authenticated
  with check (created_by = auth.uid());
create policy conv_members_select on public.conversation_members for select to authenticated
  using (public.is_conversation_member(conversation_id));
create policy conv_members_insert on public.conversation_members for insert to authenticated
  with check (
    profile_id = auth.uid()
    or exists (select 1 from public.conversations c
               where c.id = conversation_id and c.created_by = auth.uid())
  );
create policy messages_select on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id));
create policy messages_insert on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id));

-- notifications: recipient reads/updates; sender creates as themself
create policy notifications_select on public.notifications for select to authenticated
  using (recipient_id = auth.uid());
create policy notifications_insert on public.notifications for insert to authenticated
  with check (sender_id = auth.uid());
create policy notifications_update on public.notifications for update to authenticated
  using (recipient_id = auth.uid());

-- payments: owner read-only; writes via service role (edge function) only
create policy payments_select on public.payments for select to authenticated
  using (profile_id = auth.uid());

-- ============================================================
-- Realtime: chat + notifications
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
