// Configuración de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "tu-messaging-id",
    appId: "tu-app-id",
    measurementId: "tu-measurement-id"
};

// Exportar la configuración
window.appConfig = {
    firebase: firebaseConfig
}; 