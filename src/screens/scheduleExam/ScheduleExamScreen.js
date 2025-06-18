import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  BackHandler,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Book1, DocumentText, Calendar as CalendarIcon, Add, CloseCircle, Edit2, Trash } from 'iconsax-react-native';
import { Calendar as CalendarComponent } from 'react-native-calendars';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import firebase from '@/config/firebase';
import styles from './ScheduleExamStyles.js';

Dimensions.get('window');
const { db, firebase: firebaseInstance } = firebase;

const ScheduleExamScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    subject: '',
    examName: '',
    classroom: '',
    selectedDate: '',
    dateRange: {},
    questions: [],
    currentQuestion: { text: '', options: ['', '', '', ''], correctAnswer: 0, editingIndex: null },
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scaleValue = useMemo(() => new Animated.Value(1), []);
  const printScaleValue = useMemo(() => new Animated.Value(1), []);
  const menuScaleValue = useMemo(() => new Animated.Value(1), []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      const timer = setTimeout(() => setInitialLoading(false), 1500);
      return () => {
        backHandler.remove();
        clearTimeout(timer);
      };
    }, [navigation]),
  );

  useEffect(() => {
    const createAnimation = (value) => Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 0.98, duration: 1500, useNativeDriver: true }),
        Animated.timing(value, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    );
    createAnimation(scaleValue).start();
    createAnimation(printScaleValue).start();
    createAnimation(menuScaleValue).start();
  }, [scaleValue, printScaleValue, menuScaleValue]);

  const handleDateSelect = (date) => {
    const startDate = new Date(date.dateString);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 13);
    const range = {};
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      range[dateStr] = { selected: true, selectedColor: '#f78219' };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const format = { year: 'numeric', month: 'long', day: 'numeric' };
    setFormData(prev => ({
      ...prev,
      dateRange: range,
      selectedDate: `${startDate.toLocaleDateString('es-ES', format)} - ${endDate.toLocaleDateString('es-ES', format)}`,
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionInput = (field, value, index = null) => {
    if (index !== null) {
      const newOptions = [...formData.currentQuestion.options];
      newOptions[index] = value;
      setFormData(prev => ({ ...prev, currentQuestion: { ...prev.currentQuestion, options: newOptions } }));
    } else {
      setFormData(prev => ({ ...prev, currentQuestion: { ...prev.currentQuestion, [field]: value } }));
    }
  };

  const handleAddQuestion = () => {
    if (formData.questions.length >= 20) {
      Alert.alert('Límite alcanzado', 'Máximo 20 preguntas por examen');
      return;
    }
    setFormData(prev => ({ ...prev, currentQuestion: { text: '', options: ['', '', '', ''], correctAnswer: 0, editingIndex: null } }));
    setModalVisible(true);
  };

  const handleEditQuestion = (index) => {
    const questionToEdit = formData.questions[index];
    setFormData(prev => ({
      ...prev,
      currentQuestion: {
        ...questionToEdit,
        editingIndex: index,
      },
    }));
    setModalVisible(true);
  };

  const handleDeleteQuestion = (index) => {
    Alert.alert(
      'Eliminar pregunta',
      '¿Estás seguro de que quieres eliminar esta pregunta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setFormData(prev => {
              const newQuestions = [...prev.questions];
              newQuestions.splice(index, 1);
              return { ...prev, questions: newQuestions };
            });
          },
        },
      ],
    );
  };

  const saveQuestion = () => {
    if (!formData.currentQuestion.text || formData.currentQuestion.options.some(opt => !opt)) {
      Alert.alert('Error', 'Completa la pregunta y todas las opciones');
      return;
    }

    setFormData(prev => {
      const newQuestions = [...prev.questions];
      if (prev.currentQuestion.editingIndex !== null) {
        newQuestions[prev.currentQuestion.editingIndex] = {
          text: prev.currentQuestion.text,
          options: prev.currentQuestion.options,
          correctAnswer: prev.currentQuestion.correctAnswer,
        };
      } else {
        newQuestions.push({
          text: prev.currentQuestion.text,
          options: prev.currentQuestion.options,
          correctAnswer: prev.currentQuestion.correctAnswer,
        });
      }
      return {
        ...prev,
        questions: newQuestions,
        currentQuestion: { text: '', options: ['', '', '', ''], correctAnswer: 0, editingIndex: null },
      };
    });
    setModalVisible(false);
  };

  const saveNewExam = async () => {
    if (!formData.subject || !formData.examName || !formData.classroom || !formData.selectedDate || formData.questions.length === 0) {
      Alert.alert('Error', 'Completa todos los campos y agrega al menos una pregunta');
      return;
    }

    setLoading(true);
    try {
      await db.collection('exams').add({
        subject: formData.subject,
        name: formData.examName,
        classroom: formData.classroom,
        date: formData.selectedDate,
        questions: formData.questions,
        createdAt: firebaseInstance.firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Éxito', 'Examen creado correctamente');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Error al guardar el examen');
    } finally {
      setLoading(false);
    }
  };

  const generateAnswerKeyPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 13px; }
            h1 { color:rgb(0, 0, 0); text-align: center; }
            .info { margin-bottom: 13px; }
            .question { margin-bottom: 13px; }
            .correct { color: #4CAF50; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Clave de Respuestas - ${formData.examName}</h1>
          <div class="info">
            <p><strong>Materia:</strong> ${formData.subject}</p>
            <p><strong>Salón:</strong> ${formData.classroom}</p>
            <p><strong>Fecha:</strong> ${formData.selectedDate}</p>
          </div>
          ${formData.questions.map((q, i) => `
            <div class="question">
              <p><strong>${i + 1}.</strong> ${q.text}</p>
              <p class="correct">Respuesta correcta: ${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const options = {
      html: htmlContent,
      fileName: `Clave_Respuestas_${formData.examName.replace(/\s+/g, '_')}`,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  };

  const generateExamPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 13px; }
            h1 { color:rgb(0, 0, 0); text-align: center; }
            .info { margin-bottom: 13px; }
            .question { margin-bottom: 13px; }
            .options { margin-left: 13px; }
          </style>
        </head>
        <body>
          <h1>${formData.examName}</h1>
          <div class="info">
            <p><strong>Materia:</strong> ${formData.subject}</p>
            <p><strong>Salón:</strong> ${formData.classroom}</p>
            <p><strong>Fecha:</strong> ${formData.selectedDate}</p>
          </div>
          ${formData.questions.map((q, i) => `
            <div class="question">
              <p><strong>${i + 1}.</strong> ${q.text}</p>
              <div class="options">
                ${q.options.map((opt, j) => `<p>${String.fromCharCode(65 + j)}. ${opt}</p>`).join('')}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const options = {
      html: htmlContent,
      fileName: `Examen_${formData.examName.replace(/\s+/g, '_')}`,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  };

  const generateAndSharePDFs = async () => {
    try {
      setLoading(true);
      const examPath = await generateExamPDF();
      const answerKeyPath = await generateAnswerKeyPDF();

      await Share.open({
        title: 'Compartir Examen',
        urls: [
          `file://${examPath}`,
          `file://${answerKeyPath}`,
        ],
        type: 'application/pdf',
      });
    } finally {
      setLoading(false);
    }
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
    textDayFontSize: 14,
    textMonthFontSize: 14,
    textDayHeaderFontSize: 12,
    monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
    dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
    'stylesheet.calendar.main': {
      week: {
        marginTop: 0,
        marginBottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 32,
      },
    },
    'stylesheet.calendar.header': {
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        marginBottom: 0,
        paddingBottom: 0,
      },
    },
  };

  if (initialLoading) {
    return (
      <ImageBackground
        source={require('../../../assets/home-background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f78219" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/home-background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.headerWrapper}>
        <Image
          source={require('../../../assets/header.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Book1 size={18} color="#f78219" variant="Bold" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Materia"
              placeholderTextColor="#999999"
              value={formData.subject}
              onChangeText={(text) => handleInputChange('subject', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Book1 size={18} color="#f78219" variant="Bold" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre del Examen"
              placeholderTextColor="#999999"
              value={formData.examName}
              onChangeText={(text) => handleInputChange('examName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <DocumentText size={18} color="#f78219" variant="Bold" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Salón a Aplicar"
              placeholderTextColor="#999999"
              value={formData.classroom}
              onChangeText={(text) => handleInputChange('classroom', text)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <CalendarIcon size={16} color="#f78219" variant="Bold" /> Fecha del Examen
          </Text>
          <View style={styles.calendarContainer}>
            <CalendarComponent
              onDayPress={handleDateSelect}
              markedDates={formData.dateRange}
              theme={calendarTheme}
              hideExtraDays
              firstDay={1}
              monthFormat="MMMM yyyy"
              renderHeader={(date) => (
                <View style={styles.calendarHeader}>
                  <Text style={styles.headerMonth}>
                    {date.toString('MMMM yyyy').charAt(0).toUpperCase() + date.toString('MMMM yyyy').slice(1)}
                  </Text>
                </View>
              )}
            />
          </View>
          {formData.selectedDate && <Text style={styles.selectedDateText}>Seleccionado: {formData.selectedDate}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preguntas ({formData.questions.length}/20)</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddQuestion}>
            <Add size={16} color="#f78219" variant="Bold" />
            <Text style={styles.addButtonText}>Agregar Pregunta</Text>
          </TouchableOpacity>

          {formData.questions.map((q, i) => (
            <View key={i} style={styles.questionItem}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionText}>{i + 1}. {q.text}</Text>
                <View style={styles.questionActions}>
                  <TouchableOpacity onPress={() => handleEditQuestion(i)}>
                    <Edit2 size={16} color="#008f39" variant="Bold" style={styles.actionIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteQuestion(i)}>
                    <Trash size={16} color="#ff0000" variant="Bold" />
                  </TouchableOpacity>
                </View>
              </View>
              {q.options.map((opt, j) => (
                <Text key={j} style={styles.optionText}>{String.fromCharCode(65 + j)}. {opt}</Text>
              ))}
              <Text style={styles.correctAnswer}>✓ {String.fromCharCode(65 + q.correctAnswer)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {loading ? <ActivityIndicator size="small" color="#f78219" /> : (
            <>
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={saveNewExam}
                >
                  <Text style={styles.buttonText}>Guardar Examen</Text>
                </TouchableOpacity>
              </Animated.View>

              {formData.questions.length > 0 && (
                <Animated.View style={[styles.printButtonContainer, { transform: [{ scale: printScaleValue }] }]}>
                  <TouchableOpacity
                    style={styles.printButton}
                    onPress={generateAndSharePDFs}
                  >
                    <Text style={styles.buttonText}>Generar PDFs</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </>
          )}
        </View>

        <Animated.View style={{ transform: [{ scale: menuScaleValue }] }}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Menú Principal</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {formData.currentQuestion.editingIndex !== null ? 'Editar Pregunta' : 'Nueva Pregunta'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <CloseCircle size={20} color="#f78219" />
              </Pressable>
            </View>

            <TextInput
              style={styles.questionInput}
              placeholder="Escribe la pregunta"
              value={formData.currentQuestion.text}
              onChangeText={(text) => handleQuestionInput('text', text)}
            />

            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.optionContainer}>
                <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}.</Text>
                <TextInput
                  style={styles.optionInput}
                  placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                  value={formData.currentQuestion.options[i]}
                  onChangeText={(text) => handleQuestionInput('options', text, i)}
                />
                <Pressable
                  style={[
                    styles.radioButton,
                    formData.currentQuestion.correctAnswer === i && styles.radioButtonSelected,
                  ]}
                  onPress={() => handleQuestionInput('correctAnswer', i)}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.saveQuestionButton} onPress={saveQuestion}>
              <Text style={styles.saveQuestionText}>
                {formData.currentQuestion.editingIndex !== null ? 'Actualizar Pregunta' : 'Guardar Pregunta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default ScheduleExamScreen;
