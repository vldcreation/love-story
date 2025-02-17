// Main application initialization
class App {
    constructor() {
        this.envelope = document.querySelector('.envelope');
        this.content = document.querySelector('.content');
        this.init();
    }

    init() {
        this.envelope.addEventListener('click', this.handleEnvelopeClick.bind(this));
    }

    async handleEnvelopeClick() {
        this.envelope.classList.add('flap-open');

        // Play music when envelope opens
        if (window.audioManager) {
            await window.audioManager.play();
        }

        setTimeout(async () => {
            this.envelope.style.display = 'none';
            this.content.style.display = 'block';
            
            // Initialize slider after content is visible
            if (!window.slider) {
                window.slider = new Slider();
            }
        }, 800);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio manager first
    window.audioManager = new AudioManager();
});

// Initialize app when window loads
window.addEventListener('load', () => {
    window.app = new App();
});