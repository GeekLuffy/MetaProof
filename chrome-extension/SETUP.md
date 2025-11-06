# Proof of Art Extension - Setup Guide

## Quick Start

### 1. Install the Extension

**Method 1: Developer Mode (Recommended for Testing)**

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. Extension installed! ✅

**Method 2: Chrome Web Store (Coming Soon)**

Will be available once published to the Chrome Web Store.

### 2. Initial Configuration

After installation:

1. **Click the extension icon** in your browser toolbar (puzzle piece icon)
2. **Click the settings icon** (⚙️) in the popup
3. Configure the following:

#### Required Settings:

**Backend API Endpoint**:
```
https://your-api-endpoint.com
```
> Replace with your actual backend API URL

#### Optional but Recommended:

**IPFS Configuration** (choose one):

- **Web3.Storage** (Recommended):
  1. Visit https://web3.storage
  2. Create account
  3. Generate API token
  4. Paste token in settings

- **NFT.Storage**:
  1. Visit https://nft.storage
  2. Create account
  3. Generate API token
  4. Paste token in settings

- **Pinata**:
  1. Visit https://pinata.cloud
  2. Create account
  3. Get API key and secret
  4. Paste both in settings

### 3. Test the Extension

1. Navigate to a supported platform:
   - https://chat.openai.com (ChatGPT)
   - https://gemini.google.com (Gemini)
   - https://www.bing.com/images/create (Bing)
   - Discord (for Midjourney)

2. Generate an image:
   - Enter a prompt
   - Wait for image generation
   - Extension will automatically capture it

3. View your proof:
   - Click the extension icon
   - See your new proof in the list
   - Click to view details

## Backend API Setup

You need to set up a backend API with these endpoints:

### Required Endpoints:

1. **POST /api/verify** - Verify a proof
2. **POST /api/register** - Register a proof
3. **GET /api/proof/:id** - Get proof status

### Example Backend (Node.js/Express):

```javascript
// Example API structure
app.post('/api/verify', async (req, res) => {
  const { contentHash, ipfsCid, fingerprint, timestamp, platform, model } = req.body;
  
  // Verify the proof
  // Check hash, validate timestamp, etc.
  
  res.json({
    verified: true,
    message: 'Proof verified successfully'
  });
});

app.post('/api/register', async (req, res) => {
  const proof = req.body;
  
  // Store proof in database
  // Generate registration ID
  
  res.json({
    success: true,
    registrationId: 'unique-id',
    message: 'Proof registered successfully'
  });
});

app.get('/api/proof/:id', async (req, res) => {
  // Get proof from database
  
  res.json({
    id: req.params.id,
    status: 'verified',
    registrationId: 'unique-id'
  });
});
```

## Troubleshooting

### Extension Not Tracking

**Issue**: Extension doesn't capture prompts or images

**Solutions**:
1. Check that tracking is enabled (green dot in popup)
2. Verify you're on a supported platform
3. Refresh the page
4. Check browser console for errors (F12)

### IPFS Upload Failing

**Issue**: Images not uploading to IPFS

**Solutions**:
1. Verify API token is correct
2. Check IPFS provider service status
3. Try a different provider
4. Disable auto-upload and upload manually

### API Verification Failing

**Issue**: Proofs fail to verify with backend

**Solutions**:
1. Check API endpoint URL is correct
2. Verify backend is running and accessible
3. Check CORS settings on backend
4. Review browser console for errors

### Images Not Captured

**Issue**: Generated images aren't detected

**Solutions**:
1. Wait a few seconds after generation
2. Platform might use custom image loading
3. Try right-clicking and "View Image"
4. Check content script console logs

## Advanced Configuration

### Custom Platform Support

To add support for a new platform, edit `content-script.js`:

```javascript
const platformMonitors = {
  yourplatform: {
    promptSelector: 'textarea.prompt-input',
    imageSelector: 'img.generated-image',
    monitorPrompts() {
      this.observeInputs(this.promptSelector);
    },
    monitorImages() {
      this.observeImages(this.imageSelector);
    }
  }
};
```

### Icon Customization

Replace the icon files in `/icons/` directory:
- icon16.png (16x16)
- icon32.png (32x32)
- icon48.png (48x48)
- icon128.png (128x128)

### Disable Specific Platforms

In the extension settings:
1. Scroll to "Supported Platforms"
2. Toggle off platforms you don't use

## Development Mode

### Enable Debug Logging

1. Open background script console:
   - Go to `chrome://extensions/`
   - Click "service worker" under the extension
2. All tracking events will be logged

### Test Without Backend

The extension will work without a backend, but:
- Verification will fail
- Registration will fail
- Local proof storage will work
- IPFS upload will work (if configured)

## Data Management

### Export Your Data

1. Settings → "Export All Proofs"
2. Save JSON file securely
3. Import on another device if needed

### Backup Recommendations

- Export proofs weekly
- Save IPFS CIDs separately
- Keep proof JSON files encrypted

### Clear Data

Settings → "Clear All Data"
⚠️ **WARNING**: This permanently deletes all proofs!

## Support

Need help?
- Check the main README.md
- Review browser console errors
- Open an issue on GitHub
- Contact support

## Next Steps

After setup:
1. ✅ Create your first proof
2. ✅ Verify it works
3. ✅ Register on your platform
4. ✅ Share your verified art!

Happy creating! 🎨

