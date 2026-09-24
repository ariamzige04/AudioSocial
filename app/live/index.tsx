import React, { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LiveRoomCard } from "@/components/LiveRoomCard";
import { Body, Button, Screen, Title } from "@/components/ui";
import { listVisibleLiveRooms } from "@/services/liveRooms";
import type { LiveRoom } from "@/types/models";

export default function LiveDirectoryScreen() {
  const [items, setItems] = useState<LiveRoom[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      listVisibleLiveRooms()
        .then((rooms) => {
          if (active) setItems(rooms);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <Screen>
      <Title>Conversaciones en vivo</Title>
      <Body muted>
        Abre una sala pública, privada o con pase y reúne a tu comunidad para
        conversar sin cámaras.
      </Body>
      <Button
        title="Preparar mi sala"
        onPress={() => router.push("/live/create")}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LiveRoomCard room={item} />}
        ListEmptyComponent={
          <Body muted>Todavía no hay conversaciones activas.</Body>
        }
      />
    </Screen>
  );
}
