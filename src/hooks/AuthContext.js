import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import PropTypes from 'prop-types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { validateEmail } from '@/utils/index';
import auth, { GoogleAuthProvider } from '@react-native-firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [fbUser, fbUserLoading] = useAuthState(auth());

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
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión: ' + error.message);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const { idToken, accessToken } = await GoogleSignin.getTokens();

      if (!idToken) throw new Error('No se pudo obtener el ID Token');

      const credential = GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(credential);

      console.log('Token de acceso:', accessToken); // Opcional: úsalo si necesitas acceso a APIs de Google

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión con Google');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await auth().signOut();
    } catch (error) {
      Alert.alert('Error', 'Error al cerrar sesión: ' + error.message);
    }
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '703434058862-80ls0k2798jhflp88a73et5jb1216dkg.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    requestCameraPermission();
  }, []);

  useEffect(() => {
    setUser(fbUser);
    setAuthLoading(fbUserLoading);
  }, [fbUser, fbUserLoading]);

  const memData = useMemo(() => ({
    user,
    signIn,
    signInWithGoogle,
    signOut,
    authLoading,
  }), [user, signIn, signInWithGoogle, signOut, authLoading]);

  return <AuthContext.Provider value={memData}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.any,
};

export function useAuth() {
  return useContext(AuthContext);
}
