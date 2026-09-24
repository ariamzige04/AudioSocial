import React from "react";
import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";

export default function IndexScreen() {
  const { session, loading } = useSession();
  if (loading) return <Loading label="Preparando tu espacio de escucha…" />;
  return <Redirect href={session ? "/(tabs)" : "/(auth)/sign-in"} />;
}
