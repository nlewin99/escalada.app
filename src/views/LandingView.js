import { ImageSlider } from '../components/ImageSlider.js';

export class LandingView {
    constructor(db) {
        this.db = db;
        this.imageSlider = new ImageSlider();
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupEventListeners();
        this.loadStats();
        this.loadLatestBoulders();
        this.setupScrollIndicator();
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });

        // Observar las tarjetas de características y estadísticas
        document.querySelectorAll('.feature-card, .stat-card').forEach(card => {
            observer.observe(card);
        });
    }

    setupEventListeners() {
        const exploreButton = document.getElementById('explore-button');
        const loginCta = document.querySelector('.login-cta');

        exploreButton.addEventListener('click', () => {
            document.querySelector('[data-view="boulders"]').click();
        });

        loginCta?.addEventListener('click', () => {
            document.querySelector('.login-form').style.display = 'flex';
        });
    }

    async loadStats() {
        try {
            // Cargar estadísticas desde Firestore
            const bouldersSnapshot = await this.db.collection('boulders').get();
            const sectorsSnapshot = await this.db.collection('sectores').get();
            const usersSnapshot = await this.db.collection('users').get();

            // Actualizar los contadores con animación
            this.animateCounter('total-boulders', bouldersSnapshot.size);
            this.animateCounter('total-sectors', sectorsSnapshot.size);
            this.animateCounter('total-users', usersSnapshot.size);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    async loadLatestBoulders() {
        try {
            const snapshot = await this.db.collection('boulders')
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();

            const container = document.getElementById('latest-boulders');
            if (snapshot.empty) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-mountain fa-3x"></i>
                        <h3>No hay boulders registrados aún</h3>
                        <p>¡Sé el primero en agregar uno!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = snapshot.docs.map(doc => {
                const boulder = doc.data();
                return `
                    <div class="boulder-card">
                        <img src="${boulder.imagenUrl}" alt="${boulder.nombre}">
                        <div class="boulder-info">
                            <h3>${boulder.nombre}</h3>
                            <span class="boulder-grade">Grado: ${boulder.grado}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error al cargar últimos boulders:', error);
        }
    }

    animateCounter(elementId, target) {
        const element = document.getElementById(elementId);
        const duration = 2000; // 2 segundos
        const steps = 60;
        const stepDuration = duration / steps;
        let current = 0;

        const increment = target / steps;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.round(current);

            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, stepDuration);
    }

    setupScrollIndicator() {
        // Ocultar el indicador cuando se hace scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.scrollIndicator.classList.add('hidden');
            } else {
                this.scrollIndicator.classList.remove('hidden');
            }
        });

        // Hacer scroll suave al hacer clic en el indicador
        this.scrollIndicator.addEventListener('click', () => {
            const featuresSection = document.querySelector('.features-section');
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
} 