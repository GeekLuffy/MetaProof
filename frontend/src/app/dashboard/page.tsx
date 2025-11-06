'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useArtworks } from '@/hooks/useArtworks';
import { useAccount } from 'wagmi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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
  const { contentHashes, certificateAddress, loading, contractAddress, hasContract } = useArtworks();
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
                href="/dashboard" 
                className="text-white font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-slate-400">View and manage your registered artworks</p>
        </div>

        {/* Contract Status */}
        {!hasContract && (
          <div className="mb-8 p-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-yellow-500 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                  Contract Not Deployed
                </h3>
                <p className="text-yellow-200/80 mb-4">
                  The Proof-of-Art contract needs to be deployed to Polygon Amoy testnet before you can register artworks on the blockchain.
                </p>
                <div className="space-y-2 text-sm text-yellow-200/70">
                  <p><strong>Steps to deploy:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Get test MATIC from <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Polygon Faucet</a></li>
                    <li>Run: <code className="bg-slate-950 px-2 py-1 rounded">cd contracts && npm run deploy:testnet</code></li>
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
        <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Account Info</h2>
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
          <div className="mb-8 p-6 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-400 text-2xl">ℹ️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  View Your NFT Certificates in MetaMask
                </h3>
                <p className="text-blue-200/80 mb-4">
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
                    <a
                      href={`https://amoy.polygonscan.com/address/${address}#tokentxnsErc721`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline"
                    >
                      View your NFTs on Amoy PolygonScan →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Artworks List */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">My Artworks</h2>
          
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
      </div>
    </div>
  );
}

