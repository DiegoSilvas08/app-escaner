import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Menu, Provider } from 'react-native-paper';
import firebase from '@/config/firebase';
import { styles } from './GradesStyles';

const { db } = firebase;

const GradesScreen = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const handleSelectExam = async (exam) => {
    setSelectedExam(exam);
    setMenuVisible(false);
    setStats(null);

    try {
      const answersSnapshot = await db
        .collection('answers')
        .where('examId', '==', exam.id)
        .get();

      if (!answersSnapshot.empty) {
        const answersData = answersSnapshot.docs.map((doc) => doc.data().answers);

        const totalAnswers = answersData.length;
        const questionStats = {};

        exam.questions.forEach((_, index) => {
          const questionNumber = index + 1;
          const correctAnswers = answersData.filter(
            (answer) => answer[questionNumber] === exam.correctAnswers[questionNumber],
          ).length;

          questionStats[questionNumber] = {
            correctPercentage: (correctAnswers / totalAnswers) * 100,
          };
        });

        setStats(questionStats);
      }
    } catch (error) {
      console.error('Error al cargar las respuestas:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas del examen.');
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

        {selectedExam && stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Estadísticas del Examen:</Text>
            {Object.keys(stats).map((questionNumber) => (
              <View key={questionNumber} style={styles.questionStats}>
                <Text style={styles.statsText}>
                  Pregunta {questionNumber}: {stats[questionNumber].correctPercentage.toFixed(2)}% de aciertos
                </Text>
              </View>
            ))}
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#007BFF" />}
      </ScrollView>
    </Provider>
  );
};


export default GradesScreen;
