import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Animated, ImageBackground, Image } from 'react-native';
import { DocumentText, Calendar as CalendarIcon, Book1, Edit2, Trash } from 'iconsax-react-native';
import firebase from '@/config/firebase';
import { useNavigation } from '@react-navigation/native';
import { styles } from './ReviewGradesStyles';

const { db } = firebase;

const ReviewGradesScreen = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const menuScaleValue = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const snapshot = await db.collection('exams').orderBy('createdAt', 'desc').get();
        const examsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExams(examsData);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();

    Animated.loop(
      Animated.sequence([
        Animated.timing(menuScaleValue, { toValue: 0.98, duration: 1500, useNativeDriver: true }),
        Animated.timing(menuScaleValue, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    ).start();
  }, [menuScaleValue]);

  const handleDeleteExam = (id) => {
    Alert.alert(
      'Eliminar examen',
      '¿Estás seguro de que quieres eliminar este examen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteExam(id),
        },
      ],
    );
  };

  const deleteExam = async (id) => {
    try {
      await db.collection('exams').doc(id).delete();
      setExams(exams.filter(exam => exam.id !== id));
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el examen');
    }
  };

  if (loading) {
    return (
      <ImageBackground source={require('../../../assets/home-background.png')} style={styles.background} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f78219" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../../assets/home-background.png')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.headerWrapper}>
        <Image source={require('../../../assets/header.png')} style={styles.headerImage} resizeMode="contain" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Exámenes Programados</Text>

        {exams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay exámenes registrados</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {exams.map((exam) => (
              <View key={exam.id} style={styles.examCard}>
                <View style={styles.cardHeader}>
                  <Book1 size={18} color="#f78219" variant="Bold" />
                  <Text style={styles.examName}>{exam.name}</Text>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('EditExam', { examId: exam.id })}>
                      <Edit2 size={18} color="#008f39" variant="Bold" style={styles.actionIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteExam(exam.id)}>
                      <Trash size={18} color="#ff0000" variant="Bold" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardRow}>
                  <DocumentText size={16} color="#666" variant="Outline" />
                  <Text style={styles.examText}>{exam.subject}</Text>
                </View>

                <View style={styles.cardRow}>
                  <DocumentText size={16} color="#666" variant="Outline" />
                  <Text style={styles.examText}>Salón: {exam.classroom}</Text>
                </View>

                <View style={styles.cardRow}>
                  <CalendarIcon size={16} color="#666" variant="Outline" />
                  <Text style={styles.examText}>{exam.date}</Text>
                </View>

                <View style={styles.questionsInfo}>
                  <Text style={styles.questionsText}>
                    {exam.questions.length} Preguntas
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <Animated.View style={[styles.menuButtonContainer, { transform: [{ scale: menuScaleValue }] }]}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Home')}  // Cambiado de navigation.goBack() a navigation.navigate('Home')
          >
            <Text style={styles.menuButtonText}>Menú Principal</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default ReviewGradesScreen;
