'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { useEffect, useRef } from 'react';
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

  // Store registration params to save to database after confirmation
  const registrationParamsRef = useRef<RegisterArtworkParams | null>(null);

  const registerArtwork = async (params: RegisterArtworkParams) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Save params for later database save
    registrationParamsRef.current = params;

    try {
      const contractAddress = getContractAddress();

      // Ensure proper bytes32 length (64 hex chars + 0x = 66 chars)
      const formatBytes32 = (hash: string): `0x${string}` => {
        const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
        
        // Check for valid length
        if (cleanHash.length !== 64) {
          console.warn(`⚠️ Invalid hash length: ${cleanHash.length}, expected 64. Hash: ${hash}`);
          
          // If it's 65 chars and starts with '0', remove the leading zero
          if (cleanHash.length === 65 && cleanHash.startsWith('0')) {
            console.log(`🔧 Fixing hash by removing leading zero`);
            return `0x${cleanHash.slice(1)}` as `0x${string}`;
          }
          
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
      console.log('🔑 IMPORTANT: Save this content hash for verification:', formattedContentHash);

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
        // EIP-1559: Zero gas fees (free transactions)
        maxFeePerGas: 0n, // Maximum total fee per gas
        maxPriorityFeePerGas: 0n, // Priority fee per gas
      });

      toast.loading('Waiting for wallet approval...', { id: 'register-tx' });
    } catch (err: any) {
      console.error('❌ Error registering artwork:', err);
      
      // Specific error messages
      if (err.message?.includes('NEXT_PUBLIC_PROOF_OF_ART_ADDRESS not configured')) {
        toast.error('⚠️ Contract not deployed. Please deploy the smart contract first.', { id: 'register-tx' });
      } else if (err.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user', { id: 'register-tx' });
      } else if (err.message?.includes('Invalid contract address')) {
        toast.error('⚠️ Invalid contract address. Check your configuration.', { id: 'register-tx' });
      } else {
        toast.error(err.message || 'Failed to register artwork', { id: 'register-tx' });
      }
    }
  };

  // Handle transaction states and save to database after blockchain confirmation
  useEffect(() => {
    if (error) {
      console.error('❌ Transaction error:', error);
      const errorMsg = error.message || 'Transaction failed';
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('User denied')) {
        toast.error('❌ Transaction rejected by user', { id: 'register-tx' });
      } else if (errorMsg.includes('insufficient funds')) {
        toast.error('❌ Insufficient funds for gas', { id: 'register-tx' });
      } else if (errorMsg.includes('nonce')) {
        toast.error('❌ Transaction nonce error. Please try again.', { id: 'register-tx' });
      } else {
        toast.error(`❌ Transaction failed: ${errorMsg}`, { id: 'register-tx', duration: 5000 });
      }
      registrationParamsRef.current = null;
    }
  }, [error]);

  // Track when transaction is submitted
  useEffect(() => {
    if (isPending) {
      console.log('⏳ Transaction pending - waiting for user approval...');
      toast.loading('⏳ Waiting for wallet approval...', { id: 'register-tx' });
    }
  }, [isPending]);

  // Track when transaction is submitted to blockchain
  useEffect(() => {
    if (hash && !isConfirmed && !error) {
      console.log('📤 Transaction submitted:', hash);
      toast.loading(`📤 Transaction submitted! Confirming...`, { id: 'register-tx' });
    }
  }, [hash, isConfirmed, error]);

  // Track when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash && registrationParamsRef.current) {
      console.log('✅ Transaction confirmed:', hash);
      console.log('✅ Artwork registered on blockchain with hash:', registrationParamsRef.current.contentHash);
      toast.success('✅ Artwork successfully registered on blockchain! 🎉', { 
        id: 'register-tx',
        duration: 5000 
      });
      registrationParamsRef.current = null;
    }
  }, [isConfirmed, hash]);

  // Track confirmation progress
  useEffect(() => {
    if (isConfirming) {
      console.log('⏳ Waiting for transaction confirmation...');
    }
  }, [isConfirming]);

  return {
    registerArtwork,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  };
}

