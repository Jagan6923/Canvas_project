
// API Route Definitions for Canvas Builder Backend

const express = require('express');
const multer = require('multer');
const {
  initCanvas,
  addElementToCanvas,
  exportCanvasAsPDF
} = require('./controllers/canvasController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/canvas/init', initCanvas); // Initialize canvas
router.post('/canvas/:id/add', upload.single('image'), addElementToCanvas); // Add element
router.get('/canvas/:id/export', exportCanvasAsPDF); // Export as PDF

module.exports = router;
