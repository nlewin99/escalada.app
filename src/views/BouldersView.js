import { BoulderCard } from '../components/BoulderCard.js';
import { OfflineStorage } from '../utils/OfflineStorage.js';
import { BoulderForm } from '../components/BoulderForm.js';
import { AuthService } from '../utils/AuthService.js';

export class BouldersView {
    constructor(db, storage) {
        this.db = db;
        this.storage = storage;
        this.allBoulders = [];
        this.sectorSelect = document.getElementById('sector-select');
        this.gradeSelect = document.getElementById('grade-select');
        this.boulderSearch = document.getElementById('boulder-search');
        this.bouldersContainer = document.getElementById('boulders-container');
        this.modal = document.getElementById('boulder-modal');
        this.closeButton = document.querySelector('.close-button');
        this.boulderForm = new BoulderForm(this.db, this.storage);
        this.actionsContainer = null;
        this.init();
    }

    init() {
        document.body.appendChild(this.boulderForm.getElement());
        this.boulderForm.setOnSuccess(() => this.loadBoulders(this.sectorSelect.value));
        this.loadSectors();
        this.loadBoulders();
        this.setupEventListeners();
        this.setupAuthListener();
    }

    setupAuthListener() {
        // Crear el contenedor de acciones si no existe
        if (!this.actionsContainer) {
            this.actionsContainer = document.createElement('div');
            this.actionsContainer.className = 'actions-container';
            const filtersContainer = document.querySelector('.filters-container');
            filtersContainer.appendChild(this.actionsContainer);
        }

        // Escuchar cambios en el estado de autenticación
        AuthService.onAuthStateChanged((user) => {
            this.updateNewBoulderButton(user);
        });
    }

    updateNewBoulderButton(user) {
        // Limpiar el contenedor de acciones
        this.actionsContainer.innerHTML = '';
        
        // Si hay un usuario autenticado, mostrar el botón
        if (user) {
            const addButton = document.createElement('button');
            addButton.className = 'btn btn-primary add-boulder-btn';
            addButton.innerHTML = '<i class="fas fa-plus"></i> Nuevo Boulder';
            addButton.onclick = () => this.boulderForm.show();
            this.actionsContainer.appendChild(addButton);
        }
    }

    setupEventListeners() {
        this.boulderSearch.addEventListener('input', () => this.filterAndDisplayBoulders());
        this.gradeSelect.addEventListener('change', () => this.filterAndDisplayBoulders());
        this.sectorSelect.addEventListener('change', (e) => this.loadBoulders(e.target.value));
        this.closeButton.addEventListener('click', () => this.modal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });
    }

    handleBoulderClick(boulder) {
        if (document.body.classList.contains('deletion-mode') || 
            document.querySelector('.main-content').classList.contains('deletion-mode')) {
            if (OfflineStorage.isBoulderSaved(boulder.id)) {
                OfflineStorage.togglePendingDeletion(boulder.id);
            }
            return;
        } else if (document.body.classList.contains('save-mode')) {
            OfflineStorage.togglePendingSave(boulder);
        } else {
            BoulderCard.showDetails(
                boulder,
                (b) => this.handleEdit(b),
                (b) => this.handleDelete(b)
            );
        }
    }

    async handleEdit(boulder) {
        this.boulderForm.show(boulder);
    }

    async handleDelete(boulder) {
        try {
            const loadingOverlay = document.getElementById('loading-overlay');
            loadingOverlay.classList.add('visible');

            // Eliminar la imagen de Storage si existe
            if (boulder.imagenUrl) {
                try {
                    const storageRef = firebase.storage().refFromURL(boulder.imagenUrl);
                    await storageRef.delete();
                } catch (error) {
                    console.error('Error al eliminar la imagen:', error);
                }
            }

            // Eliminar el documento de Firestore
            await this.db.collection('boulders').doc(boulder.id).delete();

            // Recargar los boulders
            await this.loadBoulders(this.sectorSelect.value);
        } catch (error) {
            console.error('Error al eliminar el boulder:', error);
            alert('Error al eliminar el boulder. Por favor, intenta de nuevo.');
        } finally {
            document.getElementById('loading-overlay').classList.remove('visible');
        }
    }

    async loadSectors() {
        try {
            console.log('Cargando sectores...');
            const snapshot = await this.db.collection('sectores').get();
            console.log('Sectores encontrados:', snapshot.size);
            snapshot.forEach(doc => {
                const sector = doc.data();
                console.log('Sector:', sector.nombre);
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = sector.nombre;
                this.sectorSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar los sectores:", error);
        }
    }

    async loadBoulders(sectorId = '') {
        this.bouldersContainer.innerHTML = '';
        
        try {
            let query = this.db.collection('boulders');
            if (sectorId) {
                query = query.where('sectorId', '==', sectorId);
            }
            
            const snapshot = await query.get();
            
            if (snapshot.empty) {
                this.bouldersContainer.innerHTML = '<p>No se encontraron boulders para mostrar.</p>';
                return;
            }

            this.allBoulders = [];
            snapshot.forEach(doc => {
                const boulder = { id: doc.id, ...doc.data() };
                this.allBoulders.push(boulder);
            });

            this.filterAndDisplayBoulders();
        } catch (error) {
            console.error("Error al cargar los boulders:", error);
            this.bouldersContainer.innerHTML = '<p>Error al cargar los boulders. Por favor, intenta más tarde.</p>';
        }
    }

    filterAndDisplayBoulders() {
        const searchTerm = this.boulderSearch.value.toLowerCase();
        const selectedGrade = this.gradeSelect.value;
        
        const filteredBoulders = this.allBoulders.filter(boulder => {
            const matchesSearch = boulder.nombre.toLowerCase().includes(searchTerm);
            const matchesGrade = !selectedGrade || boulder.grado === selectedGrade;
            return matchesSearch && matchesGrade;
        });

        this.bouldersContainer.innerHTML = '';
        
        if (filteredBoulders.length === 0) {
            this.bouldersContainer.innerHTML = '<p>No se encontraron boulders que coincidan con los criterios de búsqueda.</p>';
            return;
        }

        filteredBoulders.forEach(boulder => {
            const boulderCard = new BoulderCard(
                boulder,
                (b) => this.handleBoulderClick(b)
            );
            this.bouldersContainer.appendChild(boulderCard.render());
        });
    }
} 