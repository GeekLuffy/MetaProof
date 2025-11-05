# Deployment Guide - Proof-of-Art

This guide covers deploying the Proof-of-Art application to production.

## Architecture Overview

The Proof-of-Art system consists of three main components:

1. **Frontend** (Next.js) → Deploy to **Vercel**
2. **Backend** (Node.js API) → Deploy to **Railway** or **Render**
3. **Smart Contracts** (Solidity) → Deploy to **Polygon Mumbai/Mainnet**

---

## 🚀 Frontend Deployment (Vercel)

### Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- WalletConnect Project ID (get from https://cloud.walletconnect.com)

### Step 1: Prepare Repository

```bash
# Commit your code
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? proof-of-art
# - In which directory is your code located? ./frontend
# - Want to override settings? Yes
# - Build Command: npm run build
# - Output Directory: .next
# - Development Command: npm run dev
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_CHAIN_ID=80001
NEXT_PUBLIC_NETWORK_NAME=Mumbai
```

### Step 4: Deploy

```bash
# Production deployment
vercel --prod
```

Your frontend will be live at: `https://proof-of-art.vercel.app`

---

## 🔧 Backend Deployment (Railway)

### Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository

### Step 1: Prepare Backend

Create a `railway.json` in the backend directory (already created in backend folder).

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Configure:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### Step 3: Add Environment Variables

In Railway Dashboard → Variables, add all variables from `env.example`:

```env
NODE_ENV=production
PORT=5000

# API Keys
OPENAI_API_KEY=sk-...
STABILITY_API_KEY=...
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
PINATA_JWT=...

# Database (Railway provides this)
DATABASE_URL=${DATABASE_URL}

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Blockchain
PRIVATE_KEY=your-deployer-private-key
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
```

### Step 4: Add PostgreSQL Database

1. In Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically connects it via `DATABASE_URL`

### Step 5: Deploy

Railway auto-deploys on every push. Your backend will be at:
`https://your-project.railway.app`

---

## 📜 Smart Contract Deployment

### Prerequisites

- MetaMask wallet with MATIC tokens
- Polygon Mumbai RPC URL
- Polygonscan API key

### Step 1: Get Test MATIC

Get free testnet MATIC from: https://faucet.polygon.technology/

### Step 2: Configure Environment

Update your `.env` file in the contracts directory:

```env
PRIVATE_KEY=your_wallet_private_key
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### Step 3: Deploy Contracts

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai

# Verify on Polygonscan
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

### Step 4: Update Frontend & Backend

After deployment, update the contract addresses in:

1. Frontend: `frontend/src/lib/contracts.ts`
2. Backend: Environment variables

---

## 🔐 Environment Variables Reference

### Frontend (Vercel)
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxx
NEXT_PUBLIC_BACKEND_URL=https://api.proof-of-art.com
NEXT_PUBLIC_CHAIN_ID=80001
NEXT_PUBLIC_NETWORK_NAME=Mumbai
```

### Backend (Railway)
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://proof-of-art.vercel.app

# AI APIs
OPENAI_API_KEY=sk-xxx
STABILITY_API_KEY=sk-xxx

# Storage
PINATA_API_KEY=xxx
PINATA_SECRET_KEY=xxx
PINATA_JWT=xxx

# Database
DATABASE_URL=postgresql://xxx

# Auth
JWT_SECRET=xxx

# Blockchain
PRIVATE_KEY=xxx
POLYGON_MUMBAI_RPC_URL=xxx
```

---

## 📊 Post-Deployment Checklist

- [ ] Frontend is accessible and loads correctly
- [ ] Backend API responds to health checks
- [ ] Smart contracts are verified on Polygonscan
- [ ] Environment variables are set correctly
- [ ] Wallet connection works
- [ ] IPFS upload functions properly
- [ ] AI generation works (if API keys are configured)
- [ ] Database connections are stable
- [ ] SSL/HTTPS is enabled
- [ ] CORS is configured correctly

---

## 🔄 Alternative Deployment Options

### Backend Alternatives

#### Option 1: Render
- Similar to Railway
- Free tier available
- Deploy at: https://render.com

#### Option 2: Vercel Serverless Functions
- Convert backend to API routes in `/frontend/pages/api`
- Limited to serverless constraints

#### Option 3: DigitalOcean App Platform
- More control, slightly more complex
- Deploy at: https://www.digitalocean.com/products/app-platform

### Frontend Alternatives

#### Option 1: Netlify
- Similar to Vercel
- Deploy at: https://netlify.com

#### Option 2: Cloudflare Pages
- Fast global CDN
- Deploy at: https://pages.cloudflare.com

---

## 🐛 Troubleshooting

### Issue: Build fails on Vercel

**Solution**: Check build logs and ensure:
- All dependencies are in `package.json`
- No TypeScript errors
- Environment variables are set

### Issue: Backend API not reachable

**Solution**: 
- Check Railway logs
- Verify CORS settings
- Ensure PORT is correctly configured

### Issue: Smart contract calls fail

**Solution**:
- Verify contract addresses are correct
- Check you're on the right network
- Ensure wallet has test MATIC

---

## 📈 Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics** - Built-in for frontend
2. **Railway Logs** - For backend monitoring
3. **Sentry** - Error tracking (optional)
4. **Polygonscan** - Smart contract monitoring

---

## 🚀 Production Deployment (Mainnet)

When ready for production:

1. **Deploy contracts to Polygon Mainnet**
   ```bash
   npx hardhat run scripts/deploy.js --network polygon
   ```

2. **Update environment variables** to use mainnet RPC and contract addresses

3. **Enable security features**:
   - Rate limiting
   - Input validation
   - Security headers

4. **Get security audit** for smart contracts

5. **Update `NEXT_PUBLIC_CHAIN_ID`** to `137` (Polygon Mainnet)

---

## 📞 Support

For deployment issues:
- Frontend: Check Vercel docs - https://vercel.com/docs
- Backend: Check Railway docs - https://docs.railway.app
- Contracts: Check Hardhat docs - https://hardhat.org/docs

---

**Ready to deploy!** 🎉

Start with the frontend on Vercel, then backend on Railway, and finally deploy your contracts to Polygon Mumbai testnet.

