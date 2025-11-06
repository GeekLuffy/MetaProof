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
  const [generationProgress, setGenerationProgress] = useState('');
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { uploadFile } = useIPFS();
  const { registerArtwork, isPending: isRegistering, isConfirming, isConfirmed, hash: txHash, error: txError } = useRegisterArtwork();

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

  const handleUploadToIPFS = async () => {
    if (!result || !result.imageBuffer) {
      toast.error('No image data to upload');
      return;
    }

    setUploadingToIPFS(true);
    try {
      toast.loading('Uploading to IPFS...', { id: 'ipfs-upload' });
      
      const response = await api.artwork.uploadToIPFS({
        imageBuffer: result.imageBuffer,
        contentHash: result.contentHash,
        promptHash: result.promptHash,
        model: result.model,
      });

      if (response.data.success) {
        // Update result with IPFS data
        setResult({
          ...result,
          ipfsCID: response.data.ipfsCID,
          imageUrl: response.data.ipfsUrl,
          proofPackage: response.data.proofPackage,
          metadataURI: response.data.metadataURI,
          ipfsReady: true,
        });
        
        toast.success('Successfully uploaded to IPFS! 🎉', { id: 'ipfs-upload' });
      }
    } catch (error: any) {
      console.error('IPFS upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload to IPFS', { id: 'ipfs-upload' });
    } finally {
      setUploadingToIPFS(false);
    }
  };

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
    setGenerationProgress('🎨 Generating image with AI...');

    try {
      // Start timer
      const startTime = Date.now();
      let updateInterval: NodeJS.Timeout | null = null;

      // Update progress every 5 seconds
      const progressSteps = [
        '🎨 Generating image with AI...',
        '🎨 Still generating (AI models can take 30-60 seconds)...',
        '📥 Downloading and computing hash...',
        '✅ Almost done...',
      ];
      let stepIndex = 0;

      updateInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 15000 && stepIndex < progressSteps.length - 1) {
          stepIndex = Math.min(Math.floor(elapsed / 15000), progressSteps.length - 1);
          setGenerationProgress(progressSteps[stepIndex]);
        }
      }, 5000);

      const response = await api.artwork.generate({
        prompt: prompt.trim(),
        model,
        parameters: {
          size: '1024x1024',
          quality: 'standard',
        },
      });

      if (updateInterval) clearInterval(updateInterval);

      const totalTime = Date.now() - startTime;
      console.log('✅ Generation response received:', response.data);
      console.log(`⏱️ Total time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
      
      setResult(response.data);
      setGenerationProgress('');
      
      toast.success(`🎨 Image generated in ${(totalTime / 1000).toFixed(1)}s! (Upload to IPFS for permanent storage)`, { duration: 5000 });
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
      setGenerationProgress('');
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
                {models.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  models.map((m) => (
                    <option 
                      key={m.id} 
                      value={m.id}
                      disabled={!m.available && generating}
                    >
                      {m.name} ({m.provider}){!m.available ? ' - Not configured' : ''}
                    </option>
                  ))
                )}
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

        {/* Progress Indicator */}
        {generating && generationProgress && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
              <div className="flex-1">
                <p className="text-blue-300 font-medium">{generationProgress}</p>
                <p className="text-blue-200/60 text-sm mt-1">
                  AI generation: 30-60 seconds • Image will appear immediately when ready
                </p>
              </div>
            </div>
          </div>
        )}

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
              {/* IPFS Status */}
              {result.ipfsReady ? (
                <div className="p-3 bg-green-900/20 border border-green-600/30 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-400">✅ Uploaded to IPFS</span>
                  </div>
                  <div>
                    <span className="text-slate-400">IPFS CID:</span>
                    <code className="ml-2 text-green-400 break-all text-xs">{result.ipfsCID}</code>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-400 font-medium">⚠️ Not on IPFS yet</span>
                      </div>
                      <p className="text-yellow-200/70 text-xs">
                        Currently using temporary storage. Upload to IPFS for permanent, decentralized storage.
                      </p>
                    </div>
                    <button
                      onClick={handleUploadToIPFS}
                      disabled={uploadingToIPFS}
                      className="flex-shrink-0 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-700/50 text-white text-xs rounded transition-colors font-medium"
                    >
                      {uploadingToIPFS ? (
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                          Uploading...
                        </span>
                      ) : (
                        'Upload to IPFS'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Content Hash */}
              <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-blue-400 font-medium block mb-1">Content Hash (for verification):</span>
                    <code className="text-xs text-blue-300 break-all block">{result.contentHash}</code>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.contentHash);
                      toast.success('Hash copied to clipboard!');
                    }}
                    className="flex-shrink-0 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-blue-200/70 mt-2">
                  ℹ️ Save this hash to verify your artwork later
                </p>
              </div>
              
              <div>
                <span className="text-slate-400">Model:</span>
                <span className="ml-2 text-white">{result.model}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!result) {
                      toast.error('No artwork to register');
                      return;
                    }

                    if (!result.ipfsReady) {
                      toast.error('Please upload to IPFS first before blockchain registration');
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
                  disabled={isRegistering || isConfirming || isConfirmed || !result || !result.ipfsReady}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  title={!result?.ipfsReady ? 'Upload to IPFS first' : ''}
                >
                  {isRegistering ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Waiting for approval...
                    </span>
                  ) : isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Confirming on blockchain...
                    </span>
                  ) : isConfirmed ? (
                    '✅ Registered on Blockchain'
                  ) : txError ? (
                    '❌ Registration Failed - Retry'
                  ) : !result?.ipfsReady ? (
                    '🔒 Register on Blockchain (Upload to IPFS first)'
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
                  View Image
                </a>
              </div>

              {/* Transaction Status */}
              {(txHash || isConfirming || isConfirmed) && (
                <div className={`p-3 rounded-lg text-sm ${
                  isConfirmed 
                    ? 'bg-green-900/20 border border-green-600/30' 
                    : 'bg-blue-900/20 border border-blue-600/30'
                }`}>
                  <div className="space-y-2">
                    {txHash && (
                      <div>
                        <span className={isConfirmed ? 'text-green-400' : 'text-blue-400'}>
                          Transaction Hash:
                        </span>
                        <code className="ml-2 text-xs break-all">
                          {txHash}
                        </code>
                        {process.env.NEXT_PUBLIC_YOUR_CHAIN_EXPLORER_URL && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_YOUR_CHAIN_EXPLORER_URL}/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`ml-2 ${isConfirmed ? 'text-green-400' : 'text-blue-400'} hover:underline`}
                          >
                            View on Explorer →
                          </a>
                        )}
                      </div>
                    )}
                    <div>
                      <span className={isConfirmed ? 'text-green-300' : 'text-blue-300'}>
                        {isConfirming && '⏳ Waiting for blockchain confirmation...'}
                        {isConfirmed && '✅ Transaction confirmed! Your artwork is now on the blockchain.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {txError && (
                <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg text-sm">
                  <div className="text-red-400">
                    ❌ Blockchain registration failed
                  </div>
                  <div className="text-red-200/70 text-xs mt-1">
                    Your artwork is saved in the database, but blockchain registration failed. 
                    You can retry or verify it later.
                  </div>
                </div>
              )}

              {/* Verify Button - Only show after confirmed */}
              {isConfirmed && (
                <Link
                  href={`/verify?hash=${result.contentHash}`}
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                >
                  ✓ Verify Registration on Blockchain
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

