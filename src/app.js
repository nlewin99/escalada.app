import { initFirebase } from './config/firebase.js';
import { Navbar } from './components/Navbar.js';
import { LandingView } from './views/LandingView.js';
import { BouldersView } from './views/BouldersView.js';
import { OfflineView } from './views/OfflineView.js';
import { OfflineStorage } from './utils/OfflineStorage.js';
import { AuthService } from './utils/AuthService.js';
import { LoginForm } from './components/LoginForm.js';

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
    }

    init() {
        // Inicializar componentes y vistas
        this.navbar = new Navbar();
        this.landingView = new LandingView();
        this.bouldersView = new BouldersView(this.db, this.storage);
        this.offlineView = new OfflineView();
        this.offlineView.init();
        this.loginForm = new LoginForm();

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
            } else {
                // Usuario no autenticado
                document.body.classList.add('user-not-authenticated');
                document.body.classList.remove('user-authenticated');
            }
        });
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
}); 