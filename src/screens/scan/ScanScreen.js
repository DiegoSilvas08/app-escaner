import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Animated,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CloudArrowUp, Gallery, Note } from 'iconsax-react-native';
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
  const [goingBack, setGoingBack] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const menuScale = useRef(new Animated.Value(1)).current;

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

  const handleGoBack = () => {
    setGoingBack(true);
    navigation.goBack();
  };

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.95, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(menuScale, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
        Animated.timing(menuScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    ).start();
  }, [scale, opacity, menuScale]);

  useEffect(() => {
    const fetchExams = async () => {
      const snap = await getDocs(collection(db, 'exams'));
      setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchExams();
  }, []);

  return (
    <ImageBackground
      source={require('../../../assets/home-background.png')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Gestión de Exámenes</Text>
        <Animated.View style={[styles.buttonContainer, { transform: [{ scale }], opacity }]}>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => setShowExamList(true)}
              activeOpacity={0.8}
            >
              <Note size={50} color="#fffde1" variant="Bold" />
              <Text style={styles.cardLabel}>
                {selectedExam?.name || 'Seleccionar Examen'}
              </Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              style={styles.card}
              onPress={scanDocument}
              activeOpacity={0.8}
            >
              <Gallery size={50} color="#fffde1" variant="Bold" />
              <Text style={styles.cardLabel}>Escanear Documento</Text>
            </TouchableOpacity>
          </View>
          {scannedDoc && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadDocument}
              activeOpacity={0.8}
              disabled={loading}
            >
              <CloudArrowUp size={40} color="#fffde1" variant="Bold" />
              <Text style={styles.uploadText}>
                {loading ? 'Subiendo...' : 'Subir Documento'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: menuScale }] }}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
            disabled={goingBack}
          >
            {goingBack ? (
              <ActivityIndicator color="#fffde1" />
            ) : (
              <Text style={styles.menuButtonText}>Menú Principal</Text>
            )}
          </TouchableOpacity>
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
