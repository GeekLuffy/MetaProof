# Deployment Guide

Complete guide for deploying Proof-of-Art Network and POA token in all environments.

## Table of Contents

1. [Local Development](#local-development)
2. [Cloud Deployment](#cloud-deployment)
3. [Integration in Projects](#integration-in-projects)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

## Local Development

### Initial Setup

```bash
# Clone repository
git clone https://github.com/proof-of-art/proof-of-art-network.git
cd proof-of-art-network

# Install dependencies
npm install

# Compile contracts
npm run compile
```

### Start Network

```bash
# Terminal 1: Start blockchain network
npm run node
```

The network will start with:
- 20 pre-funded accounts (100 ETH each)
- Chain ID: 31337
- RPC: http://127.0.0.1:8545
- 1 second block time

### Deploy Contracts

```bash
# Terminal 2: Deploy POA token
npm run deploy:local
```

### Export Configuration

```bash
# Export for use in other projects
npm run export:config
```

This creates/updates `index.js` with deployment addresses and ABIs.

## Cloud Deployment

### Prerequisites

- Cloud server (see [PROVIDERS.md](PROVIDERS.md))
- Domain name (optional but recommended)
- SSL certificate

### Step-by-Step Cloud Deployment

#### 1. Server Setup

```bash
# SSH into your server
ssh user@your-server-ip

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/proof-of-art/proof-of-art-network.git
cd proof-of-art-network

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env
```

Edit `.env`:

```bash
CHAIN_ID=31337
CLOUD_RPC_URL=https://your-domain.com:8545
INITIAL_SUPPLY=1000000
PRIVATE_KEY=your_private_key_here
NODE_ENV=production
```

#### 3. Configure SSL

```bash
# Install Certbot
sudo apt-get install certbot -y

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo mkdir -p cloud/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem cloud/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem cloud/ssl/key.pem
sudo chmod 644 cloud/ssl/*
```

#### 4. Start Services

```bash
# Build and start containers
npm run docker:prod:up

# Verify services are running
docker ps
```

#### 5. Deploy POA Token

```bash
# Deploy token to cloud network
npm run deploy:cloud

# Export configuration
npm run export:config
```

#### 6. Test Deployment

```bash
# Test RPC endpoint
curl -X POST https://your-domain.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Test health endpoint
curl https://your-domain.com/health
```

### Automated Deployment Script

For quick deployment, use the automated script:

```bash
sudo bash cloud/deploy.sh
```

## Integration in Projects

### As NPM Package

#### Install

```bash
npm install proof-of-art-network
```

#### Use in Your Project

```javascript
const {
  networkConfig,
  poaTokenAddress,
  poaTokenABI,
  localRPCUrl,
  cloudRPCUrl
} = require('proof-of-art-network');

// Use in Wagmi configuration
import { createConfig, http } from 'wagmi';

const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http(cloudRPCUrl), // or localRPCUrl for dev
  },
});
```

### React/Next.js Integration

```javascript
// lib/web3.js
import { createConfig, http } from 'wagmi';
import { networkConfig, cloudRPCUrl } from 'proof-of-art-network';

export const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http(cloudRPCUrl),
  },
});

// components/POABalance.jsx
import { useContractRead } from 'wagmi';
import { poaTokenAddress, poaTokenABI } from 'proof-of-art-network';
import { formatUnits } from 'viem';

export function POABalance({ address }) {
  const { data: balance } = useContractRead({
    address: poaTokenAddress,
    abi: poaTokenABI,
    functionName: 'balanceOf',
    args: [address],
  });

  return (
    <div>
      POA Balance: {balance ? formatUnits(balance, 18) : '0'}
    </div>
  );
}
```

### ethers.js Integration

```javascript
const { ethers } = require('ethers');
const {
  poaTokenAddress,
  poaTokenABI,
  cloudRPCUrl
} = require('proof-of-art-network');

// Connect to network
const provider = new ethers.JsonRpcProvider(cloudRPCUrl);
const wallet = new ethers.Wallet(privateKey, provider);

// Create contract instance
const poaToken = new ethers.Contract(
  poaTokenAddress,
  poaTokenABI,
  wallet
);

// Use contract
async function transfer(to, amount) {
  const tx = await poaToken.transfer(
    to,
    ethers.parseUnits(amount.toString(), 18)
  );
  await tx.wait();
  console.log('Transfer complete!');
}
```

### Hardhat Integration

```javascript
// hardhat.config.js
require('proof-of-art-network/hardhat');

module.exports = {
  networks: {
    poa: {
      url: require('proof-of-art-network').cloudRPCUrl,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

## Environment-Specific Configurations

### Development

```javascript
// Use local network
const rpcUrl = process.env.NODE_ENV === 'development' 
  ? localRPCUrl 
  : cloudRPCUrl;

const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http(rpcUrl),
  },
});
```

### Production

```javascript
// Use cloud network with fallback
const rpcUrl = cloudRPCUrl;

const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http(rpcUrl, {
      timeout: 60000,
      retryCount: 3,
    }),
  },
});
```

## Best Practices

### Security

1. **Never commit private keys**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use environment variables**
   ```javascript
   const privateKey = process.env.PRIVATE_KEY;
   ```

3. **Secure RPC endpoints**
   - Use SSL/TLS
   - Implement rate limiting
   - Consider authentication

4. **Rotate keys regularly**
   - Development: Monthly
   - Production: Quarterly or as needed

### Performance

1. **Use connection pooling**
   ```javascript
   const provider = new ethers.JsonRpcProvider(rpcUrl, {
     staticNetwork: true,
   });
   ```

2. **Cache contract instances**
   ```javascript
   const contractCache = new Map();
   
   function getContract(address, abi, provider) {
     const key = `${address}-${provider.connection.url}`;
     if (!contractCache.has(key)) {
       contractCache.set(key, new ethers.Contract(address, abi, provider));
     }
     return contractCache.get(key);
   }
   ```

3. **Batch requests when possible**
   ```javascript
   const [balance, totalSupply, name] = await Promise.all([
     contract.balanceOf(address),
     contract.totalSupply(),
     contract.name()
   ]);
   ```

### Monitoring

1. **Health checks**
   ```javascript
   async function checkHealth() {
     try {
       const blockNumber = await provider.getBlockNumber();
       return { healthy: true, blockNumber };
     } catch (error) {
       return { healthy: false, error: error.message };
     }
   }
   ```

2. **Log important events**
   ```javascript
   contract.on('Transfer', (from, to, amount) => {
     console.log(`Transfer: ${from} -> ${to}: ${amount}`);
   });
   ```

3. **Set up alerts**
   - Monitor RPC availability
   - Track error rates
   - Watch resource usage

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Firewall rules set
- [ ] Backup strategy in place

### Deployment

- [ ] Server provisioned
- [ ] Docker installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] SSL configured
- [ ] Services started
- [ ] Contracts deployed

### Post-Deployment

- [ ] RPC endpoint accessible
- [ ] Token deployed successfully
- [ ] MetaMask connection verified
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified

## Troubleshooting

### Common Issues

#### Network Not Starting

**Problem**: Container won't start

**Solution**:
```bash
# Check logs
docker-compose logs poa-network

# Check if port is in use
sudo netstat -tulpn | grep 8545

# Restart Docker
sudo systemctl restart docker
```

#### Deployment Failed

**Problem**: Token deployment fails

**Solution**:
```bash
# Verify network is running
curl http://localhost:8545

# Check account balance
npm run accounts

# Verify private key in .env
echo $PRIVATE_KEY
```

#### Connection Issues

**Problem**: Can't connect from MetaMask

**Solution**:
1. Verify RPC URL is correct
2. Check if CORS is enabled
3. Verify SSL certificate
4. Check firewall rules

#### High Gas Fees

**Problem**: Transactions too expensive

**Solution**:
- This shouldn't happen on local/test networks
- Check you're connected to correct network
- Verify gas price settings

## Migration Guide

### From Development to Production

1. **Export development deployment**
   ```bash
   npm run export:config
   ```

2. **Update environment variables**
   ```bash
   # Change from localhost to cloud
   CLOUD_RPC_URL=https://your-domain.com:8545
   ```

3. **Deploy to cloud**
   ```bash
   npm run deploy:cloud
   ```

4. **Update application configuration**
   ```javascript
   const rpcUrl = cloudRPCUrl; // Changed from localRPCUrl
   ```

5. **Test thoroughly**
   - Verify RPC connectivity
   - Test token operations
   - Check MetaMask integration

## Next Steps

- [Network Setup](NETWORK_SETUP.md) - Detailed network configuration
- [Token Setup](TOKEN_SETUP.md) - POA token guide
- [Cloud Setup](CLOUD_SETUP.md) - Cloud deployment details
- [Provider Guides](PROVIDERS.md) - Platform-specific instructions

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Docker Documentation](https://docs.docker.com/)

