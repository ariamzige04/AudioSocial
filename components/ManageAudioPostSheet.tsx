import React from "react";
import { Alert, View } from "react-native";
import { Button } from "./ui";
import { deleteOwnAudioPost, hidePost } from "@/services/audioPosts";
import { useSession } from "@/providers/SessionProvider";

export function ManageAudioPostSheet({
  postId,
  owned = false,
  onDone,
}: {
  postId: string;
  owned?: boolean;
  onDone?: () => void;
}) {
  const { session } = useSession();

  return (
    <View style={{ gap: 8 }}>
      <Button
        kind="ghost"
        title="Ocultar para mí"
        onPress={async () => {
          if (session?.user.id) {
            await hidePost(postId, session.user.id);
            onDone?.();
          }
        }}
      />
      {owned ? (
        <Button
          kind="danger"
          title="Eliminar publicación"
          onPress={() =>
            Alert.alert(
              "¿Eliminar publicación?",
              "Esta acción es permanente. También se eliminarán sus likes, comentarios, guardados y reportes asociados.",
              [
                { text: "Cancelar" },
                {
                  text: "Eliminar",
                  style: "destructive",
                  onPress: async () => {
                    if (!session?.user.id) return;
                    await deleteOwnAudioPost(postId, session.user.id);
                    onDone?.();
                  },
                },
              ],
            )
          }
        />
      ) : null}
    </View>
  );
}
