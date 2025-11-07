import { createProofPackage, ProofPackage, verifyProofPackage, generateContentHash } from '../utils/crypto';
import { MerkleTree } from '../utils/merkleTree';

/**
 * Proof generation and verification service
 */
export class ProofService {
  /**
   * Create a complete proof package for an artwork
   */
  async createArtworkProof(data: {
    creatorAddress: string;
    prompt: string;
    contentBuffer: Buffer;
    ipfsCID: string;
    modelUsed: string;
    parameters?: any;
    biometricData?: any;
    encryptPrompt?: boolean;
    encryptionKey?: string;
    parentArtworkId?: string;
    iterationNumber?: number;
  }): Promise<ProofPackage> {
    // Create base proof package
    const proofPackage = createProofPackage(data);

    // Add iteration info if provided
    if (data.iterationNumber) {
      proofPackage.creative.iterationNumber = data.iterationNumber;
    }

    if (data.parentArtworkId) {
      proofPackage.creative.parentArtworkId = data.parentArtworkId;
    }

    // Add biometric proof-of-human data if provided
    if (data.biometricData) {
      proofPackage.creator.biometricProof = {
        facialHash: data.biometricData.facialHash,
        signature: data.biometricData.signature,
        timestamp: data.biometricData.timestamp,
        verified: data.biometricData.verified || true,
        entropy: data.biometricData.entropy,
      };
    }

    // Verify the package is valid
    if (!verifyProofPackage(proofPackage)) {
      throw new Error('Generated proof package is invalid');
    }

    return proofPackage;
  }

  /**
   * Create batch proof using Merkle tree
   */
  createBatchProof(artworks: Array<{ contentHash: string }>): {
    root: string;
    tree: MerkleTree;
    proofs: Map<string, string[]>;
  } {
    const contentHashes = artworks.map((a) => a.contentHash);
    const tree = new MerkleTree(contentHashes);

    const proofs = new Map<string, string[]>();
    contentHashes.forEach((hash, index) => {
      proofs.set(hash, tree.getProof(index));
    });

    return {
      root: tree.getRoot(),
      tree,
      proofs,
    };
  }

  /**
   * Verify a single artwork proof
   */
  verifyArtworkProof(proofPackage: ProofPackage): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic structure validation
    if (!verifyProofPackage(proofPackage)) {
      errors.push('Invalid proof package structure');
    }

    // Timestamp validation
    const timestamp = new Date(proofPackage.timestamp);
    if (timestamp > new Date()) {
      errors.push('Timestamp is in the future');
    }

    // Content hash validation
    if (
      !proofPackage.output.contentHash ||
      !proofPackage.output.contentHash.startsWith('0x')
    ) {
      errors.push('Invalid content hash format');
    }

    // IPFS CID validation
    if (!proofPackage.output.ipfsCID || proofPackage.output.ipfsCID.length < 10) {
      errors.push('Invalid IPFS CID');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Verify batch proof
   */
  verifyBatchProof(
    contentHash: string,
    proof: string[],
    merkleRoot: string
  ): boolean {
    return MerkleTree.verify(contentHash, proof, merkleRoot);
  }

  /**
   * Generate certificate metadata
   */
  generateCertificateMetadata(proofPackage: ProofPackage): any {
    return {
      name: `Proof-of-Art Certificate #${Date.now()}`,
      description: 'Blockchain-verified certificate for AI-generated artwork',
      image: `ipfs://${proofPackage.output.ipfsCID}`,
      attributes: [
        {
          trait_type: 'Creator',
          value: proofPackage.creator.address,
        },
        {
          trait_type: 'Model',
          value: proofPackage.creative.modelUsed,
        },
        {
          trait_type: 'Created At',
          value: proofPackage.timestamp,
        },
        {
          trait_type: 'Content Hash',
          value: proofPackage.output.contentHash,
        },
        {
          trait_type: 'Prompt Hash',
          value: proofPackage.creative.promptHash,
        },
        {
          trait_type: 'Iteration',
          value: proofPackage.creative.iterationNumber.toString(),
        },
        {
          trait_type: 'Verified',
          value: 'true',
        },
      ],
      properties: {
        category: 'AI Art Certificate',
        verified: true,
        blockchain: process.env.YOUR_CHAIN_NAME || 'Proof-of-Art Network',
        ipfsCID: proofPackage.output.ipfsCID,
        proofPackage: proofPackage,
      },
    };
  }
}

export const proofService = new ProofService();

