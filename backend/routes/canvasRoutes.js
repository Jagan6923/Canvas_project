const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');

// Determine if we're in a serverless environment
const isServerless = process.env.VERCEL === '1';

// Use memory storage for serverless environments, disk storage for local development
const storage = isServerless
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });

const upload = multer({ storage });

// Use different controller based on environment
const controller = isServerless
    ? require('../controllers/canvasControllerServerless')
    : require('../controllers/canvasController');

router.post('/create', controller.createCanvasAPI);
router.post('/add', upload.single('imageFile'), controller.addElementAPI);
router.get('/export', controller.exportPDFAPI);

module.exports = router;