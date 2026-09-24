import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { Button, Field } from "./ui";
import { createComment, listComments } from "@/services/comments";
import { useSession } from "@/providers/SessionProvider";
import type { Comment } from "@/types/models";

export function CommentsSheet({
  postId,
  onChanged,
}: {
  postId: string;
  onChanged?: () => void;
}) {
  const { session } = useSession();
  const [items, setItems] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = () =>
    listComments(postId)
      .then(setItems)
      .catch(() => {});
  useEffect(() => {
    load();
  }, [postId]);

  return (
    <View style={{ gap: 10 }}>
      {items.length ? (
        items.map((item) => (
          <Text key={item.id}>
            <Text style={{ fontWeight: "800" }}>
              @{item.author?.username || "usuario"}{" "}
            </Text>
            {item.body}
          </Text>
        ))
      ) : (
        <Text>Sé la primera persona en comentar este audio.</Text>
      )}
      <Field
        value={body}
        onChangeText={setBody}
        placeholder="Escribe un comentario…"
        maxLength={1000}
      />
      <Button
        title={sending ? "Enviando…" : "Enviar"}
        disabled={sending || !body.trim()}
        onPress={async () => {
          if (!session?.user.id || !body.trim()) return;
          setSending(true);
          try {
            await createComment(postId, session.user.id, body);
            setBody("");
            await load();
            onChanged?.();
          } catch (error) {
            Alert.alert(
              "Comentario",
              error instanceof Error
                ? error.message
                : "No se pudo publicar el comentario.",
            );
          } finally {
            setSending(false);
          }
        }}
      />
    </View>
  );
}
