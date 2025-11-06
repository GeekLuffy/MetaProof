'use client';

import { useState, useRef, useEffect } from 'react';
import { useVerifyArtwork, useComputeHash } from '@/hooks/useVerifyArtwork';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function VerifyPage() {
  const [inputMethod, setInputMethod] = useState<'hash' | 'file'>('hash');
  const [contentHash, setContentHash] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dbArtwork, setDbArtwork] = useState<any>(null);
  const [checkingDb, setCheckingDb] = useState(false);
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
  const { exists, verificationCount, isLoading, hasContract, contractAddress } = useVerifyArtwork(
    inputMethod === 'hash' ? contentHash : computedHash || undefined
  );

  const displayHash = inputMethod === 'hash' ? contentHash : computedHash;

  // Check database when hash changes
  useEffect(() => {
    const checkDatabase = async () => {
      if (!displayHash || displayHash.length !== 64) {
        setDbArtwork(null);
        return;
      }

      setCheckingDb(true);
      try {
        // Add 0x prefix if not present
        const hashToCheck = displayHash.startsWith('0x') ? displayHash : `0x${displayHash}`;
        const response = await api.artwork.getByHash(hashToCheck);
        setDbArtwork(response.data.artwork);
        console.log('✅ Found in database:', response.data.artwork);
      } catch (error: any) {
        console.log('ℹ️ Not found in database:', error.response?.status);
        setDbArtwork(null);
      } finally {
        setCheckingDb(false);
      }
    };

    checkDatabase();
  }, [displayHash]);

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
    setDbArtwork(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isValid = displayHash && displayHash.length === 64;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-semibold text-white">
              Proof-of-Art
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/create" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Create
              </Link>
              <Link 
                href="/verify" 
                className="text-white font-medium"
              >
                Verify
              </Link>
              <Link 
                href="/dashboard" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Verify Artwork</h1>
          <p className="text-slate-400">Check if artwork is registered on the blockchain</p>
        </div>

        {/* Contract Status Warning */}
        {!hasContract && (
          <div className="mb-8 p-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-yellow-500 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                  Contract Not Deployed
                </h3>
                <p className="text-yellow-200/80 mb-4">
                  The Proof-of-Art contract needs to be deployed before you can verify artworks.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block text-sm text-yellow-400 hover:underline"
                >
                  View deployment instructions →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Input Method Selection */}
        <div className="mb-6">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setInputMethod('hash');
                resetForm();
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                inputMethod === 'hash'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Verify by Hash
            </button>
            <button
              onClick={() => {
                setInputMethod('file');
                resetForm();
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                inputMethod === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Verify by File
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-lg">
          {inputMethod === 'hash' ? (
            <div>
              <label htmlFor="contentHash" className="block text-sm font-medium text-white mb-2">
                Content Hash (SHA-256)
              </label>
              <input
                id="contentHash"
                type="text"
                value={contentHash}
                onChange={(e) => setContentHash(e.target.value.trim())}
                placeholder="0x1eb58845823efe86b6a9f30b1fc22dcf43a96b1bac8a0433fd3e9780d498709d"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                disabled={!hasContract}
              />
              <p className="mt-2 text-sm text-slate-400">
                Enter the SHA-256 hash of the artwork (with or without 0x prefix)
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Upload Artwork File
              </label>
              <div className="flex flex-col items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700/50 transition-colors"
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
                        className="w-12 h-12 mb-4 text-slate-500"
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
                      <p className="mb-2 text-sm text-slate-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
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
                  <p className="text-sm text-slate-400">
                    Selected: <span className="text-white">{selectedFile.name}</span>
                  </p>
                  {computing && (
                    <p className="text-sm text-blue-400 mt-2">Computing hash...</p>
                  )}
                  {computedHash && (
                    <div className="mt-2">
                      <p className="text-sm text-slate-400">Computed Hash:</p>
                      <code className="text-xs text-blue-400 break-all">{computedHash}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug Information */}
        {isValid && (
          <div className="mb-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
            <details className="text-sm" open>
              <summary className="text-slate-400 cursor-pointer hover:text-white mb-3">
                🔍 Debug Information
              </summary>
              <div className="mt-3 space-y-3 font-mono text-xs">
                <div className="pb-3 border-b border-slate-700">
                  <div className="text-slate-500 mb-2 font-semibold">Hash Information:</div>
                  <div className="ml-4 space-y-2">
                    <div>
                      <span className="text-slate-500">Hash Being Checked:</span>
                      <code className="ml-2 text-yellow-400 break-all">
                        {displayHash ? `0x${displayHash.replace(/^0x/, '')}` : 'None'}
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-500">Hash Length:</span>
                      <code className="ml-2 text-yellow-400">
                        {displayHash ? displayHash.replace(/^0x/, '').length : 0} chars (need 64)
                      </code>
                    </div>
                  </div>
                </div>
                {hasContract && (
                  <div className="pb-3 border-b border-slate-700">
                    <div className="text-slate-500 mb-2 font-semibold">Blockchain Status:</div>
                    <div className="ml-4 space-y-2">
                      <div>
                        <span className="text-slate-500">Contract Address:</span>
                        <code className="ml-2 text-yellow-400 break-all">{contractAddress}</code>
                      </div>
                      <div>
                        <span className="text-slate-500">Exists on Chain:</span>
                        <code className="ml-2 text-yellow-400">{exists ? '✅ true' : '❌ false'}</code>
                      </div>
                      <div>
                        <span className="text-slate-500">Loading:</span>
                        <code className="ml-2 text-yellow-400">{isLoading ? '⏳ true' : '✅ false'}</code>
                      </div>
                      {exists && (
                        <div>
                          <span className="text-slate-500">Verifications:</span>
                          <code className="ml-2 text-yellow-400">{verificationCount}</code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-slate-500 mb-2 font-semibold">Database Status:</div>
                  <div className="ml-4 space-y-2">
                    <div>
                      <span className="text-slate-500">Exists in DB:</span>
                      <code className="ml-2 text-yellow-400">
                        {checkingDb ? '⏳ checking...' : dbArtwork ? '✅ true' : '❌ false'}
                      </code>
                    </div>
                    {dbArtwork && (
                      <>
                        <div>
                          <span className="text-slate-500">Creator:</span>
                          <code className="ml-2 text-yellow-400 break-all">{dbArtwork.creatorAddress}</code>
                        </div>
                        <div>
                          <span className="text-slate-500">IPFS CID:</span>
                          <code className="ml-2 text-yellow-400">{dbArtwork.ipfsCID}</code>
                        </div>
                        <div>
                          <span className="text-slate-500">Model Used:</span>
                          <code className="ml-2 text-yellow-400">{dbArtwork.modelUsed}</code>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Verification Result */}
        {isValid && hasContract && (
          <div className="mb-8">
            {isLoading ? (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg text-center">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Verifying on blockchain...</p>
              </div>
            ) : exists ? (
              <div className="p-6 bg-green-900/20 border border-green-600/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-3xl">✓</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-green-400 mb-2">
                      Artwork Verified!
                    </h3>
                    <p className="text-green-200/80 mb-4">
                      This artwork is registered on the blockchain and its authenticity is verified.
                    </p>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-green-300 font-medium">Content Hash:</span>
                        <code className="ml-2 text-green-400 break-all">{displayHash}</code>
                      </div>
                      <div>
                        <span className="text-green-300 font-medium">Verification Count:</span>
                        <span className="ml-2 text-white">{verificationCount} verification(s)</span>
                      </div>
                      <div>
                        <span className="text-green-300 font-medium">Contract:</span>
                        <code className="ml-2 text-green-400 text-xs">{contractAddress}</code>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-600/30">
                      <a
                        href={`${process.env.NEXT_PUBLIC_YOUR_CHAIN_EXPLORER_URL || ''}/address/${contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-400 hover:underline"
                      >
                        View on Block Explorer →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : dbArtwork && !exists ? (
              <div className="p-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-500 text-3xl">⚠</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                      Partially Verified
                    </h3>
                    <p className="text-yellow-200/80 mb-4">
                      This artwork is registered in the database but NOT on the blockchain.
                    </p>
                    <div className="space-y-2 text-sm text-yellow-200/70 mb-4">
                      <p><strong>Possible reasons:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>The blockchain transaction failed or wasn't completed</li>
                        <li>You clicked "Register on Blockchain" but the transaction was rejected</li>
                        <li>The contract address is incorrect or not deployed</li>
                        <li>You're connected to a different network than where it was registered</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-yellow-900/30 rounded text-sm space-y-2">
                      <div>
                        <span className="text-yellow-300 font-medium">Creator:</span>
                        <code className="ml-2 text-yellow-200 text-xs break-all">{dbArtwork.creatorAddress}</code>
                      </div>
                      <div>
                        <span className="text-yellow-300 font-medium">IPFS CID:</span>
                        <code className="ml-2 text-yellow-200">{dbArtwork.ipfsCID}</code>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Link
                        href="/create"
                        className="inline-block text-sm px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                      >
                        Register on Blockchain →
                      </Link>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${dbArtwork.ipfsCID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                      >
                        View on IPFS
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-red-900/20 border border-red-600/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-red-500 text-3xl">✗</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-red-400 mb-2">
                      Not Verified
                    </h3>
                    <p className="text-red-200/80 mb-4">
                      This artwork is not registered on the blockchain or in the database.
                    </p>
                    <div className="space-y-2 text-sm text-red-200/70">
                      <p>This could mean:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>The artwork was never registered</li>
                        <li>The hash doesn't match (file may be modified)</li>
                        <li>It's registered on a different network</li>
                        <li>You're using the wrong hash</li>
                      </ul>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/create"
                        className="inline-block text-sm text-red-400 hover:underline"
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
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                1
              </div>
              <p>
                <strong className="text-white">Choose verification method:</strong> Enter the artwork's hash directly, or upload the file to compute it
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                2
              </div>
              <p>
                <strong className="text-white">Check blockchain:</strong> We query the smart contract to see if this artwork is registered
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                3
              </div>
              <p>
                <strong className="text-white">View results:</strong> See if the artwork is verified, who created it, and when it was registered
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

