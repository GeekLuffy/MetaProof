# 🚀 Quick Deploy Guide

Get Proof-of-Art live in **15 minutes**!

## Prerequisites

1. ✅ GitHub account
2. ✅ Vercel account (free) - https://vercel.com
3. ✅ Railway account (free) - https://railway.app  
4. ✅ WalletConnect Project ID - https://cloud.walletconnect.com
5. ✅ OpenAI API Key (optional) - https://platform.openai.com
6. ✅ Pinata Account (free) - https://pinata.cloud

---

## Step 1: Push to GitHub (2 min)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Step 2: Deploy Frontend to Vercel (5 min)

### Via Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel

# Follow prompts:
# Directory: ./frontend
# Build Command: npm run build
# Output Directory: .next
```

### Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Settings:
   - Root Directory: `frontend`
   - Framework: Next.js
4. Add environment variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   NEXT_PUBLIC_CHAIN_ID=80001
   ```
5. Click **Deploy**

✅ Frontend URL: `https://proof-of-art.vercel.app`

---

## Step 3: Deploy Backend to Railway (5 min)

1. Go to https://railway.app
2. **New Project** → **Deploy from GitHub**
3. Select your repository
4. Click on the service → **Settings**:
   - Root Directory: `/backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. **Variables** tab → Add:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-random-secret-key
   PINATA_JWT=your-pinata-jwt
   OPENAI_API_KEY=sk-your-key (optional)
   FRONTEND_URL=https://proof-of-art.vercel.app
   ```
6. Add PostgreSQL database:
   - **New** → **Database** → **PostgreSQL**
   - Auto-connects via `DATABASE_URL`

✅ Backend URL: `https://proof-of-art.railway.app`

---

## Step 4: Update Frontend Environment (1 min)

Go back to Vercel → Settings → Environment Variables:

Update `NEXT_PUBLIC_BACKEND_URL` to your Railway URL:
```
NEXT_PUBLIC_BACKEND_URL=https://proof-of-art.railway.app
```

Redeploy: `vercel --prod`

---

## Step 5: Deploy Smart Contracts (2 min)

```bash
# Get free test MATIC
# Visit: https://faucet.polygon.technology/

# Deploy to Mumbai testnet
cd contracts
npx hardhat run scripts/deploy.js --network mumbai

# Save the contract addresses from output
```

Update contract addresses in your frontend code if needed.

---

## 🎉 You're Live!

Your Proof-of-Art DApp is now deployed:

- **Frontend**: https://proof-of-art.vercel.app
- **Backend**: https://proof-of-art.railway.app  
- **Smart Contracts**: Deployed on Polygon Mumbai

---

## 🔧 Post-Deployment

### Test Your Deployment

1. Visit your frontend URL
2. Connect wallet (use Mumbai testnet)
3. Try uploading a file to IPFS
4. Test authentication flow

### Get Required API Keys

1. **WalletConnect**: https://cloud.walletconnect.com
   - Create project → Copy Project ID

2. **Pinata (IPFS)**: https://app.pinata.cloud
   - API Keys → Generate JWT

3. **OpenAI (Optional)**: https://platform.openai.com/api-keys
   - Create new secret key

### Set Up Custom Domain (Optional)

**Vercel**:
1. Settings → Domains
2. Add your domain
3. Update DNS records

**Railway**:
1. Settings → Networking
2. Add custom domain

---

## 📊 Monitor Your Deployment

- **Vercel Logs**: https://vercel.com/dashboard
- **Railway Logs**: https://railway.app/project/[your-project]
- **Smart Contracts**: https://mumbai.polygonscan.com

---

## 🐛 Quick Troubleshooting

**Frontend not loading?**
- Check Vercel build logs
- Verify environment variables are set

**Backend API errors?**
- Check Railway logs  
- Verify database connection
- Check CORS settings

**Wallet won't connect?**
- Make sure you're on Mumbai testnet
- Check WalletConnect Project ID

---

## 🚀 Ready for Mainnet?

When ready for production:

1. Deploy contracts to Polygon Mainnet
2. Update `NEXT_PUBLIC_CHAIN_ID` to `137`
3. Get security audit for contracts
4. Enable rate limiting
5. Set up monitoring (Sentry)

---

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.

**Happy deploying!** 🎨⛓️

