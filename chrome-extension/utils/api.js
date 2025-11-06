// API service for backend communication
// Updated to work with Proof-of-Art backend API
import { computeHash as computeHashUtil } from './crypto.js';

class APIService {
  constructor() {
    this.baseUrl = null;
  }
  
  /**
   * Initialize API service with base URL
   * @param {string} baseUrl - Backend API URL
   */
  async initialize() {
    const settings = await chrome.storage.local.get('settings');
    // Default to your Proof-of-Art backend
    this.baseUrl = settings.settings?.apiEndpoint || 'http://localhost:5000';
  }
  
  /**
   * Get stored auth token (for future use with Web3 auth)
   * @returns {Promise<string|null>} Auth token
   */
  async getAuthToken() {
    const result = await chrome.storage.local.get('authToken');
    return result.authToken || null;
  }
  
  /**
   * Make API request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    if (!this.baseUrl) {
      await this.initialize();
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if available
    const authToken = await this.getAuthToken();
    if (authToken) {
      defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }
    
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  /**
   * Compute hash using crypto utility
   * @param {string} data - Data to hash
   * @returns {Promise<string>} Hash
   */
  async computeHash(data) {
    // Use static import instead of dynamic import (service workers don't support dynamic imports)
    return await computeHashUtil(data);
  }
  
  /**
   * Verify proof with backend
   * Uses: POST /api/verify
   * @param {object} proof - Proof object
   * @returns {Promise<object>} Verification result
   */
  async verifyProof(proof) {
    return await this.request('/api/verify', {
      method: 'POST',
      body: JSON.stringify({
        contentHash: proof.contentHash,
        ipfsCID: proof.ipfsCid, // Backend uses ipfsCID
        fingerprint: proof.fingerprint,
        timestamp: proof.timestamp,
        platform: proof.platform,
        model: proof.model
      })
    });
  }
  
  /**
   * Register proof on platform
   * Uses: POST /api/artworks
   * @param {object} proof - Proof object
   * @returns {Promise<object>} Registration result
   */
  async registerProof(proof) {
    try {
      // Compute prompt hash
      const promptHash = await this.computeHash(proof.prompt);
      
      // Get creator address from storage (if connected with Web3)
      const result = await chrome.storage.local.get('walletAddress');
      const creatorAddress = result.walletAddress || '0x0000000000000000000000000000000000000000';
      
      const response = await this.request('/api/artworks', {
        method: 'POST',
        body: JSON.stringify({
          contentHash: proof.contentHash,
          promptHash: promptHash,
          ipfsCID: proof.ipfsCid,
          modelUsed: `${proof.platform}-${proof.model}`,
          metadataURI: proof.ipfsCid ? `ipfs://${proof.ipfsCid}` : null,
          certificateTokenId: null
        })
      });
      
      // Transform response to match extension expectations
      return {
        success: response.success,
        registrationId: response.artwork?.id?.toString() || proof.contentHash,
        message: 'Proof registered successfully',
        data: response.artwork
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  /**
   * Get proof status from backend
   * Uses: GET /api/artworks/:contentHash
   * @param {string} contentHashOrId - Content hash or proof ID
   * @returns {Promise<object>} Proof status
   */
  async getProofStatus(contentHashOrId) {
    try {
      const response = await this.request(`/api/artworks/${contentHashOrId}`, {
        method: 'GET'
      });
      
      // Transform response to match extension expectations
      return {
        success: response.success,
        id: response.artwork?.id,
        status: 'verified',
        data: response.artwork
      };
      
    } catch (error) {
      if (error.message.includes('404')) {
        return {
          success: false,
          status: 'not_found',
          error: 'Proof not found'
        };
      }
      throw error;
    }
  }
  
  /**
   * Search for proofs
   * Uses: GET /api/artworks?address=...
   * @param {object} query - Search query
   * @returns {Promise<array>} Search results
   */
  async searchProofs(query) {
    try {
      const params = new URLSearchParams();
      
      if (query.address) {
        params.append('address', query.address);
      }
      if (query.platform) {
        // Backend uses modelUsed field for platform info
        params.append('modelUsed', query.platform);
      }
      
      const response = await this.request(`/api/artworks?${params}`, {
        method: 'GET'
      });
      
      // Transform response to match extension expectations
      return {
        success: response.success,
        count: response.count,
        data: response.artworks || []
      };
      
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        count: 0,
        data: []
      };
    }
  }
  
  /**
   * Check if content hash exists
   * Uses: GET /api/artworks/:contentHash
   * @param {string} contentHash - Content hash
   * @returns {Promise<object>} Check result
   */
  async checkContentHash(contentHash) {
    try {
      const result = await this.getProofStatus(contentHash);
      
      return {
        success: true,
        exists: result.success && result.data !== null,
        data: result.data || null
      };
      
    } catch (error) {
      if (error.message.includes('404')) {
        return {
          success: true,
          exists: false,
          data: null
        };
      }
      throw error;
    }
  }
  
  /**
   * Get user's registered proofs
   * Uses: GET /api/artworks/my
   * @returns {Promise<array>} User's proofs
   */
  async getUserProofs() {
    try {
      const response = await this.request('/api/artworks/my', {
        method: 'GET'
      });
      
      // Transform response to match extension expectations
      return {
        success: response.success,
        count: response.count,
        data: response.artworks || []
      };
      
    } catch (error) {
      console.error('Get user proofs error:', error);
      // If not authenticated, return empty array
      return {
        success: false,
        count: 0,
        data: []
      };
    }
  }
  
  /**
   * Check backend health
   * Uses: GET /health
   * @returns {Promise<object>} Health status
   */
  async checkHealth() {
    try {
      const response = await this.request('/health', {
        method: 'GET'
      });
      
      return {
        success: true,
        healthy: response.status === 'healthy',
        data: response
      };
      
    } catch (error) {
      return {
        success: false,
        healthy: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const apiService = new APIService();

