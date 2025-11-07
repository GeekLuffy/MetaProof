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
      // If it's 65 chars and starts with '0', remove the leading zero
      if (cleanHash.length === 65 && cleanHash.startsWith('0')) {
        const fixed = `0x${cleanHash.slice(1)}` as `0x${string}`;
        return fixed;
      }
      
      return undefined;
    }
    
    const formatted = `0x${cleanHash}` as `0x${string}`;
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

// Hook for visual similarity search
export function useVisualSearch() {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const searchVisualSimilarity = async (file: File, threshold: number = 80) => {
    setSearching(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('threshold', threshold.toString());
      formData.append('limit', '10');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/artworks/search/visual`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to search for similar artworks');
      return null;
    } finally {
      setSearching(false);
    }
  };

  return {
    searchVisualSimilarity,
    searching,
    results,
    error,
    reset: () => {
      setResults(null);
      setError(null);
    },
  };
}

// Hook for backend verification with visual matching
export function useBackendVerify() {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyWithBackend = async (file: File, checkVisualSimilarity: boolean = true) => {
    // Visual similarity is enabled by default to detect screenshots and modifications
    setVerifying(true);
    setError(null);
    setResult(null);

    try {
      // Compute content hash
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // If visual similarity check is enabled, upload and get visual fingerprint
      let visualFingerprint = null;
      if (checkVisualSimilarity && file.type.startsWith('image/')) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          
          const uploadResponse = await fetch(`${apiUrl}/api/upload`, {
            method: 'POST',
            body: uploadFormData,
            headers: {
              // Add auth token if available
              ...(localStorage.getItem('token') && {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              }),
            },
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            visualFingerprint = uploadData.visualFingerprint?.visualFeatures;
          }
        } catch (uploadError) {
          // Silent error handling
        }
      }

      // Verify with backend
      const verifyResponse = await fetch(`${apiUrl}/api/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentHash,
          checkVisualSimilarity,
          visualFingerprint,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error(`Verification failed: ${verifyResponse.statusText}`);
      }

      const data = await verifyResponse.json();
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to verify artwork');
      return null;
    } finally {
      setVerifying(false);
    }
  };

  return {
    verifyWithBackend,
    verifying,
    result,
    error,
    reset: () => {
      setResult(null);
      setError(null);
    },
  };
}

