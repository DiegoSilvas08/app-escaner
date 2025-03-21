import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, PermissionsAndroid, Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import firebase from './database/firebase'; // Importa firebase como un objeto
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import ScheduleExamScreen from './screens/ScheduleExamScreen';
import AnswerSheetScreen from './screens/AnswerSheetScreen';
import GradesScreen from './screens/GradesScreen';

const { auth } = firebase; // Extrae auth del objeto exportado

const Stack = createStackNavigator();

function App() {
  const [loading, setLoading] = React.useState(true); // Estado para manejar la carga inicial
  const [user, setUser] = React.useState(null); // Estado para almacenar el usuario autenticado

  // Verificar permisos de cámara en Android e iOS
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permisos de cámara',
            message: 'Esta aplicación necesita acceso a la cámara para escanear documentos.',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permisos de cámara concedidos');
        } else {
          Alert.alert('Permisos denegados', 'No se pueden usar las funciones de escaneo sin permisos de cámara.');
        }
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === 'ios') {
      const cameraPermissionStatus = await check(PERMISSIONS.IOS.CAMERA);
      if (cameraPermissionStatus === RESULTS.DENIED) {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        if (result === RESULTS.GRANTED) {
          console.log('Permisos de cámara concedidos');
        } else {
          Alert.alert('Permisos denegados', 'No se pueden usar las funciones de escaneo sin permisos de cámara.');
        }
      }
    }
  };

  // Efecto para verificar el estado de autenticación al cargar la aplicación
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Actualiza el estado del usuario
      setLoading(false); // Finaliza la carga
    });

    // Solicitar permisos de cámara al cargar la aplicación
    requestCameraPermission();

    return unsubscribe; // Limpia la suscripción al desmontar el componente
  }, []);

  // Muestra un indicador de carga mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Home' : 'Login'}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Scan"
          component={ScanScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ScheduleExam"
          component={ScheduleExamScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AnswerSheet"
          component={AnswerSheetScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Grades"
          component={GradesScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;