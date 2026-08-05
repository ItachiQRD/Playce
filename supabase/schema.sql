-- PLAYCE V1 Schema
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('athlete','club','coach','agent','scout','fan','admin');
create type availability_status as enum ('open','looking','unavailable');
create type visibility_level as enum ('public','limited','private');
create type opportunity_type as enum ('offer','demand');
create type opportunity_status as enum ('open','closed');
create type application_status as enum ('sent','viewed','shortlisted','trial','closed','rejected');
create type post_type as enum ('text','image','video','result','training','announcement','opportunity_search','highlight','reel');
create type report_status as enum ('pending','resolved','dismissed');
create type report_target as enum ('profile','post','message','opportunity','comment');
create type media_type as enum ('photo','video','link');
create type achievement_type as enum ('title','diploma','license','badge');
create type message_type as enum ('text','image','link','profile','opportunity');
create type notification_type as enum ('message','like','comment','follow','application','status','opportunity','system');
create type saved_item_type as enum ('profile','opportunity','post');

-- Sports referential
create table sports (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_fr text not null,
  name_en text not null,
  icon text,
  created_at timestamptz default now()
);

create table positions (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid references sports(id) on delete cascade,
  slug text not null,
  name_fr text not null,
  name_en text not null,
  unique(sport_id, slug)
);

create table levels (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid references sports(id) on delete cascade,
  slug text not null,
  name_fr text not null,
  name_en text not null,
  sort_order int default 0,
  unique(sport_id, slug)
);

create table report_reasons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label_fr text not null,
  label_en text not null
);

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  handle text unique not null,
  full_name text not null,
  role user_role not null default 'athlete',
  avatar_url text,
  cover_url text,
  bio text,
  city text,
  country text,
  birth_date date,
  hide_age boolean default false,
  sport_id uuid references sports(id),
  position text,
  level text,
  dominant_side text,
  availability availability_status default 'open',
  languages text[] default '{}',
  goals text,
  current_club text,
  visibility visibility_level default 'public',
  allow_direct_contact boolean default true,
  email_verified boolean default false,
  identity_verified boolean default false,
  completeness int default 0,
  is_suspended boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  organization text not null,
  role text not null,
  level text,
  start_date date,
  end_date date,
  description text,
  is_current boolean default false,
  created_at timestamptz default now()
);

create table stats (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  label text not null,
  value text not null,
  season text,
  is_declarative boolean default true,
  source text,
  created_at timestamptz default now()
);

create table media (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  type media_type not null,
  url text not null,
  thumbnail_url text,
  title text,
  is_highlight boolean default false,
  created_at timestamptz default now()
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  year text,
  issuer text,
  type achievement_type default 'title',
  created_at timestamptz default now()
);

create table follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade not null,
  type post_type default 'text',
  content text not null,
  media_url text,
  thumbnail_url text,
  sport_id uuid references sports(id),
  hashtags text[] default '{}',
  likes_count int default 0,
  comments_count int default 0,
  saves_count int default 0,
  opportunity_id uuid,
  created_at timestamptz default now()
);

create table likes (
  user_id uuid references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade not null,
  type opportunity_type not null,
  title text not null,
  organization text,
  sport_id uuid references sports(id) not null,
  position text,
  level text,
  city text,
  country text,
  contract_type text,
  compensation text,
  deadline date,
  description text not null,
  criteria text,
  status opportunity_status default 'open',
  applications_count int default 0,
  created_at timestamptz default now()
);

alter table posts
  add constraint posts_opportunity_fk
  foreign key (opportunity_id) references opportunities(id) on delete set null;

create table applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete cascade not null,
  applicant_id uuid references profiles(id) on delete cascade not null,
  message text,
  status application_status default 'sent',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(opportunity_id, applicant_id)
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  type message_type default 'text',
  attachment_url text,
  created_at timestamptz default now(),
  read_at timestamptz
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  body text not null,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete cascade not null,
  target_type report_target not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status report_status default 'pending',
  created_at timestamptz default now()
);

create table saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  item_type saved_item_type not null,
  item_id uuid not null,
  created_at timestamptz default now(),
  unique(user_id, item_type, item_id)
);

create table verification_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  status text default 'pending',
  documents text[],
  notes text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

create table search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  query text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_profiles_sport on profiles(sport_id);
create index idx_profiles_role on profiles(role);
create index idx_profiles_handle on profiles(handle);
create index idx_posts_author on posts(author_id);
create index idx_posts_created on posts(created_at desc);
create index idx_opportunities_sport on opportunities(sport_id);
create index idx_opportunities_status on opportunities(status);
create index idx_notifications_user on notifications(user_id, read);
create index idx_messages_conversation on messages(conversation_id, created_at);

-- Seed sports
insert into sports (slug, name_fr, name_en, icon) values
  ('football', 'Football', 'Football', '⚽'),
  ('basketball', 'Basketball', 'Basketball', '🏀'),
  ('tennis', 'Tennis', 'Tennis', '🎾'),
  ('rugby', 'Rugby', 'Rugby', '🏉'),
  ('athletics', 'Athlétisme', 'Athletics', '🏃'),
  ('swimming', 'Natation', 'Swimming', '🏊'),
  ('volleyball', 'Volleyball', 'Volleyball', '🏐'),
  ('handball', 'Handball', 'Handball', '🤾');

-- Football positions
insert into positions (sport_id, slug, name_fr, name_en)
select id, p.slug, p.name_fr, p.name_en from sports s
cross join (values
  ('gk','Gardien','Goalkeeper'),
  ('cb','Défenseur central','Center Back'),
  ('lb','Latéral gauche','Left Back'),
  ('rb','Latéral droit','Right Back'),
  ('cdm','Milieu défensif','Defensive Midfielder'),
  ('cm','Milieu central','Central Midfielder'),
  ('cam','Milieu offensif','Attacking Midfielder'),
  ('lw','Ailier gauche','Left Winger'),
  ('rw','Ailier droit','Right Winger'),
  ('st','Attaquant','Striker')
) as p(slug, name_fr, name_en)
where s.slug = 'football';

-- Football levels
insert into levels (sport_id, slug, name_fr, name_en, sort_order)
select id, l.slug, l.name_fr, l.name_en, l.sort_order from sports s
cross join (values
  ('amateur', 'Amateur', 'Amateur', 1),
  ('regional', 'Régional', 'Regional', 2),
  ('national', 'National', 'National', 3),
  ('semi-pro', 'Semi-pro', 'Semi-pro', 4),
  ('pro', 'Professionnel', 'Professional', 5),
  ('youth', 'Jeunes / Académie', 'Youth / Academy', 0)
) as l(slug, name_fr, name_en, sort_order)
where s.slug = 'football';

insert into report_reasons (slug, label_fr, label_en) values
  ('spam', 'Spam', 'Spam'),
  ('harassment', 'Harcèlement', 'Harassment'),
  ('fake', 'Fausse identité / données', 'Fake identity / data'),
  ('inappropriate', 'Contenu inapproprié', 'Inappropriate content'),
  ('scam', 'Arnaque', 'Scam'),
  ('other', 'Autre', 'Other');

-- Updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger applications_updated_at before update on applications
  for each row execute function set_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, handle, full_name, role, email_verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'handle', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'athlete'),
    new.email_confirmed_at is not null
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Like counters
create or replace function update_post_likes_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set likes_count = likes_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger likes_count_trigger
  after insert or delete on likes
  for each row execute function update_post_likes_count();

create or replace function update_post_comments_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set comments_count = comments_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger comments_count_trigger
  after insert or delete on comments
  for each row execute function update_post_comments_count();

create or replace function update_applications_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update opportunities set applications_count = applications_count + 1 where id = new.opportunity_id;
  elsif tg_op = 'DELETE' then
    update opportunities set applications_count = applications_count - 1 where id = old.opportunity_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger applications_count_trigger
  after insert or delete on applications
  for each row execute function update_applications_count();

-- RLS
alter table profiles enable row level security;
alter table experiences enable row level security;
alter table stats enable row level security;
alter table media enable row level security;
alter table achievements enable row level security;
alter table follows enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table opportunities enable row level security;
alter table applications enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table saved_items enable row level security;
alter table verification_requests enable row level security;
alter table search_history enable row level security;
alter table sports enable row level security;
alter table positions enable row level security;
alter table levels enable row level security;
alter table report_reasons enable row level security;

-- Public read for referentials
create policy "sports_read" on sports for select using (true);
create policy "positions_read" on positions for select using (true);
create policy "levels_read" on levels for select using (true);
create policy "report_reasons_read" on report_reasons for select using (true);

-- Profiles
create policy "profiles_public_read" on profiles for select using (
  visibility = 'public' or id = auth.uid() or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "profiles_update_own" on profiles for update using (id = auth.uid());
create policy "profiles_admin_all" on profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Experiences / stats / media / achievements
create policy "experiences_read" on experiences for select using (true);
create policy "experiences_own" on experiences for all using (profile_id = auth.uid());
create policy "stats_read" on stats for select using (true);
create policy "stats_own" on stats for all using (profile_id = auth.uid());
create policy "media_read" on media for select using (true);
create policy "media_own" on media for all using (profile_id = auth.uid());
create policy "achievements_read" on achievements for select using (true);
create policy "achievements_own" on achievements for all using (profile_id = auth.uid());

-- Follows
create policy "follows_read" on follows for select using (true);
create policy "follows_own" on follows for insert with check (follower_id = auth.uid());
create policy "follows_delete" on follows for delete using (follower_id = auth.uid());

-- Posts
create policy "posts_read" on posts for select using (true);
create policy "posts_insert" on posts for insert with check (author_id = auth.uid());
create policy "posts_update" on posts for update using (author_id = auth.uid());
create policy "posts_delete" on posts for delete using (
  author_id = auth.uid() or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Likes / comments
create policy "likes_read" on likes for select using (true);
create policy "likes_own" on likes for all using (user_id = auth.uid());
create policy "comments_read" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (author_id = auth.uid());
create policy "comments_delete" on comments for delete using (
  author_id = auth.uid() or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Opportunities
create policy "opportunities_read" on opportunities for select using (true);
create policy "opportunities_insert" on opportunities for insert with check (author_id = auth.uid());
create policy "opportunities_update" on opportunities for update using (author_id = auth.uid());
create policy "opportunities_delete" on opportunities for delete using (
  author_id = auth.uid() or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Applications
create policy "applications_read" on applications for select using (
  applicant_id = auth.uid() or
  exists (select 1 from opportunities o where o.id = opportunity_id and o.author_id = auth.uid()) or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "applications_insert" on applications for insert with check (applicant_id = auth.uid());
create policy "applications_update" on applications for update using (
  applicant_id = auth.uid() or
  exists (select 1 from opportunities o where o.id = opportunity_id and o.author_id = auth.uid())
);

-- Conversations / messages
create policy "conversation_participants_read" on conversation_participants for select using (
  profile_id = auth.uid() or
  exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = conversation_id and cp.profile_id = auth.uid()
  )
);
create policy "conversations_read" on conversations for select using (
  exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = id and cp.profile_id = auth.uid()
  )
);
create policy "messages_read" on messages for select using (
  exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = conversation_id and cp.profile_id = auth.uid()
  )
);
create policy "messages_insert" on messages for insert with check (
  sender_id = auth.uid() and
  exists (
    select 1 from conversation_participants cp
    where cp.conversation_id = conversation_id and cp.profile_id = auth.uid()
  )
);

-- Notifications
create policy "notifications_own" on notifications for all using (user_id = auth.uid());

-- Reports
create policy "reports_insert" on reports for insert with check (reporter_id = auth.uid());
create policy "reports_admin" on reports for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "reports_admin_update" on reports for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Saved / verification / search
create policy "saved_own" on saved_items for all using (user_id = auth.uid());
create policy "verification_own" on verification_requests for select using (profile_id = auth.uid());
create policy "verification_insert" on verification_requests for insert with check (profile_id = auth.uid());
create policy "verification_admin" on verification_requests for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "search_history_own" on search_history for all using (user_id = auth.uid());

-- Storage buckets (run in dashboard or via API)
-- avatars, covers, posts, media
