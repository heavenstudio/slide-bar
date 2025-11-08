import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { prisma } from './config/database.js';
import { createUploadRouter } from './routes/upload.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { UploadService } from './services/upload.service.js';
import { authenticate } from './middleware/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(config.upload.dir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize services
const uploadService = new UploadService(prisma);

// Routes
app.use('/api/auth', createAuthRouter(prisma));
app.use('/api/upload', createUploadRouter(uploadService, authenticate));

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      maxSize: config.upload.maxFileSize,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const start = () => {
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📁 Upload directory: ${config.upload.dir}`);
  });
};

// Only start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { app };
