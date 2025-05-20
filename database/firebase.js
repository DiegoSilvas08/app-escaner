// firebase.js
import firebase from "firebase/compat/app"; // Importa Firebase App
import "firebase/compat/firestore"; // Importa Firestore
import "firebase/compat/auth"; // Importa el módulo de autenticación
import "firebase/compat/storage"; // Importa Firebase Storage

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCNFo4XcwMrXwjf05OsTEW4l44lEQBk83U",
    authDomain: "escaner-581ad.firebaseapp.com",
    projectId: "escaner-581ad",
    storageBucket: "escaner-581ad.firebasestorage.app",
    messagingSenderId: "608555016079",
    appId: "1:608555016079:web:0334f63fe918f2e2aa75fa"
};

// Inicializa Firebase solo si no está ya inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Obtén las instancias de Firestore, Auth y Storage
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Exporta las instancias necesarias
export default { firebase, db, auth, storage }; // Exportación nombrada