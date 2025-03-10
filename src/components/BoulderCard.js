import { OfflineStorage } from '../utils/OfflineStorage.js';
import { OfflineView } from '../views/OfflineView.js';
import { AuthService } from '../utils/AuthService.js';

export class BoulderCard {
    constructor(boulder, onClickCallback, onEditCallback, onDeleteCallback) {
        this.boulder = boulder;
        this.onClickCallback = onClickCallback;
        this.onEditCallback = onEditCallback;
        this.onDeleteCallback = onDeleteCallback;
    }

    render() {
        const div = document.createElement('div');
        div.className = 'boulder-card';
        if (OfflineStorage.isBoulderSaved(this.boulder.id)) {
            div.classList.add('saved');
        }
        div.dataset.boulderId = this.boulder.id;
        div.__boulder = this.boulder; // Guardar referencia al objeto boulder
        
        div.innerHTML = `
            <img src="${this.boulder.imagenUrl}" alt="${this.boulder.nombre}">
            <div class="boulder-info">
                <h2>${this.boulder.nombre}</h2>
                <span class="boulder-grade">Grado: ${this.boulder.grado}</span>
            </div>
        `;
        
        div.addEventListener('click', () => this.onClickCallback(this.boulder));
        return div;
    }

    static showDetails(boulder, onEdit, onDelete) {
        const modal = document.getElementById('boulder-modal');
        const modalContent = document.getElementById('boulder-detail-content');
        const coordsString = `${boulder.latitud},${boulder.longitud}`;
        const googleMapsUrl = `https://www.google.com/maps?q=${boulder.latitud},${boulder.longitud}`;
        const isSaved = OfflineStorage.isBoulderSaved(boulder.id);
        const isOfflineView = document.querySelector('.offline-content').style.display === 'block';
        const isAuthenticated = AuthService.getCurrentUser() !== null;
        
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
                <div class="boulder-actions">
                    ${isAuthenticated ? `
                        <button class="btn btn-primary" onclick="editBoulder('${boulder.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger" onclick="deleteBoulder('${boulder.id}')">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    ` : ''}
                    ${isOfflineView ? `
                        <button class="btn btn-danger" onclick="toggleSaveBoulder('${boulder.id}')">
                            <i class="fas fa-trash"></i> Eliminar de Guardados
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="toggleSaveBoulder('${boulder.id}')">
                            <i class="fas fa-save"></i> Guardar para Offline
                        </button>
                    `}
                </div>
            </div>
        `;
        modal.style.display = 'flex';

        // Definir las funciones globales para los botones
        window.toggleSaveBoulder = (boulderId) => {
            if (isOfflineView) {
                // En vista offline, manejar eliminación
                OfflineView.handleDeleteFromModal(boulderId);
            } else {
                // En vista boulders, solo guardar
                modal.style.display = 'none';
                document.body.classList.add('save-mode');
                OfflineStorage.saveBoulder(boulder);
            }
        };

        window.editBoulder = (boulderId) => {
            modal.style.display = 'none';
            if (onEdit) onEdit(boulder);
        };

        window.deleteBoulder = async (boulderId) => {
            if (confirm('¿Estás seguro de que deseas eliminar este boulder?')) {
                modal.style.display = 'none';
                if (onDelete) onDelete(boulder);
            }
        };

        window.copyCoords = this.copyCoords;
    }

    static copyCoords(coords) {
        navigator.clipboard.writeText(coords).then(() => {
            alert('Coordenadas copiadas al portapapeles');
        }).catch(err => {
            console.error('Error al copiar coordenadas:', err);
            alert('Error al copiar coordenadas');
        });
    }
} 