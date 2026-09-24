import React, { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { AudioPostCard } from "@/components/AudioPostCard";
import { ProfileSummaryCard } from "@/components/ProfileSummaryCard";
import { Body, Button, Screen, Title } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";
import { getProfile, listProfileFeedPosts } from "@/services/profiles";
import type { AudioPost, Profile } from "@/types/models";

export default function ProfileScreen() {
  const { session, signOut } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<AudioPost[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!session?.user.id) return;
      let active = true;
      Promise.all([
        getProfile(session.user.id),
        listProfileFeedPosts(session.user.id, session.user.id),
      ])
        .then(([profileData, postData]) => {
          if (!active) return;
          setProfile(profileData);
          setPosts(postData);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [session?.user.id]),
  );

  return (
    <Screen>
      <Title>Perfil</Title>
      {profile ? (
        <ProfileSummaryCard profile={profile} />
      ) : (
        <Body muted>No pudimos cargar el perfil.</Body>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button
          kind="ghost"
          title="Editar perfil"
          onPress={() => router.push("/edit-profile")}
        />
        <Button
          kind="ghost"
          title="Contenido oculto"
          onPress={() => router.push("/hidden-posts")}
        />
        <Button
          kind="ghost"
          title="Mis reportes"
          onPress={() => router.push("/report-history")}
        />
        <Button
          kind="ghost"
          title="Salas en vivo"
          onPress={() => router.push("/live")}
        />
        <Button kind="ghost" title="Cerrar sesión" onPress={signOut} />
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AudioPostCard post={item} />}
        ListEmptyComponent={<Body muted>Todavía no has publicado</Body>}
      />
    </Screen>
  );
}
