import { initFirebase } from './config/firebase.js';
import { Navbar } from './components/Navbar.js';
import { LandingView } from './views/LandingView.js';
import { BouldersView } from './views/BouldersView.js';
import { OfflineView } from './views/OfflineView.js';
import { OfflineStorage } from './utils/OfflineStorage.js';
import { AuthService } from './utils/AuthService.js';
import { LoginForm } from './components/LoginForm.js';
import { SectorManager } from './components/SectorManager.js';
import { ProfileView } from './components/ProfileView.js';

class App {
    constructor() {
        const { db, auth, storage } = initFirebase();
        this.db = db;
        this.storage = storage;
        AuthService.init(auth);
        this.navbar = null;
        this.landingView = null;
        this.bouldersView = null;
        this.offlineView = null;
        this.loginForm = null;
        this.sectorManager = null;
        this.profileView = null;
    }

    init() {
        // Inicializar componentes y vistas
        this.navbar = new Navbar();
        this.landingView = new LandingView(this.db);
        this.bouldersView = new BouldersView(this.db, this.storage);
        this.offlineView = new OfflineView();
        this.offlineView.init();
        this.loginForm = new LoginForm();
        this.sectorManager = new SectorManager(this.db);
        this.profileView = new ProfileView(this.db, this.storage);

        // Agregar el formulario de login al DOM pero oculto inicialmente
        document.body.appendChild(this.loginForm.getElement());
        this.loginForm.getElement().style.display = 'none';

        // Inicializar botón de confirmación
        const confirmButton = document.getElementById('confirm-changes');
        confirmButton.addEventListener('click', () => {
            OfflineStorage.confirmChanges();
        });

        // Inicializar botón de cancelar selección
        const cancelButton = document.getElementById('cancel-selection');
        cancelButton.addEventListener('click', () => {
            OfflineStorage.cancelSelection();
        });

        // Configurar el observer de autenticación
        AuthService.onAuthStateChanged((user) => {
            if (user) {
                // Usuario autenticado
                document.body.classList.add('user-authenticated');
                document.body.classList.remove('user-not-authenticated');
                this.loginForm.getElement().style.display = 'none';
                document.querySelector('[data-view="sectors"]').style.display = 'inline-flex';
                document.querySelector('[data-view="profile"]').style.display = 'inline-flex';
            } else {
                // Usuario no autenticado
                document.body.classList.add('user-not-authenticated');
                document.body.classList.remove('user-authenticated');
                document.querySelector('[data-view="sectors"]').style.display = 'none';
                document.querySelector('[data-view="profile"]').style.display = 'none';
                if (document.querySelector('.sector-manager').style.display === 'block') {
                    document.querySelector('.sector-manager').style.display = 'none';
                }
                if (document.querySelector('.profile-view').style.display === 'block') {
                    document.querySelector('.profile-view').style.display = 'none';
                }
            }
        });

        // Manejar la navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.dataset.view;
                this.navigateToView(view);
            });
        });
    }

    navigateToView(view) {
        // Ocultar todas las vistas
        document.querySelector('.landing-page').style.display = 'none';
        document.querySelector('.main-content').style.display = 'none';
        document.querySelector('.offline-content').style.display = 'none';
        document.querySelector('.sector-manager').style.display = 'none';
        document.querySelector('.profile-view').style.display = 'none';

        // Mostrar la vista seleccionada
        switch(view) {
            case 'landing':
                document.querySelector('.landing-page').style.display = 'block';
                break;
            case 'boulders':
                document.querySelector('.main-content').style.display = 'block';
                break;
            case 'offline':
                document.querySelector('.offline-content').style.display = 'block';
                break;
            case 'sectors':
                if (AuthService.getCurrentUser()) {
                    document.querySelector('.sector-manager').style.display = 'block';
                } else {
                    alert('Debes iniciar sesión para acceder a esta sección');
                    document.querySelector('.landing-page').style.display = 'block';
                }
                break;
            case 'profile':
                if (AuthService.getCurrentUser()) {
                    document.querySelector('.profile-view').style.display = 'block';
                } else {
                    alert('Debes iniciar sesión para acceder a esta sección');
                    document.querySelector('.landing-page').style.display = 'block';
                }
                break;
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
}); 