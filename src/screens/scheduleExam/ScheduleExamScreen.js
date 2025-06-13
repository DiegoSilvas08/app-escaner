import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Book1, DocumentText, Calendar as CalendarIcon } from 'iconsax-react-native';
import { Calendar as CalendarComponent } from 'react-native-calendars';
import firebase from '@/config/firebase';
import { styles } from './ScheduleExamStyles';

const { db, firebase: firebaseInstance } = firebase;

const ScheduleExamScreen = () => {
  const navigation = useNavigation();
  const [examName, setExamName] = useState('');
  const [numQuestions, setNumQuestions] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  const saveNewExam = async () => {
    if (examName === '' || numQuestions === '' || selectedDate === '') {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      await db.collection('exams').add({
        name: examName,
        questions: parseInt(numQuestions, 10),
        date: selectedDate,
        createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Éxito', 'Examen agendado correctamente.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar el examen:', error);
      Alert.alert('Error', 'No se pudo guardar el examen. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <Book1 size={24} color="#007BFF" variant="Bold" />
        <TextInput
          style={styles.input}
          placeholder="Nombre del Examen"
          placeholderTextColor="#888"
          value={examName}
          onChangeText={(value) => setExamName(value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <DocumentText size={24} color="#007BFF" variant="Bold" />
        <TextInput
          style={styles.input}
          placeholder="Número de Preguntas"
          placeholderTextColor="#888"
          value={numQuestions}
          onChangeText={(value) => setNumQuestions(value)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <CalendarIcon size={24} color="#007BFF" variant="Bold" />
        <Text style={styles.label}>Fecha del Examen:</Text>
      </View>
      <CalendarComponent
        onDayPress={handleDateSelect}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: 'blue' },
        }}
        theme={{
          calendarBackground: '#f9f9f9',
          selectedDayBackgroundColor: 'blue',
          todayTextColor: 'blue',
          arrowColor: 'blue',
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loading} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={saveNewExam}>
          <Text style={styles.buttonText}>Guardar Examen</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};



export default ScheduleExamScreen;
