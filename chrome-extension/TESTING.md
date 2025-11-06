# Testing Chrome Extension with Backend

Quick guide to test the Chrome extension connected to your Proof-of-Art backend.

## 🚀 Quick Test (5 minutes)

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

✅ Should see: `Server running on port 5000`

### Step 2: Load Extension
1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `chrome-extension` folder
5. ✅ Extension icon appears in toolbar

### Step 3: Check Connection
1. Click extension icon
2. Open Chrome DevTools (F12)
3. Look for: `✅ IPFS CID matches`
4. No CORS errors

### Step 4: Generate Test Art

**Option A: ChatGPT (Easiest)**
1. Go to https://chatgpt.com
2. Type: "Generate an image of a sunset"
3. Wait for image
4. ✅ Check extension popup for new proof

**Option B: Bing Image Creator**
1. Go to https://www.bing.com/images/create
2. Enter prompt: "futuristic city"
3. Click Create
4. ✅ Check extension popup

### Step 5: Verify Backend Connection
1. Click extension icon
2. Click on any proof card
3. Click "Verify Proof"
4. ✅ Should verify successfully with backend

### Step 6: Register Artwork
1. Click on proof details
2. Click "Register on Platform"
3. ✅ Check backend logs: `Artwork registered`
4. ✅ Extension shows: "Registered" badge

## 🔍 Detailed Testing

### Test 1: Backend Health Check

```bash
curl http://localhost:5000/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-06...",
  "uptime": 123
}
```

### Test 2: Verify Endpoint

```bash
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "contentHash": "test123"
  }'
```

**Expected:**
```json
{
  "success": true,
  "verified": false,
  "message": "Artwork not found in database"
}
```

### Test 3: Register Artwork

```bash
curl -X POST http://localhost:5000/api/artworks \
  -H "Content-Type: application/json" \
  -d '{
    "contentHash": "abc123",
    "promptHash": "def456",
    "ipfsCID": "QmTest123",
    "modelUsed": "test-model"
  }'
```

**Expected:**
```json
{
  "success": true,
  "artwork": {
    "id": 1,
    "contentHash": "abc123",
    ...
  }
}
```

### Test 4: Get Artwork

```bash
curl http://localhost:5000/api/artworks/abc123
```

**Expected:**
```json
{
  "success": true,
  "artwork": {
    "contentHash": "abc123",
    ...
  }
}
```

## 🧪 Extension Features Test

### Feature: Automatic Tracking
- ✅ Detects prompt input
- ✅ Captures generated image
- ✅ Computes hash
- ✅ Stores proof locally

**Test:**
1. Go to https://chatgpt.com
2. Generate image
3. Check extension popup
4. Proof appears automatically

### Feature: Manual Verification
- ✅ Connects to backend
- ✅ Checks database
- ✅ Returns verification status

**Test:**
1. Click proof in extension
2. Click "Verify"
3. Check result

### Feature: Registration
- ✅ Computes prompt hash
- ✅ Sends to backend
- ✅ Saves in database
- ✅ Returns registration ID

**Test:**
1. Click proof in extension
2. Click "Register"
3. Check backend database

### Feature: IPFS Upload
- ✅ Uploads to configured provider
- ✅ Returns CID
- ✅ Stores in proof

**Test:**
1. Configure IPFS token in settings
2. Generate art
3. Check proof has ipfsCid

## 🐛 Troubleshooting Tests

### Test: CORS Issue

**Symptoms:**
- Console error: `CORS policy blocked`
- Requests fail

**Solution:**
Backend already allows CORS. If issue persists:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: '*', // Allow all for testing
  credentials: true,
}));
```

### Test: Database Not Available

**Symptoms:**
- Registration works but logs: `⚠️ Database not available`
- Verification returns "not found"

**Solution:**
1. Set DATABASE_URL in `.env`
2. Or: Backend works without DB, just logs warnings

### Test: Extension Not Capturing

**Symptoms:**
- Generate art but no proof appears

**Debug:**
1. Open DevTools on page with art generation
2. Console tab
3. Look for: `Proof of Art: Content script loaded`
4. Should see: `Prompt captured: ...`
5. Should see: `New image detected`

**Solution:**
- Platform may not be supported yet
- Check content-script.js for platform detectors

### Test: Backend Connection Failed

**Symptoms:**
- Extension shows error: "API request failed"

**Debug:**
```javascript
// In extension background console
chrome.storage.local.get('settings', (result) => {
  console.log('API Endpoint:', result.settings.apiEndpoint);
});
```

**Solution:**
1. Check backend is running
2. Check API endpoint in settings
3. Test: `curl http://localhost:5000/health`

## 📊 Database Check

### Check Registered Artworks

```sql
-- If using PostgreSQL
SELECT * FROM artworks ORDER BY created_at DESC;
```

Or use backend endpoint:
```bash
curl http://localhost:5000/api/artworks
```

### Check Specific Hash

```bash
curl http://localhost:5000/api/artworks/YOUR_CONTENT_HASH
```

## ✅ Success Criteria

After testing, you should have:

- ✅ Backend running on port 5000
- ✅ Extension loaded in Chrome
- ✅ At least 1 proof captured
- ✅ Proof verified with backend
- ✅ Proof registered in database
- ✅ No errors in console
- ✅ IPFS upload working (if configured)

## 🎯 Production Testing Checklist

Before deploying to production:

- [ ] Test with production API URL
- [ ] Test with real IPFS provider
- [ ] Test with multiple platforms
- [ ] Test verification with registered artwork
- [ ] Test with Web3 authentication (if implemented)
- [ ] Test error handling
- [ ] Test rate limiting
- [ ] Load test backend
- [ ] Security audit
- [ ] CORS properly configured
- [ ] SSL/HTTPS enabled

## 📝 Test Results Template

```
Date: _______
Backend Version: _______
Extension Version: 1.0.0

✅/❌ Backend starts successfully
✅/❌ Extension loads in Chrome
✅/❌ Health check passes
✅/❌ Art generation tracked
✅/❌ Proof stored locally
✅/❌ Hash computed correctly
✅/❌ IPFS upload works
✅/❌ Verification succeeds
✅/❌ Registration succeeds
✅/❌ Database stores artwork
✅/❌ Retrieval works

Issues Found:
_______________________

Notes:
_______________________
```

## 🔗 Related Documentation

- [INTEGRATION.md](INTEGRATION.md) - How extension connects to backend
- [README.md](README.md) - Full extension documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide

---

**Happy Testing! 🎨**

