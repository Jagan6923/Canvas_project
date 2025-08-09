const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const controller = require('../controllers/canvasController');

router.post('/create', controller.createCanvasAPI);
router.post('/add', upload.single('imageFile'), controller.addElementAPI);
router.get('/export', controller.exportPDFAPI);

module.exports = router;