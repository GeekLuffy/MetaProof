'use client';

import { useReadContract, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { useState, useEffect } from 'react';

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
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  // Get content hashes for user's artworks
  const { data: contentHashes, isLoading: isLoadingHashes } = useReadContract({
    address: contractAddress,
    abi: PROOF_OF_ART_ABI,
    functionName: 'getCreatorArtworks',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
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

  useEffect(() => {
    async function fetchArtworks() {
      if (!contentHashes || !contractAddress || !address) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // This would ideally use multicall, but for simplicity we'll note it needs contract integration
        // For now, return empty array since we can't easily read multiple contracts in this hook
        setArtworks([]);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchArtworks();
  }, [contentHashes, contractAddress, address]);

  return {
    artworks,
    contentHashes: contentHashes as string[] | undefined,
    certificateAddress: certificateAddress as string | undefined,
    loading: loading || isLoadingHashes,
    contractAddress,
    hasContract: !!contractAddress,
  };
}

