import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { Camera, CloudArrowUp } from 'iconsax-react-native';
import DocumentScanner from "react-native-document-scanner-plugin";
import firebase from "../database/firebase"; // Importa Firebase
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage
import { collection, addDoc, getDocs } from "firebase/firestore"; // Firestore

const { db, storage } = firebase; // Extrae db y storage del objeto exportado

const ScanScreen = () => {
  const [scannedDoc, setScannedDoc] = useState(null); // Estado para la imagen escaneada
  const [exams, setExams] = useState([]); // Estado para la lista de exámenes
  const [selectedExam, setSelectedExam] = useState(null); // Estado para el examen seleccionado
  const [showExamList, setShowExamList] = useState(false); // Estado para mostrar/ocultar la lista de exámenes
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga

  // Obtener la lista de exámenes registrados en Firestore
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "exams"));
        const examsList = [];
        querySnapshot.forEach((doc) => {
          examsList.push({ id: doc.id, ...doc.data() });
        });
        setExams(examsList);
      } catch (error) {
        console.error("Error al obtener los exámenes:", error);
        Alert.alert("Error", "No se pudieron cargar los exámenes.");
      }
    };

    fetchExams();
  }, []);

  // Función para escanear el documento
  const scanDocument = async () => {
    if (!selectedExam) {
      Alert.alert("Error", "Por favor, selecciona un examen.");
      return;
    }

    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
      });

      if (scannedImages && scannedImages.length > 0) {
        setScannedDoc(scannedImages[0]); // Guarda la primera imagen escaneada
      } else {
        Alert.alert("Error", "No se pudo escanear el documento.");
      }
    } catch (error) {
      console.error("Error al escanear el documento:", error);
      Alert.alert("Error", "No se pudo escanear el documento.");
    }
  };

  // Función para subir el documento escaneado a Firebase
  const uploadDocument = async () => {
    if (!scannedDoc) {
      Alert.alert("Error", "No hay ningún documento escaneado para subir.");
      return;
    }

    if (!selectedExam) {
      Alert.alert("Error", "Por favor, selecciona un examen.");
      return;
    }

    setLoading(true); // Activar el indicador de carga

    try {
      // Convertir la imagen a un Blob
      const response = await fetch(scannedDoc);
      const blob = await response.blob();

      // Crear una referencia única para el archivo en Storage
      const storageRef = ref(storage, `exams/${selectedExam.name}/${Date.now()}.jpg`);

      // Subir el archivo a Firebase Storage
      await uploadBytes(storageRef, blob);

      // Obtener la URL de descarga del archivo
      const downloadURL = await getDownloadURL(storageRef);

      // Guardar la referencia en Firestore
      await addDoc(collection(db, "scannedDocuments"), {
        examId: selectedExam.id,
        examName: selectedExam.name,
        scannedImage: downloadURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert("Éxito", "Documento subido correctamente.");
    } catch (error) {
      console.error("Error al subir el documento:", error);
      Alert.alert("Éxito", "Documento subido correctamente.");
    } finally {
      // Limpiar el documento escaneado, independientemente de si la subida fue exitosa o no
      setScannedDoc(null);
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón para seleccionar un examen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowExamList(true)}
      >
        <Text style={styles.buttonText}>
          {selectedExam ? selectedExam.name : "Seleccionar Examen"}
        </Text>
      </TouchableOpacity>

      {/* Previsualización del documento escaneado */}
      {scannedDoc && (
        <Image source={{ uri: scannedDoc }} style={styles.scannedImage} />
      )}

      {/* Botón para escanear */}
      <TouchableOpacity style={styles.button} onPress={scanDocument}>
        <View style={styles.buttonContent}>
          <Camera size={24} color="#fff" variant="Bold" />
          <Text style={styles.buttonText}>Escanear Documento</Text>
        </View>
      </TouchableOpacity>

      {/* Botón para subir el documento */}
      {scannedDoc && (
        <TouchableOpacity style={styles.button} onPress={uploadDocument}>
          <View style={styles.buttonContent}>
            <CloudArrowUp size={24} color="#fff" variant="Bold" />
            <Text style={styles.buttonText}>Subir Documento</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Indicador de carga */}
      {loading && <ActivityIndicator size="large" color="#007BFF" />}

      {/* Modal para seleccionar un examen */}
      <Modal
        visible={showExamList}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExamList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un Examen</Text>
            <FlatList
              data={exams}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.examItem}
                  onPress={() => {
                    setSelectedExam(item);
                    setShowExamList(false);
                  }}
                >
                  <Text style={styles.examName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowExamList(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  button: {
    width: "100%",
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scannedImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  examItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  examName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ScanScreen;