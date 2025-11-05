// Shared TypeScript types for Proof-of-Art system

export interface Creator {
  walletAddress: string;
  biometricHash?: string;
  sessionProof?: string;
  name?: string;
  verifiedCreator: boolean;
}

export interface CreativeDetails {
  promptHash: string;
  promptEncrypted?: string;
  modelUsed: string;
  parameters?: Record<string, any>;
  iterationNumber: number;
  parentArtworkId?: string;
}

export interface OutputDetails {
  contentHash: string;
  ipfsCID: string;
  perceptualHash?: string;
  fileType: string;
  fileSize: number;
}

export interface BlockchainDetails {
  txHash: string;
  blockNumber: number;
  contractAddress: string;
  certificateTokenId: number;
  network: string;
}

export interface ProofPackage {
  timestamp: string;
  creator: Creator;
  creative: CreativeDetails;
  output: OutputDetails;
  blockchain?: BlockchainDetails;
  signature?: string;
}

export interface Artwork {
  id: string;
  proofPackage: ProofPackage;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationResult {
  verified: boolean;
  artwork?: Artwork;
  verificationScore: number;
  timesVerified: number;
  firstVerification?: string;
  message?: string;
}

export interface GenerateRequest {
  prompt: string;
  model: 'dall-e-3' | 'stability-ai' | 'midjourney';
  parameters?: {
    size?: string;
    quality?: string;
    style?: string;
    n?: number;
  };
  biometricData?: string;
}

export interface GenerateResponse {
  success: boolean;
  imageUrl?: string;
  ipfsCID?: string;
  proofPackage?: ProofPackage;
  certificateTokenId?: number;
  error?: string;
}

export interface UploadToIPFSRequest {
  file: Buffer | Blob;
  filename: string;
  metadata?: Record<string, any>;
}

export interface UploadToIPFSResponse {
  success: boolean;
  ipfsCID?: string;
  url?: string;
  error?: string;
}

export interface VerifyRequest {
  contentHash?: string;
  ipfsCID?: string;
  imageFile?: Buffer | Blob;
}

export interface DashboardStats {
  totalArtworks: number;
  uniqueCreators: number;
  verificationsPerformed: number;
  averageBlockConfirmationTime: string;
  ipfsRetrievalTime: string;
  gasOptimizationSavings: string;
  plagiarismDetections: number;
  zkProofsGenerated: number;
}

export interface Certificate {
  tokenId: number;
  owner: string;
  artwork: Artwork;
  mintedAt: string;
  metadataURI: string;
}

export enum ArtworkStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  DUPLICATE = 'duplicate',
}

export interface CreativeLineage {
  artworkId: string;
  parentId?: string;
  children: string[];
  iterationNumber: number;
  createdAt: string;
}

