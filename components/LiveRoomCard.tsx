import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import type { LiveRoom } from "@/types/models";
import { colors } from "@/lib/theme";

export function LiveRoomCard({ room }: { room: LiveRoom }) {
  return (
    <Pressable style={s.card} onPress={() => router.push(`/live/${room.id}`)}>
      <Text style={s.eyebrow}>
        {room.status === "live" ? "EN VIVO" : "PRÓXIMA SALA"}
      </Text>
      <Text style={s.title}>{room.title}</Text>
      <Text>
        @{room.host?.username || "anfitrión"} · {room.participant_count || 0}{" "}
        participantes
      </Text>
      <Text style={s.meta}>
        {room.access_type === "paid"
          ? `Pase · $${room.price_amount || 0} ${room.currency || "MXN"}`
          : room.access_type === "private"
            ? "Sólo por invitación"
            : "Sala pública gratuita"}
      </Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 5,
  },
  eyebrow: { fontSize: 12, fontWeight: "900", color: colors.primaryDark },
  title: { fontSize: 19, fontWeight: "800", color: colors.text },
  meta: { color: colors.muted },
});
