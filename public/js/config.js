// Configuration constants for the application
const CONFIG = {
    // Image configuration
    images: {
        paths: [
            '/images/img1.JPG',
            '/images/img2.JPG',
            '/images/img3.JPG',
            '/images/img4.JPG'
        ],
        defaultCaptions: [
            "Your love lights up my world",
            "Every moment with you is precious",
            "Together is my favorite place to be",
            "You're my forever and always"
        ]
    },
    
    // API endpoints
    api: {
        quote: '/api/quote',
    },
    
    // Animation settings
    animation: {
        slideTransitionDuration: 800,
        autoAdvanceInterval: 5000,
        minSwipeDistance: 50
    }
};

window.CONFIG = CONFIG;