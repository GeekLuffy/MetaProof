import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

interface AuthRequest extends Request {
  user?: {
    address: string;
  };
}

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * Generate a random nonce for signature verification
 */
export function generateNonce(): string {
  return Math.floor(Math.random() * 1000000).toString();
}

/**
 * Store for nonces (in production, use Redis or database)
 * Format: { address: nonce }
 */
const nonceStore = new Map<string, string>();

/**
 * Get nonce for an address
 */
export function getNonce(address: string): string {
  const nonce = generateNonce();
  nonceStore.set(address.toLowerCase(), nonce);
  return nonce;
}

/**
 * Verify nonce exists and is valid
 */
export function verifyNonce(address: string, nonce: string): boolean {
  const storedNonce = nonceStore.get(address.toLowerCase());
  if (storedNonce === nonce) {
    // Remove nonce after verification (one-time use)
    nonceStore.delete(address.toLowerCase());
    return true;
  }
  return false;
}

/**
 * Verify Ethereum signature
 */
export function verifySignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(address: string): string {
  return jwt.sign({ address }, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { address: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to authenticate requests
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('❌ No token provided in request');
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('❌ Invalid or expired token');
    res.status(403).json({ error: 'Invalid or expired token. Please reconnect your wallet and sign in again.' });
    return;
  }

  console.log(`✅ Authenticated user: ${decoded.address}`);
  req.user = { address: decoded.address };
  next();
}

/**
 * Optional authentication (doesn't block if no token)
 */
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = { address: decoded.address };
    }
  }

  next();
}

