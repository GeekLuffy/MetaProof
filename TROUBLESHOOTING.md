# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### ❌ Blockchain Registration Fails with "Internal JSON-RPC error"

**Symptoms:**
```
❌ Transaction error: ContractFunctionExecutionError
Internal JSON-RPC error
Contract Call: registerArtwork...
```

**Cause:** The smart contracts are not deployed or the blockchain node was restarted (losing contract state)

**Solution:**

1. **Check if contracts are deployed:**
```bash
cd contracts
npm run check-contract
```

2. **If contracts are missing, redeploy them:**
```bash
cd contracts
npm run deploy:local
```

3. **Verify the contract address in frontend/.env.local:**
```bash
# Should match the deployed address from deployment summary
NEXT_PUBLIC_PROOF_OF_ART_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

4. **Restart frontend if needed:**
```bash
cd frontend
npm run dev
```

---

### ⚠️ Verification Shows "Not Verified" Even After Registration

**Symptoms:**
- Artwork shows as registered in database
- But verification page shows "Not Verified"

**Cause:** Registration didn't complete on blockchain

**Check:**
1. Open browser console and look for transaction logs
2. Check if `isConfirmed` becomes true
3. Look for the transaction hash

**Solution:**
1. Use the Debug Information panel on verify page
2. Check "Exists in DB" vs "Exists on Chain"
3. If only in DB, click "Register on Blockchain" again

---

### 🐌 Image Generation is Slow

**Expected Time:**
- AI Generation: 30-60 seconds
- Image Display: Immediate after generation
- IPFS Upload: 10-30 seconds (optional)

**If slower:**
1. Check backend logs for timing per step
2. Bytez API may be slow - try different model
3. IPFS (Pinata) may be slow - check internet connection

---

### 🔴 Blockchain Node Issues

**Issue: Cannot connect to blockchain**

**Solution:**
```bash
# Start Hardhat node
cd contracts
npm run node

# In new terminal, deploy contracts
cd contracts
npm run deploy:local
```

**Issue: Node stopped/restarted**

When you restart the Hardhat node, all contract state is lost. You must:
1. Restart the node: `npm run node`
2. Redeploy contracts: `npm run deploy:local`
3. Update frontend env if address changed

---

### 📤 IPFS Upload Fails

**Symptoms:**
```
⚠️ Not on IPFS yet
Upload to IPFS button doesn't work
```

**Check:**
1. Is PINATA_JWT set in backend .env?
2. Check backend logs for IPFS errors
3. Verify internet connection

**Solution:**
```bash
# Backend .env must have:
PINATA_JWT=your_pinata_jwt_token

# Test Pinata connection:
curl -H "Authorization: Bearer YOUR_JWT" https://api.pinata.cloud/data/testAuthentication
```

---

### 🔑 Wallet Connection Issues

**Issue: MetaMask not connecting**

**Solution:**
1. Ensure MetaMask is installed
2. Connect to localhost:8545 network
3. Import test account:
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This has 10,000 ETH for testing

**Issue: Wrong network**

1. Open MetaMask
2. Add Custom Network:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

---

## Quick Diagnostic Commands

### Check Contract Status
```bash
cd contracts
npm run check-contract
```

### View Contract Addresses
```bash
cd contracts
cat deployments/localhost.json
```

### Check Frontend Environment
```bash
cd frontend
cat .env.local | grep NEXT_PUBLIC_PROOF_OF_ART_ADDRESS
```

### Check Backend Logs
```bash
cd backend
npm run dev
# Watch for errors in terminal
```

---

## Reset Everything (Nuclear Option)

If nothing works, start fresh:

```bash
# 1. Stop all processes (Ctrl+C in all terminals)

# 2. Clean contracts
cd contracts
npm run clean
rm -rf deployments/

# 3. Restart Hardhat node
npm run node
# Keep this running in terminal 1

# 4. Deploy contracts (in new terminal)
cd contracts  
npm run deploy:local

# 5. Copy the ProofOfArt address from deployment output

# 6. Update frontend .env.local
cd frontend
# Edit .env.local and set NEXT_PUBLIC_PROOF_OF_ART_ADDRESS

# 7. Restart backend
cd backend
npm run dev
# Keep running in terminal 2

# 8. Restart frontend  
cd frontend
npm run dev
# Keep running in terminal 3
```

---

## Useful Logs to Check

### Backend Logs Show Timing:
```
🎨 [Step 1/3] Starting image generation...
✅ [Step 1/3] Image generation completed in 35234ms
📥 [Step 2/3] Downloading image...
✅ [Step 2/3] Image downloaded in 1234ms
🔐 [Step 3/3] Generating content hash...
✅ [Step 3/3] Hashes generated in 12ms
```

### Frontend Console Shows:
```
📝 Registering artwork on blockchain...
🔑 IMPORTANT: Save this content hash for verification: 0x...
⏳ Transaction pending - waiting for user approval...
📤 Transaction submitted! Confirming...
✅ Transaction confirmed: 0x...
```

### Contract Check Shows:
```
✅ Contract exists at address
✅ Certificate contract: 0x...
✅ Certificate contract is deployed
✅ Contract is not paused
✅ Total artworks registered: X
✅ Registration function is callable
```

---

## Still Having Issues?

1. Check that all 3 services are running:
   - Blockchain node (port 8545)
   - Backend server (port 5000)
   - Frontend dev server (port 3000)

2. Check browser console for JavaScript errors

3. Check backend terminal for API errors

4. Verify .env files are properly configured

5. Try the "Reset Everything" option above

---

## Environment Variables Checklist

### Backend (.env)
- ✅ BYTEZ_API_KEY
- ✅ PINATA_JWT
- ✅ DATABASE_URL (optional)
- ✅ JWT_SECRET

### Frontend (.env.local)
- ✅ NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
- ✅ NEXT_PUBLIC_PROOF_OF_ART_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

### Contracts (.env)
- ✅ PRIVATE_KEY (for deployment)
- ✅ YOUR_CHAIN_RPC_URL (optional for custom chain)

---

## Performance Benchmarks

### Normal Operation:
- Image Generation: **30-40 seconds** ⚡
- IPFS Upload: **10-30 seconds**
- Blockchain Registration: **2-5 seconds**
- Verification Check: **<1 second**

### If Slower:
- AI Generation >60s → Check Bytez API
- IPFS Upload >60s → Check Pinata/internet
- Blockchain Reg >10s → Check node/gas
- Verification >5s → Check contract deployment

