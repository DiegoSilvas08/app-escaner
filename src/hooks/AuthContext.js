import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import PropTypes from 'prop-types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { validateEmail } from '@/utils/index';
import firebase from '@/config/firebase';

const AuthContext = createContext(null);
const { auth } = firebase;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [fbUser, fbUserLoading] = useAuthState(auth);

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
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
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
        if (result !== RESULTS.GRANTED) {
          Alert.alert(
            'Permisos denegados',
            'No se pueden usar las funciones de escáner sin permisos de cámara.',
          );
        }
      }
    }
  };

  const signIn = useCallback(async (email, password) => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor, introduce un correo electrónico válido.');
      return;
    }
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión: ' + error.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthLoading(true);
      await auth.signOut();
    } catch (error) {
      Alert.alert('Error', 'Error al cerrar sesión: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  useEffect(() => {
    setUser(fbUser);
    setAuthLoading(fbUserLoading);
  }, [fbUser, fbUserLoading]);

  const memData = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      authLoading,
    }),
    [user, signIn, signOut, authLoading],
  );

  return <AuthContext.Provider value={memData}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.any,
};

export function useAuth() {
  return useContext(AuthContext);
}
