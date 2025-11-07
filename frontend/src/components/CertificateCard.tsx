'use client';

import { useState } from 'react';
import { Download, ExternalLink, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface CertificateCardProps {
  artwork: {
    id: number;
    contentHash: string;
    ipfsCID?: string;
    certificateTokenId?: string;
    createdAt: string;
    modelUsed?: string;
  };
  index: number;
}

export function CertificateCard({ artwork, index }: CertificateCardProps) {
  const [downloading, setDownloading] = useState(false);

  const downloadCertificate = async () => {
    try {
      setDownloading(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/certificate/${artwork.contentHash}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proof-of-art-certificate-${artwork.certificateTokenId || artwork.contentHash.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Certificate downloaded successfully!');
    } catch (error: any) {
      console.error('Failed to download certificate:', error);
      toast.error(error.message || 'Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const previewCertificate = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.open(`${apiUrl}/api/certificate/preview/${artwork.contentHash}`, '_blank');
  };

  // Generate IPFS gateway URL
  const ipfsUrl = artwork.ipfsCID 
    ? `https://gateway.pinata.cloud/ipfs/${artwork.ipfsCID}`
    : null;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all duration-200 group">
      {/* Preview Area */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {ipfsUrl ? (
          <img 
            src={ipfsUrl} 
            alt={`Artwork Certificate #${artwork.certificateTokenId || index + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileCheck className="w-16 h-16 text-slate-600" />
          </div>
        )}
        
        {/* Verified Badge */}
        <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <FileCheck className="w-3 h-3" />
          Verified
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-white mb-1">
            Certificate #{artwork.certificateTokenId || index + 1}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(artwork.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          {artwork.modelUsed && (
            <p className="text-xs text-slate-500 mt-1">
              Model: {artwork.modelUsed}
            </p>
          )}
        </div>

        {/* Hash Info */}
        <div className="mb-4 p-2 bg-slate-900/50 rounded">
          <p className="text-xs text-slate-500 mb-1">Content Hash:</p>
          <code className="text-xs text-blue-400 break-all">
            {artwork.contentHash.substring(0, 24)}...
          </code>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={downloadCertificate}
            disabled={downloading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <button
            onClick={previewCertificate}
            className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
            title="Preview Certificate"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


