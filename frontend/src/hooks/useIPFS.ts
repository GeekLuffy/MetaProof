'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface UploadResult {
  ipfsCID: string;
  url: string;
  size?: number;
  filename?: string;
}

export function useIPFS() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File | Blob, metadata?: any): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await api.ipfs.upload(formData);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to upload file';
      setError(errorMsg);
      console.error('IPFS upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadJSON = async (jsonData: any): Promise<{ ipfsCID: string; url: string } | null> => {
    setUploading(true);
    setError(null);

    try {
      const response = await api.ipfs.uploadJSON(jsonData);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to upload JSON';
      setError(errorMsg);
      console.error('IPFS JSON upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getContent = async (cid: string): Promise<any | null> => {
    setError(null);

    try {
      const response = await api.ipfs.getContent(cid);
      return response.data.content;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to retrieve content';
      setError(errorMsg);
      console.error('IPFS retrieval error:', err);
      return null;
    }
  };

  const getURL = (cid: string): string => {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  };

  return {
    uploadFile,
    uploadJSON,
    getContent,
    getURL,
    uploading,
    error,
  };
}

