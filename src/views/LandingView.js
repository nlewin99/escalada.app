import { ImageSlider } from '../components/ImageSlider.js';

export class LandingView {
    constructor() {
        this.slider = null;
        this.exploreButton = document.getElementById('explore-button');
        this.init();
    }

    init() {
        this.slider = new ImageSlider();
        this.exploreButton.addEventListener('click', () => this.showMainContent());
    }

    showMainContent() {
        document.querySelector('.landing-page').style.display = 'none';
        document.querySelector('.main-content').style.display = 'block';
    }
} 