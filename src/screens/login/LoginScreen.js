import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  View,
  ImageBackground,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Message, Lock } from 'iconsax-react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import firebase from '@/config/firebase';
import { styles } from './LoginStyles';
import { validateEmail } from 'utils';

const { auth } = firebase;

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permisos de la cámara',
            message: 'Esta aplicación necesita acceso a la cámara para escanear documentos.',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permisos de la cámara concedidos');
        } else {
          console.log('Permisos de la cámara denegados');
          Alert.alert(
            'Permisos denegados',
            'No se pueden usar las funciones de escáner sin permisos de cámara.',
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === 'ios') {
      const cameraPermissionStatus = await check(PERMISSIONS.IOS.CAMERA);
      if (cameraPermissionStatus === RESULTS.DENIED) {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        if (result === RESULTS.GRANTED) {
          console.log('Permisos de la cámara concedidos');
        } else {
          console.log('Permisos de la cámara denegados');
          Alert.alert(
            'Permisos denegados',
            'No se pueden usar las funciones de escáner sin permisos de cámara.',
          );
        }
      }
    }
  };

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor, introduce un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      if (userCredential.user) {
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', 'Error al iniciar sesión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  return (
    <ImageBackground
      source={require('../../../assets/ITH3.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.inputGroup}>
          <Message size={24} color="#007BFF" variant="Bold" />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Lock size={24} color="#007BFF" variant="Bold" />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={signIn}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoginScreen;
