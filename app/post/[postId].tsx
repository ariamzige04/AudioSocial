import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AudioPostActions } from "@/components/AudioPostActions";
import { AudioPostCard } from "@/components/AudioPostCard";
import { AudioPostPlayer } from "@/components/AudioPostPlayer";
import { CommentsSheet } from "@/components/CommentsSheet";
import { ManageAudioPostSheet } from "@/components/ManageAudioPostSheet";
import { ReportSheet } from "@/components/ReportSheet";
import { Button, Loading, Screen, Title } from "@/components/ui";
import { getFeedPostById } from "@/services/audioPosts";
import { useSession } from "@/providers/SessionProvider";
import type { AudioPost } from "@/types/models";

export default function AudioPostScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { session } = useSession();
  const [post, setPost] = useState<AudioPost | null>(null);

  const load = useCallback(async () => {
    if (!postId) return;
    try {
      setPost(await getFeedPostById(postId));
    } catch {
      Alert.alert("No pudimos cargar esta publicación.");
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!post) return <Loading label="Cargando esta voz…" />;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Title>PUBLICACIÓN</Title>
        <AudioPostCard post={post} />
        {post.author?.id && post.author.id !== session?.user.id ? (
          <Button
            kind="ghost"
            title={`Ver perfil de @${post.author.username}`}
            onPress={() => router.push(`/profile/${post.author?.id}`)}
          />
        ) : null}
        <AudioPostPlayer
          postId={post.id}
          audioPath={post.audio_path}
          onPlayRegistered={load}
        />
        <AudioPostActions postId={post.id} onChanged={load} />
        <CommentsSheet postId={post.id} onChanged={load} />
        <ManageAudioPostSheet
          postId={post.id}
          owned={post.author?.id === session?.user.id}
          onDone={() => router.back()}
        />
        <ReportSheet postId={post.id} profileId={post.author?.id} />
      </ScrollView>
    </Screen>
  );
}
