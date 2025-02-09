export class OfflineStorage {
    static STORAGE_KEY = 'saved_boulders';
    static PENDING_KEY = 'pending_boulders';
    static pendingChanges = new Set();
    static pendingDeletions = new Set();

    static addToPending(boulder) {
        this.pendingChanges.add(boulder.id);
        this.updatePendingUI();
    }

    static removeFromPending(boulderId) {
        this.pendingChanges.delete(boulderId);
        this.updatePendingUI();
    }

    static addToPendingDeletions(boulderId) {
        this.pendingDeletions.add(boulderId);
        const confirmButton = document.getElementById('confirm-changes');
        confirmButton.classList.add('visible', 'delete-mode');
        this.updatePendingUI();
    }

    static removeFromPendingDeletions(boulderId) {
        this.pendingDeletions.delete(boulderId);
        this.updatePendingUI();
    }

    static togglePendingDeletion(boulderId) {
        if (this.pendingDeletions.has(boulderId)) {
            this.removeFromPendingDeletions(boulderId);
        } else {
            this.addToPendingDeletions(boulderId);
        }
    }

    static togglePendingSave(boulder) {
        if (this.pendingChanges.has(boulder.id)) {
            this.removeFromPending(boulder.id);
        } else {
            this.addToPending(boulder);
        }
    }

    static updatePendingUI() {
        const confirmButton = document.getElementById('confirm-changes');
        const cancelButton = document.getElementById('cancel-selection');
        const counter = confirmButton.querySelector('.counter');
        const count = this.pendingChanges.size + this.pendingDeletions.size;
        
        counter.textContent = count;
        confirmButton.classList.toggle('visible', count > 0);
        cancelButton.classList.toggle('visible', count > 0);

        if (this.pendingDeletions.size > 0) {
            confirmButton.innerHTML = `
                <span class="counter">${this.pendingDeletions.size}</span>
                <i class="fas fa-trash"></i>
                <span>Eliminar seleccionados</span>
            `;
            confirmButton.classList.add('delete-mode');
            confirmButton.classList.remove('save-mode');
        } else if (this.pendingChanges.size > 0) {
            confirmButton.innerHTML = `
                <span class="counter">${this.pendingChanges.size}</span>
                <i class="fas fa-save"></i>
                <span>Guardar seleccionados</span>
            `;
            confirmButton.classList.add('save-mode');
            confirmButton.classList.remove('delete-mode');
        } else {
            confirmButton.classList.remove('save-mode', 'delete-mode');
            document.body.classList.remove('save-mode', 'deletion-mode');
            document.querySelector('.main-content')?.classList.remove('deletion-mode');
        }

        // Actualizar visual de las tarjetas
        document.querySelectorAll('.boulder-card').forEach(card => {
            const boulderId = card.dataset.boulderId;
            if (this.pendingDeletions.has(boulderId)) {
                card.classList.add('selected-for-deletion');
                card.classList.remove('selected-for-offline');
            } else if (this.pendingChanges.has(boulderId)) {
                card.classList.add('selected-for-offline');
                card.classList.remove('selected-for-deletion');
            } else {
                card.classList.remove('selected-for-offline', 'selected-for-deletion');
            }
        });
    }

    static cancelSelection() {
        this.pendingChanges.clear();
        this.pendingDeletions.clear();
        document.body.classList.remove('save-mode', 'deletion-mode');
        document.querySelector('.main-content')?.classList.remove('deletion-mode');
        this.updatePendingUI();
    }

    static async confirmChanges() {
        if (this.pendingDeletions.size > 0) {
            return this.confirmDeletions();
        }

        if (this.pendingChanges.size === 0) return;

        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.add('visible');

        try {
            const currentBoulders = this.getSavedBoulders();
            const updatedBoulders = [...currentBoulders];

            this.pendingChanges.forEach(boulderId => {
                const boulder = this.findBoulderById(boulderId);
                if (boulder && !this.isBoulderSaved(boulderId)) {
                    updatedBoulders.push(boulder);
                }
            });

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedBoulders));
            this.pendingChanges.clear();
            this.updatePendingUI();
            document.body.classList.remove('save-mode');

            await new Promise(resolve => setTimeout(resolve, 800));
            window.location.reload();
        } catch (error) {
            console.error('Error al confirmar cambios:', error);
            alert('Error al guardar los cambios. Por favor, intenta de nuevo.');
        } finally {
            loadingOverlay.classList.remove('visible');
        }
    }

    static async confirmDeletions() {
        if (this.pendingDeletions.size === 0) return;

        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.add('visible');

        try {
            const currentBoulders = this.getSavedBoulders();
            const updatedBoulders = currentBoulders.filter(
                boulder => !this.pendingDeletions.has(boulder.id)
            );

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedBoulders));
            this.pendingDeletions.clear();
            this.updatePendingUI();
            document.body.classList.remove('deletion-mode');

            await new Promise(resolve => setTimeout(resolve, 800));
            window.location.reload();
        } catch (error) {
            console.error('Error al eliminar boulders:', error);
            alert('Error al eliminar los boulders. Por favor, intenta de nuevo.');
        } finally {
            loadingOverlay.classList.remove('visible');
        }
    }

    static findBoulderById(boulderId) {
        const card = document.querySelector(`.boulder-card[data-boulder-id="${boulderId}"]`);
        if (card && card.__boulder) {
            return card.__boulder;
        }
        return null;
    }

    static saveBoulder(boulder) {
        try {
            this.addToPending(boulder);
            return true;
        } catch (error) {
            console.error('Error al guardar el boulder:', error);
            return false;
        }
    }

    static removeBoulder(boulderId) {
        try {
            const savedBoulders = this.getSavedBoulders();
            const updatedBoulders = savedBoulders.filter(b => b.id !== boulderId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedBoulders));
            return true;
        } catch (error) {
            console.error('Error al eliminar el boulder:', error);
            return false;
        }
    }

    static getSavedBoulders() {
        try {
            const savedBoulders = localStorage.getItem(this.STORAGE_KEY);
            return savedBoulders ? JSON.parse(savedBoulders) : [];
        } catch (error) {
            console.error('Error al obtener los boulders guardados:', error);
            return [];
        }
    }

    static isBoulderSaved(boulderId) {
        const savedBoulders = this.getSavedBoulders();
        return savedBoulders.some(b => b.id === boulderId);
    }

    static exportBoulderData(boulder) {
        const data = JSON.stringify(boulder, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boulder-${boulder.nombre.toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static exportToPDF() {
        const savedBoulders = this.getSavedBoulders();
        if (savedBoulders.length === 0) {
            alert('No hay boulders guardados para exportar');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('Lista de Boulders Guardados', 20, 20);
        
        let yPosition = 40;
        
        savedBoulders.forEach((boulder, index) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(14);
            doc.text(`${index + 1}. ${boulder.nombre}`, 20, yPosition);
            
            doc.setFontSize(12);
            doc.text(`Grado: ${boulder.grado}`, 30, yPosition + 7);
            
            const coordsText = `Coordenadas: ${boulder.latitud}, ${boulder.longitud}`;
            doc.text(coordsText, 30, yPosition + 14);
            
            const mapsUrl = `https://www.google.com/maps?q=${boulder.latitud},${boulder.longitud}`;
            doc.setTextColor(0, 0, 255);
            doc.textWithLink('Ver en Google Maps', 30, yPosition + 21, { url: mapsUrl });
            doc.setTextColor(0, 0, 0);
            
            yPosition += 35;
        });

        try {
            // Generar el PDF como blob
            const pdfBlob = doc.output('blob');
            
            // Crear URL del blob
            const blobUrl = URL.createObjectURL(pdfBlob);
            
            // Crear un elemento a temporal
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'boulders-guardados.pdf';
            
            // En dispositivos móviles, abrir en nueva pestaña
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                window.open(blobUrl, '_blank');
            } else {
                // En desktop, descargar directamente
                link.click();
            }
            
            // Limpiar
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el PDF. Por favor, intenta de nuevo.');
        }
    }
} 