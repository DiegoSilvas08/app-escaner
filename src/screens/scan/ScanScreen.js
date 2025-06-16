// src/screens/ScanScreen.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Animated,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, CloudArrowUp, Document, ArrowLeft2 } from 'iconsax-react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import firebase from '@/config/firebase';
import { styles } from './ScanStyles';

const { db, storage } = firebase;

const ScanScreen = () => {
  const navigation = useNavigation();
  const [scannedDoc, setScannedDoc] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamList, setShowExamList] = useState(false);
  const [loading, setLoading] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const scanDocument = async () => {
    if (!selectedExam) {return Alert.alert('Error', 'Selecciona un examen primero');}
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({ croppedImageQuality: 100 });
      if (scannedImages.length) {setScannedDoc(scannedImages[0]);}
    } catch {
      Alert.alert('Error', 'No se pudo escanear el documento');
    }
  };

  const uploadDocument = async () => {
    if (!scannedDoc) {return Alert.alert('Error', 'Escanea un documento primero');}
    setLoading(true);
    try {
      const resp = await fetch(scannedDoc);
      const blob = await resp.blob();
      const storageRef = ref(storage, `exams/${selectedExam.name}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'scannedDocuments'), {
        examId: selectedExam.id,
        examName: selectedExam.name,
        scannedImage: url,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Éxito', 'Documento subido correctamente');
      setScannedDoc(null);
    } catch {
      Alert.alert('Error', 'No se pudo subir el documento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.97, duration: 2000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [scale, opacity]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'exams'));
      setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  return (
    <ImageBackground
      source={require('../../../assets/home-background.png')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft2 size={35} color="#fffde1" variant="Bold" />
      </TouchableOpacity>
      <View style={styles.container}>
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowExamList(true)}
            activeOpacity={0.8}
          >
            <Document size={20} color="#fffde1" variant="Bold" />
            <Text style={styles.selectText}>
              {selectedExam?.name || 'Seleccionar Examen'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={scanDocument}
            activeOpacity={0.8}
          >
            <Camera size={28} color="#fffde1" variant="Bold" />
            <Text style={styles.actionText}>Escanear Documento</Text>
          </TouchableOpacity>
          {scannedDoc && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={uploadDocument}
              activeOpacity={0.8}
              disabled={loading}
            >
              <CloudArrowUp size={28} color="#fffde1" variant="Bold" />
              <Text style={styles.actionText}>
                {loading ? 'Subiendo...' : 'Subir Documento'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
      {showExamList && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Selecciona un examen</Text>
            <FlatList
              data={exams}
              keyExtractor={item => item.id}
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
              style={styles.closeModal}
              onPress={() => setShowExamList(false)}
            >
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ImageBackground>
  );
};

export default ScanScreen;
