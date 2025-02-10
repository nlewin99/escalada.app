// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAwvkbf4uyIx38YKPw6Pm0akIhbO12gx5Y",
    authDomain: "appescalada-fdc62.firebaseapp.com",
    projectId: "appescalada-fdc62",
    storageBucket: "appescalada-fdc62.appspot.com",
    messagingSenderId: "616040598687",
    appId: "1:616040598687:web:c5c2afeb60522549cce6aa",
    measurementId: "G-NYK0E4ZHTX"
};

// Inicializar Firebase
export const initFirebase = () => {
    firebase.initializeApp(firebaseConfig);
    return {
        db: firebase.firestore(),
        auth: firebase.auth(),
        storage: firebase.storage()
    };
}; 