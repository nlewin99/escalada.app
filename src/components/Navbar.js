export class Navbar {
    constructor() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.navItems = document.querySelectorAll('.nav-item');
        this.init();
    }

    init() {
        this.navToggle.addEventListener('click', () => this.toggleNav());
        this.navItems.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Cerrar el menú si se hace clic fuera
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    toggleNav() {
        this.navLinks.classList.toggle('active');
    }

    handleNavClick(e) {
        e.preventDefault();
        const view = e.target.dataset.view;
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
        
        switch(viewName) {
            case 'landing':
                landingPage.style.display = 'block';
                mainContent.style.display = 'none';
                break;
            case 'boulders':
                landingPage.style.display = 'none';
                mainContent.style.display = 'block';
                break;
        }
    }
} 