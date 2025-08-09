// This file routes all API requests to your Express app
const app = require('../serverless');

// For debugging
console.log('API handler initialized');
console.log('Environment:', process.env.VERCEL ? 'Vercel' : 'Local');
console.log('Node version:', process.version);

// Export for Vercel serverless deployment
module.exports = app;
