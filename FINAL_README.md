# 🎨 Proof-of-Art - Complete Setup & Usage Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [AI Model Configuration](#ai-model-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Smart Contracts](#smart-contracts)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

Proof-of-Art is a blockchain-based AI art verification system that establishes immutable authorship links between creators, their prompts, and AI-generated content. It solves the critical problem of verifiable authorship in the age of generative AI.

## ✨ Features

### Core Features
- ✅ **Multi-Model AI Generation** - Support for DALL-E 3, Stability AI, and multiple Bytez models
- ✅ **Blockchain Verification** - Immutable on-chain proof of creation on Polygon
- ✅ **IPFS Storage** - Decentralized content storage via Pinata
- ✅ **NFT Certificates** - Dynamic certificates with metadata binding
- ✅ **Wallet Authentication** - Secure Web3 authentication

### Advanced Features
- 🔐 **Zero-Knowledge Proofs** - Prove ownership without revealing prompts
- 🌳 **Creative Lineage Tree** - Track artistic evolution across iterations
- 🚨 **AI Plagiarism Detection** - Perceptual hashing for duplicate detection
- 👥 **Collaborative Creation** - Multi-creator co-signing with royalty splits
- ⏰ **Time-Locked Reveals** - Encrypted prompts with scheduled disclosure
- 🛒 **Proof Marketplace** - Trade verified artworks securely

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  USER INTERFACE                      │
│       (Prompt Input + Wallet + Generation)           │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌─────────────────┐      ┌──────────────────┐
│  Identity Layer │      │  AI Generation   │
│  - Wallet Auth  │      │  - 4 Providers   │
│  - JWT Tokens   │      │  - Multi-Model   │
└────────┬────────┘      └─────────┬────────┘
         │                         │
         └───────────┬─────────────┘
                     ▼
         ┌────────────────────────┐
         │  Cryptographic Engine  │
         │  - Content Hashing     │
         │  - Digital Signature   │
         └──────────┬─────────────┘
                    ▼
         ┌────────────────────────┐
         │   Blockchain Layer     │
         │  - Smart Contract      │
         │  - Polygon Network     │
         └──────────┬─────────────┘
                    ▼
         ┌────────────────────────┐
         │  Decentralized Storage │
         │  - IPFS (Pinata)       │
         └────────────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MetaMask** or compatible Web3 wallet
- **Git** for cloning the repository
- **API Keys** for AI services (at least one):
  - OpenAI API key (for DALL-E 3)
  - Stability AI API key
  - Bytez API key
- **IPFS/Pinata** account for decentralized storage
- **Polygon testnet** MATIC for gas fees

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/proof-of-art.git
cd proof-of-art
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 5. Install Smart Contract Dependencies

```bash
cd contracts
npm install
cd ..
```

## 🔑 AI Model Configuration

### Environment Variables Setup

Create a `.env` file in the root directory by copying the example:

```bash
cp env.example .env
```

Edit `.env` with your actual credentials:

```bash
# BLOCKCHAIN CONFIGURATION
PRIVATE_KEY=your_wallet_private_key_here
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# AI API CONFIGURATION (Configure at least one)
OPENAI_API_KEY=your_openai_api_key_here
STABILITY_API_KEY=your_stability_api_key_here
BYTEZ_API_KEY=your_bytez_api_key_here

# DECENTRALIZED STORAGE
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token

# BACKEND SERVER CONFIGURATION
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this

# FRONTEND CONFIGURATION
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_PROOF_OF_ART_ADDRESS=deployed_contract_address_here
```

### Obtaining API Keys

#### 1. **OpenAI API Key** (DALL-E 3)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and add to `.env` as `OPENAI_API_KEY`

**Pricing:** ~$0.04-$0.12 per image depending on size/quality

#### 2. **Stability AI API Key** (Recommended - Affordable)

1. Visit [Stability AI Platform](https://platform.stability.ai/)
2. Create an account
3. Navigate to API Keys
4. Generate a new API key
5. Add to `.env` as `STABILITY_API_KEY`

**Pricing:** ~$0.02-$0.04 per image

#### 3. **Bytez API Key** (Multiple Models)

1. Go to [Bytez.com](https://www.bytez.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add to `.env` as `BYTEZ_API_KEY`

**Features:** Access to multiple open-source models (Stable Diffusion XL, Animagine, Dreamlike, etc.)

#### 4. **Pinata (IPFS) Setup**

1. Visit [Pinata.cloud](https://www.pinata.cloud/)
2. Create a free account
3. Go to API Keys section
4. Generate new key with admin permissions
5. Copy:
   - API Key → `PINATA_API_KEY`
   - API Secret → `PINATA_SECRET_KEY`
   - JWT (if available) → `PINATA_JWT`

#### 5. **WalletConnect Project ID**

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up and create a new project
3. Copy the Project ID
4. Add to `.env` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## 🏃 Running the Application

### 1. Deploy Smart Contracts (First Time Only)

```bash
cd contracts
npm run deploy:local
# or for testnet
npm run deploy:testnet
```

Copy the deployed contract address to `.env`:
```bash
NEXT_PUBLIC_PROOF_OF_ART_ADDRESS=0x...
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:5000`

### 3. Start Frontend Application

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📚 API Documentation

### Authentication

All generation endpoints require authentication with a JWT token.

#### Get Nonce
```bash
POST /api/auth/nonce
Body: { "address": "0x..." }
Response: { "nonce": "Sign this message..." }
```

#### Verify Signature
```bash
POST /api/auth/verify
Body: { 
  "address": "0x...",
  "signature": "0x...",
  "message": "Sign this message..."
}
Response: { "token": "jwt_token..." }
```

### Image Generation

#### Generate Image
```bash
POST /api/generate
Headers: { "Authorization": "Bearer <jwt_token>" }
Body: {
  "prompt": "A serene mountain landscape",
  "model": "dall-e-3",
  "parameters": {
    "size": "1024x1024",
    "quality": "hd"
  }
}
Response: {
  "imageUrl": "data:image/png;base64,...",
  "contentHash": "0x...",
  "ipfsCID": "Qm...",
  "metadata": {...}
}
```

#### Get Available Models
```bash
GET /api/generate/models
Response: {
  "models": [
    {
      "id": "dall-e-3",
      "name": "DALL-E 3",
      "provider": "OpenAI",
      "available": true,
      "description": "OpenAI DALL-E 3 - High quality image generation",
      "features": ["1024x1024", "1792x1024", "1024x1792", "HD quality"]
    },
    {
      "id": "stability-ai",
      "name": "Stability AI",
      "provider": "Stability AI",
      "available": true,
      "description": "Stable Diffusion - Fast and flexible generation",
      "features": ["Custom sizes", "Style presets", "High quality"]
    }
  ]
}
```

### Model-Specific Parameters

#### DALL-E 3
```json
{
  "model": "dall-e-3",
  "parameters": {
    "size": "1024x1024" | "1792x1024" | "1024x1792",
    "quality": "standard" | "hd",
    "style": "vivid" | "natural"
  }
}
```

#### Stability AI
```json
{
  "model": "stability-ai",
  "parameters": {
    "width": 1024,
    "height": 1024,
    "style_preset": "enhance"
  }
}
```

#### Bytez Models
```json
{
  "model": "bytez:stabilityai/stable-diffusion-xl-base-1.0",
  "parameters": {}
}
```

### Verification

#### Verify Content
```bash
POST /api/verify
Body: {
  "contentHash": "0x..."
  // or
  "ipfsCID": "Qm..."
}
Response: {
  "verified": true,
  "creator": "0x...",
  "timestamp": 1234567890,
  "metadata": {...}
}
```

### Artworks

#### Get All Artworks
```bash
GET /api/artworks?address=0x...
Response: {
  "artworks": [...]
}
```

#### Get Artwork by ID
```bash
GET /api/artworks/:id
Response: {
  "id": "...",
  "creator": "0x...",
  "prompt": "...",
  "imageUrl": "...",
  ...
}
```

## 🔗 Smart Contracts

### Main Contract: ProofOfArt.sol

Located at: `contracts/contracts/ProofOfArt.sol`

#### Key Functions

```solidity
// Create proof of authorship
function createProof(
    string memory contentHash,
    string memory metadataURI,
    bytes memory signature
) external returns (uint256 proofId)

// Verify proof
function verifyProof(uint256 proofId) external view returns (
    address creator,
    uint256 timestamp,
    string memory contentHash,
    string memory metadataURI
)

// Get creator's proofs
function getCreatorProofs(address creator) external view returns (uint256[] memory)
```

### Deployment Scripts

```bash
# Local Hardhat Network
cd contracts
npm run node          # Start local blockchain
npm run deploy:local  # Deploy contracts

# Polygon Amoy Testnet
npm run deploy:testnet

# Polygon Mainnet
npm run deploy:mainnet
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Web3Modal** - Wallet connection
- **wagmi** - React hooks for Ethereum
- **viem** - Ethereum interactions

### Backend
- **Node.js & Express** - REST API server
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Axios** - HTTP client
- **Sharp** - Image processing

### Blockchain
- **Solidity 0.8.x** - Smart contracts
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries
- **Polygon** - Layer 2 blockchain

### AI Integration
- **OpenAI SDK** - DALL-E 3
- **Stability AI API** - Stable Diffusion
- **Bytez.js** - Multiple open-source models (Stable Diffusion XL, Animagine XL, Dreamlike Photoreal, etc.)

### Storage
- **IPFS (Pinata)** - Decentralized storage
- **Base64** - Temporary image encoding

## 🐛 Troubleshooting

### Common Issues

#### 1. "OpenAI API key not configured"
- Check `OPENAI_API_KEY` in `.env`
- Verify you have credits in your OpenAI account
- Check API key permissions

#### 2. "Contract not deployed"
- Run `cd contracts && npm run deploy:local`
- Copy the contract address to `NEXT_PUBLIC_PROOF_OF_ART_ADDRESS`
- Restart frontend server

#### 3. "MetaMask connection failed"
- Ensure MetaMask is installed
- Check you're on the correct network (Polygon Amoy for testnet)
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set

#### 4. "IPFS upload failed"
- Verify Pinata API keys are correct
- Check Pinata account has available storage
- Ensure network connectivity

#### 5. Models showing as unavailable
- Check corresponding API key is set in `.env`
- Restart the backend server
- Verify API key has sufficient credits

### Development Tips

1. **Start with Bytez** - Access to multiple models with one API key
2. **Use local blockchain** - Faster testing without testnet gas fees
3. **Check logs** - Backend logs show detailed error messages
4. **Test one model at a time** - Add API keys incrementally
5. **Use testnet first** - Test on Polygon Amoy before mainnet

### Port Conflicts

If ports are in use:

```bash
# Backend (default: 5000)
PORT=5001 npm run dev

# Frontend (default: 3000)
npm run dev -- -p 3001
```

### Reset Local Blockchain

```bash
cd contracts
rm -rf artifacts cache
npm run node
npm run deploy:local
```

## 📊 Project Structure

```
proof-of-art/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── hooks/        # Custom hooks
│   └── public/           # Static assets
│
├── backend/              # Express API server
│   └── src/
│       ├── routes/       # API endpoints
│       ├── services/     # Business logic
│       │   └── aiService.ts  # AI model integration
│       ├── middleware/   # Auth, validation
│       └── utils/        # Helpers
│
├── contracts/            # Solidity smart contracts
│   ├── contracts/
│   │   ├── ProofOfArt.sol
│   │   ├── ProofCertificate.sol
│   │   └── ProofMarketplace.sol
│   ├── scripts/          # Deployment scripts
│   └── test/            # Contract tests
│
├── shared/              # Shared TypeScript types
│   └── types/
│
├── docs/                # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── SECURITY.md
│
├── .env                 # Environment variables
├── env.example          # Template for .env
└── package.json         # Root dependencies
```

## 🔐 Security Considerations

1. **Never commit `.env`** - Contains sensitive API keys
2. **Use testnet first** - Test thoroughly before mainnet
3. **Secure private keys** - Never share or commit private keys
4. **Validate inputs** - All API inputs are validated
5. **Rate limiting** - Prevent API abuse
6. **JWT tokens** - Expire after 24 hours

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For issues and questions:
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check `/docs` folder for detailed guides
- **API Reference**: See `docs/API.md`

## 🚀 Next Steps

1. **Deploy to testnet** - Test with real blockchain
2. **Add more models** - Integrate additional AI providers
3. **Implement marketplace** - Enable artwork trading
4. **Mobile app** - React Native application
5. **Social features** - Artist profiles and following

## ✅ Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (root, backend, frontend, contracts)
- [ ] Create `.env` file from `env.example`
- [ ] Get at least one AI API key (recommend Bytez for multiple models)
- [ ] Get Pinata API keys
- [ ] Get WalletConnect Project ID
- [ ] Deploy smart contracts
- [ ] Start backend server
- [ ] Start frontend application
- [ ] Connect MetaMask wallet
- [ ] Generate your first AI artwork with blockchain proof!

---