'use client';

import { useReadContract, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { useEffect } from 'react';

const PROOF_OF_ART_ABI = parseAbi([
  'function getCreatorArtworks(address _creator) external view returns (bytes32[])',
  'function getCertificateContract() external view returns (address)',
]);

interface Artwork {
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

export function useArtworks() {
  const { address } = useAccount();
  const contractAddress = getContractAddress();

  // Get content hashes for user's artworks
  // Note: Use address as-is (don't lowercase) since contract stores it as registered
  const { data: contentHashes, isLoading: isLoadingHashes, refetch: refetchHashes, error: readError } = useReadContract({
    address: contractAddress,
    abi: PROOF_OF_ART_ABI,
    functionName: 'getCreatorArtworks',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
      refetchInterval: 3000, // Refetch every 3 seconds to catch new registrations
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  });

  // Get certificate contract address
  const { data: certificateAddress } = useReadContract({
    address: contractAddress,
    abi: PROOF_OF_ART_ABI,
    functionName: 'getCertificateContract',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Convert bytes32[] to string[]
  const convertHashes = (hashes: any): string[] => {
    if (!hashes) {
      return [];
    }
    
    // Handle different return formats from wagmi
    if (Array.isArray(hashes)) {
      return hashes.map((hash) => {
        if (typeof hash === 'string') {
          // Already a string, ensure it has 0x prefix and is lowercase
          const normalized = hash.startsWith('0x') ? hash : `0x${hash}`;
          return normalized.toLowerCase();
        }
        // Convert BigInt to hex string
        if (typeof hash === 'bigint') {
          const hex = hash.toString(16);
          return `0x${hex.padStart(64, '0')}`.toLowerCase();
        }
        // Convert number to hex string
        if (typeof hash === 'number') {
          return `0x${hash.toString(16).padStart(64, '0')}`.toLowerCase();
        }
        // Try to convert to string
        const str = String(hash);
        return str.startsWith('0x') ? str.toLowerCase() : `0x${str}`.toLowerCase();
      }).filter((hash) => hash && hash !== '0x0000000000000000000000000000000000000000000000000000000000000000');
    }
    
    return [];
  };

  // Expose refetch function for manual refresh
  useEffect(() => {
    // Refetch when address or contract changes
    if (address && contractAddress) {
      refetchHashes();
    }
  }, [address, contractAddress, refetchHashes]);

  // Debug logging
  useEffect(() => {
    if (readError) {
      console.error('❌ Error reading artworks:', readError);
    }
    if (contentHashes !== undefined) {
      console.log('📊 Raw contentHashes from contract:', contentHashes);
      console.log('📊 Type:', typeof contentHashes, Array.isArray(contentHashes));
      console.log('📊 Address used:', address);
      console.log('📊 Contract address:', contractAddress);
    }
  }, [contentHashes, readError, address, contractAddress]);

  const convertedHashes = convertHashes(contentHashes);

  return {
    artworks: [], // Keep for future expansion
    contentHashes: convertedHashes,
    certificateAddress: certificateAddress as string | undefined,
    loading: isLoadingHashes,
    contractAddress,
    hasContract: !!contractAddress,
    refetch: refetchHashes, // Expose refetch function
  };
}

