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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referencias a elementos del DOM
const modal = document.getElementById('boulder-modal');
const modalContent = document.getElementById('boulder-detail-content');
const closeButton = document.querySelector('.close-button');
const sectorSelect = document.getElementById('sector-select');

// Cargar sectores
async function loadSectors() {
    try {
        console.log('Cargando sectores...');
        const snapshot = await db.collection('sectores').get();
        console.log('Sectores encontrados:', snapshot.size);
        snapshot.forEach(doc => {
            const sector = doc.data();
            console.log('Sector:', sector.nombre);
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = sector.nombre;
            sectorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar los sectores:", error);
    }
}

// Función para cargar los boulders
async function loadBoulders(sectorId = '') {
    const bouldersContainer = document.getElementById('boulders-container');
    bouldersContainer.innerHTML = '';
    
    try {
        console.log('Cargando boulders...', sectorId ? `para el sector: ${sectorId}` : 'todos los sectores');
        let query = db.collection('boulders');
        if (sectorId) {
            query = query.where('sectorId', '==', sectorId);
        }
        
        const snapshot = await query.get();
        console.log('Boulders encontrados:', snapshot.size);
        
        if (snapshot.empty) {
            bouldersContainer.innerHTML = '<p>No se encontraron boulders para mostrar.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const boulder = { id: doc.id, ...doc.data() };
            console.log('Boulder cargado:', boulder.nombre);
            const boulderElement = createBoulderCard(boulder);
            bouldersContainer.appendChild(boulderElement);
        });
    } catch (error) {
        console.error("Error al cargar los boulders:", error);
        bouldersContainer.innerHTML = '<p>Error al cargar los boulders. Por favor, intenta más tarde.</p>';
    }
}

// Función para crear una tarjeta de boulder
function createBoulderCard(boulder) {
    const div = document.createElement('div');
    div.className = 'boulder-card';
    
    div.innerHTML = `
        <img src="${boulder.imagenUrl}" alt="${boulder.nombre}">
        <div class="boulder-info">
            <h2>${boulder.nombre}</h2>
            <span class="boulder-grade">Grado: ${boulder.grado}</span>
        </div>
    `;
    
    div.addEventListener('click', () => showBoulderDetails(boulder));
    return div;
}

// Función para mostrar detalles del boulder
function showBoulderDetails(boulder) {
    modalContent.innerHTML = `
        <div class="boulder-detail">
            <img src="${boulder.imagenUrl}" alt="${boulder.nombre}">
            <h2>${boulder.nombre}</h2>
            <p><strong>Grado:</strong> ${boulder.grado}</p>
            <p><strong>Ubicación:</strong></p>
            <p>Latitud: ${boulder.latitud}</p>
            <p>Longitud: ${boulder.longitud}</p>
        </div>
    `;
    modal.style.display = 'block';
}

// Event Listeners
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

sectorSelect.addEventListener('change', (e) => {
    loadBoulders(e.target.value);
});

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    loadSectors();
    loadBoulders();
}); 