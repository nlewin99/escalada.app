import { BoulderCard } from '../components/BoulderCard.js';
import { OfflineStorage } from '../utils/OfflineStorage.js';

export class BouldersView {
    constructor(db) {
        this.db = db;
        this.allBoulders = [];
        this.sectorSelect = document.getElementById('sector-select');
        this.gradeSelect = document.getElementById('grade-select');
        this.boulderSearch = document.getElementById('boulder-search');
        this.bouldersContainer = document.getElementById('boulders-container');
        this.modal = document.getElementById('boulder-modal');
        this.closeButton = document.querySelector('.close-button');
        this.init();
    }

    init() {
        this.loadSectors();
        this.loadBoulders();
        this.setupEventListeners();
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
        // Verificar si estamos en modo eliminación
        const isInDeletionMode = document.body.classList.contains('deletion-mode') || 
                                document.querySelector('.main-content').classList.contains('deletion-mode');
        
        if (isInDeletionMode) {
            // Si el boulder está guardado, permitir su selección para eliminar
            if (OfflineStorage.isBoulderSaved(boulder.id)) {
                OfflineStorage.togglePendingDeletion(boulder.id);
            }
            return; // Importante: retornar aquí para evitar abrir el modal
        } else if (document.body.classList.contains('save-mode')) {
            OfflineStorage.togglePendingSave(boulder);
        } else {
            BoulderCard.showDetails(boulder);
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
            const boulderCard = new BoulderCard(boulder, (b) => this.handleBoulderClick(b));
            this.bouldersContainer.appendChild(boulderCard.render());
        });
    }
} 