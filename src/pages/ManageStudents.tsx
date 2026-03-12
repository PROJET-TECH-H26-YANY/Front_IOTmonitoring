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
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const resetForm = () => {
    setNom("");
    setNfcUid("");
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!nom) return Alert.alert("Erreur", "Le nom est requis");

    // Aidé par IA pour faire une fiche de modification/ajout d'élève plus propre
    try {
      if (editingId) {
        // Mode Modification
        await studentService.update(editingId, {
          nom: nom,
          nfcUid: nfcUid ? nfcUid : null,
        });
        Alert.alert("Succès", "Élève mis à jour !");
      } else {
        // Mode Création
        await studentService.create({
          nom: nom,
          nfcUid: nfcUid ? nfcUid : null,
        });
        Alert.alert("Succès", "Élève ajouté !");
      }

      resetForm();
      fetchStudents();
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  };

  const handleEdit = (student: Student) => {
    setNom(student.name);
    setNfcUid(student.nfcUid || "");
    setEditingId(student.id);
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
        <Text style={styles.formTitle}>
          {editingId ? "Modifier l'élève" : "Ajouter un élève"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nom de l'élève"
          value={nom}
          onChangeText={setNom}
        />
        <TextInput
          style={styles.input}
          placeholder="UID NFC (Optionnel)"
          value={nfcUid}
          onChangeText={setNfcUid}
        />

        {/* Aidé par IA pour faire une belle fiche modifier */}
        <View style={styles.rowButtons}>
          <TouchableOpacity
            style={[
              styles.button,
              { flex: 1, marginRight: editingId ? 10 : 0 },
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>
              {editingId ? "Mettre à jour" : "Ajouter"}
            </Text>
          </TouchableOpacity>

          {/* Bouton Annuler visible uniquement si on modifie */}
          {editingId && (
            <TouchableOpacity
              style={[styles.button, { flex: 1, backgroundColor: "#6b7280" }]}
              onPress={resetForm}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
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
                NFC: {item.nfcUid || "Non assigné"}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={{ marginRight: 15 }}
              >
                <Text style={{ color: "#2563eb", fontWeight: "bold" }}>
                  Modifier
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={{ color: "red", fontWeight: "bold" }}>
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>
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
  formTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
    color: "#374151",
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  rowButtons: { flexDirection: "row", justifyContent: "space-between" },
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
  actions: { flexDirection: "row" },
});
