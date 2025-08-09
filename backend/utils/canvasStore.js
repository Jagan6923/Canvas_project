
// Serverless-compatible canvas store (in-memory for Vercel)
const fs = require('fs');
const path = require('path');
const os = require('os');

// Determine if we're running in a serverless environment
const isServerless = process.env.VERCEL === '1';

// In-memory store for serverless environments
const memoryStore = {};

// Default canvas ID for simple applications
const DEFAULT_CANVAS_ID = 'default_canvas';

// Set up file storage for local development
let storeDir;
if (!isServerless) {
  try {
    storeDir = path.join(__dirname, '../data');
    // Create data directory if it doesn't exist and we're not in serverless
    if (!fs.existsSync(storeDir)) {
      fs.mkdirSync(storeDir, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create data directory, falling back to in-memory store');
  }
}

const getStorePath = (id) => storeDir ? path.join(storeDir, `${id}.json`) : null;

// Initialize a new canvas
exports.init = (id, width, height) => {
  const data = { width, height, elements: [] };

  if (isServerless || !storeDir) {
    // Use in-memory storage for serverless
    memoryStore[id] = data;
  } else {
    // Use file storage for local development
    try {
      fs.writeFileSync(getStorePath(id), JSON.stringify(data));
    } catch (err) {
      console.warn('Could not write to file, using in-memory store');
      memoryStore[id] = data;
    }
  }

  return data;
};

// Get canvas data
exports.get = (id) => {
  if (isServerless || !storeDir) {
    // Use in-memory storage for serverless
    return memoryStore[id] || null;
  }

  // Use file storage for local development
  try {
    const filePath = getStorePath(id);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (err) {
    // Fall back to memory if file read fails
    return memoryStore[id] || null;
  }
};

// Update canvas data
exports.update = (id, data) => {
  if (isServerless || !storeDir) {
    // Use in-memory storage for serverless
    memoryStore[id] = data;
  } else {
    // Use file storage for local development
    try {
      fs.writeFileSync(getStorePath(id), JSON.stringify(data));
    } catch (err) {
      console.warn('Could not write to file, using in-memory store');
      memoryStore[id] = data;
    }
  }

  return data;
};

// Add an element to a canvas
exports.addElement = (id, element) => {
  const canvas = exports.get(id);
  if (!canvas) return null;

  canvas.elements.push(element);
  exports.update(id, canvas);
  return canvas;
};

// Export the default canvas ID
exports.DEFAULT_CANVAS_ID = DEFAULT_CANVAS_ID;