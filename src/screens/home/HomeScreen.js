import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, Calendar } from 'iconsax-react-native';
import { useAuth } from '@/hooks/AuthContext';
import { styles } from './HomeStyles';

const HomeScreen = () => {
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const onSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.95, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [scale, opacity]);

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
          onPress={() => navigation.navigate('Scan')}
          activeOpacity={0.8}
        >
          <Camera size={50} color="#fffde1" variant="Bold" />
          <Text style={styles.cardLabel}>Escanear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ScheduleExam')}
          activeOpacity={0.8}
        >
          <Calendar size={50} color="#fffde1" variant="Bold" />
          <Text style={styles.cardLabel}>Agendar</Text>
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
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        )}
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default HomeScreen;
