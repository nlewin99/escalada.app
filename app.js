// Inicializar Firebase usando la configuración externa
firebase.initializeApp(window.appConfig.firebase);
const db = firebase.firestore();

// Referencias a elementos del DOM
const modal = document.getElementById('boulder-modal');
const modalContent = document.getElementById('boulder-detail-content');
const closeButton = document.querySelector('.close-button');
const sectorSelect = document.getElementById('sector-select');
const gradeSelect = document.getElementById('grade-select');
const boulderSearch = document.getElementById('boulder-search');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-item');

// Actualizar el array de imágenes para usar las locales
const sliderImages = [
    'img/1.jpeg',
    'img/2.jpeg',
    'img/3.jpeg',
];


let currentImageIndex = 0;

// Variables para almacenar los boulders
let allBoulders = [];

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
        let query = db.collection('boulders');
        if (sectorId) {
            query = query.where('sectorId', '==', sectorId);
        }
        
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            bouldersContainer.innerHTML = '<p>No se encontraron boulders para mostrar.</p>';
            return;
        }

        allBoulders = [];
        snapshot.forEach(doc => {
            const boulder = { id: doc.id, ...doc.data() };
            allBoulders.push(boulder);
        });

        filterAndDisplayBoulders();
    } catch (error) {
        console.error("Error al cargar los boulders:", error);
        bouldersContainer.innerHTML = '<p>Error al cargar los boulders. Por favor, intenta más tarde.</p>';
    }
}

// Función para filtrar y mostrar los boulders
function filterAndDisplayBoulders() {
    const searchTerm = boulderSearch.value.toLowerCase();
    const selectedGrade = gradeSelect.value;
    const bouldersContainer = document.getElementById('boulders-container');
    
    const filteredBoulders = allBoulders.filter(boulder => {
        const matchesSearch = boulder.nombre.toLowerCase().includes(searchTerm);
        const matchesGrade = !selectedGrade || boulder.grado === selectedGrade;
        return matchesSearch && matchesGrade;
    });

    bouldersContainer.innerHTML = '';
    
    if (filteredBoulders.length === 0) {
        bouldersContainer.innerHTML = '<p>No se encontraron boulders que coincidan con los criterios de búsqueda.</p>';
        return;
    }

    filteredBoulders.forEach(boulder => {
        const boulderElement = createBoulderCard(boulder);
        bouldersContainer.appendChild(boulderElement);
    });
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
    const coordsString = `${boulder.latitud},${boulder.longitud}`;
    const googleMapsUrl = `https://www.google.com/maps?q=${boulder.latitud},${boulder.longitud}`;
    
    modalContent.innerHTML = `
        <div class="boulder-detail">
            <img src="${boulder.imagenUrl}" alt="${boulder.nombre}">
            <h2>${boulder.nombre}</h2>
            <p><strong>Grado:</strong> ${boulder.grado}</p>
            <div class="location-details">
                <p><strong>Ubicación:</strong></p>
                <p class="coords">${coordsString}</p>
                <div class="location-buttons">
                    <button class="btn btn-copy" onclick="copyCoords('${coordsString}')">
                        <i class="fas fa-copy"></i> Copiar Coordenadas
                    </button>
                    <a href="${googleMapsUrl}" target="_blank" class="btn btn-maps">
                        <i class="fas fa-map-marker-alt"></i> Abrir en Google Maps
                    </a>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Función para copiar coordenadas
function copyCoords(coords) {
    navigator.clipboard.writeText(coords).then(() => {
        const copyBtn = document.querySelector('.btn-copy');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
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

// Event Listeners para filtros y búsqueda
boulderSearch.addEventListener('input', filterAndDisplayBoulders);
gradeSelect.addEventListener('change', filterAndDisplayBoulders);
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