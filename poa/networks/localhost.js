// Localhost Network Configuration

const localhostNetwork = {
  id: 31337,
  name: "Proof-of-Art Network (Localhost)",
  network: "localhost",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"]
    },
    public: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"]
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

// MetaMask configuration for localhost
const localhostMetaMaskConfig = {
  chainId: "0x7a69", // 31337 in hex
  chainName: "Proof-of-Art Network (Localhost)",
  rpcUrls: ["http://127.0.0.1:8545"],
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  blockExplorerUrls: ["http://127.0.0.1:8545"]
};

module.exports = {
  localhostNetwork,
  localhostMetaMaskConfig,
  default: localhostNetwork
};

