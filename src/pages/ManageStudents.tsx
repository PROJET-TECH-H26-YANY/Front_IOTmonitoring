import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { studentService } from "../services/api";
import { Student } from "../types";

export default function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [nom, setNom] = useState("");
  const [nfcUid, setNfcUid] = useState("");

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error) {
      console.error("Erreur chargement élèves", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreate = async () => {
    if (!nom) return Alert.alert("Erreur", "Le nom est requis");

    try {
      await studentService.create({
        nom: nom,
        nfcUid: nfcUid ? nfcUid : null,
      });

      Alert.alert("Succès", "Élève ajouté !");
      setNom(""); 
      setNfcUid("");
      fetchStudents();
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await studentService.delete(id);
      fetchStudents();
    } catch (error: any) {
      Alert.alert("Erreur", "Impossible de supprimer l'élève");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des élèves</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nom de l'élève"
          value={nom}
          onChangeText={setNom}
        />
        <TextInput
          style={styles.input}
          placeholder="UID NFC "
          value={nfcUid}
          onChangeText={setNfcUid}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Ajouter l'élève</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Liste des élèves</Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
                <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>
                Id: {item.id || "Non assigné"}
              </Text>
              <Text style={styles.info}>
                NFC: {item.nfcUid || "Non assigné"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={{ color: "red", fontWeight: "bold" }}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f3f4f6" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
  form: { backgroundColor: "#fff", padding: 15, borderRadius: 8, elevation: 2 },
  input: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "bold" },
  info: { color: "#6b7280", marginTop: 5, fontSize: 12 },
});
