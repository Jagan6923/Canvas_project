// serverless.js
const express = require('express');
const cors = require('cors');
const canvasRoutes = require('./routes/canvasRoutes');

// For Vercel serverless functions, set VERCEL environment variable
if (process.env.VERCEL_URL) {
    process.env.VERCEL = '1';
}

// Create express instance
const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://canvas-project-silk.vercel.app';

// Debug middleware for Vercel deployment
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Environment:', process.env.VERCEL ? 'Vercel' : 'Local');
    console.log('Origin:', req.headers.origin);
    next();
});

// CORS preflight handler
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204);
});

// Use cors middleware
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());

// Explicitly mount the routes at both paths to handle potential path issues
app.use('/api/canvas', canvasRoutes);

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL ? 'Vercel' : 'Local',
        node_version: process.version
    });
});

app.get('/', (req, res) => {
    res.send('Canvas Builder API is running...');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Server error',
        message: err.message,
        path: req.path,
        method: req.method,
        origin: req.headers.origin,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// Export the Express app as a serverless function
module.exports = app;

// Export the Express app as a serverless function
module.exports = app;
