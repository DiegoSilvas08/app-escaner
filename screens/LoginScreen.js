import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  View,
  ImageBackground,
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import firebase from "../database/firebase"; // Importa firebase como un objeto

const { auth } = firebase; // Extrae auth del objeto exportado

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para solicitar permisos de la cámara
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Permisos de la cámara",
            message: "Esta aplicación necesita acceso a la cámara para escanear documentos.",
            buttonNeutral: "Preguntar después",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Permisos de la cámara concedidos");
        } else {
          console.log("Permisos de la cámara denegados");
          Alert.alert(
            "Permisos denegados",
            "No se pueden usar las funciones de escáner sin permisos de cámara."
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === "ios") {
      const cameraPermissionStatus = await check(PERMISSIONS.IOS.CAMERA);
      if (cameraPermissionStatus === RESULTS.DENIED) {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        if (result === RESULTS.GRANTED) {
          console.log("Permisos de la cámara concedidos");
        } else {
          console.log("Permisos de la cámara denegados");
          Alert.alert(
            "Permisos denegados",
            "No se pueden usar las funciones de escáner sin permisos de cámara."
          );
        }
      }
    }
  };

  // Solicitar permisos al cargar la pantalla
  useEffect(() => {
    requestCameraPermission();
  }, []);

  // Función para validar el formato del correo electrónico
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Función para manejar el inicio de sesión
  const signIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Por favor, introduce un correo electrónico válido.");
      return;
    }

    setLoading(true);
    try {
      // Inicia sesión con Firebase Authentication
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      if (userCredential.user) {
        // Redirige a la pantalla Home después de un inicio de sesión exitoso
        navigation.replace("Home");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      Alert.alert("Error", "Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/ITH.jpg")} // Carga la imagen de fondo
      style={styles.background}
      resizeMode="cover" // Ajusta la imagen para cubrir toda la pantalla
    >
      <SafeAreaView style={styles.container}>
        {/* Grupo de entrada para el correo electrónico */}
        <View style={styles.inputGroup}>
          {/* Reemplaza el ícono de correo con un texto o imagen */}
          <Text style={styles.icon}>📧</Text> {/* Emoji como ícono */}
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

        {/* Grupo de entrada para la contraseña */}
        <View style={styles.inputGroup}>
          {/* Reemplaza el ícono de candado con un texto o imagen */}
          <Text style={styles.icon}>🔒</Text> {/* Emoji como ícono */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Mostrar un ActivityIndicator si loading es true, de lo contrario mostrar el botón de inicio de sesión */}
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

// Estilos
const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Fondo semi-transparente para mejorar la legibilidad
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#1A237E",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
    fontSize: 24, // Tamaño del emoji
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  button: {
    width: "100%",
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;