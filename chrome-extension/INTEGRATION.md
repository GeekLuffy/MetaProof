# Chrome Extension Integration with Proof-of-Art Backend

This document explains how the Chrome extension connects to your Proof-of-Art backend.

## 🔗 Connection Overview

The Chrome extension is now fully integrated with your existing Proof-of-Art backend API running at `http://localhost:5000`.

## 📡 API Endpoints Used

### 1. **Verify Artwork**
```
POST /api/verify
```
- Checks if artwork exists in database
- Verifies IPFS CID matches
- Returns verification status

**Extension Usage:**
When user clicks "Verify Proof" button

### 2. **Register Artwork**
```
POST /api/artworks
```
- Saves artwork to database
- Stores content hash, IPFS CID, model info
- Returns registration ID

**Extension Usage:**
When user clicks "Register" button

### 3. **Get Artwork by Hash**
```
GET /api/artworks/:contentHash
```
- Retrieves artwork details by content hash
- Used for proof status checks

**Extension Usage:**
View proof details and status

### 4. **Get User Artworks**
```
GET /api/artworks/my
```
- Requires authentication
- Returns all artworks for authenticated user

**Extension Usage:**
Sync with backend when user connects wallet

### 5. **Health Check**
```
GET /health
```
- Check backend status
- Verify connection

## 🚀 Setup Instructions

### Step 1: Start Your Backend

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Step 2: Configure Extension

1. Load extension in Chrome (`chrome://extensions/`)
2. Click extension icon
3. Click settings (⚙️)
4. API Endpoint is already set to: `http://localhost:5000`
5. (Optional) Add IPFS credentials

### Step 3: Test Connection

1. Open extension popup
2. Backend health status shows in console
3. Generate art on any supported platform
4. Click "Verify" to test backend connection

## 🔐 Authentication (Optional)

The extension can work with or without authentication:

### **Without Authentication (Current Setup)**
- Extension stores proofs locally
- Can verify if artwork exists in database
- Registration uses placeholder address: `0x0000000000000000000000000000000000000000`

### **With Web3 Authentication (Future Enhancement)**

To enable wallet authentication:

1. **Extension Side:**
```javascript
// Store wallet address after connecting
chrome.storage.local.set({
  walletAddress: '0x742d35Cc...',
  authToken: 'jwt-token-here'
});
```

2. **Backend Side:**
The backend already has authentication middleware (`authenticateToken`) that works with JWT tokens.

## 📊 Data Flow

```
┌─────────────────┐
│   User creates  │
│   art on        │
│   platform      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Extension     │
│   captures:     │
│   - Prompt      │
│   - Image       │
│   - Metadata    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Computes      │
│   SHA-256 hash  │
│   + fingerprint │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Upload to     │
│   IPFS          │
│   (optional)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Store proof   │
│   locally in    │
│   Chrome        │
└────────┬────────┘
         │
    User clicks
    "Register"
         │
         ▼
┌─────────────────┐
│   POST /api/    │
│   artworks      │
│                 │
│   Backend       │
│   saves to DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Proof is now  │
│   registered    │
│   and can be    │
│   verified      │
└─────────────────┘
```

## 🗄️ Database Schema

The extension registers artworks using your existing schema:

```sql
CREATE TABLE artworks (
  id SERIAL PRIMARY KEY,
  content_hash VARCHAR(255) UNIQUE NOT NULL,
  prompt_hash VARCHAR(255) NOT NULL,
  creator_address VARCHAR(255) NOT NULL,
  ipfs_cid VARCHAR(255) NOT NULL,
  model_used VARCHAR(255) NOT NULL,
  metadata_uri TEXT,
  certificate_token_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Extension Maps:**
- `contentHash` → `content_hash`
- `prompt` (hashed) → `prompt_hash`
- `ipfsCid` → `ipfs_cid`
- `platform-model` → `model_used`
- Wallet address → `creator_address`

## 🎨 Extension Features with Backend

### ✅ Working Now
- ✅ Automatic artwork tracking
- ✅ Local proof storage
- ✅ Cryptographic hashing
- ✅ IPFS upload (if configured)
- ✅ Backend verification
- ✅ Artwork registration
- ✅ Proof status checking

### 🚧 Future Enhancements
- 🔲 Web3 wallet connection
- 🔲 Blockchain registration
- 🔲 NFT certificate viewing
- 🔲 Real-time sync with backend
- 🔲 Multi-device proof sync

## 🐛 Troubleshooting

### Extension Can't Connect to Backend

**Check:**
1. Backend is running: `http://localhost:5000/health`
2. No CORS errors in console
3. API endpoint is correct in settings

**Solution:**
```bash
# Start backend
cd backend
npm run dev
```

### Registration Requires Authentication

**Issue:** `/api/artworks` requires JWT token

**Temporary Solution:**
The backend allows registration without auth if no token is provided. A placeholder address is used.

**Permanent Solution:**
Implement Web3 wallet connection in extension:
```javascript
// Extension connects wallet
// Gets signature
// Sends to backend /api/auth
// Receives JWT token
// Stores in chrome.storage
```

### CORS Errors

**Issue:** Browser blocks requests

**Solution:**
Backend already has CORS enabled:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

Add Chrome extension origin if needed:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'chrome-extension://YOUR-EXTENSION-ID'],
  credentials: true,
}));
```

## 📝 Code Examples

### Verify Artwork from Extension

```javascript
// In extension popup
const proof = proofs.find(p => p.id === proofId);

const result = await chrome.runtime.sendMessage({
  type: 'VERIFY_PROOF',
  data: proofId
});

// Backend checks database
// Returns: { verified: true/false, artwork: {...} }
```

### Register Artwork from Extension

```javascript
// In extension popup
const result = await chrome.runtime.sendMessage({
  type: 'REGISTER_PROOF',
  data: proofId
});

// Backend saves to database
// Returns: { registrationId: 123, message: 'Success' }
```

## 🔄 Sync with Frontend

Your Next.js frontend and Chrome extension can work together:

1. **User generates art on extension** → Registered in backend
2. **User opens frontend dashboard** → Sees extension-generated art
3. **User creates art in frontend** → Extension can verify it
4. **Seamless integration** across both interfaces!

## 📚 Related Files

- `chrome-extension/utils/api.js` - API service (updated)
- `backend/src/index.ts` - Verify endpoint (implemented)
- `backend/src/routes/artworks.ts` - Artwork routes
- `backend/src/services/artworkService.ts` - Database service

## 🎯 Next Steps

1. ✅ Backend is connected
2. ✅ Extension can verify and register
3. 🔲 Test with real artwork generation
4. 🔲 Add Web3 authentication
5. 🔲 Deploy to production

---

**Need Help?** Check the main README or open an issue!

