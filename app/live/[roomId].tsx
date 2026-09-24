import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Body, Button, Field, Loading, Screen, Title } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";
import {
  getLiveKitConnection,
  getLiveRoom,
  inviteLiveRoomUser,
  joinLiveRoomByAccess,
  leaveLiveRoom,
  updateLiveRoomStatus,
} from "@/services/liveRooms";
import type { LiveRoom } from "@/types/models";

type Connection = { token: string; serverUrl: string };

export default function LiveRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { session } = useSession();
  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [joined, setJoined] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!roomId) return;
    const nextRoom = await getLiveRoom(roomId);
    setRoom(nextRoom);

    if (nextRoom?.status === "live") {
      getLiveKitConnection(roomId)
        .then((value) =>
          setConnection({
            token: value.token,
            serverUrl: value.serverUrl ?? value.url ?? "",
          }),
        )
        .catch(() => setConnection(null));
    } else {
      setConnection(null);
    }
  }, [roomId]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  if (!room) return <Loading label="Preparando el escenario…" />;

  const isHost = room.host_id === session?.user.id;

  return (
    <Screen>
      <Title>{room.title}</Title>
      <Body muted>
        @{room.host?.username ?? "anfitrión"} · {room.access_type} ·{" "}
        {room.status}
      </Body>
      {room.description ? <Body>{room.description}</Body> : null}

      {isHost && room.status === "scheduled" ? (
        <Button
          title="Iniciar sala"
          disabled={busy}
          onPress={async () => {
            if (!session?.user.id) return;
            setBusy(true);
            try {
              await updateLiveRoomStatus(room.id, session.user.id, "live");
              await joinLiveRoomByAccess(room);
              await load();
            } catch (error) {
              Alert.alert(
                "Sala",
                error instanceof Error
                  ? error.message
                  : "No se pudo iniciar la sala.",
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {isHost && room.status === "live" ? (
        <Button
          kind="danger"
          title="Finalizar sala"
          disabled={busy}
          onPress={async () => {
            if (!session?.user.id) return;
            setBusy(true);
            try {
              await updateLiveRoomStatus(room.id, session.user.id, "ended");
              await leaveLiveRoom(room.id).catch(() => {});
              await load();
            } catch (error) {
              Alert.alert(
                "Sala",
                error instanceof Error
                  ? error.message
                  : "No se pudo finalizar la sala.",
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {!isHost && room.status === "live" && !joined ? (
        <Button
          title={
            room.access_type === "paid"
              ? `Entrar con pase · $${room.price_amount ?? 0} ${room.currency ?? "MXN"}`
              : "Entrar a la sala"
          }
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await joinLiveRoomByAccess(room);
              setJoined(true);
              await load();
            } catch (error) {
              const fallback =
                room.access_type === "private"
                  ? "Esta sala requiere una invitación."
                  : room.access_type === "paid"
                    ? "Esta sala requiere un pase activo. El flujo de pago todavía no está integrado."
                    : "No se pudo entrar a la sala.";
              Alert.alert(
                "Acceso a sala",
                error instanceof Error ? error.message : fallback,
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {!isHost && joined ? (
        <Button
          kind="ghost"
          title="Salir de la sala"
          onPress={async () => {
            await leaveLiveRoom(room.id);
            setJoined(false);
            await load();
          }}
        />
      ) : null}

      {isHost && room.access_type === "private" ? (
        <View style={{ gap: 8 }}>
          <Field
            placeholder="Username a invitar"
            value={inviteUsername}
            onChangeText={setInviteUsername}
            autoCapitalize="none"
          />
          <Button
            kind="ghost"
            title="Enviar invitación"
            disabled={!inviteUsername.trim() || busy}
            onPress={async () => {
              setBusy(true);
              try {
                await inviteLiveRoomUser(room.id, inviteUsername);
                setInviteUsername("");
                Alert.alert("Invitación", "La invitación quedó registrada.");
              } catch (error) {
                Alert.alert(
                  "Invitación",
                  error instanceof Error
                    ? error.message
                    : "No se pudo enviar la invitación.",
                );
              } finally {
                setBusy(false);
              }
            }}
          />
        </View>
      ) : null}

      <Body>
        {connection?.serverUrl
          ? "La sala tiene un servidor LiveKit configurado, pero el cliente de audio nativo todavía no está activado en esta versión."
          : "El audio en vivo nativo está desactivado para permitir el arranque con Expo Go."}
      </Body>
      <Body muted>
        Para audio real se requiere LiveKit y un development build. Las salas
        pagadas además necesitan integración de pagos.
      </Body>
    </Screen>
  );
}
