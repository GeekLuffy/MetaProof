import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Get backend URL from environment variable, with fallback
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: check env var
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  }
  // Server-side: use default
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
};

const BASE_URL = getBackendUrl();

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Unauthorized or Forbidden - clear auth
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_address');
        console.warn('Authentication token invalid or expired. Please reconnect your wallet.');
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Auth
  auth: {
    getNonce: (address: string) =>
      apiClient.post('/api/auth/nonce', { address }),
    
    verifySignature: (address: string, signature: string, message: string) =>
      apiClient.post('/api/auth/verify', { address, signature, message }),
  },

  // Artwork generation
  artwork: {
    generate: (data: {
      prompt: string;
      model: string;
      parameters?: any;
      biometricData?: string;
    }) => apiClient.post('/api/generate', data, {
      timeout: 300000, // 5 minutes for image generation
    }),

    getModels: () => apiClient.get('/api/generate/models'),

    verify: (data: { contentHash?: string; ipfsCID?: string }) =>
      apiClient.post('/api/verify', data),

    getAll: (address?: string) =>
      apiClient.get('/api/artworks', { params: { address } }),

    getById: (id: string) => apiClient.get(`/api/artworks/${id}`),
  },

  // IPFS upload
  ipfs: {
    upload: (formData: FormData) =>
      apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    
    uploadJSON: (jsonData: any) =>
      apiClient.post('/api/upload/json', jsonData),
    
    getContent: (cid: string) =>
      apiClient.get(`/api/upload/${cid}`),
    
    getURL: (cid: string) =>
      apiClient.get(`/api/upload/url/${cid}`),
  },

  // Platform stats
  stats: {
    get: () => apiClient.get('/api/stats'),
  },

  // User profile
  user: {
    getProfile: (address: string) =>
      apiClient.get(`/api/user/${address}`),
    
    getArtworks: (address: string) =>
      apiClient.get(`/api/user/${address}/artworks`),
  },
};

export default apiClient;

