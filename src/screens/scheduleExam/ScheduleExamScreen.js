import React, { useState, useEffect, useMemo } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, Alert, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Book1, DocumentText, Calendar as CalendarIcon } from 'iconsax-react-native';
import { Calendar as CalendarComponent } from 'react-native-calendars';
import firebase from '@/config/firebase';
import { styles } from './ScheduleExamStyles';

const { db, firebase: firebaseInstance } = firebase;

const ScheduleExamScreen = () => {
  const navigation = useNavigation();
  const [examName, setExamName] = useState('');
  const [classroom, setClassroom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const scaleValue = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 0.98, duration: 1000, useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [scaleValue]);

  const handleDateSelect = (date) => {
    const formattedDate = new Date(date.dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setSelectedDate(formattedDate);
  };

  const calendarTheme = {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    selectedDayBackgroundColor: '#f78219',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#f78219',
    dayTextColor: '#333333',
    textDisabledColor: '#d9d9d9',
    arrowColor: '#f78219',
    monthTextColor: '#333333',
    textDayFontWeight: '500',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '500',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 12,
    'stylesheet.calendar.header': {
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
      },
    },
  };

  const saveNewExam = async () => {
    if (!examName || !classroom || !selectedDate) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await db.collection('exams').add({
        name: examName,
        classroom: classroom,
        date: selectedDate,
        createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Éxito', 'Examen agendado correctamente.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el examen.');
    } finally {
      setLoading(false);
    }
  };

  const goToMainMenu = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Book1 size={24} color="#f78219" variant="Bold" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre del Examen"
              placeholderTextColor="#999999"
              value={examName}
              onChangeText={setExamName}
            />
          </View>

          <View style={styles.inputGroup}>
            <DocumentText size={24} color="#f78219" variant="Bold" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Salón a Aplicar"
              placeholderTextColor="#999999"
              value={classroom}
              onChangeText={setClassroom}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <CalendarIcon size={20} color="#f78219" variant="Bold" /> Fecha del Examen
          </Text>

          <View style={styles.calendarContainer}>
            <CalendarComponent
              onDayPress={handleDateSelect}
              markedDates={selectedDate ? {
                [new Date(selectedDate).toISOString().split('T')[0]]: {
                  selected: true,
                  selectedColor: '#f78219',
                },
              } : {}}
              theme={calendarTheme}
              hideExtraDays
              firstDay={1}
              monthFormat="MMM yyyy"
              renderHeader={(date) => {
                const monthName = date.toString('MMM yyyy').toUpperCase();
                return (
                  <View style={styles.calendarHeader}>
                    <Text style={styles.headerMonth}>{monthName}</Text>
                  </View>
                );
              }}
            />
          </View>

          {selectedDate && (
            <Text style={styles.selectedDateText}>Seleccionado: {selectedDate}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#f78219" style={styles.loading} />
          ) : (
            <TouchableOpacity
              style={[styles.button, { transform: [{ scale: scaleValue }] }]}
              onPress={saveNewExam}
            >
              <Text style={styles.buttonText}>Crear Examen</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.menuButton} onPress={goToMainMenu}>
          <Text style={styles.buttonText}>Menú Principal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ScheduleExamScreen;
