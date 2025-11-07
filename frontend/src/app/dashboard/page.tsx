'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useArtworks } from '@/hooks/useArtworks';
import { useAccount } from 'wagmi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CertificateCard } from '@/components/CertificateCard';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { address } = useAccount();
  const { contentHashes, certificateAddress, loading, contractAddress, hasContract, refetch, artworks } = useArtworks();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const addNFTToMetaMask = async () => {
    if (!certificateAddress) {
      toast.error('Certificate contract not found');
      return;
    }

    try {
      // @ts-ignore - MetaMask types
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: certificateAddress,
            symbol: 'POA-CERT',
            // tokenId: You'd specify the specific token ID here
          },
        },
      });
      toast.success('NFT collection added to MetaMask!');
    } catch (error: any) {
      console.error('Error adding NFT to MetaMask:', error);
      toast.error(error.message || 'Failed to add NFT to MetaMask');
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl glass-card flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-xl" />
                <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Proof-of-Art</span>
            </Link>
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-8">
                <Link href="/create" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Create</Link>
                <Link href="/verify" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Verify</Link>
                <Link href="/dashboard" className="relative text-white text-sm font-medium">
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-white" />
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-3">My Dashboard</h1>
          <p className="text-gray-400">View and manage your registered artworks</p>
        </div>

        {/* Contract Status */}
        {!hasContract && (
          <div className="mb-8 p-8 glass-card border border-yellow-500/20 rounded-2xl animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="text-yellow-400 text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">
                  Contract Not Deployed
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  The Proof-of-Art contract needs to be deployed to your custom blockchain network before you can register artworks on the blockchain.
                </p>
                <div className="space-y-2 text-sm text-yellow-200/70">
                  <p><strong>Steps to deploy:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Ensure your custom blockchain node is running</li>
                    <li>Run: <code className="bg-slate-950 px-2 py-1 rounded">cd contracts && npm run deploy:custom</code></li>
                    <li>Copy the deployed contract address</li>
                    <li>Add to .env: <code className="bg-slate-950 px-2 py-1 rounded">NEXT_PUBLIC_PROOF_OF_ART_ADDRESS=0x...</code></li>
                    <li>Restart the dev server</li>
                  </ol>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/create" 
                    className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    View Setup Guide
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="mb-8 p-8 glass-card border border-white/10 rounded-2xl animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-6">Account Info</h2>
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-sm">Your Address:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-blue-400 text-sm">{address}</code>
                {address && (
                  <button
                    onClick={() => copyToClipboard(address, 'Address')}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedHash === address ? '✓ Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
            {contractAddress && (
              <div>
                <span className="text-slate-400 text-sm">Contract Address:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-blue-400 text-sm">{contractAddress}</code>
                  <button
                    onClick={() => copyToClipboard(contractAddress, 'Contract address')}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedHash === contractAddress ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
            {certificateAddress && (
              <div>
                <span className="text-slate-400 text-sm">Certificate Contract:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-blue-400 text-sm">{certificateAddress}</code>
                  <button
                    onClick={() => copyToClipboard(certificateAddress, 'Certificate address')}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedHash === certificateAddress ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NFT Import Instructions */}
        {hasContract && certificateAddress && (
          <div className="mb-8 p-8 glass-card border border-blue-400/20 rounded-2xl animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="text-blue-400 text-3xl">ℹ️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-400 mb-3">
                  View Your NFT Certificates in MetaMask
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Your NFT certificates are stored on the blockchain. To view them in MetaMask:
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-blue-300 mb-2">Option 1: Import via MetaMask</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-blue-200/70">
                      <li>Open MetaMask and go to NFTs tab</li>
                      <li>Click "Import NFT"</li>
                      <li>Enter contract address: <code className="bg-slate-950 px-1 py-0.5 rounded text-xs">{certificateAddress}</code></li>
                      <li>Enter your token ID (shown after registration)</li>
                    </ol>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-300 mb-2">Option 2: View on Block Explorer</p>
                    {process.env.NEXT_PUBLIC_YOUR_CHAIN_EXPLORER_URL ? (
                      <a
                        href={`${process.env.NEXT_PUBLIC_YOUR_CHAIN_EXPLORER_URL}/address/${address}#tokentxnsErc721`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline"
                      >
                        View your NFTs on Block Explorer →
                      </a>
                    ) : (
                      <p className="text-sm text-blue-200/70">Block explorer URL not configured</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Artworks List */}
        <div className="glass-card border border-white/10 rounded-2xl p-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Artworks</h2>
            {hasContract && (
              <button
                onClick={() => refetch()}
                disabled={loading}
                className="px-4 py-2 glass-card border border-white/20 hover-lift disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-all font-medium"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading artworks...</p>
            </div>
          ) : !hasContract ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">Deploy the contract first to see your artworks</p>
              <Link
                href="/create"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create Your First Artwork
              </Link>
            </div>
          ) : !contentHashes || contentHashes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">No artworks registered yet</p>
              <Link
                href="/create"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create Your First Artwork
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-300 mb-4">
                You have <strong>{contentHashes.length}</strong> registered artwork(s)
              </p>
              <div className="grid grid-cols-1 gap-4">
                {contentHashes.map((hash, index) => (
                  <div
                    key={hash}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-slate-400 mb-1">Artwork #{index + 1}</p>
                        <code className="text-xs text-blue-400">{hash}</code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(hash, 'Content hash')}
                        className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1 bg-slate-700 rounded"
                      >
                        {copiedHash === hash ? '✓' : 'Copy Hash'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Certificates Section */}
        {hasContract && (
          <div className="glass-card border border-white/10 rounded-2xl p-8 mt-8 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">My Certificates</h2>
              <span className="text-sm text-slate-400">
                {artworks.length} Certificate(s)
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Loading certificates...</p>
              </div>
            ) : !artworks || artworks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-2">No certificates yet</p>
                <p className="text-sm text-slate-500">Create and register your first artwork to get a certificate!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork: any, index: number) => (
                  <CertificateCard 
                    key={artwork.contentHash}
                    artwork={artwork}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

