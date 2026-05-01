import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { dashboardService } from "../services/api";
import { SessionData } from "../types";

export default function History() {
  const [history, setHistory] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const data = await dashboardService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Erreur chargement historique", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Fonction pour formater la date proprement
  // IA
  const formatDate = (dateString?: string) => {
    if (!dateString) return "En cours";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des sessions</Text>
      
      <FlatList
        data={history}
        keyExtractor={(item) => item.sessionId.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerCard}>
              <Text style={styles.name}>{item.studentName}</Text>
              <Text style={[styles.status, item.status === "Terminé" ? styles.statusClosed : styles.statusOpen]}>
                {item.status}
              </Text>
            </View>
            
            <Text style={styles.info}>Début : {formatDate(item.startTime)}</Text>
            <Text style={styles.info}>Fin : {formatDate(item.endTime)}</Text>
            
            {item.timeWorked !== undefined && (
              <Text style={styles.time}>Temps total : {Math.floor(item.timeWorked / 60)} min</Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun historique disponible.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f3f4f6" },
  centered: { justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
  headerCard: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  name: { fontSize: 16, fontWeight: "bold" },
  status: { fontSize: 12, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: "hidden" },
  statusClosed: { backgroundColor: "#d1fae5", color: "#065f46" },
  statusOpen: { backgroundColor: "#fee2e2", color: "#991b1b" },
  info: { color: "#6b7280", marginTop: 2, fontSize: 13 },
  time: { color: "#4f46e5", fontWeight: "bold", marginTop: 5, fontSize: 13 },
  empty: { textAlign: "center", marginTop: 50, color: "#9ca3af" }
});