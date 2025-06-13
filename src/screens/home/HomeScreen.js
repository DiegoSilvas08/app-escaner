import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, Calendar } from 'iconsax-react-native';
import { styles } from './HomeStyles';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Sí',
          onPress: () => {
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/ith_header.png')} style={styles.headerImage} />

      <Text style={styles.welcomeText}>BIENVENIDO</Text>

      <View style={styles.gridContainer}>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.textAbove}>Iniciar</Text>
            <Camera size={40} color="#FFF" variant="Bold" />
            <Text style={styles.textBelow}>Escaneo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => navigation.navigate('ScheduleExam')}
          >
            <Text style={styles.textAbove}>Agendar</Text>
            <Calendar size={40} color="#FFF" variant="Bold" />
            <Text style={styles.textBelow}>Examen</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};



export default HomeScreen;
