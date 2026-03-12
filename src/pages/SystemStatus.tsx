import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SystemStatus() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>État du Système</Text>
      <Text style={styles.subtitle}>Les informations MQTT apparaîtront ici.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#6b7280" },
});