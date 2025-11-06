// IPFS utilities for decentralized storage

/**
 * Upload data to IPFS
 * @param {string} dataURL - Data URL to upload
 * @returns {Promise<string>} IPFS CID
 */
export async function uploadToIPFS(dataURL) {
  try {
    // Convert data URL to blob
    const blob = await dataURLToBlob(dataURL);
    
    // Try multiple IPFS gateways/services
    const services = [
      { name: 'web3.storage', upload: uploadToWeb3Storage },
      { name: 'nft.storage', upload: uploadToNFTStorage },
      { name: 'pinata', upload: uploadToPinata }
    ];
    
    // Try each service until one succeeds
    for (const service of services) {
      try {
        console.log(`Attempting upload to ${service.name}...`);
        const cid = await service.upload(blob);
        console.log(`Successfully uploaded to ${service.name}: ${cid}`);
        return cid;
      } catch (error) {
        console.warn(`${service.name} upload failed:`, error.message);
      }
    }
    
    throw new Error('All IPFS upload services failed');
    
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}

/**
 * Upload to Web3.Storage
 * @param {Blob} blob - File blob
 * @returns {Promise<string>} CID
 */
async function uploadToWeb3Storage(blob) {
  // Get API token from settings
  const settings = await chrome.storage.local.get('settings');
  const apiToken = settings.settings?.web3StorageToken;
  
  if (!apiToken) {
    throw new Error('Web3.Storage API token not configured');
  }
  
  const formData = new FormData();
  formData.append('file', blob, 'proof-of-art.png');
  
  const response = await fetch('https://api.web3.storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Web3.Storage API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.cid;
}

/**
 * Upload to NFT.Storage
 * @param {Blob} blob - File blob
 * @returns {Promise<string>} CID
 */
async function uploadToNFTStorage(blob) {
  const settings = await chrome.storage.local.get('settings');
  const apiToken = settings.settings?.nftStorageToken;
  
  if (!apiToken) {
    throw new Error('NFT.Storage API token not configured');
  }
  
  const formData = new FormData();
  formData.append('file', blob, 'proof-of-art.png');
  
  const response = await fetch('https://api.nft.storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`NFT.Storage API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.value.cid;
}

/**
 * Upload to Pinata
 * @param {Blob} blob - File blob
 * @returns {Promise<string>} CID
 */
async function uploadToPinata(blob) {
  const settings = await chrome.storage.local.get('settings');
  const apiKey = settings.settings?.pinataApiKey;
  const apiSecret = settings.settings?.pinataApiSecret;
  
  // Also check config.js as fallback
  if (!apiKey || !apiSecret || apiKey === 'YOUR_PINATA_API_KEY') {
    // Try to import from config
    try {
      const { DEFAULT_CONFIG } = await import('../config.js');
      if (DEFAULT_CONFIG.pinataApiKey && DEFAULT_CONFIG.pinataApiKey !== 'YOUR_PINATA_API_KEY') {
        const apiKey = DEFAULT_CONFIG.pinataApiKey;
        const apiSecret = DEFAULT_CONFIG.pinataApiSecret;
        if (apiKey && apiSecret) {
          // Update settings with config values
          settings.settings = settings.settings || {};
          settings.settings.pinataApiKey = apiKey;
          settings.settings.pinataApiSecret = apiSecret;
          await chrome.storage.local.set(settings);
        }
      }
    } catch (e) {
      // Config not available
    }
  }
  
  const finalApiKey = settings.settings?.pinataApiKey;
  const finalApiSecret = settings.settings?.pinataApiSecret;
  
  if (!finalApiKey || !finalApiSecret || finalApiKey === 'YOUR_PINATA_API_KEY') {
    throw new Error('Pinata API credentials not configured');
  }
  
  const formData = new FormData();
  formData.append('file', blob, 'proof-of-art.png');
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': finalApiKey,
      'pinata_secret_api_key': finalApiSecret
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Pinata API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.IpfsHash;
}

/**
 * Get IPFS gateway URL for a CID
 * @param {string} cid - IPFS CID
 * @param {string} gateway - Gateway URL (optional)
 * @returns {string} Full URL
 */
export function getIPFSUrl(cid, gateway = 'https://ipfs.io/ipfs/') {
  return `${gateway}${cid}`;
}

/**
 * Verify content on IPFS matches hash
 * @param {string} cid - IPFS CID
 * @param {string} expectedHash - Expected content hash
 * @returns {Promise<boolean>} True if content matches
 */
export async function verifyIPFSContent(cid, expectedHash) {
  try {
    const gateways = [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/'
    ];
    
    for (const gateway of gateways) {
      try {
        const url = getIPFSUrl(cid, gateway);
        const response = await fetch(url);
        
        if (response.ok) {
          const blob = await response.blob();
          const dataURL = await blobToDataURL(blob);
          
          // Import hash function
          const { computeHash } = await import('./crypto.js');
          const actualHash = await computeHash(dataURL);
          
          return actualHash === expectedHash;
        }
      } catch (error) {
        console.warn(`Gateway ${gateway} failed:`, error.message);
      }
    }
    
    throw new Error('All IPFS gateways failed');
    
  } catch (error) {
    console.error('IPFS verification error:', error);
    return false;
  }
}

/**
 * Convert data URL to Blob
 * @param {string} dataURL - Data URL
 * @returns {Promise<Blob>} Blob
 */
function dataURLToBlob(dataURL) {
  return new Promise((resolve, reject) => {
    try {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      resolve(new Blob([u8arr], { type: mime }));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert Blob to data URL
 * @param {Blob} blob - Blob
 * @returns {Promise<string>} Data URL
 */
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

