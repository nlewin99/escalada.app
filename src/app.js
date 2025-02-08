import { initFirebase } from './config/firebase.js';
import { Navbar } from './components/Navbar.js';
import { LandingView } from './views/LandingView.js';
import { BouldersView } from './views/BouldersView.js';
import { OfflineView } from './views/OfflineView.js';

class App {
    constructor() {
        this.db = initFirebase();
        this.navbar = null;
        this.landingView = null;
        this.bouldersView = null;
        this.offlineView = null;
    }

    init() {
        // Inicializar componentes y vistas
        this.navbar = new Navbar();
        this.landingView = new LandingView();
        this.bouldersView = new BouldersView(this.db);
        this.offlineView = new OfflineView();
        this.offlineView.init();
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
}); 