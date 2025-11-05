# Network Setup Guide

## ⚠️ Important: Polygon Mumbai is Deprecated

Polygon Mumbai testnet was shut down in April 2024. We now use **Polygon Amoy** testnet.

## 🔧 Add Polygon Amoy to MetaMask

### Manual Setup:
1. Open MetaMask
2. Click on the network dropdown (top left)
3. Click "Add Network" or "Add network manually"
4. Enter the following details:

```
Network Name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency Symbol: MATIC
Block Explorer URL: https://amoy.polygonscan.com
```

### Alternative RPC URLs (if one is slow):
- `https://rpc-amoy.polygon.technology`
- `https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY` (requires Alchemy account)
- `https://polygon-amoy-bor-rpc.publicnode.com`

## 💰 Get Test MATIC

You need test MATIC to deploy contracts and pay gas fees.

### Option 1: Polygon Faucet
1. Go to https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Paste your wallet address
4. Complete CAPTCHA and request tokens
5. Wait 1-2 minutes for tokens to arrive

### Option 2: Alchemy Faucet
1. Go to https://www.alchemy.com/faucets/polygon-amoy
2. Sign in with Alchemy account (free)
3. Enter your wallet address
4. Receive 0.5 MATIC instantly

### Option 3: QuickNode Faucet
1. Go to https://faucet.quicknode.com/polygon/amoy
2. Enter your wallet address
3. Complete verification
4. Receive test MATIC

## 🚀 Quick Start

### 1. Add Network via Chainlist
The easiest way:
1. Go to https://chainlist.org/
2. Search for "Polygon Amoy"
3. Click "Add to MetaMask"
4. Approve in MetaMask

### 2. Update Your Environment Variables
Copy `.env.example` to `.env` and update:

```bash
# Use Polygon Amoy RPC
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Your wallet private key (NEVER share this!)
PRIVATE_KEY=your_private_key_here

# Get from https://polygonscan.com/apis
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 3. Deploy to Amoy Testnet

```bash
# Compile contracts
cd contracts
npx hardhat compile

# Deploy to Amoy
npx hardhat run scripts/deploy.js --network amoy

# Or use the npm script
npm run deploy:testnet
```

## 🔍 Network Details

### Polygon Amoy (Testnet)
- **Chain ID**: 80002
- **Currency**: MATIC (test tokens)
- **Block Time**: ~2 seconds
- **RPC**: https://rpc-amoy.polygon.technology
- **Explorer**: https://amoy.polygonscan.com
- **Faucet**: https://faucet.polygon.technology/

### Polygon Mainnet (Production)
- **Chain ID**: 137
- **Currency**: MATIC (real tokens)
- **Block Time**: ~2 seconds
- **RPC**: https://polygon-rpc.com
- **Explorer**: https://polygonscan.com

## 🛠️ Troubleshooting

### "Error connecting to custom network"
- Check if RPC URL is correct: https://rpc-amoy.polygon.technology
- Try alternative RPC URLs listed above
- Ensure you have internet connection
- MetaMask might be slow, wait a few seconds

### "Insufficient funds for gas"
- Get test MATIC from faucet (see above)
- Ensure you're on Polygon Amoy network
- Check balance at https://amoy.polygonscan.com

### "Nonce too high" error
1. Go to MetaMask Settings
2. Advanced → Reset Account
3. This clears transaction history
4. Try transaction again

### "Chain ID mismatch"
- Ensure Chain ID is **80002** (not 80001)
- Mumbai was 80001, Amoy is 80002

## 📚 Useful Links

- [Polygon Docs](https://docs.polygon.technology/)
- [Amoy Testnet Info](https://polygon.technology/blog/introducing-the-amoy-testnet-for-polygon-pos)
- [Hardhat Config](https://hardhat.org/hardhat-runner/docs/config)
- [MetaMask Guide](https://support.metamask.io/networks-and-sidechains/managing-networks/how-to-add-a-custom-network-rpc/)

## ✅ Verify Your Setup

Run this command to test your connection:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network amoy
```

You should see:
```
🚀 Starting Proof-of-Art deployment...
📝 Deploying contracts with account: 0x...
💰 Account balance: 0.5 ETH
```

If you see this, you're all set! 🎉


