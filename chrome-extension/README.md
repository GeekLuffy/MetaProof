# Proof of Art - Chrome Extension

A powerful Chrome extension that tracks and verifies AI-generated art across multiple platforms with cryptographic proof.

## 🎨 Features

- **Multi-Platform Support**: Automatically tracks art generation on:
  - Midjourney (Discord)
  - Google Gemini
  - ChatGPT / DALL-E
  - Bing Image Creator
  - Leonardo.ai
  - Stable Diffusion
  - And more!

- **Cryptographic Verification**:
  - SHA-256 content hashing
  - Browser fingerprinting
  - Timestamp verification
  - IPFS decentralized storage support

- **Automatic Tracking**:
  - Captures prompts in real-time
  - Tracks generated images
  - Records metadata and model information
  - Creates immutable proof records

- **IPFS Integration**:
  - Upload to Web3.Storage
  - Upload to NFT.Storage
  - Upload to Pinata
  - Automatic decentralized backup

## 🚀 Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "Proof of Art"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. The extension is now installed!

## 📖 Usage

### Getting Started

1. **Install the Extension**: Follow the installation steps above

2. **Configure Settings**:
   - Click the extension icon in your browser toolbar
   - Click the settings icon (⚙️)
   - Configure your API endpoint and IPFS provider credentials

3. **Start Creating**:
   - Navigate to any supported AI art platform
   - The extension will automatically track your prompts and generated images
   - View your proofs in the extension popup

### Creating a Proof

1. Open a supported platform (e.g., ChatGPT at https://chatgpt.com)
2. Enter your prompt and generate art
3. The extension automatically:
   - Captures your prompt
   - Records the generated image
   - Computes cryptographic hash
   - Uploads to IPFS (if enabled)
   - Creates a verifiable proof record

### Verifying a Proof

1. Open the extension popup
2. Click on any proof card
3. Click "Verify Proof"
4. The extension will:
   - Check the content hash
   - Verify with your backend API
   - Confirm IPFS availability

### Registering a Proof

1. Open the proof details
2. Click "Register on Platform"
3. The proof will be registered on your backend
4. You'll receive a registration ID for future reference

## ⚙️ Configuration

### API Endpoint

The extension is pre-configured to connect to your Proof-of-Art backend:
```
http://localhost:5000
```

For production, update this in the extension settings to your deployed backend URL.

### IPFS Providers

Configure at least one IPFS provider:

**Web3.Storage**:
1. Sign up at [web3.storage](https://web3.storage)
2. Get your API token
3. Enter it in the extension settings

**NFT.Storage**:
1. Sign up at [nft.storage](https://nft.storage)
2. Get your API token
3. Enter it in the extension settings

**Pinata**:
1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Get your API key and secret
3. Enter them in the extension settings

## 🔧 Backend API Integration

✅ **The extension is now fully integrated with your existing Proof-of-Art backend!**

Your backend provides the following endpoints:

### `POST /api/verify` ✅ Implemented
Verify a proof record by checking if it exists in your database

**Used by:** "Verify Proof" button in extension

### `POST /api/artworks` ✅ Implemented  
Register artwork in your database with all proof details

**Used by:** "Register" button in extension

### `GET /api/artworks/:contentHash` ✅ Implemented
Get artwork details by content hash

**Used by:** Proof status checks and verification

### `GET /api/artworks/my` ✅ Implemented
Get user's registered artworks (requires authentication)

**Used by:** Syncing with frontend when user connects wallet

### `GET /health` ✅ Implemented
Check backend health and connection status

**See [INTEGRATION.md](INTEGRATION.md) for complete API documentation**

## 📦 Data Export/Import

### Export Your Data
1. Open the extension settings
2. Click "Export All Proofs"
3. Save the JSON file

### Import Data
1. Open the extension settings
2. Click "Import Proofs"
3. Select your JSON export file

## 🔒 Privacy & Security

- All data is stored locally in your browser
- Proofs are encrypted with SHA-256 hashing
- Browser fingerprinting is used for authenticity verification
- No data is sent to third parties without your consent
- IPFS uploads are optional and user-controlled

## 🛠️ Development

### Project Structure
```
chrome-extension/
├── manifest.json           # Extension manifest
├── background.js          # Background service worker
├── content-script.js      # Content script for platform monitoring
├── popup.html/js          # Extension popup UI
├── options.html/js        # Settings page
├── styles/                # CSS files
├── utils/                 # Utility modules
│   ├── crypto.js         # Hashing and fingerprinting
│   ├── ipfs.js           # IPFS integration
│   └── api.js            # Backend API service
└── icons/                # Extension icons
```

### Building

This extension uses vanilla JavaScript with ES6 modules. No build process required!

### Testing

1. Load the extension in developer mode
2. Open the Chrome DevTools console
3. Navigate to supported platforms
4. Check console logs for tracking activity

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Visit our website: [your-proof-of-art-website.com](https://your-proof-of-art-website.com)
- Email: support@your-proof-of-art-website.com

## 🎯 Roadmap

- [ ] Support for more AI art platforms
- [ ] Enhanced metadata extraction
- [ ] Blockchain integration
- [ ] NFT minting support
- [ ] Social sharing features
- [ ] Batch verification
- [ ] Mobile app companion

## 📝 Changelog

### Version 1.0.0 (Initial Release)
- Multi-platform art tracking
- Cryptographic proof generation
- IPFS integration
- Verification and registration system
- Export/Import functionality

---

Made with ❤️ for artists and creators

