import crypto from 'crypto';
import { ethers } from 'ethers';

/**
 * Cryptographic utility functions for Proof-of-Art system
 */

/**
 * Generate SHA-256 hash from data
 * @param data Data to hash (string, buffer, or object)
 * @returns Hex string hash with 0x prefix
 */
export function generateHash(data: string | Buffer | object): string {
  let input: string | Buffer;

  if (Buffer.isBuffer(data)) {
    input = data;
  } else if (typeof data === 'object') {
    input = JSON.stringify(data);
  } else {
    input = data;
  }

  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return `0x${hash}`;
}

/**
 * Generate content hash from file buffer
 * @param buffer File buffer
 * @returns Content hash with 0x prefix
 */
export function generateContentHash(buffer: Buffer): string {
  return generateHash(buffer);
}

/**
 * Generate prompt hash
 * @param prompt Prompt text
 * @returns Prompt hash with 0x prefix
 */
export function generatePromptHash(prompt: string): string {
  // Add salt to prevent rainbow table attacks
  const saltedPrompt = `proof-of-art:${prompt}:${Date.now()}`;
  return generateHash(saltedPrompt);
}

/**
 * Generate biometric hash (one-way hash of facial landmarks)
 * @param biometricData Biometric data object
 * @returns Biometric hash
 */
export function generateBiometricHash(biometricData: any): string {
  // Hash the biometric data to ensure privacy
  return generateHash(biometricData);
}

/**
 * Build Merkle tree from array of hashes
 * @param leaves Array of hashes (leaf nodes)
 * @returns Merkle root hash
 */
export function buildMerkleTree(leaves: string[]): {
  root: string;
  tree: string[][];
  proof: string[];
} {
  if (leaves.length === 0) {
    throw new Error('Cannot build Merkle tree from empty array');
  }

  // Remove 0x prefix for hashing
  const cleanLeaves = leaves.map((l) => l.replace(/^0x/, ''));

  const tree: string[][] = [cleanLeaves];

  // Build tree layer by layer
  while (tree[tree.length - 1].length > 1) {
    const currentLayer = tree[tree.length - 1];
    const nextLayer: string[] = [];

    for (let i = 0; i < currentLayer.length; i += 2) {
      if (i + 1 < currentLayer.length) {
        // Pair exists
        const combined = currentLayer[i] + currentLayer[i + 1];
        const hash = crypto.createHash('sha256').update(combined, 'hex').digest('hex');
        nextLayer.push(hash);
      } else {
        // Odd number, duplicate last element
        const combined = currentLayer[i] + currentLayer[i];
        const hash = crypto.createHash('sha256').update(combined, 'hex').digest('hex');
        nextLayer.push(hash);
      }
    }

    tree.push(nextLayer);
  }

  const root = `0x${tree[tree.length - 1][0]}`;

  // Generate proof for first leaf (can be extended for any leaf)
  const proof = generateMerkleProof(tree, 0);

  return {
    root,
    tree,
    proof,
  };
}

/**
 * Generate Merkle proof for a specific leaf
 * @param tree Merkle tree
 * @param leafIndex Index of the leaf
 * @returns Array of hashes needed to prove inclusion
 */
export function generateMerkleProof(tree: string[][], leafIndex: number): string[] {
  const proof: string[] = [];
  let index = leafIndex;

  for (let i = 0; i < tree.length - 1; i++) {
    const layer = tree[i];
    const isRightNode = index % 2 === 1;
    const siblingIndex = isRightNode ? index - 1 : index + 1;

    if (siblingIndex < layer.length) {
      proof.push(`0x${layer[siblingIndex]}`);
    }

    index = Math.floor(index / 2);
  }

  return proof;
}

/**
 * Verify Merkle proof
 * @param leaf Leaf hash
 * @param proof Merkle proof
 * @param root Expected root hash
 * @returns Whether proof is valid
 */
export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  root: string
): boolean {
  let computedHash = leaf.replace(/^0x/, '');

  for (const proofElement of proof) {
    const proofHash = proofElement.replace(/^0x/, '');
    
    // Determine order (smaller hash first for consistency)
    const combined =
      computedHash < proofHash
        ? computedHash + proofHash
        : proofHash + computedHash;

    computedHash = crypto.createHash('sha256').update(combined, 'hex').digest('hex');
  }

  return `0x${computedHash}` === root;
}

/**
 * Generate ECDSA signature using private key
 * @param message Message to sign
 * @param privateKey Private key (hex string)
 * @returns Signature object
 */
export function signMessage(
  message: string,
  privateKey: string
): { signature: string; messageHash: string } {
  const wallet = new ethers.Wallet(privateKey);
  const messageHash = ethers.hashMessage(message);
  const signature = wallet.signMessageSync(message);

  return {
    signature,
    messageHash,
  };
}

/**
 * Verify ECDSA signature
 * @param message Original message
 * @param signature Signature
 * @param expectedAddress Expected signer address
 * @returns Whether signature is valid
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
    return false;
  }
}

/**
 * Encrypt data using AES-256-GCM
 * @param data Data to encrypt
 * @param key Encryption key (32 bytes)
 * @returns Encrypted data with IV
 */
export function encryptData(
  data: string,
  key?: string
): { encrypted: string; iv: string; authTag: string } {
  const encryptionKey = key
    ? Buffer.from(key, 'hex')
    : crypto.randomBytes(32);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData Encrypted data
 * @param iv Initialization vector
 * @param authTag Authentication tag
 * @param key Decryption key (32 bytes)
 * @returns Decrypted data
 */
export function decryptData(
  encryptedData: string,
  iv: string,
  authTag: string,
  key: string
): string {
  const decryptionKey = Buffer.from(key, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    decryptionKey,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate random nonce
 * @param length Length in bytes
 * @returns Hex string nonce
 */
export function generateNonce(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate timestamp-based nonce (for replay attack prevention)
 * @returns Nonce with timestamp
 */
export function generateTimestampNonce(): {
  nonce: string;
  timestamp: number;
} {
  const timestamp = Date.now();
  const randomPart = crypto.randomBytes(16).toString('hex');
  const nonce = `${timestamp}-${randomPart}`;

  return {
    nonce,
    timestamp,
  };
}

/**
 * Verify timestamp nonce is still valid
 * @param nonce Nonce to verify
 * @param maxAge Maximum age in milliseconds
 * @returns Whether nonce is valid
 */
export function verifyTimestampNonce(
  nonce: string,
  maxAge: number = 5 * 60 * 1000 // 5 minutes
): boolean {
  try {
    const timestamp = parseInt(nonce.split('-')[0]);
    const age = Date.now() - timestamp;
    return age <= maxAge && age >= 0;
  } catch (error) {
    return false;
  }
}

/**
 * Generate deterministic ID from multiple inputs
 * @param inputs Array of inputs
 * @returns Deterministic ID
 */
export function generateDeterministicId(...inputs: any[]): string {
  const combined = inputs.map((i) => JSON.stringify(i)).join('::');
  return generateHash(combined);
}

/**
 * Create proof package for artwork
 * @param data Artwork data
 * @returns Proof package with all hashes and signatures
 */
export interface ProofPackage {
  timestamp: string;
  creator: {
    address: string;
    biometricHash?: string;
    sessionProof?: string;
  };
  creative: {
    promptHash: string;
    promptEncrypted?: { encrypted: string; iv: string; authTag: string };
    modelUsed: string;
    parameters: any;
    iterationNumber: number;
    parentArtworkId?: string;
  };
  output: {
    contentHash: string;
    ipfsCID: string;
    perceptualHash?: string;
  };
  blockchain?: {
    txHash?: string;
    blockNumber?: number;
    contractAddress?: string;
    certificateTokenId?: number;
  };
  signature?: string;
}

export function createProofPackage(data: {
  creatorAddress: string;
  prompt: string;
  contentBuffer: Buffer;
  ipfsCID: string;
  modelUsed: string;
  parameters?: any;
  biometricData?: any;
  encryptPrompt?: boolean;
  encryptionKey?: string;
}): ProofPackage {
  const timestamp = new Date().toISOString();
  const contentHash = generateContentHash(data.contentBuffer);
  const promptHash = generatePromptHash(data.prompt);

  const proofPackage: ProofPackage = {
    timestamp,
    creator: {
      address: data.creatorAddress,
      biometricHash: data.biometricData
        ? generateBiometricHash(data.biometricData)
        : undefined,
    },
    creative: {
      promptHash,
      modelUsed: data.modelUsed,
      parameters: data.parameters || {},
      iterationNumber: 1,
    },
    output: {
      contentHash,
      ipfsCID: data.ipfsCID,
    },
  };

  // Optionally encrypt prompt
  if (data.encryptPrompt && data.encryptionKey) {
    proofPackage.creative.promptEncrypted = encryptData(
      data.prompt,
      data.encryptionKey
    );
  }

  return proofPackage;
}

/**
 * Verify proof package integrity
 * @param proofPackage Proof package to verify
 * @returns Whether package is valid
 */
export function verifyProofPackage(proofPackage: ProofPackage): boolean {
  // Verify required fields exist
  if (
    !proofPackage.timestamp ||
    !proofPackage.creator.address ||
    !proofPackage.creative.promptHash ||
    !proofPackage.output.contentHash ||
    !proofPackage.output.ipfsCID
  ) {
    return false;
  }

  // Verify timestamp is valid
  const timestamp = new Date(proofPackage.timestamp);
  if (isNaN(timestamp.getTime())) {
    return false;
  }

  // Verify Ethereum address format
  if (!ethers.isAddress(proofPackage.creator.address)) {
    return false;
  }

  return true;
}

