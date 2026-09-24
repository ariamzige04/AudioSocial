import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Body, Button, Field } from "./ui";
import { listCategories } from "@/services/categories";
import { createAudioPost } from "@/services/audioPosts";
import { useSession } from "@/providers/SessionProvider";
import type { Category } from "@/types/models";

export function AudioPublicationForm({
  uri,
  durationSeconds,
  onPublished,
}: {
  uri: string;
  durationSeconds?: number;
  onPublished?: () => void;
}) {
  const { session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>();
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <View style={{ gap: 10 }}>
      <Body>DATOS DE PUBLICACIÓN</Body>
      {durationSeconds ? (
        <Body muted>Duración: {durationSeconds} s</Body>
      ) : null}
      <Field
        placeholder="Título *"
        value={title}
        onChangeText={setTitle}
        maxLength={120}
      />
      <Field
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={1000}
      />
      <Body muted>
        Categoría:{" "}
        {categories.find((item) => item.id === categoryId)?.name || "General"}
      </Body>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {categories.slice(0, 8).map((category) => (
          <Button
            key={category.id}
            kind="ghost"
            title={`${category.emoji || "✨"} ${category.name}`}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </View>
      <Button
        title={publishing ? "Publicando…" : "Publicar audio"}
        disabled={publishing}
        onPress={async () => {
          if (!session?.user.id) return;
          if (title.trim().length < 3) {
            Alert.alert(
              "Revisa el título",
              "El título debe tener al menos 3 caracteres.",
            );
            return;
          }
          setPublishing(true);
          try {
            await createAudioPost({
              userId: session.user.id,
              uri,
              title,
              description,
              categoryId,
              durationSeconds,
            });
            Alert.alert("Listo", "Tu audio fue publicado.");
            onPublished?.();
          } catch (error) {
            Alert.alert(
              "No pudimos completar la publicación.",
              error instanceof Error ? error.message : "Error desconocido.",
            );
          } finally {
            setPublishing(false);
          }
        }}
      />
    </View>
  );
}
