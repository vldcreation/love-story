const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const basicAuth = require('express-basic-auth');
require('dotenv').config();

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'images'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.body.title || 'image'}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'));
        }
    }
});

// Basic authentication middleware
if (!process.env.APP_USER || !process.env.APP_PASSWORD) {
    console.error('Error: APP_USER and APP_PASSWORD environment variables must be set');
    process.exit(1);
}

const auth = basicAuth({
    users: { [process.env.APP_USER]: process.env.APP_PASSWORD },
    challenge: true
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/quote', async (req, res) => {
    try {
        const response = await axios.get('https://api.quotable.io/random?tags=love');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({ 
            error: 'Failed to fetch quote',
            message: error.message 
        });
    }
});

// Add new endpoint to fetch image files
app.get('/api/images', (req, res) => {
    const imagesDir = path.join(__dirname, 'public', 'images');
    try {
        const files = fs.readdirSync(imagesDir);
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        res.json(imageFiles);
    } catch (error) {
        console.error('Error reading images directory:', error);
        res.status(500).json({
            error: 'Failed to read images directory',
            message: error.message
        });
    }
});

// Upload endpoint
app.post('/api/upload', auth, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No image uploaded');
        }
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            filename: req.file.filename
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Delete image endpoint
app.post('/api/delete-image', auth, (req, res) => {
    try {
        const { path: imagePath } = req.body;
        if (!imagePath) {
            throw new Error('No image path provided');
        }

        // Extract filename from path and construct full path
        const filename = imagePath.split('/').pop();
        const fullPath = path.join(__dirname, 'public', 'images', filename);

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            throw new Error('Image not found');
        }

        // Delete the file
        fs.unlinkSync(fullPath);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something broke!',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});