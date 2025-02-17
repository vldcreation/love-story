class AudioManager {
    constructor() {
        this.music = document.getElementById('background-music');
        this.isInitialized = false;

        this.init();
    }

    init() {
        // Handle iOS audio permission
        document.addEventListener('touchstart', this.handleFirstTouch.bind(this), { once: true });
    }

    async handleFirstTouch() {
        if (this.music.paused && !this.isInitialized) {
            try {
                // Initialize audio context for iOS
                await this.music.play();
                await this.music.pause();
                this.isInitialized = true;
            } catch (error) {
                console.error('Audio initialization error:', error);
            }
        }
    }

    async play() {
        try {
            await this.music.play();
        } catch (error) {
            console.error('Audio playback error:', error);
            alert('Tap anywhere to enable audio');
        }
    }

    pause() {
        return this.music.pause();
    }
}

// Initialize audio manager when window loads
window.addEventListener('load', () => {
    window.audioManager = new AudioManager();
});