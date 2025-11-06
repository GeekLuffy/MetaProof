import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.PINATA_JWT || '';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface IPFSUploadOptions {
  name?: string;
  keyValues?: Record<string, any>;
}

/**
 * IPFS Service for Pinata integration
 */
export class IPFSService {
  private apiKey: string;
  private secretKey: string;
  private jwt: string;

  constructor() {
    this.apiKey = PINATA_API_KEY;
    this.secretKey = PINATA_SECRET_KEY;
    this.jwt = PINATA_JWT;

    if (!this.apiKey && !this.jwt) {
      console.warn('Pinata credentials not configured');
    }
  }

  /**
   * Test Pinata connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(
        'https://api.pinata.cloud/data/testAuthentication',
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Pinata connection test failed:', error);
      return false;
    }
  }

  /**
   * Upload file buffer to IPFS
   */
  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    options?: IPFSUploadOptions
  ): Promise<{ cid: string; url: string; size: number }> {
    try {
      const formData = new FormData();
      
      // Convert buffer to stream for form data
      const stream = Readable.from(fileBuffer);
      formData.append('file', stream, filename);

      // Add optional metadata
      const metadata = {
        name: options?.name || filename,
        keyvalues: options?.keyValues || {},
      };
      formData.append('pinataMetadata', JSON.stringify(metadata));

      const response = await axios.post<PinataResponse>(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            ...this.getAuthHeaders(),
            ...formData.getHeaders(),
          },
          timeout: 60000, // 60 second timeout for IPFS upload
        }
      );

      const cid = response.data.IpfsHash;

      return {
        cid,
        url: `${PINATA_GATEWAY}/ipfs/${cid}`,
        size: response.data.PinSize,
      };
    } catch (error: any) {
      console.error('IPFS file upload error:', error);
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(
    jsonData: any,
    options?: IPFSUploadOptions
  ): Promise<{ cid: string; url: string }> {
    try {
      const data = {
        pinataContent: jsonData,
        pinataMetadata: {
          name: options?.name || 'json-metadata',
          keyvalues: options?.keyValues || {},
        },
      };

      const response = await axios.post<PinataResponse>(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        data,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000, // 30 second timeout for JSON upload
        }
      );

      const cid = response.data.IpfsHash;

      return {
        cid,
        url: `${PINATA_GATEWAY}/ipfs/${cid}`,
      };
    } catch (error: any) {
      console.error('IPFS JSON upload error:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
    }
  }

  /**
   * Retrieve content from IPFS
   */
  async getContent(cid: string): Promise<any> {
    try {
      const response = await axios.get(`${PINATA_GATEWAY}/ipfs/${cid}`);
      return response.data;
    } catch (error: any) {
      console.error('IPFS retrieval error:', error);
      throw new Error(`Failed to retrieve content from IPFS: ${error.message}`);
    }
  }

  /**
   * Get file URL from CID
   */
  getIPFSUrl(cid: string): string {
    return `${PINATA_GATEWAY}/ipfs/${cid}`;
  }

  /**
   * Unpin file from IPFS (remove from Pinata)
   */
  async unpinFile(cid: string): Promise<boolean> {
    try {
      await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
        headers: this.getAuthHeaders(),
      });
      return true;
    } catch (error) {
      console.error('IPFS unpin error:', error);
      return false;
    }
  }

  /**
   * List all pinned files
   */
  async listPinnedFiles(
    filters?: {
      name?: string;
      status?: 'pinned' | 'unpinned';
      pageLimit?: number;
    }
  ): Promise<any> {
    try {
      const params: any = {
        pageLimit: filters?.pageLimit || 10,
      };

      if (filters?.status) {
        params.status = filters.status;
      }

      if (filters?.name) {
        params.metadata = { name: filters.name };
      }

      const response = await axios.get('https://api.pinata.cloud/data/pinList', {
        headers: this.getAuthHeaders(),
        params,
      });

      return response.data;
    } catch (error) {
      console.error('IPFS list error:', error);
      throw new Error('Failed to list pinned files');
    }
  }

  /**
   * Get authentication headers for Pinata
   */
  private getAuthHeaders(): Record<string, string> {
    if (this.jwt) {
      return {
        Authorization: `Bearer ${this.jwt}`,
      };
    }

    return {
      pinata_api_key: this.apiKey,
      pinata_secret_api_key: this.secretKey,
    };
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();

