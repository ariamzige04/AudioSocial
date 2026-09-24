import React, { useState } from "react";
import { Alert } from "react-native";
import { Body, Button, Field, Screen, Title } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordScreen() {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  return (
    <Screen>
      <Title>Crea una contraseña nueva</Title>
      <Body muted>
        El enlace de recuperación valida tu sesión antes de permitir el cambio.
      </Body>
      <Field
        placeholder="Nueva contraseña"
        value={p1}
        onChangeText={setP1}
        secureTextEntry
      />
      <Field
        placeholder="Repite tu contraseña"
        value={p2}
        onChangeText={setP2}
        secureTextEntry
      />
      <Button
        title="Guardar contraseña"
        onPress={async () => {
          if (p1.length < 8)
            return Alert.alert("Contraseña", "Mínimo 8 caracteres");
          if (p1 !== p2)
            return Alert.alert("Contraseña", "Las contraseñas no coinciden.");
          const { error } = await supabase.auth.updateUser({ password: p1 });
          Alert.alert(
            error ? "Error" : "Listo",
            error?.message || "Contraseña actualizada",
          );
        }}
      />
    </Screen>
  );
}
