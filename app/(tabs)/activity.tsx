import { useCallback, useState } from "react";
import { FlatList, Pressable, Text } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button, Screen, Title } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";
import {
  listNotificationsPage,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications";
import type { NotificationItem } from "@/types/models";

function notificationText(kind: string) {
  if (kind === "like") return "le gustó uno de tus audios.";
  if (kind === "comment") return "comentó uno de tus audios.";
  if (kind === "follow") return "comenzó a seguirte.";
  return "interactuó con tu contenido.";
}

export default function ActivityScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<NotificationItem[]>([]);

  const load = useCallback(async () => {
    if (!session?.user.id) return;
    try {
      setItems(await listNotificationsPage(session.user.id));
    } catch {
      setItems([]);
    }
  }, [session?.user.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen>
      <Title>Actividad</Title>
      <Button
        kind="ghost"
        title="Marcar leídas"
        onPress={async () => {
          if (!session?.user.id) return;
          await markAllNotificationsRead(session.user.id);
          await load();
        }}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={async () => {
              if (!item.read_at)
                await markNotificationRead(item.id).catch(() => {});
              if (item.post_id) router.push(`/post/${item.post_id}`);
              else if (item.actor_id) router.push(`/profile/${item.actor_id}`);
              await load();
            }}
            style={{ paddingVertical: 10, opacity: item.read_at ? 0.65 : 1 }}
          >
            <Text>
              <Text style={{ fontWeight: "800" }}>
                @{item.actor?.username || "usuario"}{" "}
              </Text>
              {notificationText(item.kind)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text>
            Los likes, comentarios y nuevos seguidores aparecerán aquí.
          </Text>
        }
      />
    </Screen>
  );
}
