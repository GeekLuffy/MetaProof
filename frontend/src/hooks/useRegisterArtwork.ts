'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import toast from 'react-hot-toast';

// ProofOfArt contract ABI - minimal for registerArtwork function
const PROOF_OF_ART_ABI = parseAbi([
  'function registerArtwork(bytes32 _contentHash, bytes32 _promptHash, string memory _ipfsCID, string memory _modelUsed, string memory _metadataURI) external returns (uint256)',
  'event ArtworkRegistered(bytes32 indexed contentHash, address indexed creator, string ipfsCID, uint256 certificateTokenId, uint256 timestamp)',
]);

// Get contract address from environment or use localhost default
const getContractAddress = (): `0x${string}` => {
  const address = process.env.NEXT_PUBLIC_PROOF_OF_ART_ADDRESS;
  if (!address) {
    // Default to localhost deployment if not set
    // User should set this in .env.local after deploying
    throw new Error('NEXT_PUBLIC_PROOF_OF_ART_ADDRESS not configured. Please deploy the contract and set the address in .env.local');
  }
  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error('Invalid contract address format');
  }
  return address as `0x${string}`;
};

interface RegisterArtworkParams {
  contentHash: string; // hex string (0x...)
  promptHash: string;  // hex string (0x...)
  ipfsCID: string;
  modelUsed: string;
  metadataURI: string;
}

export function useRegisterArtwork() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const registerArtwork = async (params: RegisterArtworkParams) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const contractAddress = getContractAddress();

      // Ensure proper bytes32 length (64 hex chars + 0x = 66 chars)
      const formatBytes32 = (hash: string): `0x${string}` => {
        const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
        if (cleanHash.length !== 64) {
          throw new Error(`Invalid hash length: ${cleanHash.length}. Expected 64 characters. Got: ${hash}`);
        }
        return `0x${cleanHash}` as `0x${string}`;
      };

      const formattedContentHash = formatBytes32(params.contentHash);
      const formattedPromptHash = formatBytes32(params.promptHash);

      console.log('📝 Registering artwork on blockchain...', {
        contractAddress,
        contentHash: formattedContentHash,
        promptHash: formattedPromptHash,
        ipfsCID: params.ipfsCID,
        modelUsed: params.modelUsed,
        metadataURI: params.metadataURI,
      });

      writeContract({
        address: contractAddress,
        abi: PROOF_OF_ART_ABI,
        functionName: 'registerArtwork',
        args: [
          formattedContentHash,
          formattedPromptHash,
          params.ipfsCID,
          params.modelUsed,
          params.metadataURI,
        ],
      });

      toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'register-tx' });
    } catch (err: any) {
      console.error('❌ Error registering artwork:', err);
      toast.error(err.message || 'Failed to register artwork on blockchain', { id: 'register-tx' });
    }
  };

  // Handle transaction states
  if (error) {
    toast.error(`Transaction failed: ${error.message}`, { id: 'register-tx' });
  }

  if (isConfirmed) {
    toast.success('Artwork successfully registered on blockchain! 🎉', { id: 'register-tx' });
  }

  return {
    registerArtwork,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  };
}

