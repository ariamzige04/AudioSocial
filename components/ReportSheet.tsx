import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Button, Field, Body } from "./ui";
import { createReport } from "@/services/reports";
import { useSession } from "@/providers/SessionProvider";

export function ReportSheet({
  postId,
  profileId,
  commentId,
  onDone,
}: {
  postId?: string;
  profileId?: string;
  commentId?: string;
  onDone?: () => void;
}) {
  const { session } = useSession();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  return (
    <View style={{ gap: 10 }}>
      <Body>¿Qué sucede?</Body>
      <Field value={reason} onChangeText={setReason} placeholder="Motivo" />
      <Field
        value={details}
        onChangeText={setDetails}
        placeholder="Detalles (opcional)"
        multiline
      />
      <Button
        title="Enviar reporte"
        onPress={async () => {
          if (!session?.user.id || !reason.trim()) return;
          try {
            await createReport({
              reporter_id: session.user.id,
              reported_profile_id: profileId,
              post_id: postId,
              comment_id: commentId,
              reason,
              details,
            });
            Alert.alert(
              "Reporte enviado",
              "Tu reporte quedó en la cola privada de moderación.",
            );
            onDone?.();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        }}
      />
    </View>
  );
}
