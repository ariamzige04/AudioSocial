export type Profile = {
  id: string;

  full_name: string | null;

  username: string;

  avatar_url: string | null;

  bio?: string | null;

  follower_count?: number;

  following_count?: number;

  post_count?: number;

};

export type Category = { id: string;
 name: string;
 slug: string;
 emoji: string | null;
 color: string | null };

export type AudioPost = {
  id: string;

  author_id?: string;

  title: string;

  description: string | null;

  audio_path: string;

  duration_seconds: number | null;

  play_count: number;

  like_count: number;

  comment_count: number;

  published_at: string;

  category_id?: string | null;

  author?: Profile | null;

  category?: Category | null;

  viewerHasLiked?: boolean;

  viewerHasSaved?: boolean;

};

export type Comment = {
  id: string;
 post_id: string;
 user_id: string;
 body: string;

  created_at: string;
 updated_at: string | null;
 author?: Profile | null;

};

export type NotificationItem = {
  id: string;
 recipient_id: string;
 actor_id: string;
 kind: string;

  post_id: string | null;
 comment_id: string | null;
 created_at: string;
 read_at: string | null;

  actor?: Profile | null;
 post?: {id:string;
 title:string} | null;

};

export type LiveRoom = {
  id: string;
 host_id: string;
 title: string;
 description: string | null;

  access_type: 'public'|'private'|'paid'|string;

  speaking_mode: 'host_only'|'open'|'request'|string;

  status: string;
 price_amount: number | null;
 currency: string | null;

  scheduled_for: string | null;
 started_at: string | null;
 participant_count: number | null;

  created_at: string;
 host?: Profile | null;
 category?: Category | null;

};

export type Report = {
  id: string;
 reporter_id: string;
 reported_profile_id: string | null;

  post_id: string | null;
 comment_id: string | null;
 reason: string;
 details: string | null;

  status: string;
 resolution_note: string | null;
 reviewed_at: string | null;

  created_at: string;
 updated_at: string | null;

};

