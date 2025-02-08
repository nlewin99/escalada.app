import { OfflineStorage } from '../utils/OfflineStorage.js';
import { BoulderCard } from '../components/BoulderCard.js';

export class OfflineView {
    constructor() {
        this.container = document.getElementById('offline-container');
    }

    init() {
        this.renderSavedBoulders();
    }

    renderSavedBoulders() {
        const savedBoulders = OfflineStorage.getSavedBoulders();
        
        if (savedBoulders.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-save fa-3x"></i>
                    <h2>No hay boulders guardados</h2>
                    <p>Los boulders que guardes aparecerán aquí</p>
                </div>
            `;
            return;
        }

        this.container.innerHTML = `
            <div class="offline-header">
                <h1>Boulders Guardados</h1>
                <div class="offline-actions">
                    <button class="btn btn-primary" onclick="window.exportSavedBoulders()">
                        <i class="fas fa-file-pdf"></i> Exportar a PDF
                    </button>
                    <button id="selection-mode-btn" class="btn btn-danger" onclick="window.toggleSelectionMode()">
                        <i class="fas fa-trash"></i> Seleccionar para eliminar
                    </button>
                </div>
            </div>
            <div class="boulder-grid"></div>
        `;

        const grid = this.container.querySelector('.boulder-grid');
        savedBoulders.forEach(boulder => {
            const card = new BoulderCard(boulder, (b) => this.handleBoulderClick(b));
            grid.appendChild(card.render());
        });

        // Definir funciones globales
        window.exportSavedBoulders = () => {
            OfflineStorage.exportToPDF();
        };

        window.toggleSelectionMode = () => {
            const isSelectionMode = this.container.classList.toggle('selection-mode');
            const selectionBtn = document.getElementById('selection-mode-btn');
            
            if (isSelectionMode) {
                selectionBtn.innerHTML = '<i class="fas fa-check"></i> Terminar selección';
                selectionBtn.classList.remove('btn-danger');
                selectionBtn.classList.add('btn-secondary');
            } else {
                selectionBtn.innerHTML = '<i class="fas fa-trash"></i> Seleccionar para eliminar';
                selectionBtn.classList.remove('btn-secondary');
                selectionBtn.classList.add('btn-danger');
                // Limpiar selecciones al salir del modo
                OfflineStorage.pendingDeletions.clear();
                OfflineStorage.updatePendingUI();
            }
        };
    }

    handleBoulderClick(boulder) {
        if (this.container.classList.contains('selection-mode')) {
            OfflineStorage.togglePendingDeletion(boulder.id);
        } else {
            BoulderCard.showDetails(boulder);
        }
    }
} 