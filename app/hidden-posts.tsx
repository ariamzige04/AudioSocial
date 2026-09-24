import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { AudioPostCard } from "@/components/AudioPostCard";
import { Body, Button, Screen, Title } from "@/components/ui";
import { listHiddenFeedPosts, restoreHiddenPost } from "@/services/audioPosts";
import { useSession } from "@/providers/SessionProvider";
import type { AudioPost } from "@/types/models";

export default function HiddenPostsScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<AudioPost[]>([]);
  const load = () =>
    session?.user.id
      ? listHiddenFeedPosts(session.user.id).then(setItems)
      : Promise.resolve();
  useEffect(() => {
    load();
  }, [session?.user.id]);
  return (
    <Screen>
      <Title>Contenido oculto</Title>
      <Body muted>
        Cuando ocultes una publicación, podrás administrarla desde aquí.
      </Body>
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => (
          <View style={{ gap: 6 }}>
            <AudioPostCard post={item} />
            <Button
              kind="ghost"
              title="Restaurar publicación"
              onPress={async () => {
                if (session?.user.id) {
                  await restoreHiddenPost(item.id, session.user.id);
                  load();
                }
              }}
            />
          </View>
        )}
        ListEmptyComponent={<Body muted>No tienes publicaciones ocultas.</Body>}
      />
    </Screen>
  );
}
