import { supabase } from "@/lib/supabase";

import type { Comment } from "@/types/models";

const SELECT = `id,post_id,user_id,body,created_at,updated_at,author:profiles!comments_user_id_fkey(id,full_name,username,avatar_url)`;

export async function listComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(SELECT)
    .eq("post_id", postId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as unknown as Comment[];
}
export async function createComment(
  postId: string,
  userId: string,
  body: string,
) {
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: userId, body: body.trim() })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}
export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}
