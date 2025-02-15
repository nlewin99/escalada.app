import { AuthService } from '../utils/AuthService.js';

export class SectorManager {
    constructor(db) {
        this.container = document.querySelector('.sector-manager-content');
        this.sectores = [];
        this.db = db;
        this.unsubscribe = null;
        this.init();
    }

    init() {
        this.render();
        this.setupRealTimeUpdates();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="filters-container">
                <div class="sector-form">
                    <input type="text" id="sector-name" placeholder="Nombre del sector" class="form-control">
                    <button id="add-sector" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Agregar Sector
                    </button>
                </div>
            </div>
            <div class="sectors-grid" id="sectors-container"></div>
        `;
    }

    setupEventListeners() {
        const addButton = this.container.querySelector('#add-sector');
        const input = this.container.querySelector('#sector-name');

        addButton.addEventListener('click', () => this.handleAddSector());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddSector();
            }
        });
    }

    setupRealTimeUpdates() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        this.unsubscribe = this.db.collection('sectores')
            .orderBy('nombre')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    const sector = { id: change.doc.id, ...change.doc.data() };
                    
                    if (change.type === 'added') {
                        this.sectores.push(sector);
                    } else if (change.type === 'modified') {
                        const index = this.sectores.findIndex(s => s.id === sector.id);
                        if (index !== -1) {
                            this.sectores[index] = sector;
                        }
                    } else if (change.type === 'removed') {
                        const index = this.sectores.findIndex(s => s.id === sector.id);
                        if (index !== -1) {
                            this.sectores.splice(index, 1);
                        }
                    }
                });
                
                this.renderSectores();
                this.updateSectorSelect();
            });
    }

    async handleSectorAction(action, sectorId, newData = null) {
        try {
            const sectorRef = this.db.collection('sectores').doc(sectorId);
            
            // Actualización optimista
            const index = this.sectores.findIndex(s => s.id === sectorId);
            
            if (action === 'delete') {
                if (index !== -1) {
                    this.sectores.splice(index, 1);
                    this.renderSectores();
                }
                await sectorRef.delete();
            } else if (action === 'update' && newData) {
                if (index !== -1) {
                    this.sectores[index] = { ...this.sectores[index], ...newData };
                    this.renderSectores();
                }
                await sectorRef.update(newData);
            }
        } catch (error) {
            console.error('Error en la acción del sector:', error);
            // Revertir cambios optimistas
            this.setupRealTimeUpdates();
            alert('Error al procesar la acción. Por favor, intenta de nuevo.');
        }
    }

    renderSectores() {
        const container = this.container.querySelector('#sectors-container');
        if (this.sectores.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-layer-group fa-3x"></i>
                    <h2>No hay sectores registrados</h2>
                    <p>Agrega un nuevo sector usando el formulario superior</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.sectores.map(sector => `
            <div class="sector-card" data-id="${sector.id}">
                <div class="sector-card-content">
                    <h3 class="sector-name">${sector.nombre}</h3>
                    <div class="sector-actions">
                        <button class="btn btn-edit" onclick="editSector('${sector.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-delete" onclick="deleteSector('${sector.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Definir funciones globales para los botones
        window.editSector = async (sectorId) => {
            const sector = this.sectores.find(s => s.id === sectorId);
            const newName = prompt('Nuevo nombre para el sector:', sector.nombre);
            if (newName && newName.trim() !== '') {
                try {
                    await this.handleSectorAction('update', sectorId, { nombre: newName.trim() });
                } catch (error) {
                    console.error('Error al actualizar sector:', error);
                    alert('Error al actualizar el sector');
                }
            }
        };

        window.deleteSector = async (sectorId) => {
            if (confirm('¿Estás seguro de que deseas eliminar este sector?')) {
                try {
                    await this.handleSectorAction('delete', sectorId);
                } catch (error) {
                    console.error('Error al eliminar sector:', error);
                    alert('Error al eliminar el sector');
                }
            }
        };
    }

    async handleAddSector() {
        const input = this.container.querySelector('#sector-name');
        const nombre = input.value.trim();

        if (nombre === '') {
            alert('Por favor ingresa un nombre para el sector');
            return;
        }

        try {
            await this.db.collection('sectores').add({
                nombre,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            input.value = '';
        } catch (error) {
            console.error('Error al agregar sector:', error);
            alert('Error al agregar el sector');
        }
    }

    show() {
        if (!AuthService.getCurrentUser()) {
            alert('Debes iniciar sesión para gestionar sectores');
            return;
        }
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }
} 