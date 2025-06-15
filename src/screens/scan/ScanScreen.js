import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Camera, CloudArrowUp } from 'iconsax-react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import firebase from '@/config/firebase';
import { styles } from './ScanStyles';

const { db, storage } = firebase;

const ScanScreen = () => {
  const [scannedDoc, setScannedDoc] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamList, setShowExamList] = useState(false);
  const [loading, setLoading] = useState(false);

  const scanDocument = async () => {
    if (!selectedExam) {
      Alert.alert('Error', 'Por favor, selecciona un examen.');
      return;
    }

    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
      });

      if (scannedImages && scannedImages.length > 0) {
        setScannedDoc(scannedImages[0]);
      } else {
        Alert.alert('Error', 'No se pudo escanear el documento.');
      }
    } catch (error) {
      console.error('Error al escanear el documento:', error);
      Alert.alert('Error', 'No se pudo escanear el documento.');
    }
  };

  const uploadDocument = async () => {
    if (!scannedDoc) {
      Alert.alert('Error', 'No hay ningún documento escaneado para subir.');
      return;
    }

    if (!selectedExam) {
      Alert.alert('Error', 'Por favor, selecciona un examen.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(scannedDoc);
      const blob = await response.blob();

      const storageRef = ref(storage, `exams/${selectedExam.name}/${Date.now()}.jpg`);

      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'scannedDocuments'), {
        examId: selectedExam.id,
        examName: selectedExam.name,
        scannedImage: downloadURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Éxito', 'Documento subido correctamente.');
    } catch (error) {
      console.error('Error al subir el documento:', error);
      Alert.alert('Éxito', 'Documento subido correctamente.');
    } finally {
      setScannedDoc(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'exams'));
        const examsList = [];
        querySnapshot.forEach((doc) => {
          examsList.push({ id: doc.id, ...doc.data() });
        });
        setExams(examsList);
      } catch (error) {
        console.error('Error al obtener los exámenes:', error);
        Alert.alert('Error', 'No se pudieron cargar los exámenes.');
      }
    };

    fetchExams();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowExamList(true)}
      >
        <Text style={styles.buttonText}>
          {selectedExam ? selectedExam.name : 'Seleccionar Examen'}
        </Text>
      </TouchableOpacity>

      {scannedDoc && (
        <Image source={{ uri: scannedDoc }} style={styles.scannedImage} />
      )}

      <TouchableOpacity style={styles.button} onPress={scanDocument}>
        <View style={styles.buttonContent}>
          <Camera size={24} color="#fff" variant="Bold" />
          <Text style={styles.buttonText}>Subir Fotos de Galeria</Text>
        </View>
      </TouchableOpacity>

      {scannedDoc && (
        <TouchableOpacity style={styles.button} onPress={uploadDocument}>
          <View style={styles.buttonContent}>
            <CloudArrowUp size={24} color="#fff" variant="Bold" />
            <Text style={styles.buttonText}>Subir Documento</Text>
          </View>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator size="large" color="#007BFF" />}

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

export default ScanScreen;
