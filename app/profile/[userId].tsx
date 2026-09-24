import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AudioPostCard } from "@/components/AudioPostCard";
import { ProfileSummaryCard } from "@/components/ProfileSummaryCard";
import { Body, Button, Loading, Screen, Title } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";
import {
  getProfile,
  isProfileFollowed,
  listProfileFeedPosts,
  setProfileFollowed,
} from "@/services/profiles";
import type { AudioPost, Profile } from "@/types/models";

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<AudioPost[]>([]);
  const [followed, setFollowed] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const [profileData, postData] = await Promise.all([
      getProfile(userId),
      listProfileFeedPosts(userId, session?.user.id),
    ]);
    setProfile(profileData);
    setPosts(postData);
    if (session?.user.id && session.user.id !== userId) {
      setFollowed(await isProfileFollowed(userId, session.user.id));
    }
  }, [userId, session?.user.id]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  if (!profile) return <Loading label="Cargando…" />;

  return (
    <Screen>
      <Title>Perfil público</Title>
      <ProfileSummaryCard profile={profile} />
      {session?.user.id && session.user.id !== profile.id ? (
        <View style={{ alignItems: "flex-start" }}>
          <Button
            kind="ghost"
            title={followed ? "Dejar de seguir" : "Seguir"}
            onPress={async () => {
              const next = !followed;
              await setProfileFollowed(profile.id, session.user.id, next);
              setFollowed(next);
              load().catch(() => {});
            }}
          />
        </View>
      ) : null}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AudioPostCard post={item} />}
        ListEmptyComponent={<Body muted>Esta voz aún no ha publicado</Body>}
      />
    </Screen>
  );
}
