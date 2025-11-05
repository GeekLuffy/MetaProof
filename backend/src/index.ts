import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Load environment variables - check both backend folder and root
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') }); // Also check root
dotenv.config(); // Fallback to default location

// Debug: Log Bytez API key status (without exposing the key)
if (process.env.BYTEZ_API_KEY) {
  console.log(`✅ BYTEZ_API_KEY found: ${process.env.BYTEZ_API_KEY.substring(0, 8)}...`);
} else {
  console.warn('⚠️ BYTEZ_API_KEY not found in environment variables');
}

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Import routes
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import generateRoutes from './routes/generate';

// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Proof-of-Art API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      generate: '/api/generate',
      verify: '/api/verify',
      upload: '/api/upload',
      artworks: '/api/artworks',
    },
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Upload routes (IPFS)
app.use('/api/upload', uploadRoutes);

// Generation routes (AI)
app.use('/api/generate', generateRoutes);

app.post('/api/verify', (req: Request, res: Response) => {
  res.status(501).json({ message: 'Verification endpoint - Coming soon' });
});


app.get('/api/artworks', (req: Request, res: Response) => {
  res.status(501).json({ message: 'Artworks listing endpoint - Coming soon' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🎨 Proof-of-Art Backend Server      ║
  ║                                       ║
  ║   Server running on port ${PORT}        ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
  ║                                       ║
  ║   API: http://localhost:${PORT}/api     ║
  ║   Health: http://localhost:${PORT}/health║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;

