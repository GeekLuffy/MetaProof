# 🔑 Add Your Pinata API Keys

## Quick Setup (2 minutes)

### Step 1: Get Your Keys from .env

Open your `.env` file (in the root of Proof-of-Art project) and copy these values:

```bash
PINATA_API_KEY=your_pinata_api_key        # Line 20
PINATA_SECRET_KEY=your_pinata_secret_key  # Line 21
```

### Step 2: Add Keys to Extension

Open `chrome-extension/config.js` and replace:

```javascript
// REPLACE THESE:
pinataApiKey: 'YOUR_PINATA_API_KEY',        
pinataApiSecret: 'YOUR_PINATA_SECRET_KEY',

// WITH YOUR ACTUAL KEYS:
pinataApiKey: 'abc123yourkey',        
pinataApiSecret: 'xyz789yoursecret',
```

### Step 3: Enable Auto-Upload (Optional)

In the same file, set:

```javascript
autoUploadIPFS: true,  // Change from false to true
```

### Step 4: Reload Extension

1. Go to `chrome://extensions/`
2. Click refresh icon ↻ on "Proof of Art"
3. Done! ✅

## What This Does

- ✅ Automatically uploads generated art to Pinata IPFS
- ✅ Returns IPFS CID for decentralized storage
- ✅ Art is permanently stored and verifiable
- ✅ No need to manually configure in settings

## Alternative: Manual Configuration

If you prefer, you can also add keys through the extension settings:

1. Click extension icon
2. Click settings (⚙️)
3. Scroll to "IPFS Storage Configuration"
4. Select "Pinata" tab
5. Enter your API key and secret
6. Click "Save Settings"

## Security Note

⚠️ The `config.js` file is safe to edit - it's gitignored and won't be committed to your repository.

---

**Need your Pinata keys?**
- Sign up at https://pinata.cloud (free)
- Or check your `.env` file (lines 20-21)

