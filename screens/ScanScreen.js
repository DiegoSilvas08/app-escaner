import React, { useState, useEffect } from 'react';
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
  ScrollView,
  Platform
} from 'react-native';
import { Camera, CloudArrowUp, TickCircle, Book } from 'iconsax-react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import RNFS from 'react-native-fs';
import firebaseServices from '../database/firebase';

// Destructuración de servicios Firebase con configuración de emulador
const { db, auth, storage, firebase } = firebaseServices;

const ScanScreen = ({ navigation }) => {
  // Estados
  const [scannedDoc, setScannedDoc] = useState(null);
  const [localDocPath, setLocalDocPath] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamList, setShowExamList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [savedExams, setSavedExams] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [emulatorConfigured, setEmulatorConfigured] = useState(false);

  // Configuración del emulador en desarrollo
  useEffect(() => {
    const configureEmulator = async () => {
      if (__DEV__ && !emulatorConfigured) {
        try {
          const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
          
          // Configuración de emuladores con protección contra errores
          if (firebase.firestore?.useEmulator) {
            db.useEmulator(host, 8080);
          }
          
          if (firebase.auth?.useEmulator) {
            auth.useEmulator(`http://${host}:9099`);
          }
          
          if (firebase.storage?.useEmulator) {
            storage.useEmulator(host, 9199);
          }
          
          if (firebase.functions?.useEmulator) {
            firebase.functions().useEmulator(host, 5001);
          }
          
          setEmulatorConfigured(true);
          console.log('Emuladores Firebase configurados correctamente');
        } catch (error) {
          console.error('Error configurando emuladores:', error);
        }
      }
    };

    configureEmulator();
  }, []);

  // Cargar exámenes disponibles
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        setLoading(true);
        const querySnapshot = await db.collection('exams')
          .orderBy('createdAt', 'desc')
          .get();
          
        const examsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setExams(examsList);
        
        // Seleccionar el primer examen por defecto si hay disponibles
        if (examsList.length > 0 && !selectedExam) {
          setSelectedExam(examsList[0]);
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
        Alert.alert('Error', 'No se pudieron cargar los exámenes');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Función para escanear documento
  const handleScanDocument = async () => {
    if (!selectedExam) {
      Alert.alert('Selección requerida', 'Por favor selecciona un examen antes de escanear');
      return;
    }

    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        croppedImageQuality: 0.8,
        letUserAdjustCrop: true,
        maxNumDocuments: 1,
        responseType: 'base64'
      });

      if (scannedImages && scannedImages.length > 0) {
        const imageUri = scannedImages[0];
        setScannedDoc(imageUri);
        
        // Guardar localmente
        const localPath = await saveImageLocally(imageUri);
        setLocalDocPath(localPath);
        
        // Limpiar resultados previos
        setResults(null);
      }
    } catch (error) {
      console.error('Error scanning document:', error);
      Alert.alert('Error', 'No se pudo completar el escaneo. Asegúrate de tener permisos de cámara.');
    }
  };

  // Guardar imagen localmente
  const saveImageLocally = async (uri) => {
    try {
      const timestamp = new Date().getTime();
      const filename = `exam_${selectedExam.id}_${timestamp}.jpg`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      
      if (uri.startsWith('data:image')) {
        const base64Data = uri.split(',')[1];
        await RNFS.writeFile(destPath, base64Data, 'base64');
      } else {
        await RNFS.copyFile(uri, destPath);
      }
      
      return destPath;
    } catch (error) {
      console.error('Error saving image locally:', error);
      throw error;
    }
  };

  // Subir y procesar examen
  const handleUploadAndGrade = async () => {
    if (!scannedDoc || !selectedExam) {
      Alert.alert('Error', 'Faltan datos requeridos');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Subir a Firebase Storage
      const timestamp = new Date().getTime();
      const filename = `exam_${selectedExam.id}_${auth.currentUser?.uid}_${timestamp}.jpg`;
      const storageRef = storage.ref(`exam_answers/${filename}`);
      
      let uploadTask;
      if (scannedDoc.startsWith('data:image')) {
        const base64Data = scannedDoc.split(',')[1];
        uploadTask = storageRef.putString(base64Data, 'base64', {
          contentType: 'image/jpeg',
        });
      } else {
        uploadTask = storageRef.putFile(scannedDoc);
      }

      // Monitorear progreso
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          throw error;
        }
      );

      // Esperar a que complete la subida
      await uploadTask;
      const downloadURL = await storageRef.getDownloadURL();

      // 2. Llamar a Cloud Function para calificar
      const gradeExam = firebase.functions().httpsCallable('calificarExamen');
      const gradeResult = await gradeExam({
        scannedImage: downloadURL,
        examId: selectedExam.id,
        userId: auth.currentUser?.uid
      });

      // 3. Guardar resultados en Firestore
      const resultData = {
        examId: selectedExam.id,
        examName: selectedExam.name,
        studentId: auth.currentUser?.uid,
        studentName: auth.currentUser?.displayName || 'Anónimo',
        scannedImage: downloadURL,
        localPath: localDocPath,
        answers: gradeResult.data.answers,
        score: gradeResult.data.score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'graded'
      };

      await db.collection('exam_results').add(resultData);

      // 4. Actualizar estado con resultados
      setResults({
        score: gradeResult.data.score,
        answers: gradeResult.data.answers,
        correctAnswers: gradeResult.data.correctAnswers,
        totalQuestions: gradeResult.data.totalQuestions
      });

      Alert.alert('Éxito', 'Examen calificado correctamente');
    } catch (error) {
      console.error('Error processing exam:', error);
      Alert.alert('Error', error.message || 'Error al procesar el examen. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Cargar exámenes guardados localmente
  const loadLocalExams = async () => {
    try {
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      const examFiles = files.filter(file => 
        file.name.startsWith('exam_') && file.name.endsWith('.jpg')
      ).sort((a, b) => b.mtime - a.mtime) // Ordenar por fecha descendente
       .map(file => ({
        name: file.name,
        path: file.path,
        size: file.size,
        date: new Date(file.mtime)
      }));
      
      setSavedExams(examFiles);
    } catch (error) {
      console.error('Error loading local exams:', error);
      Alert.alert('Error', 'No se pudieron cargar los exámenes locales');
    }
  };

  // Procesar examen local
  const processLocalExam = async (filePath) => {
    try {
      setLoading(true);
      setUploadProgress(0);
      
      // 1. Leer archivo local
      const base64Data = await RNFS.readFile(filePath, 'base64');
      const imageUri = `data:image/jpeg;base64,${base64Data}`;
      
      // 2. Subir a Storage
      const timestamp = new Date().getTime();
      const filename = `local_exam_${timestamp}.jpg`;
      const storageRef = storage.ref(`temp_exams/${filename}`);
      
      const uploadTask = storageRef.putString(base64Data, 'base64', {
        contentType: 'image/jpeg'
      });

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }
      );

      await uploadTask;
      const downloadURL = await storageRef.getDownloadURL();

      // 3. Procesar con Cloud Function
      const gradeExam = firebase.functions().httpsCallable('calificarExamen');
      const gradeResult = await gradeExam({
        scannedImage: downloadURL,
        examId: selectedExam?.id || 'unknown',
        userId: auth.currentUser?.uid
      });

      // 4. Mostrar resultados
      setResults({
        score: gradeResult.data.score,
        answers: gradeResult.data.answers,
        correctAnswers: gradeResult.data.correctAnswers,
        totalQuestions: gradeResult.data.totalQuestions
      });

      Alert.alert('Proceso completado', 'Examen local calificado');
    } catch (error) {
      console.error('Error processing local exam:', error);
      Alert.alert('Error', 'No se pudo procesar el examen local');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Renderizar item de examen local
  const renderLocalExamItem = ({ item }) => (
    <TouchableOpacity
      style={styles.localExamItem}
      onPress={() => processLocalExam(item.path)}
    >
      <Text style={styles.localExamName}>
        {item.name.split('_')[1]} - {item.date.toLocaleDateString()}
      </Text>
      <Text style={styles.localExamDetails}>
        {(item.size / 1024).toFixed(2)} KB
      </Text>
    </TouchableOpacity>
  );

  // Renderizar item de examen disponible
  const renderExamItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.examItem,
        selectedExam?.id === item.id && styles.selectedExamItem
      ]}
      onPress={() => {
        setSelectedExam(item);
        setShowExamList(false);
      }}
    >
      <Text style={styles.examName}>{item.name}</Text>
      <Text style={styles.examDescription}>{item.description}</Text>
      <Text style={styles.examDate}>
        {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escanear Examen</Text>
      </View>

      {/* Selector de examen */}
      <TouchableOpacity
        style={styles.examSelector}
        onPress={() => setShowExamList(true)}
      >
        <Book size={20} color="#555" variant="Bold" />
        <Text style={styles.examSelectorText}>
          {selectedExam ? selectedExam.name : 'Seleccionar examen...'}
        </Text>
      </TouchableOpacity>

      {/* Vista previa del documento escaneado */}
      {scannedDoc ? (
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: scannedDoc }} 
            style={styles.previewImage} 
            resizeMode="contain"
          />
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleScanDocument}
            >
              <Text style={styles.actionButtonText}>Reemplazar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.uploadButton]}
              onPress={handleUploadAndGrade}
              disabled={loading}
            >
              <CloudArrowUp size={18} color="#fff" />
              <Text style={[styles.actionButtonText, styles.uploadButtonText]}>
                {loading ? 'Procesando...' : 'Calificar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanDocument}
          disabled={!selectedExam || loading}
        >
          <Camera size={24} color="#fff" variant="Bold" />
          <Text style={styles.scanButtonText}>
            {loading ? 'Cargando...' : 'Escanear Examen'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Progreso de subida */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Subiendo: {uploadProgress.toFixed(0)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${uploadProgress}%` }
              ]}
            />
          </View>
        </View>
      )}

      {/* Exámenes locales */}
      <TouchableOpacity
        style={styles.localExamsButton}
        onPress={loadLocalExams}
        disabled={loading}
      >
        <TickCircle size={20} color="#555" variant="Bold" />
        <Text style={styles.localExamsButtonText}>
          {savedExams.length > 0 ? `Exámenes Locales (${savedExams.length})` : 'Exámenes Locales'}
        </Text>
      </TouchableOpacity>

      {savedExams.length > 0 && (
        <View style={styles.localExamsContainer}>
          <Text style={styles.sectionTitle}>Archivos locales guardados:</Text>
          <FlatList
            data={savedExams}
            renderItem={renderLocalExamItem}
            keyExtractor={(item) => item.path}
            style={styles.localExamsList}
          />
        </View>
      )}

      {/* Resultados */}
      {results && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Resultados del Examen: {selectedExam?.name}</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Puntaje:</Text>
            <Text style={styles.scoreValue}>
              {results.score} / {results.totalQuestions}
            </Text>
            <Text style={styles.scorePercentage}>
              ({(results.score / results.totalQuestions * 100).toFixed(1)}%)
            </Text>
          </View>

          <Text style={styles.answersTitle}>Respuestas:</Text>
          {respuestas.map((answer, index) => (
            <View key={index} style={styles.answerItem}>
              <Text style={styles.questionNumber}>Pregunta {index + 1}:</Text>
              <Text style={[
                styles.answerText,
                answer.isCorrect && styles.correctAnswer,
                !answer.isCorrect && styles.incorrectAnswer
              ]}>
                {answer.selected} {answer.isCorrect ? '✓' : '✗'}
              </Text>
              {!answer.isCorrect && (
                <Text style={styles.correctAnswerText}>
                  Correcta: {answer.correct}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal de selección de examen */}
      <Modal
        visible={showExamList}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowExamList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Examen</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExamList(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={exams}
            renderItem={renderExamItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.examList}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>No hay exámenes disponibles</Text>
                <Text style={styles.emptyListSubtext}>Crea un examen primero en la web</Text>
              </View>
            }
          />
        </View>
      </Modal>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          {uploadProgress > 0 && (
            <Text style={styles.loadingText}>
              Procesando... {uploadProgress.toFixed(0)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

// Estilos completos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  examSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  examSelectorText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  previewContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  uploadButtonText: {
    color: '#fff',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a86ff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    opacity: 1,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  localExamsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  localExamsButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
  },
  localExamsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  localExamsList: {
    maxHeight: 200,
  },
  localExamItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  localExamName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  localExamDetails: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    maxHeight: 300,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scorePercentage: {
    fontSize: 16,
    color: '#6c757d',
    marginLeft: 8,
  },
  answersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  answerItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  questionNumber: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  answerText: {
    fontSize: 14,
    marginTop: 2,
  },
  correctAnswer: {
    color: '#28a745',
  },
  incorrectAnswer: {
    color: '#dc3545',
  },
  correctAnswerText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    color: '#3a86ff',
    fontSize: 16,
  },
  examList: {
    padding: 16,
  },
  examItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedExamItem: {
    borderColor: '#3a86ff',
    backgroundColor: '#f0f7ff',
  },
  examName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  examDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  examDate: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  emptyList: {
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    marginBottom: 8,
  },
  emptyListSubtext: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});

export default ScanScreen;