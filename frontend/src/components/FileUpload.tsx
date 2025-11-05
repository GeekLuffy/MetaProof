'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete?: (result: { ipfsCID: string; url: string }) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function FileUpload({
  onUploadComplete,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  maxSize = 50 * 1024 * 1024, // 50MB
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    ipfsCID?: string;
    url?: string;
    filename?: string;
  } | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress (actual progress tracking would require server-sent events or WebSocket)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await api.ipfs.upload(formData);

        clearInterval(progressInterval);
        setUploadProgress(100);

        const result = response.data;
        setUploadedFile({
          ipfsCID: result.ipfsCID,
          url: result.url,
          filename: result.filename,
        });

        toast.success('File uploaded to IPFS successfully!');

        if (onUploadComplete) {
          onUploadComplete({
            ipfsCID: result.ipfsCID,
            url: result.url,
          });
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(error.response?.data?.error || 'Failed to upload file');
      } finally {
        setUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${
            isDragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-600 hover:border-purple-500/50 bg-gray-800/50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-gray-300">Uploading to IPFS...</p>
              <div className="w-full max-w-xs bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">{uploadProgress}%</p>
            </>
          ) : (
            <>
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              {isDragActive ? (
                <p className="text-purple-400 font-medium">Drop the file here...</p>
              ) : (
                <>
                  <p className="text-gray-300 font-medium">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {uploadedFile && (
        <div className="mt-4 glass rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-2">✅ Upload Complete</h4>
          <div className="space-y-2 text-sm">
            {uploadedFile.filename && (
              <p className="text-gray-300">
                <span className="text-gray-500">File:</span> {uploadedFile.filename}
              </p>
            )}
            <p className="text-gray-300 break-all">
              <span className="text-gray-500">IPFS CID:</span>{' '}
              <code className="bg-gray-900 px-2 py-1 rounded">
                {uploadedFile.ipfsCID}
              </code>
            </p>
            {uploadedFile.url && (
              <a
                href={uploadedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline inline-block"
              >
                View on IPFS →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

