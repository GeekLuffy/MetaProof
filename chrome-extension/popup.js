// Popup UI logic
import { computeHash } from './utils/crypto.js';

let proofs = [];
let trackingEnabled = true;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadProofs();
  await loadSettings();
  setupEventListeners();
  checkCurrentTab();
  updateUI();
});

// Load proofs from storage
async function loadProofs() {
  const result = await chrome.storage.local.get('proofs');
  proofs = result.proofs || [];
  displayProofs();
}

// Load settings
async function loadSettings() {
  const result = await chrome.storage.local.get('settings');
  trackingEnabled = result.settings?.trackingEnabled !== false;
  updateStatusBar();
}

// Check if current tab is on a supported platform
async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;
    
    const url = new URL(tab.url);
    const hostname = url.hostname;
    
    // Supported platforms
    const platforms = {
      'chatgpt.com': 'ChatGPT',
      'chat.openai.com': 'ChatGPT',
      'gemini.google.com': 'Gemini',
      'discord.com': 'Discord/Midjourney',
      'bing.com': 'Bing Image Creator',
      'leonardo.ai': 'Leonardo.ai',
      'craiyon.com': 'Craiyon',
      'stablediffusionweb.com': 'Stable Diffusion'
    };
    
    // Check if hostname matches any platform
    let platformName = null;
    for (const [domain, name] of Object.entries(platforms)) {
      if (hostname.includes(domain.replace('*.', ''))) {
        platformName = name;
        break;
      }
    }
    
    // Also check for midjourney in discord
    if (hostname.includes('discord.com') && (tab.title?.toLowerCase().includes('midjourney') || url.pathname.includes('midjourney'))) {
      platformName = 'Midjourney';
    }
    
    // Show platform status if on supported site
    const platformStatus = document.getElementById('platformStatus');
    const platformNameEl = document.getElementById('platformName');
    const statusText = document.getElementById('statusText');
    
    if (platformName && trackingEnabled) {
      platformStatus.style.display = 'flex';
      platformNameEl.textContent = `Active on ${platformName}`;
      statusText.textContent = `Tracking ${platformName}`;
      document.getElementById('statusDot').classList.add('active', 'pulsing');
    } else if (platformName && !trackingEnabled) {
      platformStatus.style.display = 'flex';
      platformNameEl.textContent = `${platformName} detected`;
      statusText.textContent = 'Tracking disabled';
      document.getElementById('statusDot').classList.remove('active', 'pulsing');
    } else {
      platformStatus.style.display = 'none';
      document.getElementById('statusDot').classList.remove('pulsing');
    }
    
  } catch (error) {
    console.error('Error checking current tab:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // Toggle tracking
  document.getElementById('toggleTracking').addEventListener('click', toggleTracking);
  
  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  
  // Open website button
  document.getElementById('openWebsite').addEventListener('click', openWebsite);
  
  // Search input
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  
  // Close modal
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('proofModal').addEventListener('click', (e) => {
    if (e.target.id === 'proofModal') closeModal();
  });
  
  // Listen for background messages
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SESSION_STARTED') {
      addActivityItem('Tracking started', message.data.platform);
    }
  });
}

// Switch tabs
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}Tab`);
  });
}

// Display proofs
function displayProofs(proofsToDisplay = proofs) {
  const proofsList = document.getElementById('proofsList');
  const emptyState = document.getElementById('emptyState');
  
  if (proofsToDisplay.length === 0) {
    proofsList.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }
  
  proofsList.style.display = 'block';
  emptyState.style.display = 'none';
  
  proofsList.innerHTML = proofsToDisplay.map(proof => {
    const proofId = proof.id;
    return `
    <div class="proof-card" data-proof-id="${proofId}">
      <div class="proof-image">
        ${proof.ipfsCid ? 
          `<img src="https://ipfs.io/ipfs/${proof.ipfsCid}" alt="Generated art" onerror="this.parentElement.innerHTML='<div class=\'image-placeholder\'>View on IPFS</div>'">` :
          proof.imageData ? 
            `<img src="${proof.imageData}" alt="Generated art" onerror="this.parentElement.innerHTML='<div class=\'image-placeholder\'>Image Preview</div>'">` :
            '<div class="image-placeholder">Image on IPFS</div>'
        }
        ${proof.verified ? '<span class="badge badge-success">Verified</span>' : ''}
        ${proof.registered ? '<span class="badge badge-primary">Registered</span>' : ''}
      </div>
      <div class="proof-info">
        <div class="proof-header">
          <span class="proof-platform">${proof.platform}</span>
          <span class="proof-time">${formatTime(proof.timestamp)}</span>
        </div>
        <p class="proof-prompt">${truncate(proof.prompt, 80)}</p>
        <div class="proof-meta">
          <span title="Content Hash">${truncate(proof.contentHash, 16)}</span>
          ${proof.ipfsCid ? `<span title="IPFS CID">${truncate(proof.ipfsCid, 16)}</span>` : ''}
        </div>
        <div class="proof-actions">
          <button class="btn-small view-btn" data-proof-id="${proofId}">View</button>
          ${!proof.verified ? `<button class="btn-small btn-primary verify-btn" data-proof-id="${proofId}">Verify</button>` : ''}
          ${!proof.registered ? `<button class="btn-small btn-success register-btn" data-proof-id="${proofId}">Register</button>` : ''}
        </div>
      </div>
    </div>
  `;
  }).join('');
  
  // Add event listeners to buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => viewProof(btn.dataset.proofId));
  });
  
  document.querySelectorAll('.verify-btn').forEach(btn => {
    btn.addEventListener('click', () => verifyProof(btn.dataset.proofId));
  });
  
  document.querySelectorAll('.register-btn').forEach(btn => {
    btn.addEventListener('click', () => registerProof(btn.dataset.proofId));
  });
}

// View proof details
window.viewProof = async function(proofId) {
  // Reload proofs to get full data
  await loadProofs();
  const proof = proofs.find(p => p.id === proofId);
  if (!proof) {
    showNotification('Proof not found', 'error');
    return;
  }
  
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="proof-detail">
      <div class="detail-image">
        ${proof.ipfsCid ? 
          `<img src="https://ipfs.io/ipfs/${proof.ipfsCid}" alt="Generated art" onerror="this.parentElement.innerHTML='<p>Image on IPFS: ${proof.ipfsCid}</p>'">` :
          proof.imageData ? 
            `<img src="${proof.imageData}" alt="Generated art" onerror="this.parentElement.innerHTML='<p>Image preview not available</p>'">` :
            '<p>Image stored on IPFS. Use IPFS CID to view.</p>'
        }
      </div>
      
      <div class="detail-section">
        <h3>Platform & Model</h3>
        <p><strong>Platform:</strong> ${proof.platform}</p>
        <p><strong>Model:</strong> ${proof.model}</p>
        <p><strong>Content Type:</strong> ${proof.contentType}</p>
      </div>
      
      <div class="detail-section">
        <h3>Prompt</h3>
        <p class="prompt-text">${proof.prompt}</p>
      </div>
      
      <div class="detail-section">
        <h3>Cryptographic Proof</h3>
        <p><strong>Content Hash:</strong><br><code>${proof.contentHash}</code></p>
        ${proof.ipfsCid ? `<p><strong>IPFS CID:</strong><br><code>${proof.ipfsCid}</code></p>` : ''}
        <p><strong>Fingerprint:</strong><br><code>${proof.fingerprint}</code></p>
      </div>
      
      <div class="detail-section">
        <h3>Timestamps</h3>
        <p><strong>Prompt:</strong> ${new Date(proof.timestamp).toLocaleString()}</p>
        <p><strong>Generated:</strong> ${new Date(proof.generatedAt).toLocaleString()}</p>
      </div>
      
      <div class="detail-section">
        <h3>Status</h3>
        <p><strong>Verified:</strong> ${proof.verified ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Registered:</strong> ${proof.registered ? '✅ Yes' : '❌ No'}</p>
        ${proof.registrationId ? `<p><strong>Registration ID:</strong> ${proof.registrationId}</p>` : ''}
      </div>
      
      <div class="detail-actions">
        ${!proof.verified ? '<button class="btn btn-primary" onclick="verifyProofFromModal(\'' + proof.id + '\')">Verify Proof</button>' : ''}
        ${!proof.registered ? '<button class="btn btn-success" onclick="registerProofFromModal(\'' + proof.id + '\')">Register on Platform</button>' : ''}
        ${proof.ipfsCid ? '<button class="btn btn-secondary" onclick="openIPFS(\'' + proof.ipfsCid + '\')">View on IPFS</button>' : ''}
        <button class="btn btn-secondary" onclick="downloadProof(\'' + proof.id + '\')">Download Proof</button>
      </div>
    </div>
  `;
  
  document.getElementById('proofModal').style.display = 'flex';
};

// Verify proof
window.verifyProof = async function(proofId) {
  showLoading('Verifying proof...');
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'VERIFY_PROOF',
      data: proofId
    });
    
    if (response.success) {
      showNotification('Proof verified successfully!', 'success');
      await loadProofs();
    } else {
      showNotification('Verification failed: ' + response.error, 'error');
    }
  } catch (error) {
    showNotification('Verification error: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
};

window.verifyProofFromModal = async function(proofId) {
  closeModal();
  await verifyProof(proofId);
};

// Register proof
window.registerProof = async function(proofId) {
  showLoading('Registering proof...');
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'REGISTER_PROOF',
      data: proofId
    });
    
    if (response.success) {
      showNotification('Proof registered successfully!', 'success');
      await loadProofs();
    } else {
      showNotification('Registration failed: ' + response.error, 'error');
    }
  } catch (error) {
    showNotification('Registration error: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
};

window.registerProofFromModal = async function(proofId) {
  closeModal();
  await registerProof(proofId);
};

// Open IPFS
window.openIPFS = function(cid) {
  chrome.tabs.create({ url: `https://ipfs.io/ipfs/${cid}` });
};

// Download proof
window.downloadProof = function(proofId) {
  const proof = proofs.find(p => p.id === proofId);
  if (!proof) return;
  
  const proofData = {
    ...proof,
    imageData: undefined // Don't include full image data in JSON
  };
  
  const dataStr = JSON.stringify(proofData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `proof-${proof.id}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
};

// Close modal
function closeModal() {
  document.getElementById('proofModal').style.display = 'none';
}

// Toggle tracking
async function toggleTracking() {
  trackingEnabled = !trackingEnabled;
  
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || {};
  settings.trackingEnabled = trackingEnabled;
  
  await chrome.storage.local.set({ settings });
  updateStatusBar();
  checkCurrentTab(); // Re-check to update platform status
}

// Update status bar
function updateStatusBar() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const toggleBtn = document.getElementById('toggleTracking');
  
  if (trackingEnabled) {
    statusDot.classList.add('active');
    if (!statusText.textContent.includes('Active on')) {
      statusText.textContent = 'Tracking enabled';
    }
    toggleBtn.textContent = 'Disable';
    toggleBtn.classList.remove('btn-success');
  } else {
    statusDot.classList.remove('active', 'pulsing');
    statusText.textContent = 'Tracking disabled';
    toggleBtn.textContent = 'Enable';
    toggleBtn.classList.add('btn-success');
    document.getElementById('platformStatus').style.display = 'none';
  }
  
  // Re-check current tab to update platform status
  checkCurrentTab();
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  
  if (!query) {
    displayProofs();
    return;
  }
  
  const filtered = proofs.filter(proof => 
    proof.prompt.toLowerCase().includes(query) ||
    proof.platform.toLowerCase().includes(query) ||
    proof.model.toLowerCase().includes(query) ||
    proof.contentHash.toLowerCase().includes(query)
  );
  
  displayProofs(filtered);
}

// Add activity item
function addActivityItem(message, platform) {
  // This could be expanded to show real-time activity
  console.log('Activity:', message, platform);
}

// Open settings
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Open website
function openWebsite() {
  chrome.tabs.create({ url: 'https://your-proof-of-art-website.com' });
}

// Update UI
function updateUI() {
  // Update proof count, etc.
}

// Utility functions
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

function truncate(str, length) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

function showLoading(message) {
  // Could implement a loading overlay
  console.log('Loading:', message);
}

function hideLoading() {
  // Hide loading overlay
}

function showNotification(message, type = 'info') {
  // Could implement a toast notification system
  console.log(`[${type}]`, message);
  
  // Use browser notification for now
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Proof of Art',
    message: message
  });
}

