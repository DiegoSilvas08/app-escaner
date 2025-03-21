import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
} from 'react-native';

const HomeScreen = ({ navigation }) => {
  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          onPress: () => null, // No hace nada
          style: 'cancel',
        },
        {
          text: 'Sí',
          onPress: () => {
            // Navegar a la pantalla de inicio de sesión (LoginScreen)
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: false } // Evita que el usuario cierre la alerta tocando fuera de ella
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con la imagen header-ith.jpg */}
      <ImageBackground
        source={require('../assets/header-ith.png')} // Ajusta la ruta de la imagen
        style={styles.header}
        resizeMode="cover"
      >
      </ImageBackground>

      {/* Texto "BIENVENIDO" */}
      <Text style={styles.welcomeText}>BIENVENIDO</Text>

      {/* Contenido principal */}
      <View style={styles.gridContainer}>
        {/* Fila 1 */}
        <View style={styles.row}>
          {/* Botón 1: Escaneo */}
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => navigation.navigate('Scan')} // Navegar a ScanScreen
          >
            <Text style={styles.textAbove}>Iniciar</Text>
            <Text style={styles.emoji}>📷</Text>
            <Text style={styles.textBelow}>Escaneo</Text>
          </TouchableOpacity>

          {/* Botón 2: Consultar Calificaciones */}
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => navigation.navigate('Grades')} // Navegar a GradesScreen
          >
            <Text style={styles.textAbove}>Ver</Text>
            <Text style={styles.emoji}>📊</Text>
            <Text style={styles.textBelow}>Calificaciones</Text>
          </TouchableOpacity>
        </View>

        {/* Fila 2 */}
        <View style={styles.row}>
          {/* Botón 3: Agendar Examen */}
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => navigation.navigate('ScheduleExam')} // Navegar a ScheduleExamScreen
          >
            <Text style={styles.textAbove}>Agendar</Text>
            <Text style={styles.emoji}>📅</Text>
            <Text style={styles.textBelow}>Examen</Text>
          </TouchableOpacity>

          {/* Botón 4: Programar Hoja de Respuestas */}
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => navigation.navigate('AnswerSheet')} // Navegar a AnswerSheetScheduleScreen
          >
            <Text style={styles.textAbove}>Hoja de</Text>
            <Text style={styles.emoji}>📝</Text>
            <Text style={styles.textBelow}>Respuestas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botón para cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF', // Fondo blanco
  },
  header: {
    height: 300, // Altura del header
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 30, // Tamaño grande para el texto "BIENVENIDO"
    fontWeight: 'bold', // Texto en negrita
    color: '#333', // Color del texto
    textAlign: 'center', // Centrar el texto horizontalmente
    marginTop: 20, // Espacio arriba del texto
    marginBottom: 40, // Espacio debajo del texto
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row', // Organiza los elementos en una fila
    justifyContent: 'space-around', // Espacio uniforme entre los elementos
    width: '100%', // Ocupa todo el ancho disponible
    marginBottom: 40, // Espacio entre las filas
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, // Borde fino
    borderColor: '#007BFF', // Color del borde (azul)
    borderRadius: 10, // Bordes redondeados
    padding: 15, // Espacio interno
    width: 120, // Ancho fijo para cada botón
    height: 120, // Alto fijo para cada botón
    backgroundColor: '#007BFF', // Fondo azul para los botones
  },
  emoji: {
    fontSize: 60, // Tamaño grande para los emojis
    color: '#FFF', // Color del emoji (blanco para contrastar con el azul)
  },
  textAbove: {
    fontSize: 14, // Tamaño pequeño para el texto encima del emoji
    color: '#FFF', // Color del texto (blanco para contrastar con el azul)
    marginBottom: 5, // Espacio entre el texto y el emoji
  },
  textBelow: {
    fontSize: 14, // Tamaño pequeño para el texto debajo del emoji
    color: '#FFF', // Color del texto (blanco para contrastar con el azul)
    marginTop: 5, // Espacio entre el texto y el emoji
  },
  logoutButton: {
    backgroundColor: '#FF0000', // Fondo rojo para el botón de cerrar sesión
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20, // Margen horizontal
    marginBottom: 20, // Margen inferior
  },
  logoutButtonText: {
    color: '#FFF', // Texto blanco
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;