// Content Script - Injected into AI art platforms
console.log('Proof of Art: Content script loaded');

// Platform detection
const platformDetectors = {
  midjourney: () => window.location.hostname.includes('midjourney'),
  discord: () => window.location.hostname.includes('discord.com'),
  gemini: () => window.location.hostname.includes('gemini.google.com'),
  openai: () => window.location.hostname.includes('chat.openai.com') || window.location.hostname.includes('chatgpt.com'),
  bing: () => window.location.hostname.includes('bing.com') && window.location.pathname.includes('create'),
  leonardo: () => window.location.hostname.includes('leonardo.ai'),
  craiyon: () => window.location.hostname.includes('craiyon.com'),
  stablediffusion: () => window.location.hostname.includes('stablediffusion')
};

// Detect current platform
function detectPlatform() {
  for (const [name, detector] of Object.entries(platformDetectors)) {
    if (detector()) return name;
  }
  return 'unknown';
}

const currentPlatform = detectPlatform();
console.log('Detected platform:', currentPlatform);

// Platform-specific monitors
const platformMonitors = {
  midjourney: {
    promptSelector: 'input[placeholder*="prompt" i], textarea[placeholder*="imagine" i]',
    imageSelector: 'img[src*="cdn.midjourney.com"]',
    monitorPrompts() {
      this.observeInputs(this.promptSelector);
    },
    monitorImages() {
      this.observeImages(this.imageSelector);
    }
  },
  
  gemini: {
    promptSelector: 'textarea, div[contenteditable="true"]',
    imageSelector: 'img[src*="googleusercontent.com"], img[alt*="generated" i]',
    monitorPrompts() {
      this.observeInputs(this.promptSelector);
    },
    monitorImages() {
      this.observeImages(this.imageSelector);
    }
  },
  
  openai: {
    promptSelector: 'textarea#prompt-textarea, textarea[placeholder*="Message" i], div[contenteditable="true"]',
    imageSelector: 'img[src*="oaiusercontent.com"], img[src*="openai.com"], img[alt*="generated" i], button[aria-label*="image" i] img',
    monitorPrompts() {
      this.observeInputs(this.promptSelector);
      
      // Also monitor for button clicks (submit)
      document.addEventListener('click', (e) => {
        const submitBtn = e.target.closest('button[data-testid="send-button"], button[aria-label*="Send" i]');
        if (submitBtn) {
          const textarea = document.querySelector('textarea#prompt-textarea, textarea[placeholder*="Message" i]');
          if (textarea && textarea.value) {
            setTimeout(() => capturePrompt(textarea), 500);
          }
        }
      });
    },
    monitorImages() {
      this.observeImages(this.imageSelector);
      
      // ChatGPT often loads images in a lazy way, so we need aggressive monitoring
      const checkForImages = () => {
        const images = document.querySelectorAll(this.imageSelector);
        images.forEach(img => {
          if (!img.dataset.poaProcessed && img.complete && img.naturalWidth > 100) {
            img.dataset.poaProcessed = 'true';
            handleNewImage(img);
          }
        });
      };
      
      // Check every 2 seconds for new images
      setInterval(checkForImages, 2000);
    }
  },
  
  bing: {
    promptSelector: 'textarea#sb_form_q',
    imageSelector: 'img.mimg',
    monitorPrompts() {
      this.observeInputs(this.promptSelector);
    },
    monitorImages() {
      this.observeImages(this.imageSelector);
    }
  }
};

// Add common methods to all platform monitors
Object.values(platformMonitors).forEach(monitor => {
  monitor.observeInputs = function(selector) {
    // Use MutationObserver to detect when textareas appear
    const observer = new MutationObserver(() => {
      const inputs = document.querySelectorAll(selector);
      inputs.forEach(input => {
        if (!input.dataset.poaTracked) {
          input.dataset.poaTracked = 'true';
          console.log('✅ Proof of Art: Tracking input element');
          
          // Track on submit (Enter key or button click)
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && input.value && input.value.length > 3) {
              console.log('✅ Enter key detected, will capture prompt');
              setTimeout(() => capturePrompt(input), 500);
            }
          });
          
          // Also capture on blur (when user clicks away)
          input.addEventListener('blur', () => {
            if (input.value && input.value.length > 3) {
              setTimeout(() => capturePrompt(input), 200);
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also process existing inputs
    const inputs = document.querySelectorAll(selector);
    inputs.forEach(input => {
      if (!input.dataset.poaTracked) {
        input.dataset.poaTracked = 'true';
        
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey && input.value && input.value.length > 3) {
            setTimeout(() => capturePrompt(input), 500);
          }
        });
      }
    });
  };
  
  monitor.observeImages = function(selector) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const images = node.matches?.(selector) 
              ? [node] 
              : Array.from(node.querySelectorAll?.(selector) || []);
            
            images.forEach(img => {
              if (!img.dataset.poaProcessed) {
                img.dataset.poaProcessed = 'true';
                handleNewImage(img);
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Process existing images
    const existingImages = document.querySelectorAll(selector);
    existingImages.forEach(img => {
      if (!img.dataset.poaProcessed) {
        img.dataset.poaProcessed = 'true';
        handleNewImage(img);
      }
    });
  };
});

// Capture prompt
function capturePrompt(inputElement) {
  const prompt = inputElement.value || inputElement.textContent || inputElement.innerText;
  
  if (!prompt || prompt.trim().length < 3) return;
  
  console.log('✅ Proof of Art: Prompt captured:', prompt.substring(0, 50) + '...');
  
  // Extract additional metadata
  const metadata = extractMetadata();
  
  // Send to background
  chrome.runtime.sendMessage({
    type: 'PROMPT_DETECTED',
    data: {
      prompt: prompt.trim(),
      platform: currentPlatform,
      url: window.location.href,
      metadata
    }
  }).then(() => {
    console.log('✅ Proof of Art: Prompt sent to background');
  }).catch(err => console.error('❌ Failed to send prompt:', err));
}

// Handle new image
async function handleNewImage(imgElement) {
  // Wait for image to fully load
  if (!imgElement.complete) {
    imgElement.addEventListener('load', () => handleNewImage(imgElement), { once: true });
    return;
  }
  
  // Skip small images (icons, avatars)
  if (imgElement.naturalWidth < 100 || imgElement.naturalHeight < 100) {
    return;
  }
  
  console.log('✅ Proof of Art: New image detected', imgElement.naturalWidth + 'x' + imgElement.naturalHeight);
  
  try {
    // Convert image to data URL
    const imageData = await imageToDataURL(imgElement);
    
    if (!imageData) {
      console.warn('⚠️ Could not extract image data');
      return;
    }
    
    console.log('✅ Image converted to data URL');
    
    // Extract metadata
    const metadata = extractImageMetadata(imgElement);
    
    // Detect model (platform-specific)
    const model = detectModel();
    
    // Send to background
    chrome.runtime.sendMessage({
      type: 'IMAGE_GENERATED',
      data: {
        imageData,
        contentType: 'image/png',
        model,
        metadata
      }
    }).then(() => {
      console.log('✅ Proof of Art: Image sent to background successfully!');
    }).catch(err => console.error('❌ Failed to send image:', err));
    
  } catch (error) {
    console.error('❌ Error processing image:', error);
  }
}

// Convert image element to data URL (with compression)
async function imageToDataURL(imgElement, quality = 0.8) {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Limit max dimensions to reduce storage (max 2048px)
    const maxDimension = 2048;
    let width = imgElement.naturalWidth || imgElement.width;
    let height = imgElement.naturalHeight || imgElement.height;
    
    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw image
    ctx.drawImage(imgElement, 0, 0, width, height);
    
    // Convert to data URL with compression (JPEG is smaller than PNG)
    return canvas.toDataURL('image/jpeg', quality);
    
  } catch (error) {
    console.error('Canvas conversion failed:', error);
    
    // Fallback: try to fetch the image
    try {
      const response = await fetch(imgElement.src);
      const blob = await response.blob();
      return await blobToDataURL(blob);
    } catch (fetchError) {
      console.error('Fetch fallback failed:', fetchError);
      return null;
    }
  }
}

// Convert blob to data URL
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Extract general metadata
function extractMetadata() {
  return {
    title: document.title,
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    platform: currentPlatform
  };
}

// Extract image-specific metadata
function extractImageMetadata(imgElement) {
  return {
    src: imgElement.src,
    alt: imgElement.alt || '',
    width: imgElement.naturalWidth || imgElement.width,
    height: imgElement.naturalHeight || imgElement.height,
    className: imgElement.className,
    id: imgElement.id
  };
}

// Detect model based on platform
function detectModel() {
  const modelDetectors = {
    midjourney: () => {
      // Try to extract version from UI
      const versionText = document.body.textContent;
      if (versionText.includes('v6')) return 'midjourney-v6';
      if (versionText.includes('v5')) return 'midjourney-v5';
      return 'midjourney';
    },
    gemini: () => {
      const modelText = document.body.textContent;
      if (modelText.includes('Gemini Pro')) return 'gemini-pro';
      if (modelText.includes('Gemini Ultra')) return 'gemini-ultra';
      return 'gemini';
    },
    openai: () => {
      const modelText = document.body.textContent;
      if (modelText.includes('DALL-E 3')) return 'dall-e-3';
      if (modelText.includes('DALL-E 2')) return 'dall-e-2';
      return 'dall-e';
    },
    bing: () => 'bing-image-creator',
    leonardo: () => 'leonardo-ai',
    craiyon: () => 'craiyon',
    stablediffusion: () => 'stable-diffusion'
  };
  
  const detector = modelDetectors[currentPlatform];
  return detector ? detector() : currentPlatform;
}

// Initialize monitoring
function initializeMonitoring() {
  const monitor = platformMonitors[currentPlatform];
  
  if (monitor) {
    console.log('Initializing platform monitor for:', currentPlatform);
    monitor.monitorPrompts();
    monitor.monitorImages();
  } else {
    console.log('No specific monitor for platform:', currentPlatform);
    // Use generic monitoring
    genericMonitoring();
  }
}

// Generic monitoring for unknown platforms
function genericMonitoring() {
  // Monitor all textareas and contenteditable elements
  const inputSelectors = 'textarea, input[type="text"], div[contenteditable="true"]';
  const imageSelectors = 'img';
  
  platformMonitors.generic = {
    promptSelector: inputSelectors,
    imageSelector: imageSelectors,
    observeInputs: platformMonitors.gemini.observeInputs,
    observeImages: platformMonitors.gemini.observeImages
  };
  
  platformMonitors.generic.observeInputs(inputSelectors);
  platformMonitors.generic.observeImages(imageSelectors);
}

// Start monitoring when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMonitoring);
} else {
  initializeMonitoring();
}

// Re-initialize when page changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed, reinitializing...');
    setTimeout(initializeMonitoring, 1000);
  }
}).observe(document, { subtree: true, childList: true });

