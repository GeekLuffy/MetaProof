'use client';

import { AuthButton } from '@/components/AuthButton';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { isAuthenticated, isConnected, address } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">
                🎨 Proof-of-Art
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 animate-fade-in">
              Own Your Creativity
              <br />
              <span className="gradient-text">Prove Your Originality</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The world's first blockchain-verified creative provenance system for AI-generated art.
              Establish immutable proof of authorship with cryptographic security.
            </p>

            {!isAuthenticated ? (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-yellow-200 text-sm">
                  {!isConnected 
                    ? '👆 Connect your wallet to get started'
                    : '✍️ Sign the message to authenticate'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {/* Feature Cards */}
                <FeatureCard
                  icon="🎨"
                  title="Create"
                  description="Generate AI art with verified prompts"
                  link="/create"
                />
                <FeatureCard
                  icon="🔍"
                  title="Verify"
                  description="Check artwork authenticity on blockchain"
                  link="/verify"
                />
                <FeatureCard
                  icon="📊"
                  title="Dashboard"
                  description="View your verified art collection"
                  link="/dashboard"
                />
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Artworks" value="0" />
            <StatCard title="Verified Creators" value="0" />
            <StatCard title="Verifications" value="0" />
            <StatCard title="Blockchain Proofs" value="0" />
          </div>

          {/* How It Works */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StepCard
                number="1"
                title="Connect Wallet"
                description="Authenticate with your Web3 wallet"
              />
              <StepCard
                number="2"
                title="Create Art"
                description="Generate AI art with your prompt"
              />
              <StepCard
                number="3"
                title="Get Certificate"
                description="Receive blockchain-verified NFT certificate"
              />
              <StepCard
                number="4"
                title="Verify Anytime"
                description="Anyone can verify your artwork's authenticity"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description, link }: { icon: string; title: string; description: string; link: string }) {
  return (
    <a href={link} className="block">
      <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
    </a>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-gray-300 text-sm">{title}</div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
        {number}
      </div>
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
}

