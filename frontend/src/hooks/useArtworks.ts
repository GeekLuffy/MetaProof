'use client';

import { useReadContract, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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
  
  // Database state
  const [dbArtworks, setDbArtworks] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbError, setDbError] = useState<any>(null);

  // Get content hashes for user's artworks from blockchain (fallback)
  // Note: Use address as-is (don't lowercase) since contract stores it as registered
  const { data: contentHashes, isLoading: isLoadingHashes, refetch: refetchHashes, error: readError } = useReadContract({
    address: contractAddress,
    abi: PROOF_OF_ART_ABI,
    functionName: 'getCreatorArtworks',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
      refetchInterval: false, // Disabled auto-refresh
      refetchOnMount: true,
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: false, // Don't retry failed calls - it's expected if contract isn't deployed or no artworks
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

  // Fetch artworks from database (primary source)
  const fetchArtworksFromDb = async () => {
    if (!address) {
      setDbArtworks([]);
      return;
    }

    setIsLoadingDb(true);
    setDbError(null);
    
    try {
      const response = await api.artwork.getAll(address);
      if (response.data?.success && response.data?.artworks) {
        setDbArtworks(response.data.artworks);
        console.log('✅ Fetched artworks from database:', response.data.artworks.length);
      } else {
        setDbArtworks([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching artworks from database:', error);
      setDbError(error);
      // Don't clear artworks on error, keep existing ones
    } finally {
      setIsLoadingDb(false);
    }
  };

  // Fetch artworks on mount and when address changes
  useEffect(() => {
    if (!address) {
      setDbArtworks([]);
      return;
    }
    
    fetchArtworksFromDb();
    
    // No auto-refresh - user can manually refresh with the button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

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

  // Debug logging (suppress expected errors)
  useEffect(() => {
    // Only log errors if they're unexpected (not "no data" errors)
    if (readError) {
      const errorMessage = readError?.message || '';
      // Suppress common expected errors (contract not deployed, no data, etc.)
      if (!errorMessage.includes('returned no data') && 
          !errorMessage.includes('not a contract') &&
          !errorMessage.includes('does not have the function')) {
        console.error('❌ Unexpected error reading artworks:', readError);
      }
      // Silently handle expected errors - they're normal when contract isn't deployed or no artworks
    }
    // Only log successful reads in development
    if (contentHashes !== undefined && process.env.NODE_ENV === 'development') {
      console.log('📊 Raw contentHashes from contract:', contentHashes);
    }
  }, [contentHashes, readError, address, contractAddress]);

  const convertedHashes = convertHashes(contentHashes);

  // Merge database artworks with blockchain hashes
  // Prefer database as primary source, but also include blockchain hashes
  const dbContentHashes = dbArtworks.map(a => a.contentHash?.toLowerCase()).filter(Boolean);
  const allHashes = Array.from(new Set([...dbContentHashes, ...convertedHashes]));

  return {
    artworks: dbArtworks, // Full artwork objects from database
    contentHashes: allHashes.length > 0 ? allHashes : convertedHashes, // Use database first, fallback to blockchain
    certificateAddress: certificateAddress as string | undefined,
    loading: isLoadingDb || isLoadingHashes,
    contractAddress,
    hasContract: !!contractAddress,
    refetch: async () => {
      refetchHashes();
      await fetchArtworksFromDb();
    }, // Expose refetch function that updates both sources
  };
}

