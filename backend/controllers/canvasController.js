const { createCanvas, loadImage } = require('canvas');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const canvasStore = require('../utils/canvasStore');

// Default canvas ID to use
const DEFAULT_CANVAS_ID = canvasStore.DEFAULT_CANVAS_ID;

exports.createCanvasAPI = (req, res) => {
  try {
    const { width, height } = req.body;
    if (!width || !height) return res.status(400).json({ error: 'width and height required' });

    // Initialize the canvas in the store
    canvasStore.init(DEFAULT_CANVAS_ID, Number(width), Number(height));

    return res.json({
      message: 'Canvas created',
      width: Number(width),
      height: Number(height)
    });
  } catch (err) {
    console.error('createCanvasAPI error', err);
    return res.status(500).json({ error: 'Failed to create canvas' });
  }
};

exports.addElementAPI = async (req, res) => {
  try {
    const body = req.body || {};
    const file = req.file;

    // Get the canvas data
    const canvasData = canvasStore.get(DEFAULT_CANVAS_ID);
    if (!canvasData) {
      return res.status(400).json({ error: 'Canvas not initialized. Please create a canvas first.' });
    }

    const el = {
      type: body.type,
      x: Number(body.x) || 0,
      y: Number(body.y) || 0,
      width: Number(body.width) || 0,
      height: Number(body.height) || 0,
      radius: Number(body.radius) || 0,
      text: body.text || '',
      color: body.color || '#000000',
      fontSize: Number(body.fontSize) || 16,
      imageUrl: body.imageUrl || '',
      filePath: file ? file.path : null,
    };

    if (!el.type) return res.status(400).json({ error: 'type is required' });

    // Add element to canvas store
    canvasStore.addElement(DEFAULT_CANVAS_ID, el);

    return res.json({ message: 'Element added', element: el });
  } catch (err) {
    console.error('addElementAPI error', err);
    return res.status(500).json({ error: 'Failed to add element' });
  }
};

async function redrawAll(canvasData) {
  const { width, height, elements } = canvasData;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw all elements
  for (const el of elements) {
    try {
      ctx.fillStyle = el.color || '#000000';
      switch (el.type) {
        case 'rectangle':
          ctx.fillRect(el.x, el.y, el.width, el.height);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'text':
          ctx.font = `${el.fontSize}px sans-serif`;
          ctx.textBaseline = 'top';
          ctx.fillText(el.text, el.x, el.y);
          break;
        case 'image':
          {
            const source = el.imageUrl || el.filePath;
            if (!source) break;
            const imagePath = el.filePath ? path.resolve(el.filePath) : el.imageUrl;
            const image = await loadImage(imagePath);
            const w = el.width || image.width;
            const h = el.height || image.height;
            ctx.drawImage(image, el.x, el.y, w, h);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error drawing element', el, err && err.message);
    }
  }

  return canvas;
}

exports.exportPDFAPI = async (req, res) => {
  try {
    // Get the canvas data from storage
    const canvasData = canvasStore.get(DEFAULT_CANVAS_ID);
    if (!canvasData) {
      return res.status(400).json({ error: 'Canvas not initialized. Please create a canvas first.' });
    }

    // Render the canvas
    const canvas = await redrawAll(canvasData);
    const imgBuffer = canvas.toBuffer('image/png');

    // Generate PDF
    const doc = new PDFDocument({ autoFirstPage: false });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=canvas.pdf');
    doc.pipe(res);
    doc.addPage({ size: [canvasData.width, canvasData.height] });
    doc.image(imgBuffer, 0, 0, { width: canvasData.width, height: canvasData.height });
    doc.end();
  } catch (err) {
    console.error('exportPDFAPI error', err);
    return res.status(500).json({ error: 'Failed to export PDF' });
  }
};
