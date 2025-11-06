// Options page logic

let settings = {};

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
  populateSettings();
});

// Load settings from storage
async function loadSettings() {
  const result = await chrome.storage.local.get('settings');
  settings = result.settings || {
    trackingEnabled: true,
    autoUploadIPFS: true,
    showNotifications: true,
    apiEndpoint: '',
    web3StorageToken: '',
    nftStorageToken: '',
    pinataApiKey: '',
    pinataApiSecret: '',
    platforms: {
      midjourney: true,
      gemini: true,
      openai: true,
      bing: true,
      leonardo: true,
      stablediffusion: true
    }
  };
}

// Setup event listeners
function setupEventListeners() {
  // Save settings button
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  // Data management buttons
  document.getElementById('exportData').addEventListener('click', exportData);
  document.getElementById('importData').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });
  document.getElementById('importFileInput').addEventListener('change', importData);
  document.getElementById('clearData').addEventListener('click', clearData);
  
  // Auto-save on toggle changes
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      showSaveStatus('Unsaved changes', 'warning');
    });
  });
  
  document.querySelectorAll('input[type="text"], input[type="url"], input[type="password"]').forEach(input => {
    input.addEventListener('input', () => {
      showSaveStatus('Unsaved changes', 'warning');
    });
  });
}

// Populate settings in UI
function populateSettings() {
  // General settings
  document.getElementById('trackingEnabled').checked = settings.trackingEnabled;
  document.getElementById('autoUploadIPFS').checked = settings.autoUploadIPFS;
  document.getElementById('showNotifications').checked = settings.showNotifications;
  
  // API configuration
  document.getElementById('apiEndpoint').value = settings.apiEndpoint || '';
  
  // IPFS configuration
  document.getElementById('web3StorageToken').value = settings.web3StorageToken || '';
  document.getElementById('nftStorageToken').value = settings.nftStorageToken || '';
  document.getElementById('pinataApiKey').value = settings.pinataApiKey || '';
  document.getElementById('pinataApiSecret').value = settings.pinataApiSecret || '';
  
  // Platform toggles
  document.querySelectorAll('.platform-toggle').forEach(toggle => {
    const platform = toggle.dataset.platform;
    toggle.checked = settings.platforms?.[platform] !== false;
  });
}

// Switch IPFS provider tabs
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Update tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === tabName);
  });
}

// Save settings
async function saveSettings() {
  try {
    // Collect settings from UI
    const newSettings = {
      trackingEnabled: document.getElementById('trackingEnabled').checked,
      autoUploadIPFS: document.getElementById('autoUploadIPFS').checked,
      showNotifications: document.getElementById('showNotifications').checked,
      apiEndpoint: document.getElementById('apiEndpoint').value.trim(),
      web3StorageToken: document.getElementById('web3StorageToken').value.trim(),
      nftStorageToken: document.getElementById('nftStorageToken').value.trim(),
      pinataApiKey: document.getElementById('pinataApiKey').value.trim(),
      pinataApiSecret: document.getElementById('pinataApiSecret').value.trim(),
      platforms: {}
    };
    
    // Collect platform settings
    document.querySelectorAll('.platform-toggle').forEach(toggle => {
      const platform = toggle.dataset.platform;
      newSettings.platforms[platform] = toggle.checked;
    });
    
    // Save to storage
    await chrome.storage.local.set({ settings: newSettings });
    settings = newSettings;
    
    showSaveStatus('Settings saved successfully!', 'success');
    
    // Notify background script
    chrome.runtime.sendMessage({
      type: 'SETTINGS_UPDATED',
      data: newSettings
    }).catch(() => {}); // Ignore if background is not ready
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showSaveStatus('Error saving settings: ' + error.message, 'error');
  }
}

// Show save status
function showSaveStatus(message, type = 'info') {
  const statusEl = document.getElementById('saveStatus');
  statusEl.textContent = message;
  statusEl.className = `save-status ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'save-status';
    }, 3000);
  }
}

// Export data
async function exportData() {
  try {
    const result = await chrome.storage.local.get(['proofs', 'settings']);
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      proofs: result.proofs || [],
      settings: result.settings || {}
    };
    
    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `proof-of-art-export-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showSaveStatus('Data exported successfully!', 'success');
    
  } catch (error) {
    console.error('Export error:', error);
    showSaveStatus('Error exporting data: ' + error.message, 'error');
  }
}

// Import data
async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const importData = JSON.parse(text);
    
    // Validate import data
    if (!importData.version || !importData.proofs) {
      throw new Error('Invalid export file format');
    }
    
    // Confirm import
    if (!confirm(`Import ${importData.proofs.length} proofs? This will merge with existing data.`)) {
      return;
    }
    
    // Merge with existing data
    const result = await chrome.storage.local.get(['proofs', 'settings']);
    const existingProofs = result.proofs || [];
    const existingSettings = result.settings || {};
    
    // Merge proofs (avoid duplicates by ID)
    const proofIds = new Set(existingProofs.map(p => p.id));
    const newProofs = importData.proofs.filter(p => !proofIds.has(p.id));
    const mergedProofs = [...existingProofs, ...newProofs];
    
    // Optionally merge settings
    const mergeSettings = confirm('Also import settings?');
    const finalSettings = mergeSettings 
      ? { ...existingSettings, ...importData.settings }
      : existingSettings;
    
    // Save merged data
    await chrome.storage.local.set({
      proofs: mergedProofs,
      settings: finalSettings
    });
    
    if (mergeSettings) {
      await loadSettings();
      populateSettings();
    }
    
    showSaveStatus(`Imported ${newProofs.length} new proofs!`, 'success');
    
  } catch (error) {
    console.error('Import error:', error);
    showSaveStatus('Error importing data: ' + error.message, 'error');
  }
  
  // Reset file input
  event.target.value = '';
}

// Clear data
async function clearData() {
  if (!confirm('Are you sure you want to delete ALL proofs? This cannot be undone!')) {
    return;
  }
  
  if (!confirm('This will permanently delete all your proof data. Continue?')) {
    return;
  }
  
  try {
    // Keep settings, only clear proofs
    await chrome.storage.local.set({ proofs: [] });
    
    showSaveStatus('All proof data cleared!', 'success');
    
  } catch (error) {
    console.error('Clear data error:', error);
    showSaveStatus('Error clearing data: ' + error.message, 'error');
  }
}

