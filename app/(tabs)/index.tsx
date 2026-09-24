import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { AudioPostCard } from "@/components/AudioPostCard";
import { Body, Loading, Screen, Title } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";
import { listFeedPosts } from "@/services/audioPosts";
import type { AudioPost } from "@/types/models";

export default function HomeScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<AudioPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      try {
        setItems(await listFeedPosts(session?.user.id));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session?.user.id],
  );

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  if (loading) return <Loading label="Preparando tu feed…" />;

  return (
    <Screen>
      <Title>Inicio</Title>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AudioPostCard post={item} />}
        ItemSeparatorComponent={() => <Body> </Body>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
          />
        }
        ListEmptyComponent={<Body muted>Tu feed está esperando voces</Body>}
      />
    </Screen>
  );
}
