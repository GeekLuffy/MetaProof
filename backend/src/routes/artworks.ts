import express, { Request, Response } from 'express';
import { artworkService } from '../services/artworkService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

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
        ipfsCID,
        modelUsed,
        metadataURI,
        certificateTokenId,
      } = req.body;
      
      if (!contentHash || !promptHash || !ipfsCID || !modelUsed) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: contentHash, promptHash, ipfsCID, modelUsed',
        });
      }
      
      const artwork = await artworkService.saveArtwork({
        contentHash,
        promptHash,
        creatorAddress: creatorAddress.toLowerCase(),
        ipfsCID,
        modelUsed,
        metadataURI,
        certificateTokenId,
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

export default router;

