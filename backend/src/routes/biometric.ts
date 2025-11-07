import express, { Request, Response } from 'express';
import { biometricService } from '../services/biometricService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    address: string;
  };
}

/**
 * POST /api/biometric/capture
 * Process facial capture and generate proof-of-human signature
 * Requires authentication
 */
router.post('/capture', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { imageData } = req.body;
    const userAddress = req.user?.address;

    if (!userAddress) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'No facial image data provided',
      });
    }

    // Validate facial data
    const validation = biometricService.validateFacialData(imageData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Analyze image for face detection
    console.log('🔍 Analyzing facial image...');
    const faceAnalysis = await biometricService.analyzeFacialImage(imageData);
    
    console.log(`   Face Detection: ${faceAnalysis.hasFace ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`   Confidence: ${faceAnalysis.confidence}%`);
    console.log(`   Skin Tone Ratio: ${(faceAnalysis.metrics.skinToneRatio * 100).toFixed(2)}% (min: 5%)`);
    console.log(`   Brightness: ${faceAnalysis.metrics.brightness.toFixed(0)} (range: 20-250)`);
    console.log(`   Color Variance: ${faceAnalysis.metrics.colorVariance.toFixed(1)} (min: 10)`);
    
    // Reject if no face detected
    if (!faceAnalysis.hasFace) {
      console.log(`   ❌ REJECTED: ${faceAnalysis.reason}`);
      return res.status(400).json({
        success: false,
        error: 'No face detected',
        message: faceAnalysis.reason || 'Unable to detect a face in the image',
        details: {
          confidence: faceAnalysis.confidence,
          skinToneRatio: (faceAnalysis.metrics.skinToneRatio * 100).toFixed(2) + '%',
          brightness: faceAnalysis.metrics.brightness.toFixed(0),
          colorVariance: faceAnalysis.metrics.colorVariance.toFixed(1),
          minimumRequirements: {
            skinToneRatio: '5%',
            brightness: '20-250',
            colorVariance: '10',
          },
        },
      });
    }
    
    // Require minimum confidence (LOWERED TO 50% for real-world use)
    if (faceAnalysis.confidence < 50) {
      console.log(`   ❌ REJECTED: Low confidence ${faceAnalysis.confidence}%`);
      return res.status(400).json({
        success: false,
        error: 'Face detection confidence too low',
        message: `Face detection confidence: ${faceAnalysis.confidence}% (minimum: 30%). ${faceAnalysis.reason || 'Please ensure good lighting and clear view of face.'}`,
        details: {
          confidence: faceAnalysis.confidence,
          skinToneRatio: (faceAnalysis.metrics.skinToneRatio * 100).toFixed(2) + '%',
          brightness: faceAnalysis.metrics.brightness.toFixed(0),
          colorVariance: faceAnalysis.metrics.colorVariance.toFixed(1),
          minimumConfidence: 30,
        },
      });
    }

    // Generate facial hash
    const facialHash = biometricService.generateFacialHash(imageData);

    // Extract minimal features for storage
    const features = biometricService.extractBiometricFeatures(facialHash);

    // Reject if verification failed (low entropy/quality)
    if (!features.verified) {
      return res.status(400).json({
        success: false,
        error: 'Biometric verification failed',
        message: `Image quality insufficient for verification. Entropy: ${features.entropy.toFixed(2)} (minimum: 3.5). Please ensure proper lighting and camera focus.`,
        details: {
          entropy: features.entropy,
          minimumRequired: 3.5,
        },
      });
    }

    // Generate proof-of-human signature
    const timestamp = new Date().toISOString();
    const proofOfHuman = biometricService.generateProofOfHuman({
      facialHash,
      userAddress,
      timestamp,
    });

    // Create time-limited token
    const biometricToken = biometricService.createBiometricToken({
      facialHash,
      userAddress,
    });

    console.log(`✅ Biometric capture successful for ${userAddress}`);
    console.log(`   Facial Hash: ${facialHash.substring(0, 18)}...`);
    console.log(`   Entropy: ${features.entropy} ✓`);

    res.json({
      success: true,
      biometric: {
        facialHash,
        signature: proofOfHuman.signature,
        timestamp,
        features: {
          entropy: features.entropy,
          verified: true,
        },
        token: biometricToken.token,
        expiresAt: biometricToken.expiresAt,
      },
      message: 'Proof-of-human verification successful',
    });
  } catch (error: any) {
    console.error('❌ Biometric capture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process biometric data',
      message: error.message,
    });
  }
});

/**
 * POST /api/biometric/verify
 * Verify a proof-of-human signature
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { signature, facialHash, userAddress, timestamp } = req.body;

    if (!signature || !facialHash || !userAddress || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required verification parameters',
      });
    }

    // Verify the signature
    const isValid = biometricService.verifyProofOfHuman({
      signature,
      facialHash,
      userAddress,
      timestamp,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid proof-of-human signature',
        verified: false,
      });
    }

    // Check if timestamp is recent (within 1 hour)
    const captureTime = new Date(timestamp).getTime();
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;

    if (now - captureTime > hourInMs) {
      return res.status(400).json({
        success: false,
        error: 'Proof-of-human signature expired (valid for 1 hour)',
        verified: false,
      });
    }

    console.log(`✅ Biometric verification successful for ${userAddress}`);

    res.json({
      success: true,
      verified: true,
      message: 'Proof-of-human signature verified',
      data: {
        userAddress,
        timestamp,
        age: Math.round((now - captureTime) / 1000), // seconds
      },
    });
  } catch (error: any) {
    console.error('❌ Biometric verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify biometric data',
      message: error.message,
    });
  }
});

/**
 * GET /api/biometric/status
 * Check biometric authentication status
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userAddress = req.user?.address;

    if (!userAddress) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    res.json({
      success: true,
      status: {
        userAddress,
        biometricEnabled: true,
        requiresCapture: true,
      },
    });
  } catch (error: any) {
    console.error('❌ Biometric status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check biometric status',
      message: error.message,
    });
  }
});

export default router;

