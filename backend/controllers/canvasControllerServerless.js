// Mock implementation that doesn't use the canvas library
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

// Log environment for debugging
console.log('Loading serverless controller');
console.log('Environment:', isServerless ? 'Vercel' : 'Local');

exports.createCanvasAPI = (req, res) => {
    try {
        console.log('Serverless: createCanvasAPI called');
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
        return res.status(500).json({ error: 'Failed to create canvas', details: err.message });
    }
};

exports.addElementAPI = async (req, res) => {
    try {
        console.log('Serverless: addElementAPI called');
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
        return res.status(500).json({ error: 'Failed to add element', details: err.message });
    }
};

exports.exportPDFAPI = async (req, res) => {
    try {
        console.log('Serverless: exportPDFAPI called');
        // Get the canvas data from storage
        const canvasData = canvasStore.get(DEFAULT_CANVAS_ID);
        if (!canvasData) {
            return res.status(400).json({ error: 'Canvas not initialized. Please create a canvas first.' });
        }

        // Create a simple PDF with text representation of the canvas
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=canvas.pdf');
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('Canvas Export', { align: 'center' });
        doc.moveDown();

        // Canvas properties
        doc.fontSize(12).text(`Canvas Size: ${canvasData.width} x ${canvasData.height}`);
        doc.moveDown();

        // List elements
        doc.fontSize(16).text('Elements:', { underline: true });
        doc.moveDown();

        if (canvasData.elements.length === 0) {
            doc.text('No elements added to canvas');
        } else {
            canvasData.elements.forEach((el, index) => {
                doc.fontSize(14).text(`Element ${index + 1}: ${el.type}`);
                doc.fontSize(10).text(`Position: (${el.x}, ${el.y})`);

                if (el.type === 'rectangle') {
                    doc.text(`Size: ${el.width} x ${el.height}`);
                } else if (el.type === 'circle') {
                    doc.text(`Radius: ${el.radius}`);
                } else if (el.type === 'text') {
                    doc.text(`Text: "${el.text}"`);
                    doc.text(`Font Size: ${el.fontSize}`);
                }

                doc.text(`Color: ${el.color}`);
                doc.moveDown();
            });
        }

        // Add note about serverless limitation
        doc.moveDown();
        doc.fontSize(10).fillColor('gray').text(
            'Note: Visual rendering is limited in serverless environment. This is a text representation of your canvas.',
            { align: 'center' }
        );

        doc.end();
    } catch (err) {
        console.error('exportPDFAPI error', err);
        return res.status(500).json({ error: 'Failed to export PDF', details: err.message });
    }
};
