import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Button } from "./ui";
import { useSession } from "@/providers/SessionProvider";
import {
  getViewerPostState,
  setPostLiked,
  setPostSaved,
} from "@/services/audioPosts";

export function AudioPostActions({
  postId,
  onChanged,
}: {
  postId: string;
  onChanged?: () => void;
}) {
  const { session } = useSession();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session?.user.id) return;
    getViewerPostState(postId, session.user.id)
      .then((state) => {
        setLiked(state.liked);
        setSaved(state.saved);
      })
      .catch(() => {});
  }, [postId, session?.user.id]);

  const toggleLike = async () => {
    if (!session?.user.id || busy) return;
    const next = !liked;
    setBusy(true);
    try {
      await setPostLiked(postId, session.user.id, next);
      setLiked(next);
      onChanged?.();
    } catch (error) {
      Alert.alert(
        "Me gusta",
        error instanceof Error
          ? error.message
          : "No se pudo guardar el cambio.",
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleSaved = async () => {
    if (!session?.user.id || busy) return;
    const next = !saved;
    setBusy(true);
    try {
      await setPostSaved(postId, session.user.id, next);
      setSaved(next);
      onChanged?.();
    } catch (error) {
      Alert.alert(
        "Guardados",
        error instanceof Error
          ? error.message
          : "No se pudo guardar el cambio.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      <Button
        kind="ghost"
        title={liked ? "Quitar me gusta" : "Me gusta"}
        onPress={toggleLike}
        disabled={busy}
      />
      <Button
        kind="ghost"
        title={saved ? "Quitar de guardados" : "Guardar"}
        onPress={toggleSaved}
        disabled={busy}
      />
    </View>
  );
}
