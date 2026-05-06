import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import { dashboardService } from "../services/api";
import { SessionData } from "../types";
import Paho from "paho-mqtt";

const MQTT_HOST = process.env.EXPO_PUBLIC_MQTT_HOST || "185.53.209.197";
const MQTT_PORT = Number(process.env.EXPO_PUBLIC_MQTT_PORT) || 9001;

export default function StudentLive() {
  const [liveSessions, setLiveSessions] = useState<SessionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [examTime, setExamTime] = useState("10");

  const [distances, setDistances] = useState<Record<string, number>>({});
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const clientRef = useRef<Paho.Client | null>(null);

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

    const client = new Paho.Client(
      MQTT_HOST,
      MQTT_PORT,
      `App_Superviseur_${Date.now()}`,
    );
    clientRef.current = client;

    client.onMessageArrived = (msg) => {
      try {
        const data = JSON.parse(msg.payloadString);

        if (data.type === "distance") {
          setDistances((prev) => ({ ...prev, [data.mac]: data.value }));
        } else if (data.type === "alert") {
          setAlertMsg(data.message);
          setTimeout(() => setAlertMsg(null), 6000);
        } else if (data.type === "chrono") {
          setRemainingTime(data.value);
          if (data.value <= 0) setTimeout(() => setRemainingTime(null), 3000);
        }
      } catch (e) {
        console.error("Erreur parsing MQTT", e);
      }
    };

    client.connect({
      useSSL: true,
      onSuccess: () => {
        client.subscribe("labo/dashboard/update");
      },
      onFailure: (err) => console.log("Erreur connexion MQTT:", err),
    });

    return () => {
      if (client.isConnected()) client.disconnect();
    };
  }, []);

  const publishMessage = (topic: string, payloadObj: object) => {
    if (clientRef.current && clientRef.current.isConnected()) {
      const message = new Paho.Message(JSON.stringify(payloadObj));
      message.destinationName = topic;
      clientRef.current.send(message);
    } else {
      Alert.alert(
        "Erreur",
        "Non connecté au serveur MQTT. Vérifiez votre réseau.",
      );
    }
  };

  const handleForceClose = async (id: number) => {
    try {
      await dashboardService.forceClose(id);
      Alert.alert("Succès", "Session fermée.");
      fetchLive();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de fermer la session");
    }
  };

  const startExamMode = () => {
    if (liveSessions.length === 0) {
      Alert.alert("Attention", "Aucun élève connecté.");
      return;
    }

    const studentsData = liveSessions
      .map((session) => ({
        mac: session.macAddress,
        texteEcran: `ID: ${session.sessionId} - ${session.studentName}`,
      }))
      .filter((s) => s.mac);

    const timeInSeconds = parseInt(examTime, 10) || 10;

    publishMessage("labo/app/command", {
      command: "START_EXAM",
      time: timeInSeconds,
      students: studentsData,
    });

    Alert.alert("Examen lancé", `Le chrono de ${timeInSeconds}s a commencé !`);
  };

  const stopExamMode = () => {
    publishMessage("labo/app/command", { command: "STOP_EXAM" });
  };

  const triggerBuzzer = (macAddress: string) => {
    if (!macAddress) return Alert.alert("Erreur", "Adresse MAC inconnue.");
    publishMessage("labo/app/command", {
      command: "BUZZER_ON",
      mac: macAddress,
    });
  };

  return (
    <View style={styles.container}>
      {alertMsg && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>{alertMsg}</Text>
        </View>
      )}

      <View style={styles.controlsRow}>
        <Text style={{ fontSize: 14, marginRight: 5, fontWeight: "bold" }}>
          Temps(s):
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={examTime}
          onChangeText={setExamTime}
        />

        <TouchableOpacity style={styles.startBtn} onPress={startExamMode}>
          <Text style={styles.btnText}>Lancer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stopBtn} onPress={stopExamMode}>
          <Text style={styles.btnText}>Stop</Text>
        </TouchableOpacity>
        
      </View>
      {remainingTime !== null && (
          <View style={styles.chronoBanner}>
            <Text style={styles.chronoText}>
              TEMPS RESTANT : {remainingTime}s
            </Text>
          </View>
        )}

      <Text style={styles.title}>Élèves en direct</Text>

      <FlatList
        data={liveSessions}
        keyExtractor={(item) => item.sessionId.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
          />
        }
        renderItem={({ item }) => {
          const dist = distances[item.macAddress as string];
          const isDistOk = dist !== undefined && dist <= 80;
          const distColor =
            dist === undefined ? "#9ca3af" : isDistOk ? "#10b981" : "#ef4444";

          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.studentName}</Text>
                <Text style={styles.info}>
                  Début: {new Date(item.startTime).toLocaleTimeString()}
                </Text>
                {/* Affichage de la distance en direct avec code couleur */}
                <Text
                  style={{ color: distColor, fontWeight: "bold", marginTop: 5 }}
                >
                  Distance:{" "}
                  {dist !== undefined ? `${dist} cm` : "En attente..."}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.buzzerBtn}
                  onPress={() => triggerBuzzer(item.macAddress as string)}
                >
                  <Text style={styles.btnText}>Rappel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => handleForceClose(item.sessionId)}
                >
                  <Text style={styles.btnText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun élève connecté actuellement.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f3f4f6" },
  alertBanner: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  alertText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  chronoBanner: {
    backgroundColor: "#4f46e5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  chronoText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    width: 60,
    textAlign: "center",
  },
  startBtn: {
    backgroundColor: "#4f46e5",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  stopBtn: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
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
  info: { color: "#6b7280", marginTop: 2 },
  actionRow: { flexDirection: "column", gap: 8 },
  buzzerBtn: {
    backgroundColor: "#f59e0b",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeBtn: {
    backgroundColor: "#6b7280",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 50, color: "#9ca3af" },
});
