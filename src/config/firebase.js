import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCNFo4XcwMrXwjf05OsTEW4l44lEQBk83U',
  authDomain: 'app-escaner-8ae18.firebaseapp.com',
  databaseURL: 'https://app-escaner-8ae18-default-rtdb.firebaseio.com/',
  projectId: 'app-escaner-8ae18',
  storageBucket: 'app-escaner-8ae18.firebasestorage.app',
  messagingSenderId: '703434058862',
  appId: '1:703434058862:web:c06a2bf79401f5a6350a7f',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export default { firebase, db, auth, storage };
