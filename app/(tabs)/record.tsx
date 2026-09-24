import { useState } from "react";
import { Alert, View } from "react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { AudioPublicationForm } from "@/components/AudioPublicationForm";
import { Body, Button, Screen, Title } from "@/components/ui";

export default function RecordScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [uri, setUri] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>();

  const startRecording = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitas permitir el acceso al micrófono para grabar audio.",
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      Alert.alert(
        "Grabación",
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la grabación.",
      );
    }
  };

  const stopRecording = async () => {
    try {
      const seconds = Math.max(
        1,
        Math.round(recorderState.durationMillis / 1000),
      );
      await recorder.stop();
      setDurationSeconds(seconds);
      setUri(recorder.uri ?? null);
      await setAudioModeAsync({ allowsRecording: false });
    } catch (error) {
      Alert.alert(
        "Grabación",
        error instanceof Error
          ? error.message
          : "No se pudo detener la grabación.",
      );
    }
  };

  return (
    <Screen>
      <Title>Tu historia empieza aquí</Title>
      <Body muted>
        AudioSocial solo usa el micrófono mientras tú decides grabar.
      </Body>

      {!uri ? (
        <View style={{ gap: 10 }}>
          <Button
            title={
              recorderState.isRecording
                ? "Detener grabación"
                : "Iniciar grabación"
            }
            onPress={recorderState.isRecording ? stopRecording : startRecording}
          />
          {recorderState.isRecording ? (
            <Body>
              GRABACIÓN EN CURSO ·{" "}
              {Math.round(recorderState.durationMillis / 1000)} s
            </Body>
          ) : null}
        </View>
      ) : (
        <AudioPublicationForm
          uri={uri}
          durationSeconds={durationSeconds}
          onPublished={() => {
            setUri(null);
            setDurationSeconds(undefined);
          }}
        />
      )}
    </Screen>
  );
}
