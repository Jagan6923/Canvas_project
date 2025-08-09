// This file routes all API requests to your Express app
const app = require('../serverless');

// For debugging
console.log('API handler initialized');

// Export for Vercel serverless deployment
module.exports = app;
