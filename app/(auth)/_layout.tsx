import React from "react";
import { Stack } from "expo-router";
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#FFFDF6" },
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: "Iniciar sesión" }} />
      <Stack.Screen name="sign-up" options={{ title: "Crear cuenta" }} />
      <Stack.Screen
        name="forgot-password"
        options={{ title: "Recuperar contraseña" }}
      />
    </Stack>
  );
}
