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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TickSquare, TaskSquare, Calendar, ArchiveBook } from 'iconsax-react-native';
import RNFS from 'react-native-fs';
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
  const logoutScale = useRef(new Animated.Value(1)).current;
  const logoutOpacity = useRef(new Animated.Value(1)).current;

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, cerrar sesión',
          onPress: async () => {
            setLoading(true);
            await signOut();
            setLoading(false);
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handlePdf = async () => {
    try {
      const fileName = 'Hoja_de_respuestas.pdf';
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      if (!await RNFS.exists(filePath)) {
        const pdfData = await RNFS.readFileAssets(fileName, 'base64');
        await RNFS.writeFile(filePath, pdfData, 'base64');
      }

      await Share.open({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/pdf',
        failOnCancel: false,
      });
    } catch (error) {
      console.error('Error al compartir PDF:', error);
    }
  };

  useEffect(() => {
    const createAnimation = (animatedValue, toValue, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(animatedValue.scale, { toValue: toValue.scale, duration: 1500, useNativeDriver: true }),
            Animated.timing(animatedValue.opacity, { toValue: toValue.opacity, duration: 1500, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(animatedValue.scale, { toValue: 1, duration: 1500, useNativeDriver: true }),
            Animated.timing(animatedValue.opacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
          ]),
        ]),
      );
    };

    const topAnimation = createAnimation({ scale, opacity }, { scale: 1.03, opacity: 0.95 });
    const bottomAnimation = createAnimation({ scale: bottomScale, opacity: bottomOpacity }, { scale: 1.02, opacity: 0.97 }, 300);
    const logoutAnimation = createAnimation({ scale: logoutScale, opacity: logoutOpacity }, { scale: 1.02, opacity: 0.97 }, 600);

    topAnimation.start();
    bottomAnimation.start();
    logoutAnimation.start();

    return () => {
      topAnimation.stop();
      bottomAnimation.stop();
      logoutAnimation.stop();
    };
  }, [bottomOpacity, bottomScale, logoutOpacity, logoutScale, opacity, scale]);

  return (
    <ImageBackground source={require('../../../assets/home-background.png')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.headerWrapper}>
        <Image source={require('../../../assets/header.png')} style={styles.headerImage} resizeMode="contain" />
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

      <Animated.View style={{ transform: [{ scale: logoutScale }], opacity: logoutOpacity }}>
        <TouchableOpacity
          style={styles.logout}
          onPress={handleSignOut}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fffde1" />
          ) : (
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
};

export default HomeScreen;
