-- ESQUEMA APROXIMADO reconstruido desde consultas/string table del APK.
-- No contiene RLS, triggers ni funciones completas originales.
create table if not exists profiles (
  id uuid primary key,
  full_name text,
  username text unique not null,
  avatar_url text,
  bio text,
  follower_count integer default 0,
  following_count integer default 0,
  post_count integer default 0
);
create table if not exists categories (id uuid primary key, name text not null, slug text unique not null, emoji text, color text);
create table if not exists audio_posts (
  id uuid primary key default gen_random_uuid(), author_id uuid references profiles(id), category_id uuid references categories(id),
  title text not null, description text, audio_path text not null, duration_seconds numeric,
  play_count integer default 0, like_count integer default 0, comment_count integer default 0, published_at timestamptz default now()
);
create table if not exists comments (id uuid primary key default gen_random_uuid(),post_id uuid references audio_posts(id),user_id uuid references profiles(id),body text not null,created_at timestamptz default now(),updated_at timestamptz);
create table if not exists likes (post_id uuid references audio_posts(id),user_id uuid references profiles(id),created_at timestamptz default now(),primary key(post_id,user_id));
create table if not exists saved_posts (post_id uuid references audio_posts(id),user_id uuid references profiles(id),created_at timestamptz default now(),primary key(post_id,user_id));
create table if not exists hidden_posts (post_id uuid references audio_posts(id),user_id uuid references profiles(id),created_at timestamptz default now(),primary key(post_id,user_id));
create table if not exists notifications (id uuid primary key default gen_random_uuid(),recipient_id uuid references profiles(id),actor_id uuid references profiles(id),kind text,post_id uuid references audio_posts(id),comment_id uuid references comments(id),created_at timestamptz default now(),read_at timestamptz);
create table if not exists reports (id uuid primary key default gen_random_uuid(),reporter_id uuid references profiles(id),reported_profile_id uuid references profiles(id),post_id uuid references audio_posts(id),comment_id uuid references comments(id),reason text,details text,status text,resolution_note text,reviewed_at timestamptz,created_at timestamptz default now(),updated_at timestamptz);
create table if not exists live_rooms (id uuid primary key default gen_random_uuid(),host_id uuid references profiles(id),category_id uuid references categories(id),title text,description text,access_type text,speaking_mode text,status text,price_amount numeric,currency text,scheduled_for timestamptz,started_at timestamptz,participant_count integer default 0,created_at timestamptz default now());
create table if not exists live_room_members (room_id uuid references live_rooms(id),user_id uuid references profiles(id),role text,joined_at timestamptz,left_at timestamptz,removed_at timestamptz);
create table if not exists live_room_invitations (room_id uuid references live_rooms(id),invited_user_id uuid references profiles(id),invited_by uuid references profiles(id),status text,created_at timestamptz default now(),responded_at timestamptz);
create table if not exists live_room_speaker_requests (room_id uuid references live_rooms(id),user_id uuid references profiles(id),status text,requested_at timestamptz default now(),resolved_at timestamptz);
create table if not exists live_room_passes (id uuid primary key default gen_random_uuid(),room_id uuid references live_rooms(id),user_id uuid references profiles(id),status text,created_at timestamptz default now());
create table if not exists creator_payment_accounts (id uuid primary key default gen_random_uuid(),user_id uuid references profiles(id),provider text,status text,created_at timestamptz default now());
