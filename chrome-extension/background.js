// Background Service Worker for Proof of Art Extension
import { computeHash, generateFingerprint } from './utils/crypto.js';
import { uploadToIPFS } from './utils/ipfs.js';
import { apiService } from './utils/api.js';
import { DEFAULT_CONFIG } from './config.js';

// Store active tracking sessions
const activeSessions = new Map();

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Proof of Art Extension installed');
  
  // Initialize storage with defaults from config
  const result = await chrome.storage.local.get('settings');
  
  // Sync Pinata keys from config.js to storage if not set
  if (result.settings) {
    const needsUpdate = !result.settings.pinataApiKey || 
                       result.settings.pinataApiKey === 'YOUR_PINATA_API_KEY' ||
                       !result.settings.pinataApiSecret ||
                       result.settings.pinataApiSecret === 'YOUR_PINATA_SECRET_KEY';
    
    if (needsUpdate && DEFAULT_CONFIG.pinataApiKey && DEFAULT_CONFIG.pinataApiKey !== 'YOUR_PINATA_API_KEY') {
      result.settings.pinataApiKey = DEFAULT_CONFIG.pinataApiKey;
      result.settings.pinataApiSecret = DEFAULT_CONFIG.pinataApiSecret;
      await chrome.storage.local.set({ settings: result.settings });
      console.log('✅ Pinata keys synced from config.js');
    }
  } else {
    // First time install - use config defaults
    await chrome.storage.local.set({
      proofs: [],
      settings: DEFAULT_CONFIG
    });
    console.log('✅ Extension initialized with default configuration');
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('✅ Background received message:', message.type);
  
  switch (message.type) {
    case 'PROMPT_DETECTED':
      console.log('📝 Processing prompt:', message.data.prompt.substring(0, 50));
      handlePromptDetected(message.data, sender.tab.id);
      sendResponse({ success: true });
      break;
      
    case 'IMAGE_GENERATED':
      console.log('🖼️ Processing image from tab:', sender.tab.id);
      handleImageGenerated(message.data, sender.tab.id);
      sendResponse({ success: true });
      break;
      
    case 'GET_PROOFS':
      getStoredProofs().then(proofs => {
        sendResponse({ proofs });
      });
      return true; // Will respond asynchronously
      
    case 'VERIFY_PROOF':
      verifyProof(message.data).then(result => {
        sendResponse(result);
      });
      return true;
      
    case 'REGISTER_PROOF':
      registerProofOnPlatform(message.data).then(result => {
        sendResponse(result);
      });
      return true;
  }
});

// Handle prompt detection
async function handlePromptDetected(data, tabId) {
  const sessionId = `${tabId}-${Date.now()}`;
  const fingerprint = await generateFingerprint();
  
  const session = {
    sessionId,
    tabId,
    prompt: data.prompt,
    platform: data.platform,
    timestamp: new Date().toISOString(),
    fingerprint,
    metadata: {
      userAgent: navigator.userAgent,
      url: data.url,
      ...data.metadata
    }
  };
  
  activeSessions.set(sessionId, session);
  console.log('Tracking session started:', sessionId);
  
  // Notify popup if open
  chrome.runtime.sendMessage({
    type: 'SESSION_STARTED',
    data: session
  }).catch(() => {}); // Ignore if popup is not open
}

// Handle image generation
async function handleImageGenerated(data, tabId) {
  console.log('Image generated, processing...');
  
  // Find matching session
  let session = Array.from(activeSessions.values())
    .find(s => s.tabId === tabId);
  
  // If no session exists, create one (for cases where prompt wasn't captured)
  if (!session) {
    console.warn('No active session found, creating one from image data');
    const fingerprint = await generateFingerprint();
    
    session = {
      sessionId: `${tabId}-${Date.now()}`,
      tabId,
      prompt: data.metadata?.alt || 'Generated image (prompt not captured)',
      platform: await detectPlatformFromTab(tabId),
      timestamp: new Date().toISOString(),
      fingerprint,
      metadata: {
        userAgent: navigator.userAgent,
        capturedWithoutPrompt: true
      }
    };
  }
  
  try {
    // Compute content hash
    const contentHash = await computeHash(data.imageData);
    
    // Upload to IPFS (if enabled)
    const settings = await chrome.storage.local.get('settings');
    let ipfsCid = null;
    
    if (settings.settings?.autoUploadIPFS) {
      try {
        ipfsCid = await uploadToIPFS(data.imageData);
      } catch (error) {
        console.error('IPFS upload failed:', error);
      }
    }
    
    // Create proof record
    // Don't store full image data to avoid storage quota issues
    // Store only IPFS CID and hash - image can be retrieved from IPFS
    const proof = {
      id: crypto.randomUUID(),
      sessionId: session.sessionId,
      prompt: session.prompt,
      platform: session.platform,
      model: data.model || 'unknown',
      contentType: data.contentType || 'image/png',
      contentHash,
      ipfsCid,
      fingerprint: session.fingerprint,
      timestamp: session.timestamp,
      generatedAt: new Date().toISOString(),
      metadata: {
        ...session.metadata,
        ...data.metadata
      },
      // Only store image preview (first 200 chars) to reduce storage
      // Full image available via IPFS CID
      imagePreview: data.imageData ? data.imageData.substring(0, 200) : null,
      imageData: ipfsCid ? null : data.imageData, // Only store if IPFS upload failed
      verified: false,
      registered: false
    };
    
    // Save proof (without full image to avoid quota)
    await saveProof(proof);
    
    // Clean up session
    activeSessions.delete(session.sessionId);
    
    // Notify user (if notifications permission granted)
    try {
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Proof of Art Created',
          message: `Art proof captured from ${proof.platform}`,
          priority: 2
        });
      }
    } catch (error) {
      // Notifications not available or permission not granted
      console.log('✅ Proof created (notifications not available)');
    }
    
    console.log('✅ Proof created:', proof.id);
    
  } catch (error) {
    console.error('❌ Error processing image:', error);
  }
}

// Helper function to detect platform from tab
async function detectPlatformFromTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    const url = new URL(tab.url);
    const hostname = url.hostname;
    
    if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) return 'openai';
    if (hostname.includes('gemini.google.com')) return 'gemini';
    if (hostname.includes('discord.com')) return 'discord';
    if (hostname.includes('midjourney.com')) return 'midjourney';
    if (hostname.includes('bing.com')) return 'bing';
    if (hostname.includes('leonardo.ai')) return 'leonardo';
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

// Save proof to storage
async function saveProof(proof) {
  console.log('💾 Saving proof to storage...');
  const result = await chrome.storage.local.get('proofs');
  const proofs = result.proofs || [];
  
  // Remove old proofs if storage is getting full (keep only last 50)
  if (proofs.length >= 50) {
    // Remove oldest proofs
    proofs.splice(50);
  }
  
  proofs.unshift(proof); // Add to beginning
  
  try {
    await chrome.storage.local.set({ proofs });
    console.log('✅ Proof saved! Total proofs:', proofs.length);
  } catch (error) {
    if (error.message.includes('quota')) {
      console.warn('⚠️ Storage quota exceeded, removing oldest proofs...');
      // Remove oldest 10 proofs and try again
      proofs.splice(-10);
      await chrome.storage.local.set({ proofs });
      console.log('✅ Proof saved after cleanup! Total proofs:', proofs.length);
    } else {
      throw error;
    }
  }
}

// Get stored proofs
async function getStoredProofs() {
  const result = await chrome.storage.local.get('proofs');
  return result.proofs || [];
}

// Verify proof
async function verifyProof(proofId) {
  const proofs = await getStoredProofs();
  const proof = proofs.find(p => p.id === proofId);
  
  if (!proof) {
    return { success: false, error: 'Proof not found' };
  }
  
  try {
    // Verify with backend (skip local hash check if image not stored)
    const settings = await chrome.storage.local.get('settings');
    const apiEndpoint = settings.settings?.apiEndpoint || 'http://localhost:5000';
    
    // Make direct API call
    const response = await fetch(`${apiEndpoint}/api/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contentHash: proof.contentHash,
        ipfsCID: proof.ipfsCid,
        fingerprint: proof.fingerprint,
        timestamp: proof.timestamp,
        platform: proof.platform,
        model: proof.model
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Update proof status
    proof.verified = result.verified || false;
    await updateProof(proof);
    
    return { success: true, verified: result.verified, data: result };
    
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, error: error.message };
  }
}

// Register proof on platform
async function registerProofOnPlatform(proofId) {
  const proofs = await getStoredProofs();
  const proof = proofs.find(p => p.id === proofId);
  
  if (!proof) {
    return { success: false, error: 'Proof not found' };
  }
  
  try {
    // Use computeHash from background (already imported)
    // Don't use apiService.computeHash (it has dynamic import issue)
    const promptHash = await computeHash(proof.prompt);
    
    // Get creator address from storage (if connected with Web3)
    const result = await chrome.storage.local.get('walletAddress');
    const creatorAddress = result.walletAddress || '0x0000000000000000000000000000000000000000';
    
    const settings = await chrome.storage.local.get('settings');
    const apiEndpoint = settings.settings?.apiEndpoint || 'http://localhost:5000';
    
    // Make direct API call instead of using apiService
    const response = await fetch(`${apiEndpoint}/api/artworks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contentHash: proof.contentHash,
        promptHash: promptHash,
        ipfsCID: proof.ipfsCid,
        modelUsed: `${proof.platform}-${proof.model}`,
        metadataURI: proof.ipfsCid ? `ipfs://${proof.ipfsCid}` : null,
        certificateTokenId: null
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update proof status
    proof.registered = true;
    proof.registrationId = data.artwork?.id?.toString() || proof.contentHash;
    await updateProof(proof);
    
    return { 
      success: true, 
      registrationId: proof.registrationId,
      data: data 
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Update proof in storage
async function updateProof(updatedProof) {
  const proofs = await getStoredProofs();
  const index = proofs.findIndex(p => p.id === updatedProof.id);
  
  if (index !== -1) {
    proofs[index] = updatedProof;
    await chrome.storage.local.set({ proofs });
  }
}

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of activeSessions.entries()) {
    const sessionTime = new Date(session.timestamp).getTime();
    // Remove sessions older than 1 hour
    if (now - sessionTime > 60 * 60 * 1000) {
      activeSessions.delete(sessionId);
      console.log('Cleaned up stale session:', sessionId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

