const express = require('express');
const cors = require('cors');
const app = express();
const canvasRoutes = require('./routes/canvasRoutes');
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://canvas-project-silk.vercel.app';

// Debug middleware for Vercel deployment
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Environment:', process.env.VERCEL ? 'Vercel' : 'Local');
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Use cors middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/canvas', canvasRoutes);

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'Vercel' : 'Local',
    node_version: process.version,
    memory: process.memoryUsage()
  });
});

app.use('/', (req, res) => {
  res.send('Canvas Builder API is running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
