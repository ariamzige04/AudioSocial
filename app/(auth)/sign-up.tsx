import React, { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { Body, Button, Field, Screen, Title } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Screen>
      <Title>Crea tu identidad de audio</Title>
      <Body muted>Podrás cambiar tu foto y biografía más adelante.</Body>
      <Field
        placeholder="Nombre"
        value={fullName}
        onChangeText={setFullName}
        maxLength={80}
      />
      <Field
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        maxLength={24}
      />
      <Field
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Field
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={busy ? "Creando cuenta…" : "Crear cuenta"}
        disabled={busy}
        onPress={async () => {
          const normalizedUsername = username.trim().toLowerCase();
          if (!/^[a-z0-9._]{3,24}$/.test(normalizedUsername)) {
            Alert.alert(
              "Username",
              "Usa 3–24 caracteres: letras, números, punto o guion bajo.",
            );
            return;
          }
          if (!email.trim().includes("@"))
            return Alert.alert("Correo", "Escribe un correo válido.");
          if (password.length < 8)
            return Alert.alert(
              "Contraseña",
              "La contraseña debe tener al menos 8 caracteres.",
            );

          setBusy(true);
          try {
            const { error } = await supabase.auth.signUp({
              email: email.trim().toLowerCase(),
              password,
              options: {
                data: {
                  full_name: fullName.trim(),
                  username: normalizedUsername,
                },
              },
            });
            if (error) throw error;
            Alert.alert(
              "Revisa tu correo",
              "Te enviamos un enlace de confirmación.",
            );
            router.replace("/(auth)/sign-in");
          } catch (error) {
            Alert.alert(
              "Error",
              error instanceof Error
                ? error.message
                : "No se pudo crear la cuenta.",
            );
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}
