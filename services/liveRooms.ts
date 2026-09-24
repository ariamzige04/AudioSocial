import { supabase } from "@/lib/supabase";
import type { LiveRoom } from "@/types/models";

const SELECT = `id,host_id,title,description,access_type,speaking_mode,status,price_amount,currency,scheduled_for,started_at,participant_count,created_at,host:profiles!live_rooms_host_id_fkey(id,full_name,username,avatar_url),category:categories!live_rooms_category_id_fkey(id,name,slug,emoji,color)`;

export async function listVisibleLiveRooms(): Promise<LiveRoom[]> {
  const { data, error } = await supabase
    .from("live_rooms")
    .select(SELECT)
    .in("status", ["scheduled", "live"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as LiveRoom[];
}

export async function getLiveRoom(id: string): Promise<LiveRoom | null> {
  const { data, error } = await supabase
    .from("live_rooms")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as LiveRoom | null;
}

export async function createLiveRoom(input: {
  host_id: string;
  title: string;
  description?: string | null;
  access_type: "public" | "private" | "paid";
  speaking_mode: "host_only" | "open" | "request";
  status: "scheduled" | "live";
  currency?: string;
  price_amount?: number | null;
}) {
  const { data, error } = await supabase
    .from("live_rooms")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLiveRoomStatus(
  roomId: string,
  hostId: string,
  status: "live" | "ended" | "cancelled",
) {
  const patch =
    status === "live"
      ? { status, started_at: new Date().toISOString() }
      : { status };
  const { data, error } = await supabase
    .from("live_rooms")
    .update(patch)
    .eq("id", roomId)
    .eq("host_id", hostId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLiveKitConnection(roomId: string) {
  const { data, error } = await supabase.functions.invoke("livekit-token", {
    body: { room_id: roomId },
  });
  if (error) throw error;
  return data as { token: string; url?: string; serverUrl?: string };
}

export async function joinPublicLiveRoom(roomId: string) {
  const { data, error } = await supabase.rpc("join_public_live_room", {
    target_room_id: roomId,
  });
  if (error) throw error;
  return data;
}

export async function joinPrivateLiveRoom(roomId: string) {
  const { data, error } = await supabase.rpc("join_private_live_room", {
    target_room_id: roomId,
  });
  if (error) throw error;
  return data;
}

export async function joinPaidLiveRoom(roomId: string) {
  const { data, error } = await supabase.rpc("join_paid_live_room", {
    target_room_id: roomId,
  });
  if (error) throw error;
  return data;
}

export async function joinLiveRoomByAccess(
  room: Pick<LiveRoom, "id" | "access_type">,
) {
  if (room.access_type === "private") return joinPrivateLiveRoom(room.id);
  if (room.access_type === "paid") return joinPaidLiveRoom(room.id);
  return joinPublicLiveRoom(room.id);
}

export async function leaveLiveRoom(roomId: string) {
  const { data, error } = await supabase.rpc("leave_live_room", {
    target_room_id: roomId,
  });
  if (error) throw error;
  return data;
}

export async function inviteLiveRoomUser(roomId: string, username: string) {
  const { data, error } = await supabase.rpc("invite_user_to_live_room", {
    target_room_id: roomId,
    target_username: username.trim().toLowerCase(),
  });
  if (error) throw error;
  return data;
}
