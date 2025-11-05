# Quick Start Guide

## 🚀 Get Your App Running in 5 Minutes

### Step 1: Set Up Environment Variables

#### Frontend (Next.js)
Create `frontend/.env.local`:
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CHAIN_ID=80002
```

**Get WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.com
2. Sign up/login
3. Create a new project
4. Copy the Project ID

#### Backend
Create `.env` in the root:
```bash
cp env.example .env
```

Edit `.env` and add at minimum:
```env
# Backend
PORT=5000
JWT_SECRET=your-random-secret-key-here

# For AI generation (optional for now)
OPENAI_API_KEY=your_openai_key
STABILITY_API_KEY=your_stability_key

# For IPFS (optional for now)
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret

# Blockchain (optional for now)
PRIVATE_KEY=your_wallet_private_key
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

### Step 2: Install Dependencies

```bash
# From project root
npm install
```

### Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend should start on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend should start on http://localhost:3000

### Step 4: Connect Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select MetaMask
4. Approve connection
5. Switch to Polygon Amoy network (if prompted)
6. Click "Sign to Authenticate"

### Step 5: Test the App

1. **Homepage** - Should show your connected wallet
2. **Create Page** - Navigate to `/create` to generate AI art
3. **Verify Page** - Navigate to `/verify` to verify artworks

## 🐛 Troubleshooting

### "undefined/api/auth/nonce" Error
- **Fix:** Create `frontend/.env.local` with `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`
- Restart the frontend dev server

### Backend Not Found (404)
- Make sure backend is running on port 5000
- Check `backend/.env` has `PORT=5000`
- Verify no other service is using port 5000

### Module Resolution Errors
- Run `npm install` in both `frontend/` and `backend/` directories
- Delete `node_modules` and reinstall if needed

### Wallet Connection Issues
- Make sure you're on Polygon Amoy network
- Check MetaMask is unlocked
- Try refreshing the page

### API Key Errors
- Authentication will work without AI/IPFS keys
- You'll need them to generate art, but not to test the app structure

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] `.env.local` created in `frontend/` directory
- [ ] `.env` created in root directory
- [ ] Wallet connected successfully
- [ ] Can authenticate (sign message)
- [ ] No console errors (except optional warnings)

## 📝 Next Steps

Once everything is working:
1. Add API keys for AI generation
2. Deploy smart contracts to Polygon Amoy
3. Test artwork generation
4. Test blockchain verification

## 🆘 Still Having Issues?

1. Check both servers are running
2. Verify environment variables are set correctly
3. Clear browser cache and restart
4. Check the browser console for specific errors
5. Make sure ports 3000 and 5000 are available


