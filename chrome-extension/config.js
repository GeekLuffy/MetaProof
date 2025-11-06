/**
 * Extension Configuration
 * 
 * ADD YOUR API KEYS HERE (from your .env file)
 * 
 * IMPORTANT: This file is gitignored - safe to add your keys here
 */

export const DEFAULT_CONFIG = {
  // Backend API
  apiEndpoint: 'http://localhost:5000',
  
  // IPFS Configuration - Pinata (from your .env)
  pinataApiKey: '436c70b8843a24a231bb',        // From PINATA_API_KEY in .env
  pinataApiSecret: '2049105914a537e7b1c245e826f1364c0503e65673af2ebf246a45a146fc7c45',  // From PINATA_SECRET_KEY in .env
  
  // Alternative IPFS providers (optional)
  web3StorageToken: '',
  nftStorageToken: '',
  
  // Extension settings
  autoUploadIPFS: false,  // Set to true to auto-upload to IPFS
  trackingEnabled: true,
  showNotifications: true
};

/**
 * HOW TO USE:
 * 
 * 1. Copy your Pinata keys from .env file (lines 20-21)
 * 2. Replace 'YOUR_PINATA_API_KEY' with your actual key
 * 3. Replace 'YOUR_PINATA_SECRET_KEY' with your actual secret
 * 4. Reload the extension
 * 
 * Example:
 * pinataApiKey: '1234abcd5678efgh',
 * pinataApiSecret: 'super_secret_key_here',
 */

