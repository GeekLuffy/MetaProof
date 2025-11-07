import express, { Request, Response } from 'express';
import { artworkService } from '../services/artworkService';
import { getDatabasePool } from '../services/database';

const router = express.Router();

/**
 * GET /api/stats
 * Get platform statistics
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    let totalArtworks = 0;
    let uniqueCreators = 0;
    let totalVerifications = 0;
    let blockchainProofs = 0;

    try {
      const pool = getDatabasePool();
      
      // Get total artworks count
      const artworksResult = await pool.query('SELECT COUNT(*) as count FROM artworks');
      totalArtworks = parseInt(artworksResult.rows[0].count) || 0;

      // Get unique creators count
      const creatorsResult = await pool.query('SELECT COUNT(DISTINCT creator_address) as count FROM artworks');
      uniqueCreators = parseInt(creatorsResult.rows[0].count) || 0;

      // Get artworks with certificates (blockchain proofs)
      const proofsResult = await pool.query('SELECT COUNT(*) as count FROM artworks WHERE certificate_token_id IS NOT NULL');
      blockchainProofs = parseInt(proofsResult.rows[0].count) || 0;

      // For verifications, we'll use a simple estimate based on artworks
      // In a real scenario, you'd track this separately
      // For now, we'll use artworks count as a proxy
      totalVerifications = totalArtworks; // This can be updated when verification tracking is added

    } catch (error: any) {
      if (error.message?.includes('DATABASE_URL is not set')) {
        // Database not available, return zeros
        return res.json({
          success: true,
          stats: {
            totalArtworks: 0,
            uniqueCreators: 0,
            totalVerifications: 0,
            blockchainProofs: 0,
          },
        });
      }
      throw error;
    }

    res.json({
      success: true,
      stats: {
        totalArtworks,
        uniqueCreators,
        totalVerifications,
        blockchainProofs,
      },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message,
    });
  }
});

export default router;

