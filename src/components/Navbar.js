import { OfflineStorage } from '../utils/OfflineStorage.js';
import { AuthService } from '../utils/AuthService.js';

export class Navbar {
    constructor() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.navItems = document.querySelectorAll('.nav-item');
        this.logoutBtn = document.getElementById('logout-btn');
        this.loginBtn = document.createElement('a');
        this.loginBtn.href = '#';
        this.loginBtn.className = 'nav-item login-btn';
        this.loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        this.navLinks.insertBefore(this.loginBtn, this.logoutBtn);
        this.init();
    }

    init() {
        this.navToggle.addEventListener('click', () => this.toggleNav());
        this.navItems.forEach(link => {
            if (!link.classList.contains('logout-btn')) {
                link.addEventListener('click', (e) => this.handleNavClick(e));
            }
        });

        // Configurar el botón de login
        this.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginForm = document.querySelector('.login-form');
            loginForm.style.display = 'flex';
            if (window.innerWidth <= 768) {
                this.toggleNav();
            }
        });

        // Configurar el botón de logout
        this.logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const loadingOverlay = document.getElementById('loading-overlay');
                loadingOverlay.classList.add('visible');
                
                await AuthService.signOut();
                
                // Limpiar cualquier estado de la aplicación
                OfflineStorage.cancelSelection();
                
                // Mostrar la landing page
                document.querySelector('.landing-page').style.display = 'block';
                document.querySelector('.main-content').style.display = 'none';
                document.querySelector('.offline-content').style.display = 'none';
                
                if (window.innerWidth <= 768) {
                    this.toggleNav();
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
            } finally {
                document.getElementById('loading-overlay').classList.remove('visible');
            }
        });

        // Cerrar el menú si se hace clic fuera
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Configurar visibilidad inicial de los botones según el estado de autenticación
        AuthService.onAuthStateChanged((user) => {
            this.loginBtn.style.display = user ? 'none' : 'inline-flex';
            this.logoutBtn.style.display = user ? 'inline-flex' : 'none';
        });
    }

    toggleNav() {
        this.navLinks.classList.toggle('active');
    }

    handleNavClick(e) {
        e.preventDefault();
        const view = e.target.closest('.nav-item').dataset.view;
        this.navigateToView(view);
        if (window.innerWidth <= 768) {
            this.toggleNav();
        }
    }

    handleOutsideClick(e) {
        if (window.innerWidth <= 768 && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.nav-toggle') && 
            this.navLinks.classList.contains('active')) {
            this.toggleNav();
        }
    }

    navigateToView(viewName) {
        const landingPage = document.querySelector('.landing-page');
        const mainContent = document.querySelector('.main-content');
        const offlineContent = document.querySelector('.offline-content');
        
        // Limpiar selecciones antes de cambiar de vista
        OfflineStorage.cancelSelection();
        
        // Ocultar todas las vistas
        landingPage.style.display = 'none';
        mainContent.style.display = 'none';
        offlineContent.style.display = 'none';

        // Mostrar la vista seleccionada
        switch(viewName) {
            case 'landing':
                landingPage.style.display = 'block';
                break;
            case 'boulders':
                mainContent.style.display = 'block';
                break;
            case 'offline':
                offlineContent.style.display = 'block';
                break;
        }
    }
} 