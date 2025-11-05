// Cloud Network Configuration

const cloudNetwork = {
  id: parseInt(process.env.CHAIN_ID) || 31337,
  name: "Proof-of-Art Network (Cloud)",
  network: "proof-of-art-cloud",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [process.env.CLOUD_RPC_URL || "https://your-domain.com:8545"],
      webSocket: [process.env.CLOUD_WS_URL || "wss://your-domain.com:8546"]
    },
    public: {
      http: [process.env.CLOUD_RPC_URL || "https://your-domain.com:8545"],
      webSocket: [process.env.CLOUD_WS_URL || "wss://your-domain.com:8546"]
    }
  },
  blockExplorers: {
    default: {
      name: "Cloud Explorer",
      url: process.env.EXPLORER_URL || "https://your-domain.com"
    }
  },
  testnet: false
};

// MetaMask configuration for cloud
const cloudMetaMaskConfig = {
  chainId: `0x${(parseInt(process.env.CHAIN_ID) || 31337).toString(16)}`,
  chainName: "Proof-of-Art Network (Cloud)",
  rpcUrls: [process.env.CLOUD_RPC_URL || "https://your-domain.com:8545"],
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  blockExplorerUrls: [process.env.EXPLORER_URL || "https://your-domain.com"]
};

module.exports = {
  cloudNetwork,
  cloudMetaMaskConfig,
  default: cloudNetwork
};

