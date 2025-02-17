// Dynamic image loader module
const ImageLoader = {
    // Function to fetch all image paths from the /images directory
    async loadImagePaths() {
        try {
            const response = await fetch('/api/images');
            if (!response.ok) throw new Error('Failed to fetch image paths');
            const images = await response.json();
            return images.map(image => `/images/${image}`);
        } catch (error) {
            console.error('Error loading images:', error);
            return CONFIG.images.paths; // Fallback to static paths
        }
    },

    // Preload images and return their paths
    async preloadImages(paths) {
        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(src);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                img.src = src;
            });
        };

        try {
            await Promise.all(paths.map(loadImage));
            return paths;
        } catch (error) {
            console.error('Error preloading images:', error);
            throw error;
        }
    },

    // Initialize the image paths with preloading
    async initialize() {
        const paths = await this.loadImagePaths();
        // Show loading state
        document.body.classList.add('loading');
        try {
            // Preload all images
            await this.preloadImages(paths);
            // Update CONFIG with preloaded paths
            CONFIG.images.paths = paths;
            return paths;
        } finally {
            // Remove loading state
            document.body.classList.remove('loading');
        }
    }
};

// Export the ImageLoader
window.ImageLoader = ImageLoader;