import { AuthService } from '../utils/AuthService.js';

export class ProfileView {
    constructor(db, storage) {
        this.container = document.querySelector('.profile-view');
        this.db = db;
        this.storage = storage;
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const changePhotoBtn = this.container.querySelector('.change-photo-btn');
        changePhotoBtn.addEventListener('click', () => {
            // Por ahora solo mostraremos un mensaje
            alert('Funcionalidad de cambio de foto próximamente');
        });
    }

    async loadUserProfile() {
        const user = AuthService.getCurrentUser();
        if (!user) return;

        // Actualizar información básica
        const profileName = this.container.querySelector('#profile-name');
        const profileEmail = this.container.querySelector('#profile-email');
        const memberSince = this.container.querySelector('#member-since');

        profileName.textContent = user.displayName || 'Usuario';
        profileEmail.textContent = user.email || 'No disponible';
        memberSince.textContent = new Date(user.metadata.creationTime).getFullYear();

        console.log('Usuario actual:', user); // Para debug

        // Cargar foto de perfil
        const profileImage = this.container.querySelector('#profile-image');
        if (user.photoURL) {
            profileImage.src = user.photoURL;
        }

        try {
            // Intentar cargar información adicional desde Firestore
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                // Aquí podemos actualizar más información cuando la tengamos
            }
        } catch (error) {
            console.error('Error al cargar datos adicionales:', error);
        }
    }

    show() {
        if (!AuthService.getCurrentUser()) {
            alert('Debes iniciar sesión para ver el perfil');
            return;
        }
        this.container.style.display = 'block';
        this.loadUserProfile();
    }

    hide() {
        this.container.style.display = 'none';
    }
} 