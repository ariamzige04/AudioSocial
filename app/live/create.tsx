import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { Body, Button, Field, Screen, Title } from "@/components/ui";
import { MINIMUM_LIVE_ROOM_PASS_PRICE_MXN } from "@/lib/constants";
import { useSession } from "@/providers/SessionProvider";
import { createLiveRoom } from "@/services/liveRooms";

export default function CreateLiveRoomScreen() {
  const { session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<"public" | "private" | "paid">("public");
  const [price, setPrice] = useState(String(MINIMUM_LIVE_ROOM_PASS_PRICE_MXN));
  const [busy, setBusy] = useState(false);

  return (
    <Screen>
      <Title>Preparar mi sala</Title>
      <Field
        placeholder="Título *"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      <Field
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={500}
      />
      <Body>
        ¿Quién podrá entrar?{" "}
        {access === "public"
          ? "Público"
          : access === "private"
            ? "Sólo por invitación"
            : "Con pase"}
      </Body>
      <Button
        kind="ghost"
        title="Sala pública gratuita"
        onPress={() => setAccess("public")}
      />
      <Button
        kind="ghost"
        title="Sala privada por invitación"
        onPress={() => setAccess("private")}
      />
      <Button
        kind="ghost"
        title="Sala con pase"
        onPress={() => setAccess("paid")}
      />
      {access === "paid" ? (
        <Field
          placeholder={`Precio mínimo $${MINIMUM_LIVE_ROOM_PASS_PRICE_MXN} MXN`}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />
      ) : null}
      <Button
        title={busy ? "Creando sala…" : "Crear sala"}
        disabled={busy}
        onPress={async () => {
          if (!session?.user.id) return;
          if (title.trim().length < 3)
            return Alert.alert(
              "Título",
              "El título debe tener al menos 3 caracteres.",
            );

          const numericPrice = Number(price.replace(",", "."));
          if (
            access === "paid" &&
            (!Number.isFinite(numericPrice) ||
              numericPrice < MINIMUM_LIVE_ROOM_PASS_PRICE_MXN)
          ) {
            return Alert.alert(
              "Precio",
              `El pase debe costar al menos $${MINIMUM_LIVE_ROOM_PASS_PRICE_MXN} MXN.`,
            );
          }

          setBusy(true);
          try {
            const room = await createLiveRoom({
              host_id: session.user.id,
              title: title.trim(),
              description: description.trim() || null,
              access_type: access,
              speaking_mode: "request",
              status: "scheduled",
              currency: "MXN",
              price_amount: access === "paid" ? numericPrice : null,
            });
            router.replace(`/live/${room.id}`);
          } catch (error) {
            Alert.alert(
              "No pudimos crear la sala.",
              error instanceof Error ? error.message : "Error desconocido.",
            );
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}
