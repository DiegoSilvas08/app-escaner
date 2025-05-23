import React, { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Book1, DocumentText, Calendar as CalendarIcon } from 'iconsax-react-native';
import { Calendar as CalendarComponent } from "react-native-calendars";
import firebase from "../database/firebase"; // Importa firebase

const { db, firebase: firebaseInstance } = firebase; // Extrae db y firebase del objeto exportado

const ScheduleExamScreen = (props) => {
  const [examName, setExamName] = useState(""); // Estado para el nombre del examen
  const [numQuestions, setNumQuestions] = useState(""); // Estado para el número de preguntas
  const [selectedDate, setSelectedDate] = useState(""); // Estado para la fecha seleccionada
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga

  // Función para manejar la selección de fecha
  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  // Función para guardar el examen en Firestore
  const saveNewExam = async () => {
    if (examName === "" || numQuestions === "" || selectedDate === "") {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    setLoading(true); // Activar el indicador de carga

    try {
      await db.collection("exams").add({
        name: examName,
        questions: parseInt(numQuestions, 10),
        date: selectedDate,
        createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(), // Usa FieldValue correctamente
      });
      Alert.alert("Éxito", "Examen agendado correctamente.");
      props.navigation.goBack(); // Regresar a la pantalla anterior
    } catch (error) {
      console.error("Error al guardar el examen:", error);
      Alert.alert("Error", "No se pudo guardar el examen. Inténtalo de nuevo.");
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Campo para el nombre del examen */}
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

      {/* Campo para el número de preguntas */}
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

      {/* Calendario para seleccionar la fecha */}
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

      {/* Botón para guardar el examen */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5", // Fondo claro
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff", // Fondo blanco para los inputs
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Sombra en Android
  },
  icon: {
    marginRight: 10,
    fontSize: 24, // Tamaño del emoji
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Sombra en Android
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loading: {
    marginTop: 20,
  },
});

export default ScheduleExamScreen;