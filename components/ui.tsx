import React from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "@/lib/theme";

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[s.screen, style]}>{children}</View>;
}
export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={s.title}>{children}</Text>;
}
export function Body({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return <Text style={[s.body, muted && s.muted]}>{children}</Text>;
}
export function Field(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[s.field, props.style]}
    />
  );
}
export function Button({
  title,
  onPress,
  disabled = false,
  kind = "primary",
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  kind?: "primary" | "ghost" | "danger";
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        s.button,
        kind === "ghost" && s.ghost,
        kind === "danger" && s.danger,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}
export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <View style={s.center}>
      <ActivityIndicator />
      <Body muted>{label}</Body>
    </View>
  );
}
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 18, gap: 12 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  body: { fontSize: 16, color: colors.text },
  muted: { color: colors.muted },
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  ghost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { backgroundColor: "#FFF1EE" },
  buttonText: { fontWeight: "800", color: colors.text },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
});
