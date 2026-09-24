import React, { useState } from "react";
import { Alert } from "react-native";
import { Body, Button, Field, Screen, Title } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  return (
    <Screen>
      <Title>Recuperar contraseña</Title>
      <Body muted>
        Te enviaremos un enlace seguro para elegir una contraseña nueva.
      </Body>
      <Field
        value={email}
        onChangeText={setEmail}
        placeholder="Correo"
        autoCapitalize="none"
      />
      <Button
        title="Enviar enlace"
        onPress={async () => {
          const { error } = await supabase.auth.resetPasswordForEmail(
            email.trim(),
            { redirectTo: "audiosocial://update-password" },
          );
          Alert.alert(
            error ? "Error" : "Revisa tu correo",
            error?.message ||
              "Si existe una cuenta con ese correo, recibirás un enlace para crear una nueva contraseña.",
          );
        }}
      />
    </Screen>
  );
}
