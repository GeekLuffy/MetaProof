import express, { Request, Response } from 'express';
import { artworkService } from '../services/artworkService';
import { authenticateToken } from '../middleware/auth';
import { visualMatchingService } from '../services/visualMatchingService';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

interface AuthRequest extends Request {
  user?: {
    address: string;
  };
}

/**
 * GET /api/artworks
 * Get all artworks, optionally filtered by creator address
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const creatorAddress = req.query.address as string | undefined;
    
    const artworks = await artworkService.getAllArtworks(creatorAddress);
    
    res.json({
      success: true,
      artworks: artworks.map((artwork) => ({
        id: artwork.id,
        contentHash: artwork.contentHash,
        promptHash: artwork.promptHash,
        prompt: artwork.prompt,
        creatorAddress: artwork.creatorAddress,
        ipfsCID: artwork.ipfsCID,
        modelUsed: artwork.modelUsed,
        metadataURI: artwork.metadataURI,
        certificateTokenId: artwork.certificateTokenId,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
      })),
      count: artworks.length,
    });
  } catch (error: any) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch artworks',
      message: error.message,
    });
  }
});

/**
 * GET /api/artworks/my
 * Get current user's artworks (requires authentication)
 */
router.get('/my', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const creatorAddress = req.user?.address;
    
    if (!creatorAddress) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
    
    const artworks = await artworkService.getArtworksByCreator(creatorAddress);
    
    res.json({
      success: true,
      artworks: artworks.map((artwork) => ({
        id: artwork.id,
        contentHash: artwork.contentHash,
        promptHash: artwork.promptHash,
        prompt: artwork.prompt,
        creatorAddress: artwork.creatorAddress,
        ipfsCID: artwork.ipfsCID,
        modelUsed: artwork.modelUsed,
        metadataURI: artwork.metadataURI,
        certificateTokenId: artwork.certificateTokenId,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
      })),
      count: artworks.length,
    });
  } catch (error: any) {
    console.error('Error fetching user artworks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch artworks',
      message: error.message,
    });
  }
});

/**
 * GET /api/artworks/:contentHash
 * Get artwork by content hash
 */
router.get('/:contentHash', async (req: Request, res: Response) => {
  try {
    const { contentHash } = req.params;
    
    const artwork = await artworkService.getArtworkByContentHash(contentHash);
    
    if (!artwork) {
      return res.status(404).json({
        success: false,
        error: 'Artwork not found',
      });
    }
    
    res.json({
      success: true,
      artwork: {
        id: artwork.id,
        contentHash: artwork.contentHash,
        promptHash: artwork.promptHash,
        prompt: artwork.prompt,
        creatorAddress: artwork.creatorAddress,
        ipfsCID: artwork.ipfsCID,
        modelUsed: artwork.modelUsed,
        metadataURI: artwork.metadataURI,
        certificateTokenId: artwork.certificateTokenId,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch artwork',
      message: error.message,
    });
  }
});

/**
 * POST /api/artworks
 * Save or update an artwork (authentication optional - allows extension registration)
 */
router.post(
  '/',
  async (req: Request, res: Response) => {
    try {
      // Try to get authenticated user address
      const authHeader = req.headers.authorization;
      let creatorAddress = req.body.creatorAddress;
      
      // If auth token provided, verify and use that address
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'dev-secret');
          creatorAddress = (decoded as any).address;
        } catch (error) {
          // Invalid token, but continue with provided address
          console.warn('Invalid auth token, using provided address');
        }
      }
      
      // If no address provided or authenticated, use placeholder for extension
      if (!creatorAddress) {
        creatorAddress = '0x0000000000000000000000000000000000000000';
        console.log('No creator address provided, using placeholder for extension registration');
      }
      
      const {
        contentHash,
        promptHash,
        prompt,
        ipfsCID,
        modelUsed,
        metadataURI,
        certificateTokenId,
        perceptualHash,
        dhash,
        ahash,
        waveletHash,
        visualFeatures,
      } = req.body;
      
      if (!contentHash || !promptHash || !ipfsCID || !modelUsed) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: contentHash, promptHash, ipfsCID, modelUsed',
        });
      }
      
      // Convert prompt to string if it's an object
      const promptString = prompt 
        ? (typeof prompt === 'string' ? prompt : JSON.stringify(prompt))
        : undefined;
      
      const artwork = await artworkService.saveArtwork({
        contentHash,
        promptHash,
        prompt: promptString,
        creatorAddress: creatorAddress.toLowerCase(),
        ipfsCID,
        modelUsed,
        metadataURI,
        certificateTokenId,
        perceptualHash,
        dhash,
        ahash,
        waveletHash,
        visualFeatures,
      });
      
      res.json({
        success: true,
        artwork: {
          id: artwork.id,
          contentHash: artwork.contentHash,
          promptHash: artwork.promptHash,
          creatorAddress: artwork.creatorAddress,
          ipfsCID: artwork.ipfsCID,
          modelUsed: artwork.modelUsed,
          metadataURI: artwork.metadataURI,
          certificateTokenId: artwork.certificateTokenId,
          hasVisualFingerprint: !!(artwork.perceptualHash),
          createdAt: artwork.createdAt,
          updatedAt: artwork.updatedAt,
        },
      });
    } catch (error: any) {
      console.error('Error saving artwork:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save artwork',
        message: error.message,
      });
    }
  }
);

/**
 * PUT /api/artworks/:contentHash/certificate
 * Update certificate token ID for an artwork (requires authentication)
 */
router.put(
  '/:contentHash/certificate',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { contentHash } = req.params;
      const { certificateTokenId } = req.body;
      
      if (!certificateTokenId) {
        return res.status(400).json({
          success: false,
          error: 'certificateTokenId is required',
        });
      }
      
      // Verify the artwork belongs to the user
      const artwork = await artworkService.getArtworkByContentHash(contentHash);
      if (!artwork) {
        return res.status(404).json({
          success: false,
          error: 'Artwork not found',
        });
      }
      
      if (artwork.creatorAddress.toLowerCase() !== req.user?.address?.toLowerCase()) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
      }
      
      await artworkService.updateCertificateTokenId(contentHash, certificateTokenId);
      
      res.json({
        success: true,
        message: 'Certificate token ID updated',
      });
    } catch (error: any) {
      console.error('Error updating certificate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update certificate',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/artworks/search/visual
 * Search for visually similar artworks by uploading an image
 */
router.post(
  '/search/visual',
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image provided',
        });
      }

      const { buffer } = req.file;
      const similarityThreshold = req.body.threshold ? parseFloat(req.body.threshold) : 80;
      const limit = req.body.limit ? parseInt(req.body.limit) : 10;

      console.log(`🔍 Searching for visually similar artworks (threshold: ${similarityThreshold}%)...`);

      // Generate visual fingerprint for uploaded image
      const uploadedFingerprint = await visualMatchingService.generateVisualFingerprint(buffer);

      // Get all artworks with visual fingerprints
      const allArtworks = await artworkService.findSimilarArtworks(
        uploadedFingerprint.hashes.pHash,
        uploadedFingerprint.hashes.dHash,
        100 // Get more for filtering
      );

      // Compare with each artwork
      const similarArtworks: Array<{
        artwork: any;
        similarity: {
          confidence: number;
          matchType: string;
          details: any;
        };
      }> = [];

      for (const artwork of allArtworks) {
        if (!artwork.visualFeatures) continue;

        try {
          const storedFingerprint = visualMatchingService.deserializeFingerprint(artwork.visualFeatures);
          const similarity = visualMatchingService.compareFingerprints(uploadedFingerprint, storedFingerprint);

          if (similarity.confidence >= similarityThreshold) {
            similarArtworks.push({
              artwork: {
                id: artwork.id,
                contentHash: artwork.contentHash,
                promptHash: artwork.promptHash,
                prompt: artwork.prompt,
                creatorAddress: artwork.creatorAddress,
                ipfsCID: artwork.ipfsCID,
                modelUsed: artwork.modelUsed,
                createdAt: artwork.createdAt,
              },
              similarity: {
                confidence: similarity.confidence,
                matchType: similarity.matchType,
                details: similarity.details,
              },
            });
          }
        } catch (error) {
          console.warn(`Failed to compare with artwork ${artwork.id}:`, error);
        }
      }

      // Sort by confidence (highest first)
      similarArtworks.sort((a, b) => b.similarity.confidence - a.similarity.confidence);

      // Limit results
      const results = similarArtworks.slice(0, limit);

      console.log(`✅ Found ${results.length} similar artworks`);

      res.json({
        success: true,
        matches: results,
        count: results.length,
        searchParams: {
          threshold: similarityThreshold,
          limit,
        },
      });
    } catch (error: any) {
      console.error('Visual search error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform visual search',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/artworks/search/visual-by-hash
 * Search for visually similar artworks using content hash
 */
router.post('/search/visual-by-hash', async (req: Request, res: Response) => {
  try {
    const { contentHash, threshold = 80, limit = 10 } = req.body;

    if (!contentHash) {
      return res.status(400).json({
        success: false,
        error: 'contentHash is required',
      });
    }

    // Get the source artwork
    const sourceArtwork = await artworkService.getArtworkByContentHash(contentHash);
    if (!sourceArtwork || !sourceArtwork.visualFeatures) {
      return res.status(404).json({
        success: false,
        error: 'Artwork not found or has no visual fingerprint',
      });
    }

    const sourceFingerprint = visualMatchingService.deserializeFingerprint(sourceArtwork.visualFeatures);

    // Get potential matches
    const allArtworks = await artworkService.findSimilarArtworks(
      sourceArtwork.perceptualHash!,
      sourceArtwork.dhash!,
      100
    );

    const similarArtworks: Array<{
      artwork: any;
      similarity: {
        confidence: number;
        matchType: string;
        details: any;
      };
    }> = [];

    for (const artwork of allArtworks) {
      if (artwork.contentHash === contentHash || !artwork.visualFeatures) continue;

      try {
        const storedFingerprint = visualMatchingService.deserializeFingerprint(artwork.visualFeatures);
        const similarity = visualMatchingService.compareFingerprints(sourceFingerprint, storedFingerprint);

        if (similarity.confidence >= threshold) {
          similarArtworks.push({
            artwork: {
              id: artwork.id,
              contentHash: artwork.contentHash,
              promptHash: artwork.promptHash,
              prompt: artwork.prompt,
              creatorAddress: artwork.creatorAddress,
              ipfsCID: artwork.ipfsCID,
              modelUsed: artwork.modelUsed,
              createdAt: artwork.createdAt,
            },
            similarity: {
              confidence: similarity.confidence,
              matchType: similarity.matchType,
              details: similarity.details,
            },
          });
        }
      } catch (error) {
        console.warn(`Failed to compare with artwork ${artwork.id}:`, error);
      }
    }

    similarArtworks.sort((a, b) => b.similarity.confidence - a.similarity.confidence);
    const results = similarArtworks.slice(0, limit);

    res.json({
      success: true,
      sourceArtwork: {
        id: sourceArtwork.id,
        contentHash: sourceArtwork.contentHash,
        ipfsCID: sourceArtwork.ipfsCID,
      },
      matches: results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Visual search by hash error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform visual search',
      message: error.message,
    });
  }
});

export default router;

