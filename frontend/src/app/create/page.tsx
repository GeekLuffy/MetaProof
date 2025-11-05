'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { useIPFS } from '@/hooks/useIPFS';
import { useRegisterArtwork } from '@/hooks/useRegisterArtwork';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Model {
  id: string;
  name: string;
  provider: string;
  available: boolean;
  description?: string;
  features?: string[];
}

export default function CreatePage() {
  return (
    <ProtectedRoute>
      <CreateContent />
    </ProtectedRoute>
  );
}

function CreateContent() {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<string>('dall-e-3');
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { uploadFile } = useIPFS();
  const { registerArtwork, isPending: isRegistering, isConfirming, isConfirmed } = useRegisterArtwork();

  // Fetch available models on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        console.log('🔄 Fetching models from API...');
        const response = await api.artwork.getModels();
        console.log('📦 Received models:', response.data);
        const modelsList = response.data.models || [];
        console.log(`✅ Loaded ${modelsList.length} models:`, modelsList.map((m: Model) => `${m.name} (${m.provider}) - ${m.available ? 'Available' : 'Not configured'}`));
        
        setModels(modelsList);
        
        // Set default model to first available one
        const availableModel = modelsList.find((m: Model) => m.available);
        if (availableModel) {
          console.log(`🎯 Setting default model to: ${availableModel.name}`);
          setModel(availableModel.id);
        } else {
          console.warn('⚠️ No available models found, using first model');
          if (modelsList.length > 0) {
            setModel(modelsList[0].id);
          }
        }
      } catch (error: any) {
        console.error('❌ Error fetching models:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.error('Failed to load models');
        // Fallback to default models
        setModels([
          { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', available: true },
          { id: 'stability-ai', name: 'Stability AI', provider: 'Stability AI', available: true },
        ]);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    // Check authentication
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      toast.error('Please authenticate with your wallet first');
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const response = await api.artwork.generate({
        prompt: prompt.trim(),
        model,
        parameters: {
          size: '1024x1024',
          quality: 'standard',
        },
      });

      console.log('✅ Generation response received:', response.data);
      setResult(response.data);
      
      if (response.data.warning) {
        toast.success('Artwork generated! (Note: IPFS upload failed, using original URL)', { duration: 5000 });
      } else {
        toast.success('Artwork generated successfully!');
      }
    } catch (error: any) {
      console.error('❌ Generation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to generate artwork';
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Generation timed out. Please try again with a shorter prompt or different model.');
      }
      // Handle authentication errors
      else if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Authentication required. Please connect your wallet and sign in.');
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_address');
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setGenerating(false);
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
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Artwork</h1>
          <p className="text-slate-400">Generate AI art with blockchain-verified provenance</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Prompt Input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-white mb-2">
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the artwork you want to create..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={generating}
            />
            <p className="mt-2 text-sm text-slate-500">
              {prompt.length}/1000 characters
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-white mb-2">
              AI Model
            </label>
            {loadingModels ? (
              <div className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                Loading models...
              </div>
            ) : (
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                disabled={generating}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider}){!m.available ? ' - Not configured' : ''}
                  </option>
                ))}
              </select>
            )}
            {models.find((m) => m.id === model)?.description && (
              <p className="mt-2 text-sm text-slate-400">
                {models.find((m) => m.id === model)?.description}
              </p>
            )}
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={generating || !prompt.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </span>
            ) : (
              'Generate Artwork'
            )}
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div className="mt-8 p-6 bg-slate-900 border border-slate-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Generated Artwork</h2>
            
            <div className="mb-4">
              <img
                src={result.imageUrl}
                alt="Generated artwork"
                className="w-full rounded-lg border border-slate-800"
              />
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400">IPFS CID:</span>
                <code className="ml-2 text-blue-400">{result.ipfsCID}</code>
              </div>
              <div>
                <span className="text-slate-400">Content Hash:</span>
                <code className="ml-2 text-blue-400">{result.contentHash}</code>
              </div>
              <div>
                <span className="text-slate-400">Model:</span>
                <span className="ml-2 text-white">{result.model}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={async () => {
                  if (!result) {
                    toast.error('No artwork to register');
                    return;
                  }

                  if (!result.contentHash || !result.promptHash || !result.ipfsCID) {
                    toast.error('Missing required data for registration');
                    return;
                  }

                  try {
                    await registerArtwork({
                      contentHash: result.contentHash,
                      promptHash: result.promptHash,
                      ipfsCID: result.ipfsCID,
                      modelUsed: result.model,
                      metadataURI: result.metadataURI || `ipfs://${result.ipfsCID}`,
                    });
                  } catch (error: any) {
                    console.error('Registration error:', error);
                    toast.error(error.message || 'Failed to register artwork');
                  }
                }}
                disabled={isRegistering || isConfirming || !result || !result.contentHash}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {isRegistering || isConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isConfirming ? 'Confirming...' : 'Registering...'}
                  </span>
                ) : isConfirmed ? (
                  '✅ Registered'
                ) : (
                  'Register on Blockchain'
                )}
              </button>
              <a
                href={result.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
              >
                View on IPFS
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

