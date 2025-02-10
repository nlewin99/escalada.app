import { AuthService } from '../utils/AuthService.js';

export class LoginForm {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'login-form';
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="login-container">
                <span class="close-button" id="close-login">&times;</span>
                <h2>Iniciar Sesión</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt"></i>
                        Iniciar Sesión
                    </button>
                </form>
                <div id="login-error" class="error-message"></div>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.container.querySelector('#login-form');
        const closeButton = this.container.querySelector('#close-login');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.querySelector('#email').value;
            const password = form.querySelector('#password').value;
            const errorDiv = this.container.querySelector('#login-error');
            
            try {
                const loadingOverlay = document.getElementById('loading-overlay');
                loadingOverlay.classList.add('visible');
                
                await AuthService.signIn(email, password);
                
                // Limpiar el formulario y errores
                form.reset();
                errorDiv.textContent = '';
                this.container.style.display = 'none';
            } catch (error) {
                errorDiv.textContent = this.getErrorMessage(error.code);
            } finally {
                document.getElementById('loading-overlay').classList.remove('visible');
            }
        });

        closeButton.addEventListener('click', () => {
            this.container.style.display = 'none';
        });

        // Cerrar al hacer clic fuera del formulario
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.container.style.display = 'none';
            }
        });
    }

    show() {
        this.container.style.display = 'flex';
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/invalid-email': 'El email no es válido.',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
            'auth/user-not-found': 'No existe una cuenta con este email.',
            'auth/wrong-password': 'Contraseña incorrecta.',
            'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde.'
        };
        return errorMessages[errorCode] || 'Error al iniciar sesión. Intenta de nuevo.';
    }

    getElement() {
        return this.container;
    }
} 