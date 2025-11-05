import express, { Request, Response } from 'express';
import multer from 'multer';
import { ipfsService } from '../services/ipfsService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/json',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and JSON allowed.'));
    }
  },
});

interface AuthRequest extends Request {
  user?: {
    address: string;
  };
}

/**
 * POST /api/upload
 * Upload file to IPFS
 */
router.post(
  '/',
  authenticateToken,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { originalname, buffer, mimetype, size } = req.file;
      const userAddress = req.user?.address;

      // Optional metadata from request body
      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

      // Upload to IPFS with metadata
      const result = await ipfsService.uploadFile(buffer, originalname, {
        name: originalname,
        keyValues: {
          uploader: userAddress,
          uploadedAt: new Date().toISOString(),
          mimeType: mimetype,
          originalSize: size,
          ...metadata,
        },
      });

      res.json({
        success: true,
        ipfsCID: result.cid,
        url: result.url,
        size: result.size,
        filename: originalname,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload file',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/upload/json
 * Upload JSON metadata to IPFS
 */
router.post('/json', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const jsonData = req.body;

    if (!jsonData || Object.keys(jsonData).length === 0) {
      res.status(400).json({ error: 'No JSON data provided' });
      return;
    }

    const userAddress = req.user?.address;

    // Upload JSON to IPFS
    const result = await ipfsService.uploadJSON(jsonData, {
      name: jsonData.name || 'metadata',
      keyValues: {
        uploader: userAddress,
        uploadedAt: new Date().toISOString(),
        type: 'json-metadata',
      },
    });

    res.json({
      success: true,
      ipfsCID: result.cid,
      url: result.url,
    });
  } catch (error: any) {
    console.error('JSON upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload JSON',
      message: error.message,
    });
  }
});

/**
 * GET /api/upload/:cid
 * Retrieve content from IPFS
 */
router.get('/:cid', async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;

    if (!cid) {
      res.status(400).json({ error: 'CID is required' });
      return;
    }

    const content = await ipfsService.getContent(cid);

    res.json({
      success: true,
      cid,
      content,
      url: ipfsService.getIPFSUrl(cid),
    });
  } catch (error: any) {
    console.error('IPFS retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve content from IPFS',
      message: error.message,
    });
  }
});

/**
 * GET /api/upload/url/:cid
 * Get IPFS gateway URL for a CID
 */
router.get('/url/:cid', (req: Request, res: Response) => {
  const { cid } = req.params;

  if (!cid) {
    res.status(400).json({ error: 'CID is required' });
    return;
  }

  res.json({
    cid,
    url: ipfsService.getIPFSUrl(cid),
  });
});

/**
 * GET /api/upload/test
 * Test IPFS connection
 */
router.get('/test/connection', async (req: Request, res: Response) => {
  try {
    const isConnected = await ipfsService.testConnection();

    res.json({
      success: isConnected,
      message: isConnected
        ? 'IPFS connection successful'
        : 'IPFS connection failed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'IPFS connection test failed',
      message: error.message,
    });
  }
});

export default router;

