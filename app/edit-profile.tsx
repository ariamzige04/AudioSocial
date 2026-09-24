import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { EditProfileForm } from "@/components/EditProfileForm";
import { Loading, Screen, Title } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";
import { getProfile } from "@/services/profiles";
import type { Profile } from "@/types/models";

export default function EditProfileScreen() {
  const { session } = useSession();
  const [p, setP] = useState<Profile | null>(null);
  useEffect(() => {
    if (session?.user.id) getProfile(session.user.id).then(setP);
  }, [session?.user.id]);
  if (!p) return <Loading label="Cargando…" />;
  return (
    <Screen>
      <Title>Editar perfil</Title>
      <EditProfileForm profile={p} onSaved={() => router.back()} />
    </Screen>
  );
}
