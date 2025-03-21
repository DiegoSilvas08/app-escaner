import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Menu, Provider } from 'react-native-paper'; // Importa los componentes de react-native-paper
import firebase from '../database/firebase'; // Importa firebase

const { db, firebase: firebaseInstance } = firebase; // Extrae db y firebase del objeto exportado

const AnswerSheetScreen = ({ navigation }) => {
  const [selectedExam, setSelectedExam] = useState(null); // Estado para el examen seleccionado
  const [answers, setAnswers] = useState({}); // Estado para las respuestas seleccionadas
  const [menuVisible, setMenuVisible] = useState(false); // Estado para controlar la visibilidad del menú
  const [exams, setExams] = useState([]); // Estado para almacenar los exámenes
  const [loading, setLoading] = useState(true); // Estado para el indicador de carga
  const [existingAnswerSheetId, setExistingAnswerSheetId] = useState(null); // Estado para almacenar el ID de la hoja de respuestas existente

  // Cargar los exámenes desde Firestore al montar la pantalla
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examsSnapshot = await db.collection('exams').get();
        const examsData = examsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExams(examsData);
      } catch (error) {
        console.error('Error al cargar los exámenes:', error);
        Alert.alert('Error', 'No se pudieron cargar los exámenes.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Función para manejar la selección de un examen
  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    setMenuVisible(false); // Cierra el menú después de seleccionar un examen
    setAnswers({}); // Reiniciar las respuestas al seleccionar un nuevo examen
    setExistingAnswerSheetId(null); // Reiniciar el ID de la hoja de respuestas existente

    // Buscar si ya existe una hoja de respuestas para este examen
    try {
      const answerSheetSnapshot = await db
        .collection('answers')
        .where('examId', '==', exam.id)
        .get();

      if (!answerSheetSnapshot.empty) {
        const answerSheetDoc = answerSheetSnapshot.docs[0];
        setAnswers(answerSheetDoc.data().answers);
        setExistingAnswerSheetId(answerSheetDoc.id); // Guardar el ID de la hoja de respuestas existente
      }
    } catch (error) {
      console.error('Error al cargar las respuestas:', error);
      Alert.alert('Error', 'No se pudieron cargar las respuestas guardadas.');
    }
  };

  // Función para manejar la selección de una respuesta
  const handleSelectAnswer = (question, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: answer,
    }));
  };

  // Función para guardar la hoja de respuestas en Firestore
  const handleSaveAnswers = async () => {
    if (!selectedExam) {
      Alert.alert('Error', 'Por favor, selecciona un examen.');
      return;
    }

    // Verificar que todas las preguntas tengan una respuesta seleccionada
    const totalQuestions = selectedExam.questions;
    const answeredQuestions = Object.keys(answers).length;

    if (answeredQuestions < totalQuestions) {
      Alert.alert('Error', 'Por favor, responde todas las preguntas.');
      return;
    }

    setLoading(true); // Activar el indicador de carga

    try {
      const answerSheetData = {
        examId: selectedExam.id,
        examName: selectedExam.name,
        answers: answers,
        createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(), // Usa FieldValue correctamente
      };

      // Si ya existe una hoja de respuestas, actualízala; de lo contrario, crea una nueva
      if (existingAnswerSheetId) {
        await db.collection('answers').doc(existingAnswerSheetId).update(answerSheetData);
      } else {
        await db.collection('answers').add(answerSheetData);
      }

      Alert.alert('Éxito', 'Hoja de respuestas guardada correctamente.');
      navigation.goBack(); // Regresar a la pantalla anterior
    } catch (error) {
      console.error('Error al guardar las respuestas:', error);
      Alert.alert('Error', 'No se pudo guardar la hoja de respuestas.');
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Texto "Selecciona un examen" 30 píxeles más abajo */}
        <View style={{ marginTop: 30 }}>
          <Text style={styles.label}>Selecciona un examen:</Text>
        </View>

        {/* Menú desplegable para seleccionar un examen */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Text style={styles.menuButtonText}>
                {selectedExam ? selectedExam.name : 'Seleccionar examen'}
              </Text>
            </TouchableOpacity>
          }
        >
          {exams.map((exam) => (
            <Menu.Item
              key={exam.id}
              onPress={() => handleSelectExam(exam)}
              title={exam.name}
            />
          ))}
        </Menu>

        {/* Mostrar preguntas y respuestas */}
        {selectedExam && (
          <View style={styles.questionsContainer}>
            <Text style={styles.label}>Preguntas:</Text>
            {Array.from({ length: selectedExam.questions }, (_, index) => (
              <View key={index} style={styles.questionContainer}>
                <Text style={styles.questionText}>Pregunta {index + 1}:</Text>
                <View style={styles.answersContainer}>
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.answerButton,
                        answers[index + 1] === option && styles.selectedAnswerButton,
                      ]}
                      onPress={() => handleSelectAnswer(index + 1, option)}
                    >
                      <Text style={styles.answerButtonText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Botón para guardar la hoja de respuestas */}
        {selectedExam && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAnswers}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Hoja de Respuestas</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  menuButton: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#333',
  },
  questionsContainer: {
    marginTop: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  answersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  answerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  selectedAnswerButton: {
    borderColor: 'blue',
    backgroundColor: '#e6f0ff',
  },
  answerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    width: '100%',
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AnswerSheetScreen;