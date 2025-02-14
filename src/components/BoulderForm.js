import { AuthService } from '../utils/AuthService.js';

export class BoulderForm {
    constructor(db, storage) {
        this.db = db;
        this.storage = storage;
        this.container = null;
        this.currentBoulder = null;
        this.onSuccess = null;
        this.sectors = [];
        this.currentLocation = null;
        this.originalValues = null;
        this.init();
    }

    async init() {
        this.container = document.createElement('div');
        this.container.className = 'boulder-form-modal';
        await this.loadSectors();
        this.render();
        this.setupEventListeners();
    }

    async loadSectors() {
        try {
            const snapshot = await this.db.collection('sectores').get();
            this.sectors = [];
            snapshot.forEach(doc => {
                this.sectors.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error('Error al cargar sectores:', error);
        }
    }

    render() {
        // Detectar si es dispositivo móvil
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.container.innerHTML = `
            <div class="boulder-form-container">
                <span class="close-button" id="close-boulder-form">&times;</span>
                <h2>Editar Boulder</h2>
                <form id="boulder-form">
                    <div class="form-group">
                        <label for="nombre">Nombre</label>
                        <input type="text" id="nombre" ${!this.currentBoulder ? 'required' : ''}>
                    </div>
                    <div class="form-group">
                        <label for="sector">Sector</label>
                        <select id="sector" ${!this.currentBoulder ? 'required' : ''}>
                            <option value="">Seleccionar sector</option>
                            ${this.sectors.map(sector => 
                                `<option value="${sector.id}">${sector.nombre}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="grado">Grado</label>
                        <select id="grado" ${!this.currentBoulder ? 'required' : ''}>
                            <option value="">Seleccionar grado</option>
                            <option value="V0">V0</option>
                            <option value="V1">V1</option>
                            <option value="V2">V2</option>
                            <option value="V3">V3</option>
                            <option value="V4">V4</option>
                            <option value="V5">V5</option>
                            <option value="V6">V6</option>
                            <option value="V7">V7</option>
                            <option value="V8">V8</option>
                            <option value="V9">V9</option>
                            <option value="V10">V10</option>
                            <option value="V11">V11</option>
                            <option value="V12">V12</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ubicación GPS</label>
                        <div class="location-inputs">
                            <div class="location-field">
                                <label for="latitud">Latitud</label>
                                <input type="number" id="latitud" step="any" readonly>
                            </div>
                            <div class="location-field">
                                <label for="longitud">Longitud</label>
                                <input type="number" id="longitud" step="any" readonly>
                            </div>
                            ${isMobile ? `
                                <button type="button" class="btn btn-secondary get-location-btn">
                                    <i class="fas fa-map-marker-alt"></i>
                                    Obtener Ubicación GPS
                                </button>
                            ` : `
                                <div class="desktop-warning">
                                    <i class="fas fa-info-circle"></i>
                                    La obtención de ubicación GPS solo está disponible en dispositivos móviles
                                </div>
                            `}
                        </div>
                        <div id="location-status" class="location-status"></div>
                    </div>
                    <div class="form-group">
                        <label for="imagen">Imagen (opcional)</label>
                        <input type="file" id="imagen" accept="image/*">
                        <div class="image-preview"></div>
                    </div>
                    <div id="form-error" class="error-message"></div>
                    <button type="submit" class="btn btn-primary submit-btn" disabled>
                        <i class="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </form>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.container.querySelector('#boulder-form');
        const closeButton = this.container.querySelector('#close-boulder-form');
        const imageInput = this.container.querySelector('#imagen');
        const getLocationBtn = this.container.querySelector('.get-location-btn');
        const submitButton = form.querySelector('button[type="submit"]');

        // Configurar el botón de obtener ubicación
        getLocationBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.getCurrentLocation();
        });

        // Función para verificar si los campos básicos están llenos
        const checkBasicFields = () => {
            const nombre = form.querySelector('#nombre').value.trim();
            const sector = form.querySelector('#sector').value;
            const grado = form.querySelector('#grado').value;
            return nombre && sector && grado;
        };

        // Monitorear cambios en el formulario
        const updateSubmitButton = () => {
            if (this.currentBoulder) {
                // Modo edición: habilitar si hay cambios
                submitButton.disabled = !this.checkForChanges();
            } else {
                // Modo creación: habilitar si los campos básicos están llenos
                submitButton.disabled = !checkBasicFields();
            }
        };

        // Escuchar cambios en todos los campos
        ['input', 'change'].forEach(eventType => {
            form.addEventListener(eventType, () => {
                updateSubmitButton();
            }, true);
        });

        // Escuchar cambios en la imagen
        imageInput.addEventListener('change', (e) => {
            const preview = this.container.querySelector('.image-preview');
            preview.innerHTML = '';
            
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    preview.appendChild(img);
                };
                reader.readAsDataURL(e.target.files[0]);
                
                // Si estamos en modo edición, habilitar el botón
                if (this.currentBoulder) {
                    submitButton.disabled = false;
                }
            }
            updateSubmitButton();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!AuthService.getCurrentUser()) {
                this.showError('Debes iniciar sesión para realizar esta acción.');
                return;
            }

            const nombre = form.querySelector('#nombre').value.trim();
            const sectorId = form.querySelector('#sector').value;
            const grado = form.querySelector('#grado').value;
            const latitud = form.querySelector('#latitud').value ? parseFloat(form.querySelector('#latitud').value) : null;
            const longitud = form.querySelector('#longitud').value ? parseFloat(form.querySelector('#longitud').value) : null;
            const imagen = imageInput.files[0];

            if (!nombre || !sectorId || !grado) {
                this.showError('El nombre, sector y grado son obligatorios.');
                return;
            }

            try {
                const loadingOverlay = document.getElementById('loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.classList.add('visible');
                }

                let imagenUrl = this.currentBoulder?.imagenUrl;

                if (imagen) {
                    // Subir nueva imagen si se seleccionó una
                    const imageRef = this.storage.ref(`boulders/${Date.now()}_${imagen.name}`);
                    await imageRef.put(imagen);
                    imagenUrl = await imageRef.getDownloadURL();
                }

                const boulderData = {
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                // Solo incluir campos que han cambiado
                if (nombre !== this.originalValues?.nombre) boulderData.nombre = nombre;
                if (sectorId !== this.originalValues?.sectorId) boulderData.sectorId = sectorId;
                if (grado !== this.originalValues?.grado) boulderData.grado = grado;
                if (latitud !== this.originalValues?.latitud) boulderData.latitud = latitud;
                if (longitud !== this.originalValues?.longitud) boulderData.longitud = longitud;
                if (imagenUrl !== this.originalValues?.imagenUrl) boulderData.imagenUrl = imagenUrl;

                if (this.currentBoulder) {
                    // Actualizar boulder existente
                    await this.db.collection('boulders').doc(this.currentBoulder.id).update(boulderData);
                } else {
                    // Crear nuevo boulder
                    boulderData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    // Para nuevo boulder, incluir campos obligatorios
                    boulderData.nombre = nombre;
                    boulderData.sectorId = sectorId;
                    boulderData.grado = grado;
                    // Incluir ubicación e imagen solo si están presentes
                    if (latitud && longitud) {
                        boulderData.latitud = latitud;
                        boulderData.longitud = longitud;
                    }
                    if (imagenUrl) boulderData.imagenUrl = imagenUrl;
                    await this.db.collection('boulders').add(boulderData);
                }

                this.hide();
                if (this.onSuccess) this.onSuccess();
            } catch (error) {
                console.error('Error al guardar el boulder:', error);
                this.showError('Error al guardar los cambios. Por favor, intenta de nuevo.');
            } finally {
                const loadingOverlay = document.getElementById('loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.classList.remove('visible');
                }
            }
        });

        // Configurar el botón de cerrar
        closeButton.addEventListener('click', () => {
            this.hide();
            this.currentBoulder = null;
            this.originalValues = null;
        });

        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) this.hide();
        });
    }

    checkForChanges() {
        if (!this.currentBoulder || !this.originalValues) return false;

        const form = this.container.querySelector('#boulder-form');
        const currentValues = {
            nombre: form.querySelector('#nombre').value.trim(),
            sectorId: form.querySelector('#sector').value,
            grado: form.querySelector('#grado').value,
            latitud: form.querySelector('#latitud').value ? parseFloat(form.querySelector('#latitud').value) : null,
            longitud: form.querySelector('#longitud').value ? parseFloat(form.querySelector('#longitud').value) : null
        };

        // Verificar si hay una nueva imagen seleccionada
        const imageInput = form.querySelector('#imagen');
        if (imageInput.files.length > 0) return true;

        // Comparar cada campo
        return Object.keys(currentValues).some(key => {
            const originalValue = this.originalValues[key];
            const currentValue = currentValues[key];
            
            // Convertir valores a string para comparación consistente
            const strOriginal = originalValue !== null ? String(originalValue) : '';
            const strCurrent = currentValue !== null ? String(currentValue) : '';
            
            return strOriginal !== strCurrent;
        });
    }

    getCurrentLocation() {
        // Verificar si es dispositivo móvil
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.showError('La obtención de ubicación GPS solo está disponible en dispositivos móviles');
            return;
        }

        const statusDiv = this.container.querySelector('#location-status');
        const latitudInput = this.container.querySelector('#latitud');
        const longitudInput = this.container.querySelector('#longitud');

        if (!navigator.geolocation) {
            statusDiv.innerHTML = '<span class="error">La geolocalización no está soportada en este dispositivo</span>';
            return;
        }

        statusDiv.innerHTML = '<span class="info">Activando GPS... Por favor, asegúrate de tener el GPS activado y espera unos momentos...</span>';

        // Configuración específica para forzar GPS
        const options = {
            enableHighAccuracy: true,     // Forzar uso de GPS
            timeout: 60000,               // 60 segundos de timeout
            maximumAge: 0,                // Forzar nueva lectura
            desiredAccuracy: 5,           // Intentar obtener precisión de 5 metros
            forceGPS: true                // Forzar uso de GPS (en dispositivos que lo soporten)
        };

        let bestAccuracy = Infinity;
        let readings = [];
        const minReadings = 5;            // Número mínimo de lecturas para promediar
        const maxWaitTime = 60000;        // Tiempo máximo de espera (60 segundos)
        const startTime = Date.now();

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const accuracy = position.coords.accuracy;
                const currentTime = Date.now();
                
                // Verificar si es una lectura del GPS (accuracy menor a 100 metros)
                if (accuracy <= 100) {
                    readings.push({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: accuracy
                    });

                    // Actualizar UI con la precisión actual
                    statusDiv.innerHTML = `
                        <span class="info">
                            Obteniendo señal GPS (${readings.length}/${minReadings} lecturas)...
                            Precisión actual: ${accuracy.toFixed(1)} metros
                        </span>
                    `;

                    // Si tenemos suficientes lecturas o hemos alcanzado buena precisión
                    if (readings.length >= minReadings || accuracy < 10) {
                        // Calcular el promedio de las mejores lecturas
                        readings.sort((a, b) => a.accuracy - b.accuracy);
                        const bestReadings = readings.slice(0, Math.min(3, readings.length));
                        
                        const avgLat = bestReadings.reduce((sum, r) => sum + r.latitude, 0) / bestReadings.length;
                        const avgLon = bestReadings.reduce((sum, r) => sum + r.longitude, 0) / bestReadings.length;
                        const bestAccuracy = bestReadings[0].accuracy;

                        latitudInput.value = avgLat;
                        longitudInput.value = avgLon;
                        this.currentLocation = {
                            latitude: avgLat,
                            longitude: avgLon
                        };

                        // Disparar evento change para actualizar el estado del botón
                        latitudInput.dispatchEvent(new Event('change'));
                        longitudInput.dispatchEvent(new Event('change'));

                        statusDiv.innerHTML = `
                            <span class="success">
                                Ubicación GPS obtenida con precisión de ${bestAccuracy.toFixed(1)} metros
                            </span>
                        `;

                        navigator.geolocation.clearWatch(watchId);
                    }
                }

                // Verificar si hemos excedido el tiempo máximo
                if (currentTime - startTime > maxWaitTime) {
                    navigator.geolocation.clearWatch(watchId);
                    if (readings.length > 0) {
                        // Usar la mejor lectura disponible
                        const bestReading = readings.sort((a, b) => a.accuracy - b.accuracy)[0];
                        latitudInput.value = bestReading.latitude;
                        longitudInput.value = bestReading.longitude;
                        statusDiv.innerHTML = `
                            <span class="warning">
                                Tiempo máximo alcanzado. Mejor precisión lograda: ${bestReading.accuracy.toFixed(1)} metros
                            </span>
                        `;
                    } else {
                        statusDiv.innerHTML = `
                            <span class="error">
                                No se pudo obtener una señal GPS precisa. Por favor, asegúrate de:
                                <br>- Tener el GPS activado
                                <br>- Estar en un área abierta
                                <br>- Esperar a que el GPS se estabilice
                            </span>
                        `;
                    }
                }
            },
            (error) => {
                console.error('Error al obtener la ubicación:', error);
                let errorMessage = 'Error al obtener la ubicación GPS';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permiso denegado para acceder al GPS. Por favor, activa el GPS y permite el acceso.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Señal GPS no disponible. Asegúrate de estar en un área abierta.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Tiempo de espera agotado. La señal GPS es débil o está desactivada.';
                        break;
                }
                statusDiv.innerHTML = `<span class="error">${errorMessage}</span>`;
                navigator.geolocation.clearWatch(watchId);
            },
            options
        );

        // Botón para cancelar la búsqueda de GPS
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-secondary';
        cancelButton.innerHTML = 'Cancelar búsqueda GPS';
        cancelButton.onclick = () => {
            navigator.geolocation.clearWatch(watchId);
            statusDiv.innerHTML = '<span class="info">Búsqueda GPS cancelada</span>';
            statusDiv.removeChild(cancelButton);
        };
        statusDiv.appendChild(cancelButton);
    }

    showError(message) {
        const errorDiv = this.container.querySelector('#form-error');
        errorDiv.textContent = message;
    }

    async show(boulder = null) {
        this.currentBoulder = boulder;
        const form = this.container.querySelector('#boulder-form');
        const title = this.container.querySelector('h2');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Actualizar título según modo
        title.textContent = boulder ? 'Editar Boulder' : 'Nuevo Boulder';
        
        // Recargar sectores
        await this.loadSectors();
        
        // Actualizar select de sectores
        const sectorSelect = form.querySelector('#sector');
        sectorSelect.innerHTML = `
            <option value="">Seleccionar sector</option>
            ${this.sectors.map(sector => 
                `<option value="${sector.id}">${sector.nombre}</option>`
            ).join('')}
        `;
        
        // Llenar formulario si es edición
        if (boulder) {
            form.querySelector('#nombre').value = boulder.nombre || '';
            form.querySelector('#sector').value = boulder.sectorId || '';
            form.querySelector('#grado').value = boulder.grado || '';
            form.querySelector('#latitud').value = boulder.latitud || '';
            form.querySelector('#longitud').value = boulder.longitud || '';
            
            // Guardar valores originales para comparar cambios
            this.originalValues = {
                nombre: boulder.nombre || '',
                sectorId: boulder.sectorId || '',
                grado: boulder.grado || '',
                latitud: boulder.latitud || null,
                longitud: boulder.longitud || null,
                imagenUrl: boulder.imagenUrl || ''
            };
            
            // Mostrar imagen actual si existe
            const preview = this.container.querySelector('.image-preview');
            preview.innerHTML = boulder.imagenUrl ? 
                `<img src="${boulder.imagenUrl}" alt="${boulder.nombre}">` : '';

            // Inicialmente deshabilitar el botón de guardar en modo edición
            submitButton.disabled = true;
        } else {
            // Limpiar el formulario para nuevo boulder
            form.reset();
            this.container.querySelector('.image-preview').innerHTML = '';
            this.originalValues = null;
            
            // En modo creación, verificar campos básicos
            const nombre = form.querySelector('#nombre').value;
            const sector = form.querySelector('#sector').value;
            const grado = form.querySelector('#grado').value;
            submitButton.disabled = !(nombre && sector && grado);
            
            // Si hay una ubicación guardada, usarla
            if (this.currentLocation) {
                form.querySelector('#latitud').value = this.currentLocation.latitude;
                form.querySelector('#longitud').value = this.currentLocation.longitude;
            }
        }

        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
        this.currentBoulder = null;
        this.container.querySelector('#boulder-form').reset();
        this.container.querySelector('.image-preview').innerHTML = '';
        this.container.querySelector('#form-error').textContent = '';
    }

    getElement() {
        return this.container;
    }

    setOnSuccess(callback) {
        this.onSuccess = callback;
    }
} 