import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { AudioPostCard } from "@/components/AudioPostCard";
import { Body, Field, Screen, Title } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";
import { searchExplorePosts } from "@/services/audioPosts";
import type { AudioPost } from "@/types/models";

export default function ExploreScreen() {
  const { session } = useSession();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AudioPost[]>([]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      searchExplorePosts(query, session?.user.id)
        .then((results) => {
          if (active) setItems(results);
        })
        .catch(() => {
          if (active) setItems([]);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, session?.user.id]);

  return (
    <Screen>
      <Title>Encuentra tu próxima escucha</Title>
      <Field
        placeholder="Título, username o categoría"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AudioPostCard post={item} />}
        ListEmptyComponent={
          <Body muted>Prueba con otro título, username o categoría.</Body>
        }
      />
    </Screen>
  );
}
