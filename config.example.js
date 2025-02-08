// Configuración de Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "TU_API_KEY",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "tu-proyecto.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "tu-proyecto",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "tu-proyecto.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "tu-messaging-id",
    appId: process.env.FIREBASE_APP_ID || "tu-app-id",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "tu-measurement-id"
};

// Exportar la configuración
window.appConfig = {
    firebase: firebaseConfig
}; 