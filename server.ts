import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/apiRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic security headers and request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      platform: 'FraudGuard Enterprise Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes FIRST
  app.use('/api', apiRouter);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Centralized error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      error: 'An internal server error occurred',
      message: err.message || 'Internal Server Error',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`FRAUDGUARD REAL-TIME MONITORING PLATFORM ONLINE`);
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
