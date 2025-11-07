'use client';

import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

export default function ExtensionPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center animate-fade-in mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm text-gray-300">Chrome Browser Extension</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              MetaProof
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400">
                Browser Extension
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Automatically track and verify AI-generated art across multiple platforms with cryptographic proof. 
              Works seamlessly in the background while you create.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 glass-card border border-blue-400/30 hover:border-blue-400/50 text-white font-medium rounded-xl transition-all hover-lift"
              >
                Install from Chrome Web Store
              </a>
              <Link
                href="#manual-install"
                className="px-8 py-4 glass border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all hover-lift"
              >
                Manual Installation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Platform Support</h3>
              <p className="text-gray-400 leading-relaxed">
                Automatically tracks art generation on ChatGPT, Midjourney, Google Gemini, Bing Image Creator, 
                Leonardo.ai, Stable Diffusion, and more.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-white mb-3">Cryptographic Verification</h3>
              <p className="text-gray-400 leading-relaxed">
                Creates SHA-256 content hashes, browser fingerprints, and timestamp verification for 
                immutable proof of creation.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Automatic Tracking</h3>
              <p className="text-gray-400 leading-relaxed">
                Works silently in the background. Captures prompts, images, and metadata automatically 
                without interrupting your workflow.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-bold text-white mb-3">IPFS Integration</h3>
              <p className="text-gray-400 leading-relaxed">
                Optional decentralized storage via Web3.Storage, NFT.Storage, or Pinata. Your proofs 
                are permanently stored on IPFS.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-white mb-3">Backend Integration</h3>
              <p className="text-gray-400 leading-relaxed">
                Seamlessly connects with MetaProof backend API. Register artworks, verify proofs, 
                and sync with your blockchain network.
              </p>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10 hover-lift">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-white mb-3">Easy Management</h3>
              <p className="text-gray-400 leading-relaxed">
                View all your proofs in the extension popup. Register, verify, and manage your 
                AI-generated artworks with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Use Our Extension?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 glass-card rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">🛡️ Protect Your Creativity</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Every AI-generated artwork you create is automatically tracked and cryptographically verified. 
                No more worrying about proving ownership or creation date.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Immutable proof of creation timestamp</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Cryptographic hash for authenticity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Browser fingerprinting for verification</span>
                </li>
              </ul>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">⚡ Zero Friction</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                The extension works completely in the background. No need to manually copy prompts, 
                download images, or fill out forms. Everything happens automatically.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>No interruption to your creative workflow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Automatic prompt and image capture</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>One-click registration and verification</span>
                </li>
              </ul>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">🌐 Universal Compatibility</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Works with all major AI art platforms. Whether you use ChatGPT, Midjourney, Gemini, 
                or any other platform, the extension has you covered.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Supports 10+ AI art platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Extensible to new platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Works with any Chrome-based browser</span>
                </li>
              </ul>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">🔒 Privacy & Security</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                All proofs are stored locally in your browser. You control what gets uploaded to IPFS 
                or sent to the backend. Your data stays private.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Local storage for all proofs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Optional IPFS upload</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>No data collection without consent</span>
                </li>
              </ul>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">📊 Complete History</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Never lose track of your creations. The extension maintains a complete history of all 
                your AI-generated artworks with full metadata.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Full prompt and image history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Model and platform information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Search and filter capabilities</span>
                </li>
              </ul>
            </div>

            <div className="p-8 glass-card rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">🚀 Blockchain Ready</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Directly register your artworks on the MetaProof blockchain network. Get instant 
                certificates and verifiable proof of ownership.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>One-click blockchain registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Zero gas fees on our network</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Instant certificate generation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Supported Platforms</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'ChatGPT / DALL-E', icon: '🤖' },
              { name: 'Midjourney', icon: '🎨' },
              { name: 'Google Gemini', icon: '💎' },
              { name: 'Bing Image Creator', icon: '🖼️' },
              { name: 'Leonardo.ai', icon: '🦁' },
              { name: 'Stable Diffusion', icon: '⚡' },
              { name: 'Craiyon', icon: '🎭' },
              { name: 'And More...', icon: '➕' },
            ].map((platform, index) => (
              <div
                key={index}
                className="p-6 glass-card rounded-xl border border-white/10 hover-lift text-center"
              >
                <div className="text-4xl mb-3">{platform.icon}</div>
                <div className="text-sm font-medium text-white">{platform.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="manual-install" className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 glass-card rounded-2xl border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">Installation Guide</h2>
            
            <div className="space-y-6">
              <div className="p-6 glass border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400 font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Open Chrome Extensions</h3>
                    <p className="text-gray-300">
                      Open Chrome and navigate to <code className="px-2 py-1 glass rounded text-sm">chrome://extensions/</code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 glass border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400 font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Enable Developer Mode</h3>
                    <p className="text-gray-300">
                      Toggle the <span className="text-white font-medium">"Developer mode"</span> switch in the top right corner of the extensions page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 glass border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400 font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Load Unpacked</h3>
                    <p className="text-gray-300 mb-2">
                      Click the <span className="text-white font-medium">"Load unpacked"</span> button.
                    </p>
                    <p className="text-gray-300">
                      Select the <code className="px-2 py-1 glass rounded text-sm">chrome-extension</code> folder from the MetaProof repository.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 glass border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400 font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Start Using</h3>
                    <p className="text-gray-300">
                      The extension icon will appear in your Chrome toolbar. Click it to view your proofs and manage settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 glass border border-blue-400/20 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Quick Start</h3>
              <p className="text-gray-300 mb-4">
                Once installed, visit any supported platform (like ChatGPT or Midjourney) and start creating art. 
                The extension will automatically track your creations in the background.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://chatgpt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 glass border border-white/10 hover:border-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Try with ChatGPT →
                </a>
                <a
                  href="https://www.bing.com/images/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 glass border border-white/10 hover:border-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Try with Bing →
                </a>
                <a
                  href="https://gemini.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 glass border border-white/10 hover:border-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Try with Gemini →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 glass-card rounded-2xl border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-400/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Install Extension</h3>
              <p className="text-gray-400 text-sm">
                Add the MetaProof extension to your Chrome browser in seconds
              </p>
            </div>

            <div className="p-6 glass-card rounded-2xl border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-400/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Create Art</h3>
              <p className="text-gray-400 text-sm">
                Use any supported AI platform to generate your artwork
              </p>
            </div>

            <div className="p-6 glass-card rounded-2xl border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-400/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Auto-Track</h3>
              <p className="text-gray-400 text-sm">
                Extension automatically captures prompt, image, and metadata
              </p>
            </div>

            <div className="p-6 glass-card rounded-2xl border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-400/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">4</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Register & Verify</h3>
              <p className="text-gray-400 text-sm">
                Register on blockchain and get your certificate instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 glass-card rounded-2xl border border-white/10">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Install the MetaProof extension and start protecting your AI-generated art today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 glass-card border border-blue-400/30 hover:border-blue-400/50 text-white font-medium rounded-xl transition-all hover-lift"
              >
                Install Extension
              </a>
              <Link
                href="/create"
                className="px-8 py-4 glass border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all hover-lift"
              >
                Or Create on Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="h-24"></div>
    </div>
  );
}

