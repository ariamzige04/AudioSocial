import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Body, Screen, Title } from "@/components/ui";
import { useSession } from "@/providers/SessionProvider";
import { listViewerReportsPage } from "@/services/reports";
import type { Report } from "@/types/models";

export default function ReportHistoryScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<Report[]>([]);
  useEffect(() => {
    if (session?.user.id) listViewerReportsPage(session.user.id).then(setItems);
  }, [session?.user.id]);
  return (
    <Screen>
      <Title>Historial de reportes</Title>
      <Body muted>
        Consulta el estado que moderación asignó a cada reporte.
      </Body>
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12 }}>
            <Text style={{ fontWeight: "800" }}>{item.reason}</Text>
            <Text>{item.status}</Text>
            {item.resolution_note ? (
              <Text>RESPUESTA DE MODERACIÓN: {item.resolution_note}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Body muted>Los reportes que envíes aparecerán aquí.</Body>
        }
      />
    </Screen>
  );
}
