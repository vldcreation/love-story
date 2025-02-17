class Slider {
    constructor() {
        this.currentSlide = 0;
        this.slider = document.querySelector('.slider');
        this.slides = [];
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isPaused = false;
        this.autoAdvanceInterval = null;
        this.pauseIcon = document.createElement('div');
        this.pauseIcon.className = 'pause-icon playing';
        this.slider.parentElement.appendChild(this.pauseIcon);

        this.init();
    }

    init() {
        this.createSlides();
        this.setupEventListeners();
        this.startAutoAdvance();
    }

    createSlides() {
        ImageLoader.loadImagePaths().then(paths => {
            paths.forEach((path, index) => {
                const slide = document.createElement('div');
                slide.className = 'slide';
                slide.innerHTML = `<img src="${path}" alt="Memory ${index + 1}">`;
                this.slider.appendChild(slide);
                this.slides.push(slide);
                
                this.slides[0].classList.add('active');
                this.slider.style.transform = 'translateX(0)';
            });
        }).catch(error => {
            console.error('Error loading image paths:', error);
        });
    }

    setupEventListeners() {
        const container = document.querySelector('.slider-container');
        const prevButton = document.querySelector('.prev');
        const nextButton = document.querySelector('.next');

        container.addEventListener('touchstart', this.handleTouchStart.bind(this));
        container.addEventListener('touchend', this.handleTouchEnd.bind(this));
        prevButton.addEventListener('click', () => this.changeSlide(-1));
        nextButton.addEventListener('click', () => this.changeSlide(1));

        // Add click event listener to all slides
        this.slides.forEach(slide => {
            slide.addEventListener('click', this.togglePause.bind(this));
        });

        // Add click event listener to pause icon
        this.pauseIcon.addEventListener('click', this.togglePause.bind(this));
    }

    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;

        if (Math.abs(swipeDistance) >= CONFIG.animation.minSwipeDistance) {
            this.changeSlide(swipeDistance > 0 ? 1 : -1);
        }
    }

    async changeSlide(direction) {
        if (this.isPaused) return;

        this.slides[this.currentSlide].classList.remove('active');
        
        const totalSlides = this.slides.length;
        this.currentSlide = (this.currentSlide + direction + totalSlides) % totalSlides;

        this.slider.style.transform = `translateX(-${this.currentSlide * 100}%)`;

        setTimeout(() => {
            this.slides[this.currentSlide].classList.add('active');
        }, 50);

        await this.updateCaption();
    }

    async updateCaption() {
        const captionElement = document.querySelector('.caption');
        captionElement.innerHTML = '<div class="caption-loader"></div>';

        try {
            const response = await fetch(CONFIG.api.quote);
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            captionElement.textContent = data.content;
        } catch (error) {
            captionElement.textContent = CONFIG.images.defaultCaptions[this.currentSlide] || 
                                       "My heart belongs to you";
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseIcon.className = `pause-icon ${this.isPaused ? 'paused' : 'playing'}`;
        if (this.isPaused) {
            clearInterval(this.autoAdvanceInterval);
            if (window.audioManager) {
                window.audioManager.pause();
            }
        } else {
            this.startAutoAdvance();
            if (window.audioManager) {
                window.audioManager.play();
            }
        }
    }

    startAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
        }
        if (!this.isPaused) {
            this.autoAdvanceInterval = setInterval(() => this.changeSlide(1), CONFIG.animation.autoAdvanceInterval);
        }
    }
}

// Initialize slider when window loads
window.addEventListener('load', () => {
    window.slider = new Slider();
});