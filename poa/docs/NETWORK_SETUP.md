# Network Setup Guide

This guide will help you set up and run the Proof-of-Art Network locally.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- MetaMask (for wallet connection)

## Installation

1. **Clone the repository** (if not already installed):
```bash
git clone https://github.com/proof-of-art/proof-of-art-network.git
cd proof-of-art-network
```

2. **Install dependencies**:
```bash
npm install
```

## Starting the Network

### Method 1: Using npm script (Recommended)

```bash
npm run node
```

### Method 2: Using the convenience script

```bash
node scripts/start-node.js
```

### Method 3: Direct Hardhat command

```bash
npx hardhat node
```

The network will start with:
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
- **WebSocket URL**: `ws://127.0.0.1:8545`
- **20 pre-funded accounts** with 100 ETH each
- **1 second block time**

## Network Information

```
Network Name: Proof-of-Art Network
Chain ID: 31337
RPC URL: http://127.0.0.1:8545
WebSocket URL: ws://127.0.0.1:8545
Native Currency: ETH
Block Time: 1 second
EVM Compatible: Yes
```

## Adding to MetaMask

1. Open MetaMask
2. Click on the network dropdown (top of MetaMask)
3. Click "Add Network" or "Add Network Manually"
4. Enter the following details:

```
Network Name: Proof-of-Art Network
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
Block Explorer URL: (leave empty)
```

5. Click "Save"

## Using Pre-funded Accounts

When the network starts, you'll see 20 accounts with their private keys. To import one into MetaMask:

1. Open MetaMask
2. Click on the account icon (top right)
3. Select "Import Account"
4. Paste the private key from one of the accounts shown in the terminal
5. Click "Import"

⚠️ **Warning**: These accounts are for development only. Never use these private keys in production!

## Verifying Network Connection

### Method 1: Using curl

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:8545
```

### Method 2: Using MetaMask

1. Switch to Proof-of-Art Network in MetaMask
2. Check if your balance is displayed
3. Try sending a small transaction

### Method 3: Using ethers.js

```javascript
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

async function checkNetwork() {
  const network = await provider.getNetwork();
  console.log('Connected to:', network);
  
  const blockNumber = await provider.getBlockNumber();
  console.log('Current block:', blockNumber);
}

checkNetwork();
```

## Network Configuration

The network is configured in `hardhat.config.js`:

```javascript
networks: {
  hardhat: {
    chainId: 31337,
    mining: {
      auto: true,
      interval: 1000 // 1 second
    },
    accounts: {
      count: 20,
      accountsBalance: "100000000000000000000" // 100 ETH
    }
  }
}
```

## Customizing Network Settings

Edit `hardhat.config.js` to customize:

### Change Chain ID

```javascript
hardhat: {
  chainId: 12345, // Your custom chain ID
  // ...
}
```

### Change Block Time

```javascript
hardhat: {
  mining: {
    auto: true,
    interval: 5000 // 5 seconds
  },
  // ...
}
```

### Change Number of Accounts

```javascript
hardhat: {
  accounts: {
    count: 50, // More accounts
    accountsBalance: "1000000000000000000000" // 1000 ETH each
  },
  // ...
}
```

## Network Commands

### Start Network
```bash
npm run node
```

### Compile Contracts
```bash
npm run compile
```

### Deploy Contracts
```bash
npm run deploy:local
```

### Clean Build
```bash
npm run clean
```

## Using in Other Projects

### Import Network Config

```javascript
const { networkConfig } = require('proof-of-art-network');

// Use with Wagmi
import { createConfig, http } from 'wagmi';

const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http('http://127.0.0.1:8545'),
  },
});
```

### Connect with ethers.js

```javascript
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const signer = new ethers.Wallet('PRIVATE_KEY', provider);
```

### Connect with web3.js

```javascript
const Web3 = require('web3');

const web3 = new Web3('http://127.0.0.1:8545');
```

## Troubleshooting

### Port Already in Use

If port 8545 is already in use:

**Linux/Mac:**
```bash
lsof -i :8545
kill -9 <PID>
```

**Windows:**
```bash
netstat -ano | findstr :8545
taskkill /PID <PID> /F
```

### Network Not Starting

1. Check if Node.js is installed: `node --version`
2. Check if dependencies are installed: `npm install`
3. Try cleaning and recompiling: `npm run clean && npm run compile`

### MetaMask Not Connecting

1. Make sure the network is running
2. Verify the RPC URL is correct
3. Check the Chain ID (31337)
4. Try resetting MetaMask's network connection

### Transactions Failing

1. Make sure you have ETH in your account
2. Check if the network is running
3. Verify the contract address is correct
4. Check for error messages in the terminal

## Next Steps

- [Deploy POA Token](TOKEN_SETUP.md)
- [Cloud Deployment](CLOUD_SETUP.md)
- [Integration Guide](DEPLOYMENT.md)

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [MetaMask Documentation](https://docs.metamask.io/)
- [ethers.js Documentation](https://docs.ethers.org/)

