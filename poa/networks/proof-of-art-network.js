// Proof-of-Art Network Configuration
// Use this configuration with Wagmi, RainbowKit, or other Web3 libraries

const proofOfArtNetwork = {
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
      http: [process.env.CLOUD_RPC_URL || "http://127.0.0.1:8545"],
      webSocket: [process.env.CLOUD_WS_URL || "ws://127.0.0.1:8545"]
    },
    public: {
      http: [process.env.CLOUD_RPC_URL || "http://127.0.0.1:8545"],
      webSocket: [process.env.CLOUD_WS_URL || "ws://127.0.0.1:8545"]
    }
  },
  blockExplorers: {
    default: {
      name: "Local Explorer",
      url: "http://127.0.0.1:8545"
    }
  },
  testnet: true,
  // Metadata
  description: "Custom EVM-compatible blockchain network for Proof-of-Art projects",
  chainId: 31337,
  // Additional configuration
  multicall: {
    address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    blockCreated: 0
  }
};

// MetaMask configuration
const metaMaskConfig = {
  chainId: "0x7a69", // 31337 in hex
  chainName: "Proof-of-Art Network",
  rpcUrls: [process.env.CLOUD_RPC_URL || "http://127.0.0.1:8545"],
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  blockExplorerUrls: ["http://127.0.0.1:8545"]
};

module.exports = {
  proofOfArtNetwork,
  metaMaskConfig,
  default: proofOfArtNetwork
};

