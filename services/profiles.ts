import { supabase } from "@/lib/supabase";
import {
  PROFILE_AVATARS_BUCKET,
  MAX_PROFILE_AVATAR_BYTES,
} from "@/lib/constants";
import type { Profile, AudioPost } from "@/types/models";

const PROFILE_POST_SELECT = `
  id,author_id,category_id,title,description,audio_path,duration_seconds,play_count,like_count,comment_count,published_at,
  author:profiles!audio_posts_author_id_fkey(id,full_name,username,avatar_url),
  category:categories!audio_posts_category_id_fkey(id,name,slug,emoji,color)
`;

export async function getProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,full_name,username,avatar_url,bio,follower_count,following_count,post_count",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function isUsernameAvailable(
  username: string,
  currentId?: string,
) {
  let query = supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .limit(1);
  if (currentId) query = query.neq("id", currentId);
  const { data, error } = await query;
  if (error) throw error;
  return !data?.length;
}

export async function saveProfile(
  id: string,
  patch: Partial<
    Pick<Profile, "full_name" | "username" | "bio" | "avatar_url">
  >,
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, uri: string) {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_PROFILE_AVATAR_BYTES) {
    throw new Error(
      `La imagen supera el límite de ${Math.round(MAX_PROFILE_AVATAR_BYTES / 1024 / 1024)} MB.`,
    );
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const extension = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";
  const path = `${userId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(PROFILE_AVATARS_BUCKET)
    .upload(path, arrayBuffer, { contentType, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage
    .from(PROFILE_AVATARS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function isProfileFollowed(profileId: string, userId: string) {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)
    .eq("following_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function setProfileFollowed(
  profileId: string,
  userId: string,
  followed: boolean,
) {
  if (followed) {
    const { error } = await supabase
      .from("follows")
      .upsert({ follower_id: userId, following_id: profileId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", profileId);
    if (error) throw error;
  }
}

export async function listProfileFeedPosts(
  profileId: string,
  viewerId?: string,
): Promise<AudioPost[]> {
  const postsPromise = supabase
    .from("audio_posts")
    .select(PROFILE_POST_SELECT)
    .eq("author_id", profileId)
    .order("published_at", { ascending: false });
  const hiddenPromise = viewerId
    ? supabase.from("hidden_posts").select("post_id").eq("user_id", viewerId)
    : Promise.resolve({ data: [], error: null });

  const [postsResult, hiddenResult] = await Promise.all([
    postsPromise,
    hiddenPromise,
  ]);
  if (postsResult.error) throw postsResult.error;
  if (hiddenResult.error) throw hiddenResult.error;

  const hiddenIds = new Set(
    (hiddenResult.data ?? []).map((item: any) => item.post_id),
  );
  return ((postsResult.data ?? []) as unknown as AudioPost[]).filter(
    (post) => !hiddenIds.has(post.id),
  );
}
