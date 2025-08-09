
// PDF Generator using pdfkit
// Draws each element (rect, circle, text, image) onto a PDF

const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports = async function generatePDF(canvasData) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: [canvasData.width, canvasData.height],
    });

    const filePath = `temp_${Date.now()}.pdf`;
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    for (const el of canvasData.elements) {
      switch (el.type) {
        case 'rectangle':
          doc.rect(el.x, el.y, el.width, el.height).fill(el.color || 'black');
          break;
        case 'circle':
          doc.circle(el.x, el.y, el.radius).fill(el.color || 'black');
          break;
        case 'text':
          doc.fillColor(el.color || 'black')
             .fontSize(el.fontSize || 12)
             .text(el.text, el.x, el.y);
          break;
        case 'image':
          const imagePath = el.path || el.url;
          try {
            doc.image(imagePath, el.x, el.y, { width: el.width, height: el.height });
          } catch (e) {
            console.error('Image error:', e);
          }
          break;
      }
    }

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};
