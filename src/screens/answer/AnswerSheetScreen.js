import React, {  useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Menu, Provider } from 'react-native-paper';
import firebase from '@/config/firebase';
import { styles } from './AnswerSheetStyles';

const { db, firebase: firebaseInstance } = firebase;

const AnswerSheetScreen = () => {
  const navigation = useNavigation();
  const [selectedExam, setSelectedExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [existingAnswerSheetId, setExistingAnswerSheetId] = useState(null);

  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    setMenuVisible(false);
    setAnswers({});
    setExistingAnswerSheetId(null);

    try {
      const answerSheetSnapshot = await db
        .collection('answers')
        .where('examId', '==', exam.id)
        .get();

      if (!answerSheetSnapshot.empty) {
        const answerSheetDoc = answerSheetSnapshot.docs[0];
        setAnswers(answerSheetDoc.data().answers);
        setExistingAnswerSheetId(answerSheetDoc.id);
      }
    } catch (error) {
      console.error('Error al cargar las respuestas:', error);
      Alert.alert('Error', 'No se pudieron cargar las respuestas guardadas.');
    }
  };

  const handleSelectAnswer = (question, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: answer,
    }));
  };

  const handleSaveAnswers = async () => {
    if (!selectedExam) {
      Alert.alert('Error', 'Por favor, selecciona un examen.');
      return;
    }

    const totalQuestions = selectedExam.questions;
    const answeredQuestions = Object.keys(answers).length;

    if (answeredQuestions < totalQuestions) {
      Alert.alert('Error', 'Por favor, responde todas las preguntas.');
      return;
    }

    setLoading(true);

    try {
      const answerSheetData = {
        examId: selectedExam.id,
        examName: selectedExam.name,
        answers: answers,
        createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(),
      };

      if (existingAnswerSheetId) {
        await db.collection('answers').doc(existingAnswerSheetId).update(answerSheetData);
      } else {
        await db.collection('answers').add(answerSheetData);
      }

      Alert.alert('Éxito', 'Hoja de respuestas guardada correctamente.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar las respuestas:', error);
      Alert.alert('Error', 'No se pudo guardar la hoja de respuestas.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Selecciona un examen:</Text>
        </View>

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

export default AnswerSheetScreen;
