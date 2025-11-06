# Proof of Art - Chrome Extension Project Overview

## 🎯 Project Purpose

A Chrome extension that automatically tracks and creates cryptographic proof of AI-generated art across multiple platforms. When users create art on platforms like Midjourney, ChatGPT/DALL-E, or Gemini, the extension captures the prompt, generated image, and metadata, creating a verifiable proof of creation that can be registered and verified.

## 🏗️ Architecture

### Extension Components

```
chrome-extension/
├── manifest.json              # Extension configuration
├── background.js             # Service worker (main logic)
├── content-script.js         # Platform monitoring
├── popup.html/js             # User interface
├── options.html/js           # Settings page
├── styles/                   # CSS files
│   ├── popup.css
│   └── options.css
├── utils/                    # Utility modules
│   ├── crypto.js            # Hashing & fingerprinting
│   ├── ipfs.js              # IPFS integration
│   └── api.js               # Backend communication
└── icons/                    # Extension icons
```

### Data Flow

```
1. User creates art on platform
   ↓
2. Content script detects prompt input
   ↓
3. Tracks image generation
   ↓
4. Sends to background worker
   ↓
5. Computes hash & fingerprint
   ↓
6. Optionally uploads to IPFS
   ↓
7. Creates proof record
   ↓
8. Stores locally in Chrome storage
   ↓
9. Optionally sends to backend API
   ↓
10. User can verify & register
```

## 🔑 Key Features

### 1. Multi-Platform Support
- **Midjourney** (Discord)
- **ChatGPT / DALL-E** (OpenAI)
- **Google Gemini**
- **Bing Image Creator**
- **Leonardo.ai**
- **Stable Diffusion**
- Extensible to more platforms

### 2. Cryptographic Proof
- **SHA-256 Content Hashing**: Unique hash of generated image
- **Browser Fingerprinting**: Authenticates the creation environment
- **Timestamp Recording**: When prompt was entered and image generated
- **Metadata Capture**: Platform, model, prompt, and more

### 3. IPFS Integration
- Upload to **Web3.Storage**
- Upload to **NFT.Storage**
- Upload to **Pinata**
- Decentralized, permanent storage
- Returns IPFS CID for verification

### 4. Proof Record Structure
```javascript
{
  id: "unique-uuid",
  sessionId: "tracking-session-id",
  prompt: "user's prompt text",
  platform: "midjourney",
  model: "midjourney-v6",
  contentType: "image/png",
  contentHash: "sha256-hash",
  ipfsCid: "Qm...",
  fingerprint: "browser-fingerprint-hash",
  timestamp: "prompt-timestamp",
  generatedAt: "generation-timestamp",
  metadata: { /* additional data */ },
  imageData: "base64-data-url",
  verified: false,
  registered: false
}
```

## 🔧 Technical Implementation

### Background Service Worker
- Manages extension lifecycle
- Receives messages from content scripts
- Computes hashes and fingerprints
- Handles IPFS uploads
- Communicates with backend API
- Manages proof storage

### Content Scripts
- Injected into AI art platforms
- Monitors DOM for prompts and images
- Platform-specific selectors
- Mutation observers for dynamic content
- Captures images via Canvas API
- Sends data to background worker

### Popup Interface
- Displays all proofs
- Search and filter functionality
- Proof detail modal
- Verification buttons
- Registration buttons
- Export functionality

### Options Page
- General settings (tracking on/off)
- API endpoint configuration
- IPFS provider setup
- Platform enable/disable
- Data import/export
- Clear data functionality

## 🔐 Security & Privacy

### Local Storage
- All proofs stored in Chrome's local storage
- Encrypted with SHA-256 hashing
- No data sent without user consent
- User controls IPFS uploads

### Fingerprinting
- Browser fingerprinting for authenticity
- Non-invasive (standard browser APIs)
- Cannot be used for tracking across sites
- Only for proof verification

### IPFS Privacy
- Upload is optional
- User provides their own API keys
- Direct upload (no intermediary)
- Content is public on IPFS (by design)

## 📡 Backend API

### Required Endpoints
1. `POST /api/verify` - Verify proof authenticity
2. `POST /api/register` - Register proof on platform
3. `GET /api/proof/:id` - Get proof details
4. `GET /api/search` - Search proofs
5. `POST /api/check-hash` - Check if hash exists
6. `GET /api/user/proofs` - Get user's proofs

### Example Backend Included
- Node.js/Express implementation
- In-memory storage (example)
- All required endpoints
- Ready to extend with database

## 🚀 Deployment

### Extension Installation
1. Load unpacked in Chrome
2. Generate icons (HTML tool or Python)
3. Configure settings
4. Start using!

### Backend Deployment
1. Set up Node.js server
2. Install dependencies
3. Configure database (MongoDB/PostgreSQL)
4. Add authentication
5. Deploy to cloud (AWS/Heroku/Vercel)

## 🎨 Use Cases

### For Artists
- Prove ownership of AI-generated art
- Create verifiable portfolio
- Protect against theft/copying
- Timestamp creative process

### For Platforms
- Verify art authenticity
- Combat plagiarism
- Provide certificates of authenticity
- Build trust with community

### For Collectors
- Verify original creator
- Check creation timestamp
- Validate provenance
- Ensure authenticity before purchase

## 🔄 Extension Workflow

### Creating a Proof
1. User opens AI art platform
2. Extension activates automatically
3. User enters prompt
4. Extension captures prompt details
5. User generates image
6. Extension captures image
7. Computes hash and fingerprint
8. Uploads to IPFS (optional)
9. Creates proof record
10. Notifies user

### Verifying a Proof
1. User opens extension popup
2. Selects proof to verify
3. Extension checks local hash
4. Sends to backend API
5. Backend validates proof
6. Returns verification result
7. Updates proof status

### Registering a Proof
1. User selects proof
2. Clicks "Register"
3. Extension sends to backend
4. Backend creates permanent record
5. Returns registration ID
6. Proof marked as registered

## 📊 Proof Metadata

Each proof includes:
- **Content Hash**: SHA-256 of image
- **IPFS CID**: Decentralized storage ID
- **Platform**: Where art was created
- **Model**: AI model version used
- **Prompt**: Original text prompt
- **Timestamp**: When prompt entered
- **Generation Time**: When image created
- **Fingerprint**: Browser signature
- **Metadata**: URL, user agent, dimensions, etc.

## 🌐 IPFS Integration

### Why IPFS?
- Decentralized storage
- Content-addressed (hash-based)
- Permanent and immutable
- Cannot be altered or deleted
- Verifiable integrity

### How It Works
1. Image converted to blob
2. Uploaded to IPFS provider
3. Receives unique CID (Content ID)
4. CID stored in proof record
5. Anyone can verify content via CID
6. Content hash proves integrity

## 🛠️ Development

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Storage**: Chrome Storage API
- **Crypto**: Web Crypto API
- **Backend**: Node.js/Express (example)
- **IPFS**: Web3.Storage/NFT.Storage/Pinata APIs

### No Build Required
- Pure JavaScript (no bundler needed)
- ES6 modules
- Native Web APIs
- Chrome Extension Manifest V3

### Extensibility
- Easy to add new platforms
- Modular utility functions
- Platform-specific monitors
- Configurable settings

## 📈 Future Enhancements

### Planned Features
- [ ] Blockchain integration (Ethereum, Polygon)
- [ ] NFT minting directly from extension
- [ ] Batch operations (verify/register multiple)
- [ ] Social sharing with proof
- [ ] Watermark embedding
- [ ] Machine learning model detection
- [ ] Community verification system
- [ ] Mobile companion app

### Platform Support
- [ ] Adobe Firefly
- [ ] Runway ML
- [ ] Artbreeder
- [ ] NightCafe
- [ ] Crayon
- [ ] Custom API endpoints

## 📖 Documentation

- **README.md**: Full project documentation
- **QUICKSTART.md**: 5-minute setup guide
- **SETUP.md**: Detailed configuration
- **PROJECT_OVERVIEW.md**: This file
- **backend-example/**: API implementation guide

## 🤝 Contributing

The extension is designed to be extensible:
1. Add new platforms in `content-script.js`
2. Add new IPFS providers in `utils/ipfs.js`
3. Enhance UI in `popup.js` and `options.js`
4. Improve hashing in `utils/crypto.js`

## 📝 License

MIT License - Free to use, modify, and distribute

## 🎯 Core Value Proposition

**Problem**: Artists create AI art on various platforms but have no way to prove they created it first or that it's authentic.

**Solution**: Automatic, cryptographic proof of creation with timestamp, platform info, and decentralized storage.

**Result**: Verifiable, permanent proof of art ownership that can be used for portfolios, NFTs, copyright, and more.

---

Built with ❤️ for the AI art community

