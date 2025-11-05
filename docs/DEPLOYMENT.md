# Deployment Guide - Proof-of-Art on Vercel

This guide will help you deploy the Proof-of-Art system to Vercel.

## 🚀 Quick Deployment

### Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Push your code to GitHub
3. **API Keys** - Gather all required API keys (see below)

## 📋 Required API Keys & Environment Variables

### Frontend Environment Variables

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CHAIN_ID=80001
NEXT_PUBLIC_NETWORK_NAME=Mumbai
```

### Backend Environment Variables

```bash
# Blockchain
PRIVATE_KEY=your_wallet_private_key
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# AI APIs
OPENAI_API_KEY=your_openai_api_key
STABILITY_API_KEY=your_stability_api_key

# IPFS Storage
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt

# Security
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_session_secret
ENCRYPTION_KEY=your_32_character_encryption_key

# Database (Optional - for production)
DATABASE_URL=postgresql://user:password@host:5432/proof_of_art

# Node Environment
NODE_ENV=production
```

## 🎯 Step-by-Step Deployment

### Step 1: Deploy Frontend to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? proof-of-art-frontend
# - Directory? ./
# - Override settings? No
```

### Step 2: Deploy Backend to Vercel

```bash
# Navigate to backend directory
cd ../backend

# Deploy to Vercel
vercel

# Follow the prompts:
# - Project name? proof-of-art-backend
# - Directory? ./
```

### Step 3: Configure Environment Variables

#### Via Vercel Dashboard:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Add all frontend environment variables
5. Repeat for backend project

#### Via Vercel CLI:

```bash
# Frontend
cd frontend
vercel env add NEXT_PUBLIC_BACKEND_URL production
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production

# Backend
cd ../backend
vercel env add OPENAI_API_KEY production
vercel env add PINATA_JWT production
vercel env add JWT_SECRET production
```

### Step 4: Deploy Smart Contracts

```bash
# Navigate to contracts directory
cd ../contracts

# Deploy to Polygon Mumbai Testnet
npx hardhat run scripts/deploy.js --network mumbai

# Note the contract addresses from deployment output
# Update frontend with contract addresses
```

### Step 5: Update Frontend with Contract Addresses

Create `frontend/src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  ProofOfArt: '0xYOUR_PROOFOFART_ADDRESS',
  ProofCertificate: '0xYOUR_CERTIFICATE_ADDRESS',
  ProofMarketplace: '0xYOUR_MARKETPLACE_ADDRESS',
};

export const NETWORK = {
  chainId: 80001,
  name: 'Polygon Mumbai',
  rpcUrl: 'https://rpc-mumbai.maticvigil.com',
};
```

### Step 6: Redeploy with Updated Config

```bash
# Frontend
cd frontend
vercel --prod

# Backend
cd ../backend
vercel --prod
```

## 🌐 Alternative: One-Click Deploy

### Deploy via GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure project:
     - **Root Directory**: `frontend` (for frontend deployment)
     - **Framework Preset**: Next.js
     - Add environment variables
   - Click **Deploy**

3. **Deploy Backend Separately**
   - Create a new Vercel project
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - Add backend environment variables
   - Click **Deploy**

## 📦 Monorepo Deployment (Advanced)

To deploy both frontend and backend from a single Vercel project:

1. **Update Root `vercel.json`**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/next"
       },
       {
         "src": "backend/src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "backend/src/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "frontend/$1"
       }
     ]
   }
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings

Ensure backend allows frontend domain:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
}));
```

### 2. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add custom domain (e.g., `app.proof-of-art.io`)
3. Update DNS settings as instructed
4. Update environment variables with new domain

### 3. Set Up Database (Production)

For production, use a hosted PostgreSQL:

**Options:**
- **Vercel Postgres** (Recommended)
- **Supabase**
- **Railway**
- **Neon**

```bash
# Install Vercel Postgres
vercel postgres create

# Get connection string and add to environment variables
```

## 🧪 Testing Deployment

### Frontend
Visit: `https://your-frontend.vercel.app`

Test:
- ✅ Wallet connection works
- ✅ Pages load correctly
- ✅ API calls to backend succeed

### Backend
Visit: `https://your-backend.vercel.app/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-05T10:00:00Z",
  "uptime": 123
}
```

### Smart Contracts
Verify on Polygonscan:
`https://mumbai.polygonscan.com/address/YOUR_CONTRACT_ADDRESS`

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution**: Ensure all dependencies are in `package.json`
```bash
npm install
vercel --prod
```

### Issue: Environment variables not working
**Solution**: 
- Check spelling in Vercel dashboard
- Use `NEXT_PUBLIC_` prefix for frontend vars
- Redeploy after adding vars

### Issue: CORS errors
**Solution**: Update backend CORS configuration with frontend URL

### Issue: Smart contract calls fail
**Solution**: 
- Verify contract addresses are correct
- Check network configuration (Mumbai vs Mainnet)
- Ensure wallet has test MATIC

## 📊 Monitoring & Logs

### View Logs
```bash
# Real-time logs
vercel logs your-project-name --follow

# Or via dashboard
```

### Performance Monitoring
- Vercel automatically provides:
  - Real User Monitoring (RUM)
  - Web Vitals
  - Function execution time
  - Error tracking

## 🔒 Security Checklist

- [ ] All sensitive keys in environment variables (not in code)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Smart contracts verified on blockchain explorer
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] JWT secrets are strong and unique
- [ ] Database connections are secure

## 💰 Cost Considerations

**Vercel Pricing:**
- **Hobby** (Free): 
  - Good for testing
  - 100GB bandwidth
  - 100 serverless function executions/day

- **Pro** ($20/month):
  - Production ready
  - Unlimited bandwidth
  - Unlimited function executions

**Additional Costs:**
- Polygon gas fees (minimal on Mumbai testnet)
- IPFS storage (Pinata free tier: 1GB)
- OpenAI API usage (pay-as-you-go)

## 🎉 Success!

Your Proof-of-Art system is now live! 

**Next Steps:**
1. Test all functionality
2. Share with users
3. Monitor performance
4. Collect feedback
5. Iterate and improve

## 📞 Support

If you encounter issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review deployment logs
- Check GitHub Issues
- Contact: support@proof-of-art.io

---

**Happy Deploying! 🚀**

