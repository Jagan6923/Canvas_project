const { createCanvas, loadImage } = require('canvas');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const canvasStore = require('../utils/canvasStore');

// Default canvas ID to use
const DEFAULT_CANVAS_ID = canvasStore.DEFAULT_CANVAS_ID;
// Determine if we're in a serverless environment
const isServerless = process.env.VERCEL === '1';

// In-memory image store for serverless environments
const imageBuffers = {};

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

    let fileData = null;
    let fileId = null;

    // Handle file upload differently in serverless environment
    if (file) {
      if (isServerless && file.buffer) {
        // In serverless, store in memory
        fileId = `mem_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        imageBuffers[fileId] = file.buffer;
        fileData = { id: fileId, mimetype: file.mimetype };
      } else {
        // In local dev, use file path
        fileData = { path: file.path };
      }
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
      fileData: fileData
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
            let image;

            if (el.imageUrl) {
              // Load from URL
              image = await loadImage(el.imageUrl);
            } else if (el.fileData) {
              if (isServerless && el.fileData.id && imageBuffers[el.fileData.id]) {
                // Load from in-memory buffer
                image = await loadImage(imageBuffers[el.fileData.id]);
              } else if (el.fileData.path) {
                // Load from file path
                const imagePath = path.resolve(el.fileData.path);
                image = await loadImage(imagePath);
              }
            } else if (el.filePath) {
              // Legacy support
              const imagePath = path.resolve(el.filePath);
              image = await loadImage(imagePath);
            }

            if (!image) break;

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
