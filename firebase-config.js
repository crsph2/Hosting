
// firebase-config.js - Versión COMPATIBLE con Firebase v8
const firebaseConfig = {
  apiKey: "AIzaSyCxNI_HWssg9gtAoNxCULxZupzZSWmYXv4",
  authDomain: "pruebas-1ac9e.firebaseapp.com",
  projectId: "pruebas-1ac9e",
  storageBucket: "pruebas-1ac9e.firebasestorage.app",
  messagingSenderId: "418230723139",
  appId: "1:418230723139:web:bda284b7da4b8ad9256af6",
  measurementId: "G-5D65K25VKQ"
};

// Inicializar Firebase con el objeto global 'firebase'
firebase.initializeApp(firebaseConfig);

// Obtener la instancia de Firestore
const db = firebase.firestore();
