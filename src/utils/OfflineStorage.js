export class OfflineStorage {
    static STORAGE_KEY = 'saved_boulders';

    static saveBoulder(boulder) {
        try {
            const savedBoulders = this.getSavedBoulders();
            if (!this.isBoulderSaved(boulder.id)) {
                savedBoulders.push(boulder);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedBoulders));
                return true;
            }
            return false;
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

        // Generar y descargar el PDF
        doc.save('boulders-guardados.pdf');
    }
} 