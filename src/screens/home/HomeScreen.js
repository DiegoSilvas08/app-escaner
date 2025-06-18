import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TickSquare, TaskSquare, Calendar, ArchiveBook } from 'iconsax-react-native';
import RNFS from 'react-native-fs';
import RNPrint from 'react-native-print';
import Share from 'react-native-share';
import { useAuth } from '@/hooks/AuthContext';
import styles from './HomeStyles';

const HomeScreen = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const bottomScale = useRef(new Animated.Value(1)).current;
  const bottomOpacity = useRef(new Animated.Value(1)).current;

  const onSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  const handlePdf = async () => {
    const fileName = 'Hoja_de_respuestas.pdf';

    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    const exists = await RNFS.exists(filePath);

    if (!exists) {
      const pdfData = await RNFS.readFileAssets(fileName, 'base64');
      await RNFS.writeFile(filePath, pdfData, 'base64');
    }

    await Share.open({
      url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
      type: 'application/pdf',
      failOnCancel: false,
    });

    await RNPrint.print({ filePath });
  };

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.95, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bottomScale, { toValue: 1.02, duration: 1500, delay: 300, useNativeDriver: true }),
          Animated.timing(bottomScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(bottomOpacity, { toValue: 0.97, duration: 1500, delay: 300, useNativeDriver: true }),
          Animated.timing(bottomOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [scale, opacity, bottomScale, bottomOpacity]);

  return (
    <ImageBackground
      source={require('../../../assets/home-background.png')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.headerWrapper}>
        <Image
          source={require('../../../assets/header.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.menuTitle}>Selecciona una opción</Text>
      </View>

      <Animated.View style={[styles.menu, { transform: [{ scale }], opacity }]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ScheduleExam')}
          activeOpacity={0.8}
        >
          <Calendar size={50} color="#fffde1" variant="Bold" />
          <Text style={styles.cardLabel}>Crear Examen</Text>
        </TouchableOpacity>

        <View style={styles.cardSpacer} />

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Scan')}
          activeOpacity={0.8}
        >
          <TickSquare size={50} color="#fffde1" variant="Bold" />
          <Text style={styles.cardLabel}>Calificar Examen</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.bottomCardContainer, { transform: [{ scale: bottomScale }], opacity: bottomOpacity }]}>
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => navigation.navigate('ReviewGrades')}
          activeOpacity={0.8}
        >
          <ArchiveBook size={40} color="#fffde1" variant="Bold" />
          <Text style={styles.bottomCardLabel}>Examenes y Calificaciones</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />


        <TouchableOpacity
          style={styles.bottomCard}
          onPress={handlePdf}
          activeOpacity={0.8}
        >
          <TaskSquare size={40} color="#fffde1" variant="Bold" />
          <Text style={styles.bottomCardLabel}>Hoja de Respuestas</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={styles.logout}
        onPress={onSignOut}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fffde1" />
        ) : (
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        )}
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default HomeScreen;
