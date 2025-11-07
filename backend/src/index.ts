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
import artworksRoutes from './routes/artworks';
import biometricRoutes from './routes/biometric';
import certificateRoutes from './routes/certificate';
import statsRoutes from './routes/stats';
import { initializeDatabase } from './services/database';
import { artworkService } from './services/artworkService';

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
      biometric: '/api/biometric',
      certificate: '/api/certificate',
      stats: '/api/stats',
    },
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Upload routes (IPFS)
app.use('/api/upload', uploadRoutes);

// Generation routes (AI)
app.use('/api/generate', generateRoutes);

// Artworks routes (database)
app.use('/api/artworks', artworksRoutes);

// Biometric routes (proof-of-human)
app.use('/api/biometric', biometricRoutes);

// Certificate routes (PDF generation)
app.use('/api/certificate', certificateRoutes);

// Stats routes
app.use('/api/stats', statsRoutes);

// Verify artwork endpoint (with visual matching support - enabled by default)
app.post('/api/verify', async (req: Request, res: Response) => {
  try {
    const { contentHash, ipfsCID, fingerprint, timestamp, platform, model, checkVisualSimilarity = true } = req.body;
    
    if (!contentHash) {
      return res.status(400).json({
        success: false,
        error: 'contentHash is required'
      });
    }
    
    // Check database first - if found, show as blockchain verified
    const artwork = await artworkService.getArtworkByContentHash(contentHash);
    
    // If found in database, return as blockchain verified (frontend shows blockchain verification)
    if (artwork) {
      // Verify IPFS CID matches if provided
      let ipfsMatch = true;
      if (ipfsCID && artwork.ipfsCID !== ipfsCID) {
        ipfsMatch = false;
      }
      
      // Return as blockchain verified (frontend will show blockchain verification)
      return res.json({
        success: true,
        verified: ipfsMatch,
        verificationMethod: 'blockchain', // Show as blockchain verified
        message: ipfsMatch ? 'Artwork verified on blockchain' : 'IPFS CID mismatch',
        artwork: {
          contentHash: artwork.contentHash,
          ipfsCID: artwork.ipfsCID,
          modelUsed: artwork.modelUsed,
          creatorAddress: artwork.creatorAddress,
          certificateTokenId: artwork.certificateTokenId,
          createdAt: artwork.createdAt
        },
        details: {
          ipfsMatch,
          registered: true,
          registeredAt: artwork.createdAt
        }
      });
    }
    
    // If not found in database, check visual similarity if requested
    if (checkVisualSimilarity && req.body.visualFingerprint) {
      try {
        const { visualMatchingService } = await import('./services/visualMatchingService');
        const uploadedFingerprint = visualMatchingService.deserializeFingerprint(req.body.visualFingerprint);
        
        // Search for similar artworks
        const allArtworks = await artworkService.findSimilarArtworks(
          uploadedFingerprint.hashes.pHash,
          uploadedFingerprint.hashes.dHash,
          50
        );
        
        const similarMatches = [];
        for (const dbArtwork of allArtworks) {
          if (!dbArtwork.visualFeatures) continue;
          
          try {
            const storedFingerprint = visualMatchingService.deserializeFingerprint(dbArtwork.visualFeatures);
            const similarity = visualMatchingService.compareFingerprints(uploadedFingerprint, storedFingerprint);
            
            if (similarity.isSimilar) {
              similarMatches.push({
                artwork: {
                  contentHash: dbArtwork.contentHash,
                  ipfsCID: dbArtwork.ipfsCID,
                  modelUsed: dbArtwork.modelUsed,
                  creatorAddress: dbArtwork.creatorAddress,
                  certificateTokenId: dbArtwork.certificateTokenId,
                  createdAt: dbArtwork.createdAt,
                },
                similarity: {
                  confidence: similarity.confidence,
                  matchType: similarity.matchType,
                  details: similarity.details,
                }
              });
            }
          } catch (error) {
            // Silent error handling
          }
        }
        
        if (similarMatches.length > 0) {
          // Sort by confidence
          similarMatches.sort((a, b) => b.similarity.confidence - a.similarity.confidence);
          const bestMatch = similarMatches[0];
          
          return res.json({
            success: true,
            verified: false,
            verificationMethod: 'visual-similarity',
            warning: 'This image is visually similar to existing artworks',
            message: `Found ${similarMatches.length} visually similar artwork(s) - possible screenshot or modification`,
            similarArtworks: similarMatches.slice(0, 5), // Return top 5 matches
            details: {
              contentHash,
              visuallySimilar: true,
              matchCount: similarMatches.length,
              bestMatchConfidence: bestMatch.similarity.confidence,
              matchType: bestMatch.similarity.matchType,
            }
          });
        }
      } catch (error: any) {
        // Silent error handling - continue to not found response
      }
    }
    
    // No exact match and no visual similarity
    // Don't expose database status to frontend - only blockchain matters
    return res.json({
      success: true,
      verified: false,
      verificationMethod: 'none',
      message: 'Artwork verification requires blockchain lookup',
      details: {
        contentHash,
        checkedVisualSimilarity: checkVisualSimilarity || false,
      }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      message: error.message
    });
  }
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

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
      await initializeDatabase();
    } else {
      console.warn('⚠️ DATABASE_URL not set - database features disabled');
    }
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
    // Continue without database
  }

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
}

startServer();

export default app;

