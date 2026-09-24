import React, { useRef, useState } from "react";
import { Alert, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Body, Button } from "./ui";
import {
  getAuthorizedAudioUrl,
  registerAudioPlay,
} from "@/services/audioPosts";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
}

export function AudioPostPlayer({
  postId,
  audioPath,
  onPlayRegistered,
}: {
  postId: string;
  audioPath: string;
  onPlayRegistered?: () => void;
}) {
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const [loading, setLoading] = useState(false);
  const [sourceReady, setSourceReady] = useState(false);
  const playRegistered = useRef(false);

  const ensureSource = async () => {
    if (sourceReady) return true;
    setLoading(true);
    try {
      const url = await getAuthorizedAudioUrl(audioPath);
      player.replace(url);
      setSourceReady(true);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible preparar el audio.";
      Alert.alert("Reproducción", message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    if (status.playing) {
      player.pause();
      return;
    }

    const ready = await ensureSource();
    if (!ready) return;

    if (status.duration > 0 && status.currentTime >= status.duration - 0.25) {
      await player.seekTo(0);
    }

    player.play();

    if (!playRegistered.current) {
      playRegistered.current = true;
      registerAudioPlay(postId)
        .then(() => onPlayRegistered?.())
        .catch(() => {
          // El audio debe seguir reproduciéndose aunque el contador no esté disponible.
        });
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Button
        title={
          loading
            ? "Preparando audio…"
            : status.playing
              ? "Pausar audio"
              : "Reproducir audio"
        }
        onPress={toggle}
        disabled={loading}
      />
      <Body muted>
        {formatTime(status.currentTime)} / {formatTime(status.duration)}
      </Body>
    </View>
  );
}
