# Proof-of-Art Network

A standalone blockchain network and POA token infrastructure that supports both local development and cloud deployment. This package provides a reusable blockchain network and ERC-20 POA token for Proof-of-Art projects.

## Features

- ⚡ **Custom EVM-compatible blockchain network** (Hardhat-based)
- 🪙 **POA ERC-20 Token** (Name: POA, Symbol: POA)
- 🐳 **Docker support** for easy deployment
- ☁️ **Cloud deployment ready** (AWS, DigitalOcean, GCP, Azure, Railway, Render, Fly.io)
- 📦 **NPM package** - Import into other projects
- 🔒 **SSL/TLS support** for production
- 🚀 **Simple setup** - Start in minutes
- 📖 **Comprehensive documentation**

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) Docker for containerized deployment

### Installation

```bash
npm install
```

### Start Local Network

```bash
# Start the blockchain network
npm run node

# Or use the convenience script
npm run node:start
```

The network will start at:
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
- **WebSocket**: `ws://127.0.0.1:8545`

### Deploy POA Token

In another terminal:

```bash
npm run deploy:local
```

This will deploy the POA token to your local network and save the deployment info.

### Add to MetaMask

1. Open MetaMask
2. Add Network:
   - **Network Name**: Proof-of-Art Network
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH

## POA Token

The POA token is an ERC-20 token with the following specifications:

- **Name**: POA
- **Symbol**: POA
- **Decimals**: 18
- **Initial Supply**: 1,000,000 POA (configurable)
- **Features**: Minting (owner only), Burning, Standard ERC-20 functions

### Token Contract

The token contract (`contracts/POAToken.sol`) includes:
- Standard ERC-20 functions (transfer, approve, etc.)
- Minting capability (owner-controlled)
- Burning capability
- Helper functions for token amounts

## Using in Other Projects

### Install as Dependency

```bash
npm install proof-of-art-network
```

### Import Configuration

```javascript
const {
  networkConfig,
  poaTokenAddress,
  poaTokenABI,
  localRPCUrl,
  cloudRPCUrl
} = require('proof-of-art-network');

// Use with Wagmi/RainbowKit
import { createConfig, http } from 'wagmi';

const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http(localRPCUrl),
  },
});

// Use POA token in your app
const { useContractRead } = useWagmi();

const { data: balance } = useContractRead({
  address: poaTokenAddress,
  abi: poaTokenABI,
  functionName: 'balanceOf',
  args: [userAddress],
});
```

## Cloud Deployment

Deploy the network to the cloud for public access.

### Quick Deploy with Docker

```bash
# Build Docker image
npm run docker:build

# Start production containers
npm run docker:prod:up

# Deploy POA token to cloud
npm run deploy:cloud
```

### Supported Cloud Providers

- AWS (EC2, ECS, EKS)
- DigitalOcean (Droplet, App Platform)
- Google Cloud (Compute Engine, GKE)
- Azure (VM, Container Instances)
- Railway.app
- Render.com
- Fly.io

See [docs/CLOUD_SETUP.md](docs/CLOUD_SETUP.md) for detailed instructions.

## Scripts

- `npm run node` - Start blockchain network
- `npm run compile` - Compile contracts
- `npm run deploy:local` - Deploy POA token to localhost
- `npm run deploy:cloud` - Deploy POA token to cloud
- `npm run deploy:cloud:setup` - Cloud deployment setup wizard
- `npm run docker:build` - Build Docker image
- `npm run docker:up` - Start Docker containers (dev)
- `npm run docker:prod:up` - Start Docker containers (prod)
- `npm run export:config` - Export configuration for other projects

## Project Structure

```
proof-of-art-network/
├── contracts/              # Smart contracts
│   └── POAToken.sol       # POA ERC-20 token
├── scripts/               # Deployment scripts
│   ├── deploy-token.js
│   ├── start-node.js
│   ├── deploy-cloud.js
│   └── export-config.js
├── networks/              # Network configurations
│   ├── proof-of-art-network.js
│   ├── localhost.js
│   └── cloud.js
├── cloud/                 # Cloud deployment files
│   ├── docker-compose.prod.yml
│   ├── nginx.conf
│   ├── ecosystem.config.js
│   └── deploy.sh
├── docs/                  # Documentation
│   ├── DEPLOYMENT.md
│   ├── CLOUD_SETUP.md
│   └── PROVIDERS.md
├── deployments/           # Deployment artifacts
├── hardhat.config.js      # Hardhat configuration
├── Dockerfile             # Docker image
└── docker-compose.yml     # Docker Compose config
```

## Documentation

- [Network Setup Guide](docs/NETWORK_SETUP.md) - Set up local network
- [Token Setup Guide](docs/TOKEN_SETUP.md) - Deploy and use POA token
- [Cloud Deployment](docs/CLOUD_SETUP.md) - Deploy to cloud
- [Deployment Guide](docs/DEPLOYMENT.md) - Complete deployment guide
- [Cloud Providers](docs/PROVIDERS.md) - Provider-specific guides

## Configuration

Configuration is managed through environment variables. See `.env.example` for all options:

```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings
nano .env
```

Key variables:
- `CHAIN_ID` - Network chain ID (default: 31337)
- `CLOUD_RPC_URL` - Cloud RPC endpoint
- `INITIAL_SUPPLY` - POA token initial supply
- `PRIVATE_KEY` - Deployment private key

## Security

⚠️ **Important Security Notes**:

- Never commit `.env` files with private keys
- Use SSL/TLS for production deployments
- Secure your RPC endpoints
- Keep private keys safe
- Use hardware wallets for production deployments

## Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Clean Build

```bash
npm run clean
```

## Troubleshooting

### Network Won't Start

Make sure port 8545 is not in use:
```bash
# Linux/Mac
lsof -i :8545

# Windows
netstat -ano | findstr :8545
```

### Deployment Failed

1. Check if network is running
2. Verify you have ETH in deployer account
3. Check environment variables
4. Review error logs

### Docker Issues

```bash
# View logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Rebuild images
docker-compose build --no-cache
```

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/proof-of-art/proof-of-art-network/issues)
- Discussions: [GitHub Discussions](https://github.com/proof-of-art/proof-of-art-network/discussions)

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Docker Documentation](https://docs.docker.com/)

---

Made with ❤️ by the Proof-of-Art Team

