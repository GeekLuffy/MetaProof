import express, { Request, Response } from 'express';
import {
  getNonce,
  verifyNonce,
  verifySignature,
  generateToken,
} from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/auth/nonce
 * Get a nonce for wallet signature
 */
router.post('/nonce', (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    if (!address) {
      res.status(400).json({ error: 'Address is required' });
      return;
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      res.status(400).json({ error: 'Invalid Ethereum address' });
      return;
    }

    const nonce = getNonce(address);

    res.json({
      nonce,
      message: `Sign this message to authenticate with Proof-of-Art.\n\nNonce: ${nonce}\nAddress: ${address}`,
    });
  } catch (error) {
    console.error('Nonce generation error:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

/**
 * POST /api/auth/verify
 * Verify signature and return JWT token
 */
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      res.status(400).json({ error: 'Address, signature, and message are required' });
      return;
    }

    // Extract nonce from message
    const nonceMatch = message.match(/Nonce: (\d+)/);
    if (!nonceMatch) {
      res.status(400).json({ error: 'Invalid message format' });
      return;
    }

    const nonce = nonceMatch[1];

    // Verify nonce is valid and not expired
    if (!verifyNonce(address, nonce)) {
      res.status(401).json({ error: 'Invalid or expired nonce' });
      return;
    }

    // Verify signature
    if (!verifySignature(message, signature, address)) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Generate JWT token
    const token = generateToken(address);

    res.json({
      token,
      address,
      expiresIn: '7d',
    });
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // This would use the authenticateToken middleware in production
  res.json({
    message: 'Authentication status endpoint',
    authenticated: !!token,
  });
});

export default router;

