import React, { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { useFocusEffect } from "expo-router";
import { AudioPostCard } from "@/components/AudioPostCard";
import { Body, Screen, Title } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";
import { listSavedFeedPosts } from "@/services/audioPosts";
import type { AudioPost } from "@/types/models";

export default function SavedScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<AudioPost[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!session?.user.id) return;
      let active = true;
      listSavedFeedPosts(session.user.id)
        .then((results) => {
          if (active) setItems(results);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [session?.user.id]),
  );

  return (
    <Screen>
      <Title>Guardados</Title>
      <Body muted>Nadie más puede consultar qué audios guardas.</Body>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AudioPostCard post={item} />}
        ListEmptyComponent={<Body muted>Aún no guardas audios</Body>}
      />
    </Screen>
  );
}
