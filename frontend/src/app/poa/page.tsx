'use client';

import { Navigation } from '@/components/Navigation';
import { yourChainConfig, YOUR_CHAIN_ID, YOUR_CHAIN_ID_HEX } from '@/config/yourChain';
import { useState } from 'react';

export default function POAPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const networkName = yourChainConfig.name || 'MetaProof Network';
  const rpcUrl = yourChainConfig.rpcUrls.default.http[0] || 'https://p01--poa-chain--wdqd5crrcgfg.code.run/';
  const chainId = YOUR_CHAIN_ID || 31337;
  const chainIdHex = YOUR_CHAIN_ID_HEX || '0x7a69';
  const nativeCurrency = yourChainConfig.nativeCurrency;
  const explorerUrl = yourChainConfig.blockExplorers?.default?.url || '';

  const metaMaskConfig = {
    chainId: chainIdHex,
    chainName: networkName,
    rpcUrls: [rpcUrl],
    nativeCurrency: {
      name: nativeCurrency.name,
      symbol: nativeCurrency.symbol,
      decimals: nativeCurrency.decimals,
    },
    blockExplorerUrls: explorerUrl ? [explorerUrl] : [],
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center animate-fade-in mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300">EVM-Compatible Custom Blockchain</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Our Own
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400">
                Blockchain Network
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Built on Ethereum Virtual Machine (EVM) for seamless compatibility with Ethereum tools and smart contracts.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="p-8 glass-card rounded-2xl border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-4">What is Our Blockchain?</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                MetaProof operates on its own custom blockchain network built on the Ethereum Virtual Machine (EVM). 
                This means our network is fully compatible with Ethereum's ecosystem, tools, and smart contracts.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Just like Ethereum, our blockchain uses the same programming languages (Solidity), development tools, 
                and wallet interfaces. However, we've optimized it specifically for creative provenance and AI art verification.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-4">EVM Compatibility</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Our blockchain is 100% EVM-compatible, which means:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Works with all Ethereum development tools (Hardhat, Truffle, Remix)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Compatible with MetaMask, WalletConnect, and other Ethereum wallets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Uses Solidity smart contracts (same as Ethereum)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Supports all standard Ethereum JSON-RPC methods</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Key Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-3">Zero Gas Fees</h3>
              <p className="text-gray-400 leading-relaxed">
                Our custom blockchain eliminates gas fees entirely. Register artworks, verify authenticity, 
                and mint certificates without paying any transaction costs.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Fast Transactions</h3>
              <p className="text-gray-400 leading-relaxed">
                Optimized for speed with instant block confirmations. Your artwork registrations and 
                verifications are processed immediately.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-3">Dedicated Network</h3>
              <p className="text-gray-400 leading-relaxed">
                A purpose-built network focused on creative provenance. No competition for block space 
                or network congestion issues.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-white mb-3">Ethereum Compatible</h3>
              <p className="text-gray-400 leading-relaxed">
                Full compatibility with Ethereum means you can use familiar tools, wallets, and 
                development frameworks without learning anything new.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Immutable</h3>
              <p className="text-gray-400 leading-relaxed">
                All artwork registrations and verifications are permanently recorded on-chain with 
                cryptographic proof, just like Ethereum.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-white mb-3">Purpose-Built</h3>
              <p className="text-gray-400 leading-relaxed">
                Designed specifically for AI art and creative content. Optimized smart contracts 
                and features tailored for provenance tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MetaMask Setup Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 glass-card rounded-2xl border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">Add Network to MetaMask</h2>
            <p className="text-gray-300 mb-8">
              Follow these steps to manually add our blockchain network to your MetaMask wallet:
            </p>

            <div className="space-y-6 mb-8">
              <div className="p-6 glass border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Open MetaMask</h3>
                    <p className="text-gray-300">
                      Click on the MetaMask extension icon in your browser and make sure you're logged in.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 glass border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Open Network Settings</h3>
                    <p className="text-gray-300 mb-2">
                      Click on the network dropdown (usually shows "Ethereum Mainnet" or another network) 
                      at the top of MetaMask.
                    </p>
                    <p className="text-gray-300">
                      Scroll down and click on <span className="text-white font-medium">"Add Network"</span> or 
                      <span className="text-white font-medium"> "Add a network manually"</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 glass border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-4">Enter Network Details</h3>
                    <p className="text-gray-300 mb-4">
                      Fill in the following information:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 glass border border-white/10 rounded-lg">
                        <span className="text-gray-400 text-sm">Network Name:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-white text-sm font-mono">{networkName}</code>
                          <button
                            onClick={() => copyToClipboard(networkName, 'name')}
                            className="px-2 py-1 text-xs glass border border-white/10 rounded hover:border-white/20 transition-colors"
                          >
                            {copied === 'name' ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 glass border border-white/10 rounded-lg">
                        <span className="text-gray-400 text-sm">RPC URL:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-white text-sm font-mono max-w-xs truncate">{rpcUrl}</code>
                          <button
                            onClick={() => copyToClipboard(rpcUrl, 'rpc')}
                            className="px-2 py-1 text-xs glass border border-white/10 rounded hover:border-white/20 transition-colors"
                          >
                            {copied === 'rpc' ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 glass border border-white/10 rounded-lg">
                        <span className="text-gray-400 text-sm">Chain ID:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-white text-sm font-mono">{chainId}</code>
                          <button
                            onClick={() => copyToClipboard(chainId.toString(), 'chainId')}
                            className="px-2 py-1 text-xs glass border border-white/10 rounded hover:border-white/20 transition-colors"
                          >
                            {copied === 'chainId' ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 glass border border-white/10 rounded-lg">
                        <span className="text-gray-400 text-sm">Currency Symbol:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-white text-sm font-mono">{nativeCurrency.symbol}</code>
                          <button
                            onClick={() => copyToClipboard(nativeCurrency.symbol, 'symbol')}
                            className="px-2 py-1 text-xs glass border border-white/10 rounded hover:border-white/20 transition-colors"
                          >
                            {copied === 'symbol' ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      {explorerUrl && (
                        <div className="flex items-center justify-between p-3 glass border border-white/10 rounded-lg">
                          <span className="text-gray-400 text-sm">Block Explorer URL:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-white text-sm font-mono max-w-xs truncate">{explorerUrl}</code>
                            <button
                              onClick={() => copyToClipboard(explorerUrl, 'explorer')}
                              className="px-2 py-1 text-xs glass border border-white/10 rounded hover:border-white/20 transition-colors"
                            >
                              {copied === 'explorer' ? '✓' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 glass border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Save and Switch</h3>
                    <p className="text-gray-300">
                      Click <span className="text-white font-medium">"Save"</span> to add the network. 
                      MetaMask will automatically switch to the new network, or you can select it from 
                      the network dropdown.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Add Button */}
            <div className="mt-8 p-6 glass border border-green-400/20 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Quick Add (Auto-Detect)</h3>
              <p className="text-gray-300 mb-4 text-sm">
                If your browser supports it, you can add the network automatically:
              </p>
              <button
                onClick={async () => {
                  if (typeof window !== 'undefined' && (window as any).ethereum) {
                    try {
                      await (window as any).ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [metaMaskConfig],
                      });
                    } catch (error: any) {
                      alert('Failed to add network: ' + (error.message || 'Unknown error'));
                    }
                  } else {
                    alert('MetaMask not detected. Please install MetaMask first.');
                  }
                }}
                className="w-full px-6 py-3 glass-card border border-green-400/30 hover:border-green-400/50 text-white font-medium rounded-xl transition-all hover-lift"
              >
                Add Network to MetaMask Automatically
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Network Details Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 glass-card rounded-2xl border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">Network Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 glass border border-white/10 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Technical Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chain ID:</span>
                    <code className="text-white font-mono">{chainId} ({chainIdHex})</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Name:</span>
                    <span className="text-white">{networkName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Native Currency:</span>
                    <span className="text-white">{nativeCurrency.name} ({nativeCurrency.symbol})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Decimals:</span>
                    <span className="text-white">{nativeCurrency.decimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">EVM Compatible:</span>
                    <span className="text-green-400">✓ Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gas Fees:</span>
                    <span className="text-green-400">Free (0 gwei)</span>
                  </div>
                </div>
              </div>

              <div className="p-6 glass border border-white/10 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Connection Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400 block mb-1">RPC Endpoint:</span>
                    <code className="text-white font-mono text-xs break-all">{rpcUrl}</code>
                  </div>
                  {explorerUrl && (
                    <div>
                      <span className="text-gray-400 block mb-1">Block Explorer:</span>
                      <a 
                        href={explorerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs break-all"
                      >
                        {explorerUrl}
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 block mb-1">Network Type:</span>
                    <span className="text-white">Testnet / Custom EVM Chain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="h-24"></div>
    </div>
  );
}

