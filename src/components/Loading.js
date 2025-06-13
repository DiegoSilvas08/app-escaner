import React, { useRef, useEffect } from 'react';
import {
  Animated,
  View,
  ImageBackground,
} from 'react-native';
import { styles } from './LoadingStyles';

const Loading = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim, fadeAnim]);

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={3}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Animated.Image
          source={require('../../assets/logo_ith.png')}
          style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
          resizeMode="contain"
        />
        <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
          Cargando...
        </Animated.Text>
      </View>
    </ImageBackground>
  );
};

export default Loading;

