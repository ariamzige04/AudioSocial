import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Profile } from "@/types/models";
import { ProfileAvatar } from "./ProfileAvatar";
import { colors } from "@/lib/theme";

export function ProfileSummaryCard({ profile }: { profile: Profile }) {
  return (
    <View style={s.card}>
      <ProfileAvatar
        uri={profile.avatar_url}
        name={profile.full_name || profile.username}
      />
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{profile.full_name || profile.username}</Text>
        <Text style={s.user}>@{profile.username}</Text>
        {profile.bio ? <Text style={s.bio}>{profile.bio}</Text> : null}
        <Text style={s.stats}>
          {profile.follower_count || 0} Seguidores ·{" "}
          {profile.following_count || 0} Siguiendo · {profile.post_count || 0}{" "}
          Audios
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  user: { color: colors.muted },
  bio: { marginTop: 6, color: colors.text },
  stats: { marginTop: 8, color: colors.muted, fontSize: 12 },
});
