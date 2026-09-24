import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import type { AudioPost } from "@/types/models";
import { colors } from "@/lib/theme";

export function AudioPostCard({ post }: { post: AudioPost }) {
  return (
    <Pressable style={s.card} onPress={() => router.push(`/post/${post.id}`)}>
      <View style={s.row}>
        <Text style={s.emoji}>{post.category?.emoji || "🎙️"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{post.title}</Text>
          <Text style={s.meta}>
            @{post.author?.username || "usuario"} ·{" "}
            {post.category?.name || "General"}
          </Text>
        </View>
      </View>
      {post.description ? <Text style={s.desc}>{post.description}</Text> : null}
      <Text style={s.stats}>
        ▶ {post.play_count || 0} ❤️ {post.like_count || 0} 💬{" "}
        {post.comment_count || 0}
      </Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  row: { flexDirection: "row", gap: 12 },
  emoji: { fontSize: 28 },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  meta: { color: colors.muted, marginTop: 2 },
  desc: { color: colors.text, lineHeight: 21 },
  stats: { color: colors.muted },
});
