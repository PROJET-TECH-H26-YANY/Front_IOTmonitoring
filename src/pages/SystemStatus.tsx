import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Paho from "paho-mqtt";

const MQTT_HOST = process.env.EXPO_PUBLIC_MQTT_HOST || "185.53.209.197";
const MQTT_PORT = Number(process.env.EXPO_PUBLIC_MQTT_PORT) || 9001;

export default function SystemStatus() {
  const [status, setStatus] = useState({ text: "Recherche de Node-RED...", color: "#f59e0b" }); 

  useEffect(() => {
    const client = new Paho.Client(MQTT_HOST, MQTT_PORT, `App_${Date.now()}`);

    client.onConnectionLost = () => setStatus({ text: "Serveur injoignable", color: "#ef4444" }); 
    
    client.onMessageArrived = (msg) => {
      if (msg.destinationName === "labo/system/status") {
        setStatus({ text: "Node-RED est Actif ", color: "#10b981" }); 
      }
    };

    client.connect({
      useSSL: true,
      onSuccess: () => {
        client.subscribe("labo/system/status");
      },
      onFailure: () => setStatus({ text: "Erreur de connexion", color: "#ef4444" })
    });

    return () => { if (client.isConnected()) client.disconnect(); };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>État du Système</Text>
      
      <View style={[styles.card, { borderColor: status.color }]}>
        <Text style={styles.label}>Liaison Node-RED</Text>
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 25, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1e293b", textAlign: "center", marginBottom: 40 },
  card: { backgroundColor: "white", padding: 30, borderRadius: 16, elevation: 4, borderWidth: 2, alignItems: "center" },
  label: { fontSize: 14, color: "#64748b", textTransform: "uppercase", fontWeight: "bold", letterSpacing: 1, marginBottom: 15 },
  statusText: { fontSize: 22, fontWeight: "bold", textAlign: "center" }
});