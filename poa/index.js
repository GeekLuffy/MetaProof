// Proof-of-Art Network - Main Export
// This file is auto-generated and will be updated by 'npm run export:config'

const networkConfig = {
  id: 31337,
  name: "Proof-of-Art Network",
  network: "proof-of-art",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"]
    },
    public: {
      http: ["http://127.0.0.1:8545"]
    }
  },
  blockExplorers: {
    default: {
      name: "Local Explorer",
      url: "http://127.0.0.1:8545"
    }
  },
  testnet: true
};

// Deployment addresses (will be populated after deployment)
const deployments = {
  localhost: null,
  cloud: null
};

// POA Token ABI (will be populated after compilation)
const poaTokenABI = null;

// RPC URLs
const localRPCUrl = "http://127.0.0.1:8545";
const cloudRPCUrl = process.env.CLOUD_RPC_URL || "https://your-domain.com:8545";

// Main exports
module.exports = {
  networkConfig,
  poaTokenAddress: deployments.localhost || deployments.cloud,
  poaTokenAddresses: deployments,
  poaTokenABI,
  localRPCUrl,
  cloudRPCUrl,
  
  // Helper functions
  getNetworkConfig: () => networkConfig,
  getPOATokenAddress: (network = "localhost") => deployments[network],
  getPOATokenABI: () => poaTokenABI,
  getRPCUrl: (network = "localhost") => network === "cloud" ? cloudRPCUrl : localRPCUrl
};

