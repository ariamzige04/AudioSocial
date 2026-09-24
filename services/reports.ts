import { supabase } from "@/lib/supabase";

import type { Report } from "@/types/models";

const SELECT = `id,reporter_id,reported_profile_id,post_id,comment_id,reason,details,status,resolution_note,reviewed_at,created_at,updated_at,reportedProfile:profiles!reports_reported_profile_id_fkey(id,full_name,username),post:audio_posts!reports_post_id_fkey(id,title),comment:comments!reports_comment_id_fkey(id,body,post_id)`;

export async function createReport(input: {
  reporter_id: string;
  reported_profile_id?: string | null;
  post_id?: string | null;
  comment_id?: string | null;
  reason: string;
  details?: string | null;
}) {
  const { data, error } = await supabase
    .from("reports")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function listViewerReportsPage(
  userId: string,
  from = 0,
  to = 29,
): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select(SELECT)
    .eq("reporter_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return (data ?? []) as unknown as Report[];
}
