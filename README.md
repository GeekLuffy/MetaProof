# 🎨 MetaProof - Blockchain-Based AI Art Verification System

> The world's first blockchain-verified creative provenance system for AI-generated art. Own your creativity. Prove your originality.

## 🌟 Overview

MetaProof establishes immutable authorship links between creators, their prompts, and AI-generated content using blockchain technology. This system solves the critical problem of verifiable authorship in the age of generative AI.

**Built on Our Own Blockchain**: MetaProof operates on the **POA (Proof-of-Art) Chain**, a custom EVM-compatible blockchain network designed specifically for creative provenance. This dedicated network eliminates gas fees, provides instant transactions, and offers a purpose-built infrastructure for AI art verification.

## 🚀 Features

### Core Features
- ✅ **Secure Art Generation** - Multi-model AI integration (DALL-E 3, Stability AI, Bytez Models)
- ✅ **Cryptographic Linking** - Tamper-proof connection between creator, prompt, and output
- ✅ **Blockchain Verification** - Immutable on-chain proof of creation
- ✅ **IPFS Storage** - Decentralized content storage with Arweave backup
- ✅ **NFT Certificates** - Dynamic certificates with metadata binding

### Advanced Features (Competitive Differentiators)
- 🔐 **Zero-Knowledge Proofs** - Prove ownership without revealing prompts
- 🌳 **Creative Lineage Tree** - Track artistic evolution across iterations
- 🚨 **AI Plagiarism Detection** - Perceptual hashing for duplicate detection
- 👥 **Collaborative Creation** - Multi-creator co-signing with royalty splits
- ⏰ **Time-Locked Reveals** - Encrypted prompts with scheduled disclosure
- 🛒 **Proof Marketplace** - Trade verified artworks securely
- 🔌 **Verification API** - Third-party platform integration
- 👤 **Biometric Verification** - Proof-of-human via facial landmark hashing

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  USER INTERFACE                      │
│       (Prompt Input + Biometric + Generation)        │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌─────────────────┐      ┌──────────────────┐
│  Identity Layer │      │  AI Generation   │
│  - Wallet Auth  │      │  - Multi-Model   │
│  - Biometric    │      │  - Prompt Cache  │
│  - ZK Proof Gen │      │                  │
└────────┬────────┘      └─────────┬────────┘
         │                         │
         └───────────┬─────────────┘
                     ▼
         ┌────────────────────────┐
         │  Cryptographic Engine  │
         │  - Hash Generation     │
         │  - Merkle Tree         │
         │  - Digital Signature   │
         └──────────┬─────────────┘
                    ▼
         ┌────────────────────────┐
         │   Blockchain Layer     │
         │  - POA Chain (EVM)     │
         │  - Smart Contract      │
         │  - Event Emission      │
         │  - Certificate Mint    │
         │  - Zero Gas Fees       │
         └──────────┬─────────────┘
                    ▼
         ┌────────────────────────┐
         │  Decentralized Storage │
         │  - IPFS (content)      │
         │  - Arweave (metadata)  │
         └────────────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Web3Modal (Wagmi)
- **Backend**: Node.js, Express, TypeScript
- **Blockchain**: **POA Chain** (Custom EVM-Compatible Network)
  - Zero gas fees (EIP-1559 configured)
  - Instant block confirmations
  - Full Ethereum compatibility
  - Chain ID: 31337 (configurable)
- **Storage**: IPFS (Pinata), Arweave (permanent backup)
- **Smart Contracts**: Solidity 0.8.x, Hardhat, OpenZeppelin
- **AI APIs**: OpenAI DALL-E 3, Stability AI, Bytez Models
- **Biometric**: TensorFlow.js (facial landmark hashing)
- **Database**: PostgreSQL (off-chain metadata cache)
- **ZK-Proofs**: SnarkJS

## 📦 Project Structure

```
proof-of-art/
├── frontend/               # Next.js 14 application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities & helpers
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Business logic
│   │   ├── services/      # External services
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── contracts/             # Smart contracts
│   ├── contracts/         # Solidity contracts
│   ├── scripts/           # Deployment scripts
│   ├── test/              # Contract tests
│   └── hardhat.config.js
│
├── shared/                # Shared types & constants
│   └── types/
│
└── docs/                  # Documentation
    ├── API.md
    ├── ARCHITECTURE.md
    └── SECURITY.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- MetaMask or compatible Web3 wallet
- API keys (OpenAI, Pinata, etc.)
- **POA Chain Network**: Add MetaProof's custom blockchain to MetaMask (see [Network Setup](#network-setup))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/proof-of-art.git
cd proof-of-art

# Install dependencies for all packages
npm run install:all

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development servers
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Hardhat node: http://localhost:8545

### Network Setup

MetaProof uses its own **POA (Proof-of-Art) Chain** - a custom EVM-compatible blockchain network.

**Add POA Chain to MetaMask:**

1. Open MetaMask and click the network dropdown
2. Click "Add Network" or "Add a network manually"
3. Enter the following details:
   - **Network Name**: MetaProof Network (or Proof-of-Art Network)
   - **RPC URL**: `https://p01--poa-chain--wdqd5crrcgfg.code.run/` (or your configured RPC endpoint)
   - **Chain ID**: `31337` (or `0x7a69` in hex)
   - **Currency Symbol**: `POA`
   - **Block Explorer URL**: (optional, if configured)

**Benefits of POA Chain:**
- ✅ **Zero Gas Fees** - All transactions are free
- ✅ **Instant Confirmations** - No waiting for block confirmations
- ✅ **EVM Compatible** - Works with all Ethereum tools and wallets
- ✅ **Purpose-Built** - Optimized for creative provenance

See [/poa](/poa) page for detailed network information and setup instructions.

### Smart Contract Deployment

```bash
# Deploy to POA Chain (local)
npm run deploy:local

# Deploy to POA Chain (cloud)
npm run deploy:poa

# Deploy to other EVM networks (if needed)
npm run deploy:testnet
npm run deploy:mainnet
```

## 🔐 Security Features

- **Input Sanitization** - Prevent injection attacks
- **Rate Limiting** - Prevent abuse and spam
- **Nonce + Timestamp** - Prevent replay attacks
- **Liveness Detection** - Prevent biometric spoofing
- **Reentrancy Guards** - Smart contract security
- **Hash Verification** - Prevent content tampering
- **Token Staking** - Prevent Sybil attacks

## 📊 Key Metrics

- Total artworks registered
- Unique creators
- Verifications performed
- **Zero gas fees** (100% savings vs Ethereum/Polygon)
- Plagiarism detections
- Instant block confirmations (POA Chain)
- IPFS retrieval time

## 🔗 POA Chain Details

MetaProof operates on the **POA (Proof-of-Art) Chain**, our custom EVM-compatible blockchain:

- **Network Type**: Custom EVM Chain
- **Chain ID**: 31337 (0x7a69)
- **Native Currency**: POA (18 decimals)
- **Gas Fees**: 0 gwei (completely free)
- **Block Time**: Instant confirmations
- **EVM Compatibility**: 100% compatible with Ethereum tools
- **RPC Endpoint**: Configurable (default: cloud deployment)

**Why Our Own Chain?**
- Eliminates gas fees completely
- Provides instant transaction confirmations
- Purpose-built for creative provenance
- No network congestion
- Full control over network parameters
- Maintains Ethereum compatibility for easy integration

Learn more at [/poa](/poa) or check out our [OwnChain documentation](/poa).

## 🎯 Use Cases

| User | Scenario | Benefit |
|------|----------|---------|
| **Digital Artist** | Creates AI artwork | Proves ownership with immutable certificate |
| **Art Buyer** | Purchasing AI NFT | Verifies authenticity before buying |
| **Content Platform** | Curating AI art | Auto-verifies submissions |
| **Gallery Owner** | Digital exhibition | Ensures all works are verified |
| **Journalist** | Investigating fake art | Quickly verifies authenticity |

## 🛣️ Roadmap

### Phase 1: MVP (Weeks 1-2) ✅
- [x] Smart contract development
- [x] Basic UI with wallet connection
- [x] IPFS integration
- [x] AI API integration
- [x] Certificate generation

### Phase 2: Advanced Features (Weeks 3-4)
- [ ] Zero-knowledge proofs
- [ ] Plagiarism detection
- [ ] Creative lineage tracking
- [ ] Public verification portal
- [ ] Biometric verification

### Phase 3: Production (Week 5+)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Marketplace launch
- [ ] API for third parties
- [ ] Mobile application

## 🌐 Additional Resources

- **OwnChain Info**: Visit [/poa](/poa) for POA Chain network details
- **Extension**: Check out our [Chrome Extension](/extension) for automatic art tracking
- **API Documentation**: See [docs/API.md](./docs/API.md) for backend API details
- **Network Setup**: Detailed network configuration in [NETWORK_SETUP.md](./NETWORK_SETUP.md)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! MetaProof is built on open-source principles and we encourage community participation.

---

**MetaProof** - Own Your AI Creativity | Built on POA Chain (EVM-Compatible) | Zero Gas Fees Forever



