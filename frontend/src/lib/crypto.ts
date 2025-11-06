/**
 * Client-side cryptographic utilities
 */

/**
 * Generate SHA-256 hash from data (browser-compatible)
 */
export async function generateHash(data: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;

  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(data);
  } else {
    buffer = data;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return `0x${hashHex}`;
}

/**
 * Generate content hash from file
 */
export async function generateContentHash(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  return generateHash(buffer);
}

/**
 * Generate prompt hash
 */
export async function generatePromptHash(prompt: string): Promise<string> {
  // Add salt for additional security
  const saltedPrompt = `proof-of-art:${prompt}:${Date.now()}`;
  return generateHash(saltedPrompt);
}

/**
 * Convert file to base64 for easy transmission
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Download data as file
 */
export function downloadAsFile(data: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format hash for display (truncate middle)
 */
export function formatHash(hash: string, startChars: number = 6, endChars: number = 4): string {
  if (hash.length <= startChars + endChars) {
    return hash;
  }

  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate hash format
 */
export function isValidHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Generate random hex string
 */
export function generateRandomHex(length: number = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}`;
}

/**
 * Create metadata for artwork
 */
export function createArtworkMetadata(data: {
  name: string;
  description: string;
  prompt: string;
  model: string;
  creator: string;
  contentHash: string;
  ipfsCID: string;
}): any {
  return {
    name: data.name,
    description: data.description,
    image: `ipfs://${data.ipfsCID}`,
    attributes: [
      {
        trait_type: 'Model',
        value: data.model,
      },
      {
        trait_type: 'Prompt Hash',
        value: data.prompt,
      },
      {
        trait_type: 'Content Hash',
        value: data.contentHash,
      },
      {
        trait_type: 'Creator',
        value: data.creator,
      },
      {
        trait_type: 'Created At',
        value: new Date().toISOString(),
      },
    ],
    properties: {
      category: 'AI-Generated Art',
      verified: true,
      blockchain: process.env.NEXT_PUBLIC_YOUR_CHAIN_NAME || 'Proof-of-Art Network',
    },
  };
}

