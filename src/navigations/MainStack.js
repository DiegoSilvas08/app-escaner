import { useEffect, useState } from 'react';
import { ActivityIndicator, View, PermissionsAndroid, Platform, Alert, StyleSheet } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import firebase from '@/config/firebase';
import LoginScreen from '@/screens/login/LoginScreen';
import HomeScreen from '@/screens/home/HomeScreen';
import ScanScreen from '@/screens/scan/ScanScreen';
import ScheduleExamScreen from '@/screens/scheduleExam/ScheduleExamScreen';
import AnswerSheetScreen from '@/screens/answer/AnswerSheetScreen';
import GradesScreen from '@/screens/grades/GradesScreen';

const { auth } = firebase;
const Stack = createStackNavigator();

const MainStack = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

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

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            setLoading(false);
        });

        requestCameraPermission();

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
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
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default MainStack;
