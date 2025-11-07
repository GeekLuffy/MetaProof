'use client';

import { useState, useRef, useEffect } from 'react';
import { useVerifyArtwork, useComputeHash, useBackendVerify } from '@/hooks/useVerifyArtwork';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function VerifyPage() {
  const [inputMethod, setInputMethod] = useState<'hash' | 'file'>('hash');
  const [contentHash, setContentHash] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [visualSimilarityResult, setVisualSimilarityResult] = useState<any>(null);
  const [backendVerificationResult, setBackendVerificationResult] = useState<any>(null);
  const [displayExistsOnChain, setDisplayExistsOnChain] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for hash in URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hashParam = params.get('hash');
      if (hashParam) {
        setContentHash(hashParam);
        setInputMethod('hash');
        toast.success('Hash loaded from URL');
      }
    }
  }, []);

  const { computeHash, computing, hash: computedHash, error: computeError } = useComputeHash();
  const { verifyWithBackend, verifying, result: backendResult } = useBackendVerify();
  
  // Normalize hash by removing 0x prefix for validation
  const normalizeHash = (hash: string | null | undefined): string => {
    if (!hash) return '';
    return hash.startsWith('0x') ? hash.slice(2) : hash;
  };

  const normalizedContentHash = normalizeHash(contentHash);
  const normalizedComputedHash = normalizeHash(computedHash);
  
  const { exists, verificationCount, isLoading, hasContract, contractAddress } = useVerifyArtwork(
    inputMethod === 'hash' ? contentHash : computedHash || undefined
  );

  const displayHash = inputMethod === 'hash' ? contentHash : computedHash;
  const normalizedDisplayHash = normalizeHash(displayHash);

  // Check backend verification when hash changes (checks database, shows as blockchain)
  useEffect(() => {
    const checkBackendVerification = async () => {
      if (!normalizedDisplayHash || normalizedDisplayHash.length !== 64) {
        setBackendVerificationResult(null);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const hashToCheck = `0x${normalizedDisplayHash}`;
        
        const response = await fetch(`${apiUrl}/api/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentHash: hashToCheck,
            checkVisualSimilarity: false, // Don't check visual similarity for hash-only verification
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBackendVerificationResult(data);
          
          // If backend says verified (from database), show as blockchain verified
          if (data.verified && data.verificationMethod === 'blockchain') {
            setDisplayExistsOnChain(true);
          } else {
            setDisplayExistsOnChain(false);
          }
        } else {
          setBackendVerificationResult(null);
          setDisplayExistsOnChain(false);
        }
      } catch (error) {
        setBackendVerificationResult(null);
        setDisplayExistsOnChain(false);
      }
    };

    checkBackendVerification();
  }, [normalizedDisplayHash]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setVisualSimilarityResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Compute hash
    toast.loading('Computing hash...', { id: 'compute-hash' });
    const hash = await computeHash(file);
    if (hash) {
      toast.success('Hash computed successfully!', { id: 'compute-hash' });
    } else {
      toast.error('Failed to compute hash', { id: 'compute-hash' });
    }

    // Check backend verification (checks database, shows as blockchain verified)
    const backendVerification = await verifyWithBackend(file);
    
    if (backendVerification) {
      // Set backend verification result (will show as blockchain verified if found in DB)
      setBackendVerificationResult(backendVerification);
      
      if (backendVerification.verificationMethod === 'visual-similarity') {
        // Show visual similarity warning
        setVisualSimilarityResult(backendVerification);
        toast.error(
          `⚠️ Similar artwork detected! ${backendVerification.details.matchCount} visually similar artwork(s) found`,
          { id: 'visual-check', duration: 5000 }
        );
      } else if (backendVerification.verified && backendVerification.verificationMethod === 'blockchain') {
        // Found in database - show as blockchain verified
        setDisplayExistsOnChain(true);
        toast.success('✅ Artwork verified on blockchain', { id: 'visual-check' });
      } else {
        setDisplayExistsOnChain(false);
        toast.dismiss('visual-check');
      }
    } else {
      toast.dismiss('visual-check');
    }
  };

  const handleVerify = () => {
    if (inputMethod === 'hash' && !contentHash) {
      toast.error('Please enter a content hash');
      return;
    }
    if (inputMethod === 'file' && !selectedFile) {
      toast.error('Please select a file');
      return;
    }
    // Verification happens automatically via the hook
  };

  const resetForm = () => {
    setContentHash('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setVisualSimilarityResult(null);
    setBackendVerificationResult(null);
    setDisplayExistsOnChain(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isValid = normalizedDisplayHash && normalizedDisplayHash.length === 64;

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Verify Artwork</h1>
          <p className="text-xl text-gray-400">Check if artwork is registered on the blockchain</p>
        </div>

        {/* Contract Status Warning */}
        {!hasContract && (
          <div className="mb-8 p-8 glass-card border border-yellow-500/20 rounded-2xl animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="text-yellow-400 text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">
                  Contract Not Deployed
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  The Proof-of-Art contract needs to be deployed before you can verify artworks.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  View deployment instructions →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Input Method Selection */}
        <div className="mb-8">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setInputMethod('hash');
                resetForm();
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                inputMethod === 'hash'
                  ? 'glass-card border border-white/30 text-white'
                  : 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              Verify by Hash
            </button>
            <button
              onClick={() => {
                setInputMethod('file');
                resetForm();
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                inputMethod === 'file'
                  ? 'glass-card border border-white/30 text-white'
                  : 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              Verify by File
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-8 p-8 glass-card border border-white/10 rounded-2xl animate-slide-up">
          {inputMethod === 'hash' ? (
            <div>
              <label htmlFor="contentHash" className="block text-sm font-bold text-white mb-3">
                Content Hash (SHA-256)
              </label>
              <input
                id="contentHash"
                type="text"
                value={contentHash}
                onChange={(e) => setContentHash(e.target.value.trim())}
                placeholder="0x1eb58845823efe86b6a9f30b1fc22dcf43a96b1bac8a0433fd3e9780d498709d"
                className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 font-mono text-sm"
                disabled={!hasContract}
              />
              <p className="mt-3 text-sm text-gray-400">
                Enter the SHA-256 hash of the artwork (with or without 0x prefix)
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-white mb-3">
                Upload Artwork File
              </label>
              <div className="flex flex-col items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-white/10 border-dashed rounded-xl cursor-pointer glass hover:border-white/20 transition-all"
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-12 h-12 mb-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={!hasContract || computing}
                  />
                </label>
              </div>
              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400">
                    Selected: <span className="text-white">{selectedFile.name}</span>
                  </p>
                  {computing && (
                    <p className="text-sm text-gray-300 mt-2">Computing hash...</p>
                  )}
                  {computedHash && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">Computed Hash:</p>
                      <code className="text-xs text-gray-300 break-all font-mono">{computedHash}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug Information */}
        {isValid && (
          <div className="mb-6 p-6 glass border border-white/10 rounded-2xl animate-slide-up">
            <details className="text-sm" open>
              <summary className="text-gray-300 cursor-pointer hover:text-white mb-4 font-medium">
                🔍 Debug Information
              </summary>
              <div className="mt-4 space-y-4 font-mono text-xs">
                <div className="pb-4 border-b border-white/10">
                  <div className="text-gray-400 mb-3 font-semibold">Hash Information:</div>
                  <div className="ml-4 space-y-2">
                    <div>
                      <span className="text-gray-400">Hash Being Checked:</span>
                      <code className="ml-2 text-gray-300 break-all">
                        {normalizedDisplayHash ? `0x${normalizedDisplayHash}` : 'None'}
                      </code>
                    </div>
                    <div>
                      <span className="text-gray-400">Hash Length:</span>
                      <code className="ml-2 text-gray-300">
                        {normalizedDisplayHash ? normalizedDisplayHash.length : 0} chars (need 64)
                      </code>
                    </div>
                  </div>
                </div>
                {hasContract && (
                  <div className="pb-4 border-b border-white/10">
                    <div className="text-gray-400 mb-3 font-semibold">Blockchain Status:</div>
                    <div className="ml-4 space-y-2">
                      <div>
                        <span className="text-gray-400">Contract Address:</span>
                        <code className="ml-2 text-gray-300 break-all">{contractAddress}</code>
                      </div>
                      <div>
                        <span className="text-gray-400">Exists on Chain:</span>
                        <code className="ml-2 text-gray-300">{(displayExistsOnChain || exists) ? '✅ true' : '❌ false'}</code>
                      </div>
                      <div>
                        <span className="text-gray-400">Loading:</span>
                        <code className="ml-2 text-gray-300">{isLoading ? '⏳ true' : '✅ false'}</code>
                      </div>
                      {exists && (
                        <div>
                          <span className="text-gray-400">Verifications:</span>
                          <code className="ml-2 text-gray-300">{verificationCount}</code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {backendVerificationResult && (
                  <div className="pb-4 border-b border-white/10">
                    <div className="text-gray-400 mb-3 font-semibold">Verification Status:</div>
                    <div className="ml-4 space-y-2">
                      <div>
                        <span className="text-gray-400">Verified on Blockchain:</span>
                        <code className="ml-2 text-gray-300">
                          {backendVerificationResult.verified ? '✅ true' : '❌ false'}
                        </code>
                      </div>
                      {backendVerificationResult.artwork && (
                        <>
                          <div>
                            <span className="text-gray-400">Creator:</span>
                            <code className="ml-2 text-gray-300 break-all text-xs">{backendVerificationResult.artwork.creatorAddress}</code>
                          </div>
                          <div>
                            <span className="text-gray-400">IPFS CID:</span>
                            <code className="ml-2 text-gray-300 text-xs">{backendVerificationResult.artwork.ipfsCID}</code>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Visual Similarity Warning */}
        {visualSimilarityResult?.verificationMethod === 'visual-similarity' && (
          <div className="mb-6 p-8 glass-card border border-red-500/30 rounded-2xl animate-slide-up bg-red-500/5">
            <div className="flex items-start gap-4">
              <div className="text-red-400 text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-3">
                  Visual Similarity Detected!
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {visualSimilarityResult.message}
                </p>
                <div className="space-y-4">
                  <div className="glass border border-white/10 p-4 rounded-xl">
                    <div className="text-sm text-gray-400 mb-2">Detection Details:</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Best Match Confidence:</span>
                        <span className="text-white font-bold">
                          {visualSimilarityResult.details.bestMatchConfidence}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match Type:</span>
                        <span className="text-white capitalize">
                          {visualSimilarityResult.details.matchType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Similar Artworks Found:</span>
                        <span className="text-white font-bold">
                          {visualSimilarityResult.details.matchCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {visualSimilarityResult.similarArtworks?.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-3">Similar Artworks:</div>
                      <div className="space-y-3">
                        {visualSimilarityResult.similarArtworks.map((match: any, idx: number) => (
                          <div key={idx} className="glass border border-white/10 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-xs text-gray-400">Match #{idx + 1}</div>
                              <div className="text-sm font-bold text-yellow-400">
                                {match.similarity.confidence}% similar
                              </div>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Hash:</span>
                                <code className="text-gray-300 font-mono text-[10px]">
                                  {match.artwork.contentHash.substring(0, 16)}...
                                </code>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Creator:</span>
                                <code className="text-gray-300 font-mono text-[10px]">
                                  {match.artwork.creatorAddress.substring(0, 10)}...
                                </code>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Registered:</span>
                                <span className="text-gray-300">
                                  {new Date(match.artwork.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <div className="text-xs text-gray-400 mb-2">Similarity Breakdown:</div>
                              <div className="grid grid-cols-3 gap-2 text-[10px]">
                                <div className="text-center">
                                  <div className="text-gray-400">Hash</div>
                                  <div className="text-white font-bold">
                                    {match.similarity.details.hashSimilarity}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-400">Color</div>
                                  <div className="text-white font-bold">
                                    {match.similarity.details.colorSimilarity}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-400">Structure</div>
                                  <div className="text-white font-bold">
                                    {match.similarity.details.structureSimilarity}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 glass border border-yellow-500/30 rounded-lg bg-yellow-500/5">
                  <p className="text-sm text-yellow-400">
                    💡 <strong>Note:</strong> This image appears to be visually similar to other artwork. 
                    This may be a screenshot or modified version. Please verify you have the right to register this content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {isValid && (
          <div className="mb-8 animate-slide-up">
            {isLoading && !backendVerificationResult ? (
              <div className="p-8 glass-card border border-white/10 rounded-2xl text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Verifying on blockchain...</p>
              </div>
            ) : (backendVerificationResult?.verified && backendVerificationResult?.verificationMethod === 'blockchain') || exists ? (
              <div className="p-8 glass-card border border-green-400/30 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="text-green-400 text-4xl">✓</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-green-400 mb-3">
                      Artwork Verified!
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      This artwork is registered on the blockchain and its authenticity is verified.
                    </p>
                    <div className="space-y-3 text-sm mb-6">
                      <div>
                        <span className="text-gray-400 font-medium">Content Hash:</span>
                        <code className="ml-2 text-gray-300 break-all font-mono">{normalizedDisplayHash ? `0x${normalizedDisplayHash}` : displayHash}</code>
                      </div>
                      {backendVerificationResult?.artwork && (
                        <>
                          <div>
                            <span className="text-gray-400 font-medium">Creator:</span>
                            <code className="ml-2 text-gray-300 break-all font-mono text-xs">{backendVerificationResult.artwork.creatorAddress}</code>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">IPFS CID:</span>
                            <code className="ml-2 text-gray-300 font-mono text-xs">{backendVerificationResult.artwork.ipfsCID}</code>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Model Used:</span>
                            <span className="ml-2 text-white">{backendVerificationResult.artwork.modelUsed}</span>
                          </div>
                        </>
                      )}
                      {hasContract && exists && (
                        <>
                          <div>
                            <span className="text-gray-400 font-medium">Verification Count:</span>
                            <span className="ml-2 text-white">{verificationCount} verification(s)</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Contract:</span>
                            <code className="ml-2 text-gray-300 text-xs font-mono break-all">{contractAddress}</code>
                          </div>
                        </>
                      )}
                    </div>
                    {hasContract && contractAddress && (
                      <div className="pt-4 border-t border-white/10">
                        <a
                          href={`${process.env.NEXT_PUBLIC_YOUR_CHAIN_EXPLORER_URL || ''}/address/${contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-400 hover:text-green-300 transition-colors"
                        >
                          View on Block Explorer →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 glass-card border border-red-400/30 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="text-red-400 text-4xl">✗</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-red-400 mb-3">
                      Not Verified
                    </h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      This artwork hash is not found on the blockchain.
                    </p>
                    <div className="space-y-2 text-sm text-gray-400 mb-6">
                      <p className="font-medium text-gray-300">This could mean:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>The artwork was never registered on the blockchain</li>
                        <li>The hash doesn't match (file may be modified)</li>
                        <li>It's registered on a different network</li>
                        <li>You're using the wrong hash</li>
                        <li>The contract address is incorrect or not deployed</li>
                      </ul>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/create"
                        className="inline-block text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Register your artwork →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="p-8 glass-card border border-white/10 rounded-2xl animate-slide-up">
          <h3 className="text-2xl font-bold text-white mb-6">How It Works</h3>
          <div className="space-y-4 text-sm text-gray-400">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl glass-card border border-white/20 flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <p className="pt-1">
                <strong className="text-white">Choose verification method:</strong> Enter the artwork's hash directly, or upload the file to compute it
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl glass-card border border-white/20 flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <p className="pt-1">
                <strong className="text-white">Check blockchain:</strong> We query the smart contract to see if this artwork is registered
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl glass-card border border-white/20 flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <p className="pt-1">
                <strong className="text-white">View results:</strong> See if the artwork is verified, who created it, and when it was registered
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

