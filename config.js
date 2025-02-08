// Configuración de Firebase para desarrollo
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-bucket.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
    appId: process.env.FIREBASE_APP_ID || "your-app-id",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "your-measurement-id"
};

// Exportar la configuración
window.appConfig = {
    firebase: firebaseConfig
}; 