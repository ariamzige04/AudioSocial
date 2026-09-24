import React, { useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, Field, Screen, Title } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Screen>
      <Title>AudioSocial</Title>
      <Body muted>Escribe tu correo y contraseña.</Body>
      <Field
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Field
        placeholder="Tu contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Iniciar sesión"
        onPress={async () => {
          const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error)
            Alert.alert(
              "No pudimos completar la autenticación.",
              "El correo o la contraseña no son correctos.",
            );
          else router.replace("/(tabs)");
        }}
      />
      <Button
        kind="ghost"
        title="¿Olvidaste tu contraseña?"
        onPress={() => router.push("/(auth)/forgot-password")}
      />
      <Button
        kind="ghost"
        title="¿Aún no tienes cuenta? Crear cuenta"
        onPress={() => router.push("/(auth)/sign-up")}
      />
    </Screen>
  );
}
