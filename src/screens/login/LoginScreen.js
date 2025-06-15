import React, { useState, useEffect } from 'react';
import {
  TextInput,
  SafeAreaView,
  View,
  ImageBackground,
  Image,
  Animated,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Message, Lock } from 'iconsax-react-native';
import { useAuth } from '@/hooks/AuthContext';
import { styles } from './LoginStyles';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';

const LoginScreen = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const googleScaleAnim = React.useRef(new Animated.Value(1)).current;
  const googleOpacityAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '703434058862-80ls0k2798jhflp88a73et5jb1216dkg.apps.googleusercontent.com',
    });
  }, []);

  const onSignInPressed = async () => {
    try {
      setSignInLoading(true);
      await signIn(email, password);
    } catch (e) {
      console.log(e);
    } finally {
      setSignInLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      let idToken = signInResult.data?.idToken;
      if (!idToken) {idToken = signInResult.idToken;}
      if (!idToken) {throw new Error('No ID token found');}

      const googleCredential = GoogleAuthProvider.credential(idToken);
      return signInWithCredential(getAuth(), googleCredential);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const onGoogleSignInPressed = async () => {
    try {
      setGoogleLoading(true);
      await handleGoogleSignIn();
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0.9, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(googleScaleAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
          Animated.timing(googleScaleAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(googleOpacityAnim, { toValue: 0.95, duration: 1500, useNativeDriver: true }),
          Animated.timing(googleOpacityAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [opacityAnim, scaleAnim, googleOpacityAnim, googleScaleAnim]);

  return (
    <ImageBackground
      source={require('../../../assets/background.png')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={1}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <Image
          source={require('../../../assets/logo_ith.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Image
          source={require('../../../assets/header.png')}
          style={styles.header}
          resizeMode="contain"
        />
        <View style={styles.inputGroup}>
          <Message size={24} color="#f78219" variant="Bold" />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputGroup}>
          <Lock size={24} color="#f78219" variant="Bold" />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <Animated.View
          style={[
            styles.animatedView,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.loginButton}
            onPress={onSignInPressed}
            activeOpacity={0.8}
            disabled={signInLoading}
          >
            {signInLoading ? <ActivityIndicator color={'#fdfceb'} /> : <Text style={styles.loginButtonText}>Iniciar Sesión</Text>}
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            styles.animatedView,
            {
              transform: [{ scale: googleScaleAnim }],
              opacity: googleOpacityAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.loginButton, styles.googleButton]}
            onPress={onGoogleSignInPressed}
            activeOpacity={0.8}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color={'#fdfceb'} />
            ) : (
              <View style={styles.googleButtonContent}>
                <Image
                  source={require('../../../assets/google-icon.png')}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoginScreen;
