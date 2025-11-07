'use client';

import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isAuthenticated, isConnected } = useAuth();
  const [stats, setStats] = useState({
    totalArtworks: 0,
    uniqueCreators: 0,
    totalVerifications: 0,
    blockchainProofs: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/stats`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.stats) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        // Silent error - use default values
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8">
              <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
              <span className="text-sm text-gray-300">Blockchain-Powered Creative Provenance</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight tracking-tight">
              Own Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
                AI Creativity
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              The first blockchain-verified creative provenance system for AI-generated art.
              <br />Create, authenticate, and protect your digital masterpieces forever.
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col items-center gap-6 animate-slide-up">
                <div className="inline-flex items-center gap-3 px-8 py-4 glass-card rounded-2xl border border-white/20">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-white font-medium">
                    {!isConnected ? 'Connect your wallet to get started' : 'Sign message to authenticate'}
                  </span>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-slide-up">
                <FeatureCard
                  title="Create Art"
                  description="Generate AI art with blockchain-verified prompts and instant certificates"
                  link="/create"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                />
                <FeatureCard
                  title="Verify"
                  description="Check artwork authenticity and ownership directly on the blockchain"
                  link="/verify"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <FeatureCard
                  title="Dashboard"
                  description="Manage your complete verified art collection in one place"
                  link="/dashboard"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard 
              title="Total Artworks" 
              value={loadingStats ? '...' : formatNumber(stats.totalArtworks)} 
            />
            <StatCard 
              title="Verified Creators" 
              value={loadingStats ? '...' : formatNumber(stats.uniqueCreators)} 
            />
            <StatCard 
              title="Total Verifications" 
              value={loadingStats ? '...' : formatNumber(stats.totalVerifications)} 
            />
            <StatCard 
              title="Blockchain Proofs" 
              value={loadingStats ? '...' : formatNumber(stats.blockchainProofs)} 
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">Simple, secure, and seamless</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StepCard
              number={1}
              title="Connect Wallet"
              description="Securely authenticate using your Web3 wallet with biometric verification"
            />
            <StepCard
              number={2}
              title="Create Art"
              description="Generate stunning AI art with your unique prompts and creative vision"
            />
            <StepCard
              number={3}
              title="Get Certificate"
              description="Receive an immutable blockchain-verified NFT certificate of authenticity"
            />
            <StepCard
              number={4}
              title="Verify & Share"
              description="Anyone can verify authenticity on-chain and prove your creative ownership"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard
              icon="🛡️"
              title="Secure & Immutable"
              description="Your creative work is permanently protected on the blockchain with cryptographic proof"
            />
            <BenefitCard
              icon="⚡"
              title="Instant Verification"
              description="Anyone can verify authenticity instantly without intermediaries or third parties"
            />
            <BenefitCard
              icon="🌐"
              title="Decentralized"
              description="No central authority controls your art. True ownership, forever."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <span className="text-white font-semibold">MetaProof</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 MetaProof. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, link, icon }: { 
  title: string; 
  description: string; 
  link: string; 
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={link}
      className="group block relative p-8 glass-card rounded-2xl border border-white/10 hover-lift glass-shine"
    >
      <div className="relative z-10">
        <div className="inline-flex p-3 rounded-xl glass-card border border-white/20 mb-6">
          <div className="text-white">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed mb-4">{description}</p>
        <div className="flex items-center text-gray-300 font-medium group-hover:gap-2 transition-all">
          <span>Get Started</span>
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="text-center p-8 glass-card rounded-2xl border border-white/10 hover-lift">
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-gray-400 font-medium">{title}</div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num === 0) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`.replace('.0', '');
  return `${(num / 1000000).toFixed(1)}M`.replace('.0', '');
}

function StepCard({ number, title, description }: { 
  number: number; 
  title: string; 
  description: string;
}) {
  return (
    <div className="relative p-8 glass-card rounded-2xl border border-white/10 hover-lift">
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl glass-card border border-white/20 flex items-center justify-center text-white font-bold text-xl shadow-glass">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 mt-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { 
  icon: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center p-8 glass-card rounded-2xl border border-white/10 hover-lift">
      <div className="text-5xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
