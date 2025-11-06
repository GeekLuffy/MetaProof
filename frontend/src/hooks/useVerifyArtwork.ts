'use client';

import { useReadContract } from 'wagmi';
import { parseAbi } from 'viem';
import { useState } from 'react';

const PROOF_OF_ART_ABI = parseAbi([
  'function contentExists(bytes32) external view returns (bool)',
  'function verifyOwnership(bytes32 _contentHash, address _address) external view returns (bool)',
  'function getVerificationCount(bytes32 _contentHash) external view returns (uint256)',
]);

interface ArtworkData {
  creator: string;
  contentHash: string;
  promptHash: string;
  ipfsCID: string;
  modelUsed: string;
  timestamp: bigint;
  certificateTokenId: bigint;
  verified: boolean;
  iterationNumber: bigint;
  parentArtworkHash: string;
}

const getContractAddress = (): `0x${string}` | undefined => {
  const address = process.env.NEXT_PUBLIC_PROOF_OF_ART_ADDRESS;
  if (!address || address.length !== 42) {
    return undefined;
  }
  return address as `0x${string}`;
};

export function useVerifyArtwork(contentHash?: string) {
  const contractAddress = getContractAddress();
  const [verificationData, setVerificationData] = useState<any>(null);

  // Format hash to bytes32
  const formatHash = (hash: string): `0x${string}` | undefined => {
    if (!hash) return undefined;
    const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
    if (cleanHash.length !== 64) {
      console.warn(`⚠️ Invalid hash length: ${cleanHash.length}, expected 64. Hash: ${hash}`);
      return undefined;
    }
    const formatted = `0x${cleanHash}` as `0x${string}`;
    console.log('🔍 Formatted hash for verification:', formatted);
    return formatted;
  };

  const formattedHash = formatHash(contentHash || '');

  // Check if content exists
  const { data: exists, isLoading: isCheckingExists, error: existsError } = useReadContract({
    address: contractAddress,
    abi: PROOF_OF_ART_ABI,
    functionName: 'contentExists',
    args: formattedHash ? [formattedHash] : undefined,
    query: {
      enabled: !!contractAddress && !!formattedHash,
    },
  });

  // Log the result
  if (formattedHash && !isCheckingExists) {
    console.log('✅ Verification check complete:', {
      hash: formattedHash,
      exists,
      error: existsError,
      contractAddress,
    });
  }

  // Get verification count
  const { data: verificationCount, isLoading: isLoadingCount } = useReadContract({
    address: contractAddress,
    abi: PROOF_OF_ART_ABI,
    functionName: 'getVerificationCount',
    args: formattedHash ? [formattedHash] : undefined,
    query: {
      enabled: !!contractAddress && !!formattedHash && !!exists,
    },
  });

  return {
    exists: exists as boolean | undefined,
    verificationCount: verificationCount ? Number(verificationCount) : 0,
    isLoading: isCheckingExists || isLoadingCount,
    hasContract: !!contractAddress,
    contractAddress,
  };
}

// Hook to compute hash from file
export function useComputeHash() {
  const [computing, setComputing] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const computeHash = async (file: File) => {
    setComputing(true);
    setError(null);
    setHash(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHash(hashHex);
      return hashHex;
    } catch (err: any) {
      console.error('Error computing hash:', err);
      setError(err.message || 'Failed to compute hash');
      return null;
    } finally {
      setComputing(false);
    }
  };

  return {
    computeHash,
    computing,
    hash,
    error,
    reset: () => {
      setHash(null);
      setError(null);
    },
  };
}

