import React, { useEffect, useState } from "react";
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
const client = new Paho.Client(MQTT_HOST, MQTT_PORT, `Cmd_${Date.now()}`);

export default function StudentLive() {
  const [liveSessions, setLiveSessions] = useState<SessionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [examTime, setExamTime] = useState("10");

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

const startExamMode = () => {
    if (liveSessions.length === 0) {
      Alert.alert("Attention", "Aucun élève connecté.");
      return;
    }

    // NOUVEAU : On prépare un tableau contenant le MAC ET le texte à restaurer !
    const studentsData = liveSessions.map(session => ({
      mac: session.macAddress,
      texteEcran: "ID: " + session.sessionId + " -   " + session.studentName
    })).filter(s => s.mac);

    const timeInSeconds = parseInt(examTime, 10) || 10;

    const envoyerMessage = () => {
      const payload = JSON.stringify({
        command: "START_EXAM",
        time: timeInSeconds,
        students: studentsData // On envoie le nouveau tableau riche
      });

      const mqttMessage = new Paho.Message(payload);
      mqttMessage.destinationName = "labo/app/command";
      client.send(mqttMessage);
      
      Alert.alert("Examen lancé", `Le chrono de ${timeInSeconds}s a commencé !`);

      setTimeout(() => {
        if (client.isConnected()) client.disconnect();
      }, 500);
    };

    if (client.isConnected()) {
      envoyerMessage();
    } else {
      client.connect({
        useSSL: true,
        onSuccess: envoyerMessage,
        onFailure: (err) => Alert.alert("Erreur", "Impossible de joindre le serveur MQTT.")
      });
    }
  };

  const triggerBuzzer = (macAddress: string) => {
    if (!macAddress) {
      Alert.alert("Erreur", "Adresse MAC inconnue pour cet élève.");
      return;
    }

    client.connect({
      useSSL: true,
      onSuccess: () => {
        const message = new Paho.Message(JSON.stringify({
          command: "BUZZER_ON",
          mac: macAddress
        }));
        
        message.destinationName = "labo/app/command";
        client.send(message);

        setTimeout(() => client.disconnect(), 500);
      },
      onFailure: (err) => console.log("Erreur envoi Buzzer:", err),
    });
  };

  return (
    <View style={styles.container}>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15, backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, marginRight: 10 }}> Minuteur (sec) :</Text>
        
        <TextInput
          style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, width: 60, textAlign: 'center' }}
          keyboardType="numeric"
          value={examTime}
          onChangeText={setExamTime}
        />

        <TouchableOpacity 
          style={{ backgroundColor: '#4f46e5', padding: 10, borderRadius: 5, marginLeft: 15 }}
          onPress={startExamMode} 
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Démarrer l'Examen</Text>
        </TouchableOpacity>
      </View>
      
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

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.buzzerBtn}
                onPress={() => triggerBuzzer(item.macAddress as string)}
              >
                <Text style={styles.btnText}> Rappel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => handleForceClose(item.sessionId)}
              >
                <Text style={styles.btnText}> Fermer</Text>
              </TouchableOpacity>
            </View>
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
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  buzzerBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  closeBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  empty: { textAlign: "center", marginTop: 50, color: "#9ca3af" },
});