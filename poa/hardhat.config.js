require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
      hardfork: "london", // Enables EIP-1559
      mining: {
        auto: true,
        interval: 1000 // 1 second block time
      },
      accounts: {
        count: 20,
        accountsBalance: "100000000000000000000" // 100 ETH
      },
      // EIP-1559: Zero gas fees configuration
      gasPrice: 0, // Legacy transactions
      initialBaseFeePerGas: 0, // Base fee set to 0 (EIP-1559)
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: "remote", // Use accounts from the running node
      // EIP-1559: Zero gas fees configuration
      gasPrice: 0, // Legacy transactions
    },
    cloud: {
      url: process.env.CLOUD_RPC_URL || "https://your-domain.com:8545",
      chainId: parseInt(process.env.CHAIN_ID) || 31337,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 60000,
      // EIP-1559: Zero gas fees configuration
      gasPrice: 0, // Legacy transactions
      maxFeePerGas: 0, // EIP-1559 transactions
      maxPriorityFeePerGas: 0, // EIP-1559 transactions
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};

