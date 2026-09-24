-- AudioSocial - esquema base para un proyecto NUEVO de Supabase.
-- Ejecuta este archivo en Supabase > SQL Editor una sola vez.
-- Incluye tablas, RLS, buckets, triggers de contadores/notificaciones y RPC básicas.
-- LiveKit y cobros reales requieren configuración externa y NO se crean aquí.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique not null check (username ~ '^[a-z0-9._]{3,24}$'),
  avatar_url text,
  bio text check (char_length(bio) <= 240),
  follower_count integer not null default 0 check (follower_count >= 0),
  following_count integer not null default 0 check (following_count >= 0),
  post_count integer not null default 0 check (post_count >= 0)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  emoji text,
  color text
);

create table public.audio_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) between 3 and 120),
  description text check (char_length(description) <= 1000),
  audio_path text not null,
  duration_seconds numeric check (duration_seconds is null or duration_seconds >= 0),
  play_count integer not null default 0 check (play_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  comment_count integer not null default 0 check (comment_count >= 0),
  published_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.audio_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.likes (
  post_id uuid references public.audio_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.saved_posts (
  post_id uuid references public.audio_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.hidden_posts (
  post_id uuid references public.audio_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  kind text not null,
  post_id uuid references public.audio_posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_profile_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.audio_posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending',
  resolution_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.live_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) >= 3),
  description text,
  access_type text not null default 'public' check (access_type in ('public','private','paid')),
  speaking_mode text not null default 'request' check (speaking_mode in ('host_only','open','request')),
  status text not null default 'scheduled' check (status in ('scheduled','live','ended','cancelled')),
  price_amount numeric check (price_amount is null or price_amount >= 0),
  currency text default 'MXN',
  scheduled_for timestamptz,
  started_at timestamptz,
  participant_count integer not null default 0 check (participant_count >= 0),
  created_at timestamptz not null default now()
);

create table public.live_room_members (
  room_id uuid references public.live_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'listener',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  removed_at timestamptz,
  primary key (room_id, user_id)
);

create table public.live_room_invitations (
  room_id uuid references public.live_rooms(id) on delete cascade,
  invited_user_id uuid references public.profiles(id) on delete cascade,
  invited_by uuid references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  primary key (room_id, invited_user_id)
);

create table public.live_room_speaker_requests (
  room_id uuid references public.live_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  primary key (room_id, user_id)
);

create table public.live_room_passes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create table public.creator_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index audio_posts_published_at_idx on public.audio_posts (published_at desc);
create index comments_post_id_idx on public.comments (post_id, created_at);
create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);
create index live_rooms_status_idx on public.live_rooms (status, created_at desc);

-- Crear perfil automáticamente al registrarse en Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
begin
  base_username := lower(coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), 'user_' || substr(new.id::text, 1, 8)));
  base_username := regexp_replace(base_username, '[^a-z0-9._]', '', 'g');
  if char_length(base_username) < 3 then
    base_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  base_username := left(base_username, 24);
  final_username := base_username;

  if exists(select 1 from public.profiles where username = final_username) then
    final_username := left(base_username, 19) || '_' || substr(new.id::text, 1, 4);
  end if;

  insert into public.profiles (id, full_name, username)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), final_username);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Contadores de publicaciones, likes, comentarios y follows.
create or replace function public.sync_post_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set post_count = post_count + 1 where id = new.author_id;
    return new;
  end if;
  update public.profiles set post_count = greatest(post_count - 1, 0) where id = old.author_id;
  return old;
end;
$$;

drop trigger if exists audio_posts_sync_count on public.audio_posts;
create trigger audio_posts_sync_count after insert or delete on public.audio_posts
for each row execute procedure public.sync_post_count();

create or replace function public.sync_like_count_and_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  if tg_op = 'INSERT' then
    update public.audio_posts set like_count = like_count + 1 where id = new.post_id returning author_id into owner_id;
    if owner_id is not null and owner_id <> new.user_id then
      insert into public.notifications(recipient_id, actor_id, kind, post_id)
      values(owner_id, new.user_id, 'like', new.post_id);
    end if;
    return new;
  end if;
  update public.audio_posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

drop trigger if exists likes_sync_count on public.likes;
create trigger likes_sync_count after insert or delete on public.likes
for each row execute procedure public.sync_like_count_and_notify();

create or replace function public.sync_comment_count_and_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  if tg_op = 'INSERT' then
    update public.audio_posts set comment_count = comment_count + 1 where id = new.post_id returning author_id into owner_id;
    if owner_id is not null and owner_id <> new.user_id then
      insert into public.notifications(recipient_id, actor_id, kind, post_id, comment_id)
      values(owner_id, new.user_id, 'comment', new.post_id, new.id);
    end if;
    return new;
  end if;
  update public.audio_posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

drop trigger if exists comments_sync_count on public.comments;
create trigger comments_sync_count after insert or delete on public.comments
for each row execute procedure public.sync_comment_count_and_notify();

create or replace function public.sync_follow_counts_and_notify()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    update public.profiles set follower_count = follower_count + 1 where id = new.following_id;
    insert into public.notifications(recipient_id, actor_id, kind)
    values(new.following_id, new.follower_id, 'follow');
    return new;
  end if;
  update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
  update public.profiles set follower_count = greatest(follower_count - 1, 0) where id = old.following_id;
  return old;
end;
$$;

drop trigger if exists follows_sync_count on public.follows;
create trigger follows_sync_count after insert or delete on public.follows
for each row execute procedure public.sync_follow_counts_and_notify();

-- RPC: contador de reproducción.
create or replace function public.register_audio_play(target_post_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  update public.audio_posts set play_count = play_count + 1 where id = target_post_id;
end;
$$;


-- RPC básicas para membresía de salas. El audio real de LiveKit se configura aparte.
create or replace function public.join_public_live_room(target_room_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.live_rooms where id = target_room_id and access_type = 'public' and status in ('scheduled','live')) then
    raise exception 'room not available';
  end if;
  insert into public.live_room_members(room_id,user_id,role,joined_at,left_at,removed_at)
  values(target_room_id,auth.uid(),'listener',now(),null,null)
  on conflict(room_id,user_id) do update set joined_at=now(),left_at=null,removed_at=null;
end;
$$;

create or replace function public.join_private_live_room(target_room_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.live_rooms where id=target_room_id and host_id=auth.uid())
     and not exists(
       select 1 from public.live_room_invitations
       where room_id=target_room_id and invited_user_id=auth.uid() and status in ('pending','accepted')
     ) then raise exception 'invitation required'; end if;
  insert into public.live_room_members(room_id,user_id,role,joined_at,left_at,removed_at)
  values(target_room_id,auth.uid(),'listener',now(),null,null)
  on conflict(room_id,user_id) do update set joined_at=now(),left_at=null,removed_at=null;
end;
$$;

create or replace function public.join_paid_live_room(target_room_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.live_rooms where id=target_room_id and host_id=auth.uid())
     and not exists(
       select 1 from public.live_room_passes
       where room_id=target_room_id and user_id=auth.uid() and status='active'
     ) then raise exception 'active pass required'; end if;
  insert into public.live_room_members(room_id,user_id,role,joined_at,left_at,removed_at)
  values(target_room_id,auth.uid(),'listener',now(),null,null)
  on conflict(room_id,user_id) do update set joined_at=now(),left_at=null,removed_at=null;
end;
$$;

create or replace function public.leave_live_room(target_room_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.live_room_members set left_at=now() where room_id=target_room_id and user_id=auth.uid();
end;
$$;

create or replace function public.invite_user_to_live_room(target_room_id uuid, target_username text)
returns void language plpgsql security definer set search_path = public as $$
declare target_user_id uuid;
begin
  if not exists(select 1 from public.live_rooms where id=target_room_id and host_id=auth.uid()) then
    raise exception 'only host can invite';
  end if;
  select id into target_user_id from public.profiles where username=lower(target_username) limit 1;
  if target_user_id is null then raise exception 'user not found'; end if;
  insert into public.live_room_invitations(room_id,invited_user_id,invited_by,status)
  values(target_room_id,target_user_id,auth.uid(),'pending')
  on conflict(room_id,invited_user_id) do update set invited_by=auth.uid(),status='pending',created_at=now(),responded_at=null;
end;
$$;


-- Participant count derivado de miembros activos.
create or replace function public.refresh_live_participant_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  if tg_op = 'DELETE' then
    rid := old.room_id;
  else
    rid := new.room_id;
  end if;

  update public.live_rooms r
  set participant_count = (
    select count(*) from public.live_room_members m
    where m.room_id=rid and m.left_at is null and m.removed_at is null
  )
  where r.id=rid;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists live_members_sync_count on public.live_room_members;
create trigger live_members_sync_count after insert or update or delete on public.live_room_members
for each row execute procedure public.refresh_live_participant_count();

-- Permisos explícitos de funciones SECURITY DEFINER.
-- Las funciones internas de triggers no deben exponerse directamente por la API.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_post_count() from public, anon, authenticated;
revoke execute on function public.sync_like_count_and_notify() from public, anon, authenticated;
revoke execute on function public.sync_comment_count_and_notify() from public, anon, authenticated;
revoke execute on function public.sync_follow_counts_and_notify() from public, anon, authenticated;
revoke execute on function public.refresh_live_participant_count() from public, anon, authenticated;

-- Las RPC de la aplicación no deben ser ejecutables por usuarios anónimos.

revoke execute on function public.register_audio_play(uuid) from public, anon;
revoke execute on function public.join_public_live_room(uuid) from public, anon;
revoke execute on function public.join_private_live_room(uuid) from public, anon;
revoke execute on function public.join_paid_live_room(uuid) from public, anon;
revoke execute on function public.leave_live_room(uuid) from public, anon;
revoke execute on function public.invite_user_to_live_room(uuid, text) from public, anon;

-- Las RPC anteriores sí pueden ser utilizadas por usuarios autenticados.

grant execute on function public.register_audio_play(uuid) to authenticated;
grant execute on function public.join_public_live_room(uuid) to authenticated;
grant execute on function public.join_private_live_room(uuid) to authenticated;
grant execute on function public.join_paid_live_room(uuid) to authenticated;
grant execute on function public.leave_live_room(uuid) to authenticated;
grant execute on function public.invite_user_to_live_room(uuid, text) to authenticated;

-- Row Level Security.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.audio_posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.saved_posts enable row level security;
alter table public.hidden_posts enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.live_rooms enable row level security;
alter table public.live_room_members enable row level security;
alter table public.live_room_invitations enable row level security;
alter table public.live_room_speaker_requests enable row level security;
alter table public.live_room_passes enable row level security;
alter table public.creator_payment_accounts enable row level security;

create policy "profiles_read" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
create policy "categories_read" on public.categories for select to authenticated using (true);

create policy "posts_read" on public.audio_posts for select to authenticated using (true);
create policy "posts_insert_own" on public.audio_posts for insert to authenticated with check (author_id=auth.uid());
create policy "posts_update_own" on public.audio_posts for update to authenticated using (author_id=auth.uid()) with check (author_id=auth.uid());
create policy "posts_delete_own" on public.audio_posts for delete to authenticated using (author_id=auth.uid());

create policy "comments_read" on public.comments for select to authenticated using (true);
create policy "comments_insert_own" on public.comments for insert to authenticated with check (user_id=auth.uid());
create policy "comments_update_own" on public.comments for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "comments_delete_own" on public.comments for delete to authenticated using (user_id=auth.uid());

create policy "likes_read_own" on public.likes for select to authenticated using (user_id=auth.uid());
create policy "likes_write_own" on public.likes for insert to authenticated with check (user_id=auth.uid());
create policy "likes_update_own" on public.likes for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "likes_delete_own" on public.likes for delete to authenticated using (user_id=auth.uid());

create policy "saved_read_own" on public.saved_posts for select to authenticated using (user_id=auth.uid());
create policy "saved_write_own" on public.saved_posts for insert to authenticated with check (user_id=auth.uid());
create policy "saved_update_own" on public.saved_posts for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "saved_delete_own" on public.saved_posts for delete to authenticated using (user_id=auth.uid());

create policy "hidden_read_own" on public.hidden_posts for select to authenticated using (user_id=auth.uid());
create policy "hidden_write_own" on public.hidden_posts for insert to authenticated with check (user_id=auth.uid());
create policy "hidden_update_own" on public.hidden_posts for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "hidden_delete_own" on public.hidden_posts for delete to authenticated using (user_id=auth.uid());

create policy "follows_read" on public.follows for select to authenticated using (true);
create policy "follows_insert_own" on public.follows for insert to authenticated with check (follower_id=auth.uid());
create policy "follows_update_own" on public.follows for update to authenticated using (follower_id=auth.uid()) with check (follower_id=auth.uid());
create policy "follows_delete_own" on public.follows for delete to authenticated using (follower_id=auth.uid());

create policy "notifications_read_own" on public.notifications for select to authenticated using (recipient_id=auth.uid());
create policy "notifications_update_own" on public.notifications for update to authenticated using (recipient_id=auth.uid()) with check (recipient_id=auth.uid());

create policy "reports_insert_own" on public.reports for insert to authenticated with check (reporter_id=auth.uid());
create policy "reports_read_own" on public.reports for select to authenticated using (reporter_id=auth.uid());

create policy "live_rooms_read" on public.live_rooms for select to authenticated using (true);
create policy "live_rooms_insert_own" on public.live_rooms for insert to authenticated with check (host_id=auth.uid());
create policy "live_rooms_update_host" on public.live_rooms for update to authenticated using (host_id=auth.uid()) with check (host_id=auth.uid());
create policy "live_rooms_delete_host" on public.live_rooms for delete to authenticated using (host_id=auth.uid());

create policy "live_members_read" on public.live_room_members for select to authenticated using (user_id=auth.uid() or exists(select 1 from public.live_rooms r where r.id=room_id and r.host_id=auth.uid()));
create policy "live_invitations_read" on public.live_room_invitations for select to authenticated using (invited_user_id=auth.uid() or invited_by=auth.uid());
create policy "speaker_requests_read" on public.live_room_speaker_requests for select to authenticated using (user_id=auth.uid() or exists(select 1 from public.live_rooms r where r.id=room_id and r.host_id=auth.uid()));
create policy "passes_read_own" on public.live_room_passes for select to authenticated using (user_id=auth.uid());
create policy "payment_accounts_read_own" on public.creator_payment_accounts for select to authenticated using (user_id=auth.uid());

-- Buckets de Storage.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('audio-posts','audio-posts',false,26214400,array['audio/mp4','audio/aac','audio/webm','audio/3gpp','audio/wav'])
on conflict(id) do update set public=false,file_size_limit=26214400;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('profile-avatars','profile-avatars',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880;

create policy "audio_objects_read_authenticated" on storage.objects for select to authenticated
using (bucket_id='audio-posts');
create policy "audio_objects_insert_own_folder" on storage.objects for insert to authenticated
with check (bucket_id='audio-posts' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "audio_objects_delete_own_folder" on storage.objects for delete to authenticated
using (bucket_id='audio-posts' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "avatar_objects_insert_own_folder" on storage.objects for insert to authenticated
with check (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatar_objects_update_own_folder" on storage.objects for update to authenticated
using (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatar_objects_delete_own_folder" on storage.objects for delete to authenticated
using (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);

-- Categorías iniciales.
insert into public.categories(name,slug,emoji,color) values
('Historias','historias','📖','#FFD84D'),
('Humor','humor','😂','#FFB347'),
('Música','musica','🎵','#B7A7FF'),
('Tecnología','tecnologia','💻','#7CC7FF'),
('Opinión','opinion','💬','#91D7B5'),
('Aprendizaje','aprendizaje','🧠','#F4A6C1')
on conflict(slug) do nothing;
