// Cryptographic utilities for hashing and fingerprinting

/**
 * Compute SHA-256 hash of data
 * @param {string} data - Data to hash (base64 or string)
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function computeHash(data) {
  try {
    // Convert data URL to array buffer if needed
    let buffer;
    
    if (data.startsWith('data:')) {
      // Extract base64 data
      const base64 = data.split(',')[1];
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      buffer = bytes.buffer;
    } else {
      // Assume it's a string
      const encoder = new TextEncoder();
      buffer = encoder.encode(data);
    }
    
    // Compute SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
    
  } catch (error) {
    console.error('Hash computation error:', error);
    throw error;
  }
}

/**
 * Generate browser fingerprint for proof authenticity
 * @returns {Promise<string>} Fingerprint hash
 */
export async function generateFingerprint() {
  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages.join(','),
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    timestamp: Date.now()
  };
  
  // Only add screen/DOM-dependent features if available (not in service worker)
  if (typeof screen !== 'undefined') {
    components.screenResolution = `${screen.width}x${screen.height}`;
    components.colorDepth = screen.colorDepth;
  }
  
  if (typeof navigator.maxTouchPoints !== 'undefined') {
    components.touchSupport = navigator.maxTouchPoints > 0;
  }
  
  // Only add WebGL/Canvas if document is available
  if (typeof document !== 'undefined') {
    components.webgl = await getWebGLFingerprint();
    components.canvas = await getCanvasFingerprint();
  }
  
  const fingerprintString = JSON.stringify(components);
  return await computeHash(fingerprintString);
}

/**
 * Get WebGL fingerprint
 * @returns {string} WebGL renderer info
 */
async function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'no-webgl';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';
    
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    return `${vendor}~${renderer}`;
    
  } catch (error) {
    return 'webgl-error';
  }
}

/**
 * Get Canvas fingerprint
 * @returns {Promise<string>} Canvas fingerprint hash
 */
async function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw test pattern
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 100, 50);
    ctx.fillStyle = '#069';
    ctx.fillText('Proof of Art', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Fingerprint', 4, 35);
    
    const dataURL = canvas.toDataURL();
    return await computeHash(dataURL);
    
  } catch (error) {
    return 'canvas-error';
  }
}

/**
 * Compute multiple hash algorithms for enhanced verification
 * @param {string} data - Data to hash
 * @returns {Promise<object>} Object with multiple hashes
 */
export async function computeMultiHash(data) {
  const sha256 = await computeHash(data);
  
  return {
    sha256,
    timestamp: Date.now(),
    length: data.length
  };
}

/**
 * Verify hash matches data
 * @param {string} data - Original data
 * @param {string} expectedHash - Expected hash
 * @returns {Promise<boolean>} True if hash matches
 */
export async function verifyHash(data, expectedHash) {
  const actualHash = await computeHash(data);
  return actualHash === expectedHash;
}

