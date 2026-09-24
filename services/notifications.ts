import { supabase } from "@/lib/supabase";

import type { NotificationItem } from "@/types/models";

const SELECT = `id,recipient_id,actor_id,kind,post_id,comment_id,created_at,read_at,actor:profiles!notifications_actor_id_fkey(id,full_name,username,avatar_url),post:audio_posts!notifications_post_id_fkey(id,title)`;

export async function listNotificationsPage(
  userId: string,
  from = 0,
  to = 39,
): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select(SELECT)
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return (data ?? []) as unknown as NotificationItem[];
}
export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", userId)
    .is("read_at", null);
  if (error) throw error;
}
