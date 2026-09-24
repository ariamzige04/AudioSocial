import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Button, Field } from "./ui";
import type { Profile } from "@/types/models";
import { isUsernameAvailable, saveProfile } from "@/services/profiles";

export function EditProfileForm({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved?: (profile: any) => void;
}) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || "");
  const [saving, setSaving] = useState(false);

  return (
    <View style={{ gap: 10 }}>
      <Field
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nombre"
        maxLength={80}
      />
      <Field
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        autoCapitalize="none"
        maxLength={24}
      />
      <Field
        value={bio}
        onChangeText={setBio}
        placeholder="Biografía"
        multiline
        maxLength={240}
      />
      <Button
        title={saving ? "Guardando…" : "Guardar cambios"}
        disabled={saving}
        onPress={async () => {
          const normalizedUsername = username.trim().toLowerCase();
          if (!/^[a-z0-9._]{3,24}$/.test(normalizedUsername)) {
            Alert.alert(
              "Revisa el username",
              "El username debe tener 3–24 caracteres: letras, números, punto o guion bajo.",
            );
            return;
          }
          setSaving(true);
          try {
            if (!(await isUsernameAvailable(normalizedUsername, profile.id))) {
              Alert.alert(
                "Username no disponible",
                "Elige otro nombre de usuario.",
              );
              return;
            }
            const updated = await saveProfile(profile.id, {
              full_name: fullName.trim() || null,
              username: normalizedUsername,
              bio: bio.trim() || null,
            });
            onSaved?.(updated);
          } catch (error) {
            Alert.alert(
              "No pudimos actualizar tu perfil.",
              error instanceof Error ? error.message : "Error desconocido.",
            );
          } finally {
            setSaving(false);
          }
        }}
      />
    </View>
  );
}
