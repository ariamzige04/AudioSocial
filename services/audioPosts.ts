import { supabase } from "@/lib/supabase";
import { AUDIO_POSTS_BUCKET, MAX_AUDIO_BYTES } from "@/lib/constants";
import type { AudioPost } from "@/types/models";

const FEED_SELECT = `
  id,
  author_id,
  category_id,
  title,
  description,
  audio_path,
  duration_seconds,
  play_count,
  like_count,
  comment_count,
  published_at,
  author:profiles!audio_posts_author_id_fkey (
    id, full_name, username, avatar_url
  ),
  category:categories!audio_posts_category_id_fkey (
    id, name, slug, emoji, color
  )
`;

async function getHiddenPostIds(userId?: string) {
  if (!userId) return new Set<string>();
  const { data, error } = await supabase
    .from("hidden_posts")
    .select("post_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((item) => item.post_id));
}

export async function listFeedPostsPage(
  from = 0,
  to = 19,
  userId?: string,
): Promise<AudioPost[]> {
  const requestedCount = Math.max(1, to - from + 1);
  const fetchTo = userId ? to + 50 : to;
  const [{ data, error }, hiddenIds] = await Promise.all([
    supabase
      .from("audio_posts")
      .select(FEED_SELECT)
      .order("published_at", { ascending: false })
      .range(from, fetchTo),
    getHiddenPostIds(userId),
  ]);

  if (error) throw error;

  return ((data ?? []) as unknown as AudioPost[])
    .filter((post) => !hiddenIds.has(post.id))
    .slice(0, requestedCount);
}

export const listFeedPosts = (userId?: string) =>
  listFeedPostsPage(0, 19, userId);

export async function getFeedPostById(id: string): Promise<AudioPost | null> {
  const { data, error } = await supabase
    .from("audio_posts")
    .select(FEED_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as AudioPost | null;
}

export async function searchExplorePosts(
  query: string,
  userId?: string,
): Promise<AudioPost[]> {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return listFeedPostsPage(0, 39, userId);

  const [{ data, error }, hiddenIds] = await Promise.all([
    supabase
      .from("audio_posts")
      .select(FEED_SELECT)
      .order("published_at", { ascending: false })
      .limit(100),
    getHiddenPostIds(userId),
  ]);

  if (error) throw error;

  return ((data ?? []) as unknown as AudioPost[])
    .filter((post) => !hiddenIds.has(post.id))
    .filter((post) => {
      const searchable = [
        post.title,
        post.description,
        post.author?.username,
        post.author?.full_name,
        post.category?.name,
        post.category?.slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return searchable.includes(q);
    })
    .slice(0, 40);
}

export async function getViewerPostState(postId: string, userId: string) {
  const [likeResult, saveResult] = await Promise.all([
    supabase
      .from("likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("saved_posts")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (likeResult.error) throw likeResult.error;
  if (saveResult.error) throw saveResult.error;
  return { liked: Boolean(likeResult.data), saved: Boolean(saveResult.data) };
}

export async function setPostLiked(
  postId: string,
  userId: string,
  liked: boolean,
) {
  if (liked) {
    const { error } = await supabase
      .from("likes")
      .upsert({ post_id: postId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  }
}

export async function setPostSaved(
  postId: string,
  userId: string,
  saved: boolean,
) {
  if (saved) {
    const { error } = await supabase
      .from("saved_posts")
      .upsert({ post_id: postId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("saved_posts")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  }
}

export async function hidePost(postId: string, userId: string) {
  const { error } = await supabase
    .from("hidden_posts")
    .upsert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

export async function restoreHiddenPost(postId: string, userId: string) {
  const { error } = await supabase
    .from("hidden_posts")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function listHiddenFeedPosts(userId: string) {
  const { data, error } = await supabase
    .from("hidden_posts")
    .select(
      `post_id, post:audio_posts!hidden_posts_post_id_fkey (${FEED_SELECT})`,
    )
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? [])
    .map((item: any) => item.post)
    .filter(Boolean) as AudioPost[];
}

export async function listSavedFeedPosts(userId: string) {
  const [{ data, error }, hiddenIds] = await Promise.all([
    supabase
      .from("saved_posts")
      .select(
        `post_id, post:audio_posts!saved_posts_post_id_fkey (${FEED_SELECT})`,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    getHiddenPostIds(userId),
  ]);
  if (error) throw error;
  return (data ?? [])
    .map((item: any) => item.post)
    .filter(
      (post: AudioPost | null) =>
        Boolean(post) && !hiddenIds.has((post as AudioPost).id),
    ) as AudioPost[];
}

function inferAudioMetadata(uri: string, responseType: string | null) {
const cleanUri = uri.replace(/[?#].*$/, '');
const extension = cleanUri.split('.').pop()?.toLowerCase();

const allowed = new Set(["m4a", "mp4", "aac", "webm", "3gp", "wav"]);
  const ext =
    extension && allowed.has(extension)
      ? extension
      : responseType?.includes("webm")
        ? "webm"
        : "m4a";
  const contentType =
    responseType ||
    (
      {
        m4a: "audio/mp4",
        mp4: "audio/mp4",
        aac: "audio/aac",
        webm: "audio/webm",
        "3gp": "audio/3gpp",
        wav: "audio/wav",
      } as Record<string, string>
    )[ext] ||
    "audio/mp4";
  return { ext, contentType };
}

export async function createAudioPost(input: {
  userId: string;
  uri: string;
  title: string;
  description?: string;
  categoryId?: string;
  durationSeconds?: number;
}) {
  const response = await fetch(input.uri);
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_AUDIO_BYTES) {
    throw new Error(
      `El audio supera el límite de ${Math.round(MAX_AUDIO_BYTES / 1024 / 1024)} MB.`,
    );
  }

  const { ext, contentType } = inferAudioMetadata(
    input.uri,
    response.headers.get("content-type"),
  );
  const path = `${input.userId}/${Date.now()}.${ext}`;

  const upload = await supabase.storage
    .from(AUDIO_POSTS_BUCKET)
    .upload(path, arrayBuffer, { contentType, upsert: false });
  if (upload.error) throw upload.error;

  const { data, error } = await supabase
    .from("audio_posts")
    .insert({
      author_id: input.userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category_id: input.categoryId || null,
      audio_path: path,
      duration_seconds: input.durationSeconds ?? null,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(AUDIO_POSTS_BUCKET).remove([path]);
    throw error;
  }
  return data;
}

export async function updateOwnAudioPost(
  id: string,
  userId: string,
  patch: {
    title?: string;
    description?: string | null;
    category_id?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("audio_posts")
    .update(patch)
    .eq("id", id)
    .eq("author_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOwnAudioPost(id: string, userId: string) {
  const { data, error } = await supabase
    .from("audio_posts")
    .delete()
    .eq("id", id)
    .eq("author_id", userId)
    .select("audio_path")
    .maybeSingle();
  if (error) throw error;
  if (!data)
    throw new Error(
      "No se encontró la publicación o no tienes permiso para eliminarla.",
    );

  const storageResult = await supabase.storage
    .from(AUDIO_POSTS_BUCKET)
    .remove([data.audio_path]);
  if (storageResult.error) {
    console.warn(
      "La publicación se eliminó, pero el archivo de audio no pudo borrarse.",
      storageResult.error,
    );
  }
}

export async function registerAudioPlay(id: string) {
  const { error } = await supabase.rpc("register_audio_play", {
    target_post_id: id,
  });
  if (error) throw error;
}

export async function getAuthorizedAudioUrl(path: string) {
  const { data, error } = await supabase.storage
    .from(AUDIO_POSTS_BUCKET)
    .createSignedUrl(path, 60 * 30);
  if (error) throw error;
  return data.signedUrl;
}
