import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { dashboardService } from "../services/api";
import { SessionData } from "../types";

export default function StudentLive() {
  const [liveSessions, setLiveSessions] = useState<SessionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLive = async () => {
    try {
      const data = await dashboardService.getLive();
      setLiveSessions(data);
    } catch (error) {
      console.error("Erreur chargement live", error);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLive();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLive();
  }, []);

  const handleForceClose = async (id: number) => {
    try {
      await dashboardService.forceClose(id);
      Alert.alert("Succès", "Session fermée.");
      fetchLive(); 
    } catch (error) {
      Alert.alert("Erreur", "Impossible de fermer la session");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Élèves en direct</Text>

      <FlatList
        data={liveSessions}
        keyExtractor={(item) => item.sessionId.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#4f46e5"]} 
            tintColor="#4f46e5" 
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.studentName}</Text>
              <Text style={styles.info}>
                Début: {new Date(item.startTime).toLocaleTimeString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => handleForceClose(item.sessionId)}
            >
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun élève connecté actuellement.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f3f4f6" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: "bold" },
  info: { color: "#6b7280", marginTop: 5 },
  closeBtn: { backgroundColor: "#ef4444", padding: 8, borderRadius: 5 },
  closeBtnText: { color: "#fff", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 50, color: "#9ca3af" },
});
