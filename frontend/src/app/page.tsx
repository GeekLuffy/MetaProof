'use client';

import { AuthButton } from '@/components/AuthButton';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isConnected } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-white">
                Proof-of-Art
              </Link>
            </div>
            <div className="flex items-center">
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Blockchain-Verified AI Art
            <br />
            <span className="text-blue-400">Provenance System</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Establish immutable proof of authorship for AI-generated content.
            Secure, verifiable, and transparent creative provenance on the blockchain.
          </p>

          {!isAuthenticated && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-300 text-sm">
              {!isConnected ? (
                <>
                  <span>Connect your wallet to get started</span>
                </>
              ) : (
                <>
                  <span>Sign the authentication message to continue</span>
                </>
              )}
            </div>
          )}

          {isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              <FeatureCard
                title="Create"
                description="Generate AI art with blockchain-verified prompts"
                link="/create"
                icon="Create"
              />
              <FeatureCard
                title="Verify"
                description="Check artwork authenticity on the blockchain"
                link="/verify"
              />
              <FeatureCard
                title="Dashboard"
                description="Manage your verified art collection"
                link="/dashboard"
              />
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard title="Total Artworks" value="0" />
            <StatCard title="Verified Creators" value="0" />
            <StatCard title="Verifications" value="0" />
            <StatCard title="Blockchain Proofs" value="0" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StepCard
              number={1}
              title="Connect Wallet"
              description="Authenticate using your Web3 wallet"
            />
            <StepCard
              number={2}
              title="Create Art"
              description="Generate AI art with your prompt"
            />
            <StepCard
              number={3}
              title="Get Certificate"
              description="Receive blockchain-verified NFT certificate"
            />
            <StepCard
              number={4}
              title="Verify"
              description="Anyone can verify authenticity on-chain"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          <p>© 2025 Proof-of-Art. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, link, icon }: { title: string; description: string; link: string; icon?: string }) {
  return (
    <Link
      href={link}
      className="block p-6 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-200"
    >
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="text-center p-6 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

