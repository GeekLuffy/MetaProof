# 🚀 Vercel Deployment Checklist

Use this checklist to ensure smooth deployment to Vercel.

## Pre-Deployment

### 1. API Keys & Credentials
- [ ] Get WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- [ ] Get OpenAI API Key from [platform.openai.com](https://platform.openai.com)
- [ ] Get Pinata API credentials from [pinata.cloud](https://pinata.cloud)
- [ ] Get Polygonscan API Key from [polygonscan.com](https://polygonscan.com)
- [ ] Create wallet with MATIC on Mumbai testnet

### 2. Code Preparation
- [ ] All code committed to Git
- [ ] No hardcoded secrets in code
- [ ] `.env.example` file is up to date
- [ ] Dependencies are installed and working locally
- [ ] Tests pass: `npm test`
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Backend builds successfully: `cd backend && npm run build`

### 3. Environment Setup
- [ ] Create Vercel account
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`

## Deployment Steps

### Step 1: Deploy Smart Contracts
```bash
cd contracts
npx hardhat run scripts/deploy.js --network mumbai
```
- [ ] Note contract addresses from output
- [ ] Verify contracts on Polygonscan
- [ ] Save deployment addresses to `deployments/mumbai.json`

### Step 2: Deploy Backend
```bash
cd backend
vercel
```
- [ ] Add environment variables in Vercel dashboard
- [ ] Test health endpoint: `https://your-backend.vercel.app/health`
- [ ] Note backend URL for frontend config

### Step 3: Deploy Frontend
```bash
cd frontend
vercel
```
- [ ] Add `NEXT_PUBLIC_BACKEND_URL` with backend URL
- [ ] Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- [ ] Add contract addresses to config
- [ ] Test deployment: visit frontend URL

### Step 4: Final Configuration
- [ ] Update CORS in backend to allow frontend domain
- [ ] Test wallet connection on deployed frontend
- [ ] Test end-to-end flow: create artwork → verify
- [ ] Check all pages load correctly

## Environment Variables Reference

### Frontend (Vercel Dashboard)
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CHAIN_ID=80001
NEXT_PUBLIC_NETWORK_NAME=Mumbai
```

### Backend (Vercel Dashboard)
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your_strong_jwt_secret_here
OPENAI_API_KEY=sk-your-key-here
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret
PINATA_JWT=your_pinata_jwt
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_key
PRIVATE_KEY=your_wallet_private_key
```

## Post-Deployment Testing

### Functionality Tests
- [ ] Wallet connects successfully
- [ ] User can sign authentication message
- [ ] File upload to IPFS works
- [ ] Smart contract interactions succeed
- [ ] NFT certificates mint correctly
- [ ] Verification portal works
- [ ] All API endpoints respond

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API responses < 1 second
- [ ] IPFS retrieval times acceptable
- [ ] No console errors

### Security Tests
- [ ] No API keys exposed in frontend
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Rate limiting works
- [ ] JWT authentication required for protected routes

## Production Readiness

### Before Going Live
- [ ] Deploy contracts to Polygon Mainnet
- [ ] Use production RPC URLs
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure custom domain (optional)
- [ ] Set up database for production (if needed)
- [ ] Update environment to use mainnet values
- [ ] Load test the application
- [ ] Create backup of private keys
- [ ] Document deployment process
- [ ] Set up error tracking (Sentry)

### Documentation
- [ ] Update README with live URLs
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Add troubleshooting guide

## Rollback Plan

If deployment fails:
1. Check Vercel deployment logs
2. Verify environment variables
3. Roll back to previous deployment in Vercel dashboard
4. Fix issues locally and redeploy

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Hardhat Docs: https://hardhat.org/docs
- Next.js Docs: https://nextjs.org/docs
- Project Issues: [GitHub Issues]

---

## Quick Commands

```bash
# Deploy everything
npm run deploy:vercel

# Deploy frontend only
npm run deploy:vercel:frontend

# Deploy backend only
npm run deploy:vercel:backend

# Deploy contracts to testnet
npm run deploy:testnet

# View logs
vercel logs --follow

# Check deployment status
vercel ls
```

---

**Remember:** Test thoroughly on testnet before mainnet deployment!

