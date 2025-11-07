import express, { Request, Response } from 'express';
import { certificateService } from '../services/certificateService';
import { artworkService } from '../services/artworkService';

const router = express.Router();

/**
 * GET /api/certificate/:contentHash
 * Generate and download certificate PDF for an artwork
 */
router.get('/:contentHash', async (req: Request, res: Response) => {
  try {
    const { contentHash } = req.params;

    if (!contentHash) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content hash is required' 
      });
    }

    console.log(`📜 Generating certificate for content hash: ${contentHash.substring(0, 16)}...`);

    // Fetch artwork data from database
    const artwork = await artworkService.getArtworkByContentHash(contentHash);

    if (!artwork) {
      return res.status(404).json({ 
        success: false, 
        error: 'Artwork not found',
        message: 'No artwork found with this content hash. Make sure it has been registered on the blockchain.'
      });
    }

    // Generate IPFS URL
    const ipfsUrl = artwork.ipfsCID 
      ? `https://gateway.pinata.cloud/ipfs/${artwork.ipfsCID}`
      : undefined;

    // Generate certificate PDF
    const pdfBuffer = await certificateService.generateCertificate({
      certificateId: artwork.certificateTokenId ? String(artwork.certificateTokenId) : 'PENDING',
      creatorAddress: artwork.creatorAddress,
      prompt: artwork.prompt,
      contentHash: artwork.contentHash,
      ipfsCID: artwork.ipfsCID || 'N/A',
      ipfsUrl,
      modelUsed: artwork.modelUsed || 'Unknown',
      timestamp: artwork.createdAt || new Date(),
    });

    console.log(`✅ Certificate generated successfully (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proof-of-art-certificate-${artwork.certificateTokenId || contentHash.substring(0, 8)}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('❌ Error generating certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate certificate',
      message: error.message 
    });
  }
});

/**
 * GET /api/certificate/preview/:contentHash
 * Generate certificate and send as inline (for preview)
 */
router.get('/preview/:contentHash', async (req: Request, res: Response) => {
  try {
    const { contentHash } = req.params;

    if (!contentHash) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content hash is required' 
      });
    }

    const artwork = await artworkService.getArtworkByContentHash(contentHash);

    if (!artwork) {
      return res.status(404).json({ 
        success: false, 
        error: 'Artwork not found' 
      });
    }

    const ipfsUrl = artwork.ipfsCID 
      ? `https://gateway.pinata.cloud/ipfs/${artwork.ipfsCID}`
      : undefined;

    const pdfBuffer = await certificateService.generateCertificate({
      certificateId: artwork.certificateTokenId ? String(artwork.certificateTokenId) : 'PENDING',
      creatorAddress: artwork.creatorAddress,
      prompt: artwork.prompt,
      contentHash: artwork.contentHash,
      ipfsCID: artwork.ipfsCID || 'N/A',
      ipfsUrl,
      modelUsed: artwork.modelUsed || 'Unknown',
      timestamp: artwork.createdAt || new Date(),
    });

    // Send as inline for preview
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('❌ Error generating certificate preview:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate certificate preview',
      message: error.message 
    });
  }
});

export default router;

