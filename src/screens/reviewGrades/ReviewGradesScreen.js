import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { DocumentText, Calendar as CalendarIcon, Book1 } from 'iconsax-react-native';
import firebase from '@/config/firebase';
import { useNavigation } from '@react-navigation/native';
import ReviewGradesStyles from './ReviewGradesStyles';

const { db } = firebase;

const ReviewGradesScreen = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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
  }, []);

  if (loading) {
    return (
      <View style={ReviewGradesStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#f78219" />
      </View>
    );
  }

  return (
    <View style={ReviewGradesStyles.container}>
      <Text style={ReviewGradesStyles.title}>Exámenes Programados</Text>

      {exams.length === 0 ? (
        <View style={ReviewGradesStyles.emptyContainer}>
          <Text style={ReviewGradesStyles.emptyText}>No hay exámenes registrados</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={ReviewGradesStyles.scrollContainer}>
          {exams.map((exam) => (
            <View key={exam.id} style={ReviewGradesStyles.examCard}>
              <View style={ReviewGradesStyles.cardHeader}>
                <Book1 size={20} color="#f78219" variant="Bold" />
                <Text style={ReviewGradesStyles.examName}>{exam.name}</Text>
              </View>

              <View style={ReviewGradesStyles.cardRow}>
                <DocumentText size={18} color="#666" variant="Outline" />
                <Text style={ReviewGradesStyles.examText}>{exam.subject}</Text>
              </View>

              <View style={ReviewGradesStyles.cardRow}>
                <DocumentText size={18} color="#666" variant="Outline" />
                <Text style={ReviewGradesStyles.examText}>Salón: {exam.classroom}</Text>
              </View>

              <View style={ReviewGradesStyles.cardRow}>
                <CalendarIcon size={18} color="#666" variant="Outline" />
                <Text style={ReviewGradesStyles.examText}>{exam.date}</Text>
              </View>

              <View style={ReviewGradesStyles.questionsInfo}>
                <Text style={ReviewGradesStyles.questionsText}>
                  {exam.questions.length} Preguntas
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={ReviewGradesStyles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={ReviewGradesStyles.backButtonText}>Menú Principal</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReviewGradesScreen;
