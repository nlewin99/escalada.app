export class BoulderCard {
    constructor(boulder, onClickCallback) {
        this.boulder = boulder;
        this.onClickCallback = onClickCallback;
    }

    render() {
        const div = document.createElement('div');
        div.className = 'boulder-card';
        
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

    static showDetails(boulder) {
        const modal = document.getElementById('boulder-modal');
        const modalContent = document.getElementById('boulder-detail-content');
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

    static copyCoords(coords) {
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
} 