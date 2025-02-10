import { AuthService } from '../utils/AuthService.js';

export class BoulderForm {
    constructor(db, storage) {
        this.db = db;
        this.storage = storage;
        this.container = null;
        this.currentBoulder = null;
        this.onSuccess = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'boulder-form-modal';
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="boulder-form-container">
                <span class="close-button" id="close-boulder-form">&times;</span>
                <h2>Editar Boulder</h2>
                <form id="boulder-form">
                    <div class="form-group">
                        <label for="nombre">Nombre</label>
                        <input type="text" id="nombre" required>
                    </div>
                    <div class="form-group">
                        <label for="grado">Grado</label>
                        <select id="grado" required>
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
                        <label for="imagen">Imagen</label>
                        <input type="file" id="imagen" accept="image/*">
                        <div class="image-preview"></div>
                    </div>
                    <div id="form-error" class="error-message"></div>
                    <button type="submit" class="btn btn-primary">
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

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!AuthService.getCurrentUser()) {
                this.showError('Debes iniciar sesión para realizar esta acción.');
                return;
            }

            const nombre = form.querySelector('#nombre').value;
            const grado = form.querySelector('#grado').value;
            const imagen = imageInput.files[0];

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
                    nombre,
                    grado,
                    imagenUrl,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (this.currentBoulder) {
                    // Actualizar boulder existente
                    await this.db.collection('boulders').doc(this.currentBoulder.id).update(boulderData);
                } else {
                    // Crear nuevo boulder
                    boulderData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
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

        closeButton.addEventListener('click', () => this.hide());

        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) this.hide();
        });

        // Preview de imagen
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
            }
        });
    }

    showError(message) {
        const errorDiv = this.container.querySelector('#form-error');
        errorDiv.textContent = message;
    }

    show(boulder = null) {
        this.currentBoulder = boulder;
        const form = this.container.querySelector('#boulder-form');
        const title = this.container.querySelector('h2');
        
        // Actualizar título según modo
        title.textContent = boulder ? 'Editar Boulder' : 'Nuevo Boulder';
        
        // Llenar formulario si es edición
        if (boulder) {
            form.querySelector('#nombre').value = boulder.nombre;
            form.querySelector('#grado').value = boulder.grado;
            
            // Mostrar imagen actual
            const preview = this.container.querySelector('.image-preview');
            preview.innerHTML = `<img src="${boulder.imagenUrl}" alt="${boulder.nombre}">`;
        } else {
            form.reset();
            this.container.querySelector('.image-preview').innerHTML = '';
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