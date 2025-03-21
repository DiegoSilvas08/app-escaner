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
import firebase from '../database/firebase'; // Importa Firebase

const { db } = firebase; // Extrae db del objeto exportado

const GradesScreen = ({ navigation }) => {
  const [selectedExam, setSelectedExam] = useState(null); // Estado para el examen seleccionado
  const [menuVisible, setMenuVisible] = useState(false); // Estado para controlar la visibilidad del menú
  const [exams, setExams] = useState([]); // Estado para almacenar los exámenes
  const [loading, setLoading] = useState(true); // Estado para el indicador de carga
  const [stats, setStats] = useState(null); // Estado para las estadísticas del examen

  // Obtener los exámenes desde Firestore al montar la pantalla
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
    setStats(null); // Reiniciar las estadísticas

    try {
      // Obtener las respuestas guardadas para este examen
      const answersSnapshot = await db
        .collection('answers')
        .where('examId', '==', exam.id)
        .get();

      if (!answersSnapshot.empty) {
        const answersData = answersSnapshot.docs.map((doc) => doc.data().answers);

        // Calcular el porcentaje de acierto por reactivo
        const totalAnswers = answersData.length;
        const questionStats = {};

        exam.questions.forEach((_, index) => {
          const questionNumber = index + 1;
          const correctAnswers = answersData.filter(
            (answer) => answer[questionNumber] === exam.correctAnswers[questionNumber]
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

        {/* Mostrar estadísticas del examen seleccionado */}
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

        {/* Indicador de carga */}
        {loading && <ActivityIndicator size="large" color="#007BFF" />}
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
  statsContainer: {
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  questionStats: {
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    color: '#333',
  },
});

export default GradesScreen;