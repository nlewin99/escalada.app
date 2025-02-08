export class ImageSlider {
    constructor() {
        this.currentImageIndex = 0;
        this.sliderImages = [
            './src/assets/img/1.jpeg',
            './src/assets/img/2.jpeg',
            './src/assets/img/3.jpeg'
        ];
        this.slider = document.querySelector('.slider');
        this.init();
    }

    init() {
        // Precargar las imágenes
        this.sliderImages.forEach(src => {
            const img = new Image();
            img.src = src;
            console.log('Precargando imagen:', src); // Agregamos log para debug
        });

        // Configurar la primera imagen
        this.updateSliderImage();

        // Agregar estilos de transición
        this.slider.style.transition = 'background-image 0.5s ease-in-out';

        // Iniciar el intervalo para cambiar las imágenes
        setInterval(() => {
            this.currentImageIndex = (this.currentImageIndex + 1) % this.sliderImages.length;
            this.updateSliderImage();
        }, 5000);
    }

    updateSliderImage() {
        const imageUrl = this.sliderImages[this.currentImageIndex];
        console.log('Cambiando imagen a:', imageUrl); // Agregamos log para debug
        this.slider.style.backgroundImage = `url(${imageUrl})`;
    }
} 