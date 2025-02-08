// Configuración de Firebase
const firebaseConfig = {
    // Aquí deberás colocar tu configuración de Firebase
    apiKey: "tu-api-key",
    authDomain: "tu-auth-domain",
    projectId: "tu-project-id",
    storageBucket: "tu-storage-bucket",
    messagingSenderId: "tu-messaging-sender-id",
    appId: "tu-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Función para cargar los boulders
async function loadBoulders() {
    const bouldersContainer = document.getElementById('boulders-container');
    
    try {
        const snapshot = await db.collection('boulders').get();
        snapshot.forEach(doc => {
            const boulder = doc.data();
            const boulderElement = createBoulderCard(boulder);
            bouldersContainer.appendChild(boulderElement);
        });
    } catch (error) {
        console.error("Error al cargar los boulders:", error);
    }
}

// Función para crear una tarjeta de boulder
function createBoulderCard(boulder) {
    const div = document.createElement('div');
    div.className = 'boulder-card';
    
    div.innerHTML = `
        <img src="${boulder.imagen}" alt="${boulder.nombre}">
        <div class="boulder-info">
            <h2>${boulder.nombre}</h2>
            <span class="boulder-grade">Grado: ${boulder.grado}</span>
        </div>
    `;
    
    return div;
}

// Cargar los boulders cuando la página esté lista
document.addEventListener('DOMContentLoaded', loadBoulders); 