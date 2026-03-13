import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { logout, user } = useAuth();

return (
    <ScrollView 
      contentContainerStyle={styles.container}    
    >
      <Text style={styles.title}>Mon Profil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nom complet</Text>
        <Text style={styles.value}>{user?.name || "Non renseigné"}</Text>

        <Text style={styles.label}>Adresse Email</Text>
        <Text style={styles.value}>{user?.email || "Non renseignée"}</Text>

        <Text style={styles.label}>ID Superviseur</Text>
        <Text style={styles.value}>#{user?.id}</Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
  },
  centered: { alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 30,
  },
  label: { fontSize: 14, color: "#6b7280", marginBottom: 5, fontWeight: "600" },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
});
