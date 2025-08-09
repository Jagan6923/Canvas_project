
// File-based canvas store (more persistent than in-memory)
const fs = require('fs');
const path = require('path');

const storeDir = path.join(__dirname, '../data');
// Create data directory if it doesn't exist
if (!fs.existsSync(storeDir)) {
  fs.mkdirSync(storeDir, { recursive: true });
}

const getStorePath = (id) => path.join(storeDir, `${id}.json`);

exports.init = (id, width, height) => {
  const data = { width, height, elements: [] };
  fs.writeFileSync(getStorePath(id), JSON.stringify(data));
  return data;
};

exports.get = (id) => {
  try {
    const data = fs.readFileSync(getStorePath(id), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist or can't be read, return null
    return null;
  }
};

exports.update = (id, data) => {
  fs.writeFileSync(getStorePath(id), JSON.stringify(data));
  return data;
};

exports.addElement = (id, element) => {
  const canvas = exports.get(id);
  if (!canvas) return null;

  canvas.elements.push(element);
  exports.update(id, canvas);
  return canvas;
};

// Default canvas ID for simple applications
exports.DEFAULT_CANVAS_ID = 'default_canvas';
