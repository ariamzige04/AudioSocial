import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function ProfileAvatar({
  uri,
  name,
  size = 64,
}: {
  uri?: string | null;
  name?: string | null;
  size?: number;
}) {
  if (uri)
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  return (
    <View style={[s.f, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.36, fontWeight: "800" }}>
        {(name || "?").slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}
const s = StyleSheet.create({
  f: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
