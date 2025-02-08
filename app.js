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
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-item');

// Actualizar el array de imágenes para usar las locales
const sliderImages = [
    'img/1_bn.jpg',
    'img/2_bn.jpg'
];

let currentImageIndex = 0;

// Función mejorada para el slider
function initializeSlider() {
    const slider = document.querySelector('.slider');
    
    // Precargar las imágenes
    sliderImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Configurar la primera imagen
    updateSliderImage(slider);

    // Agregar estilos de transición
    slider.style.transition = 'background-image 0.5s ease-in-out';

    // Iniciar el intervalo para cambiar las imágenes
    setInterval(() => {
        currentImageIndex = (currentImageIndex + 1) % sliderImages.length;
        updateSliderImage(slider);
    }, 5000);
}

// Función actualizada para cambiar la imagen
function updateSliderImage(slider) {
    slider.style.backgroundImage = `url(${sliderImages[currentImageIndex]})`;
}

// Función para mostrar el contenido principal
function showMainContent() {
    document.querySelector('.landing-page').style.display = 'none';
    document.querySelector('.main-content').style.display = 'block';
}

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

// Event Listeners
document.getElementById('explore-button').addEventListener('click', showMainContent);

// Función para manejar el menú responsive
function toggleNav() {
    navLinks.classList.toggle('active');
}

// Event Listeners para la navegación
navToggle.addEventListener('click', toggleNav);

navItems.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.target.dataset.view;
        navigateToView(view);
        if (window.innerWidth <= 768) {
            toggleNav(); // Cerrar el menú en móviles después de hacer clic
        }
    });
});

// Cerrar el menú si se hace clic fuera de él
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        !e.target.closest('.nav-links') && 
        !e.target.closest('.nav-toggle') && 
        navLinks.classList.contains('active')) {
        toggleNav();
    }
});

// Función para navegar entre vistas
function navigateToView(viewName) {
    switch(viewName) {
        case 'landing':
            document.querySelector('.landing-page').style.display = 'block';
            document.querySelector('.main-content').style.display = 'none';
            break;
        case 'boulders':
            document.querySelector('.landing-page').style.display = 'none';
            document.querySelector('.main-content').style.display = 'block';
            break;
    }
}

// Modificar el inicializador de la página
document.addEventListener('DOMContentLoaded', () => {
    initializeSlider();
    loadSectors();
    loadBoulders();
}); 