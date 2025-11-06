require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-ethers");
const path = require("path");

// Load .env from root directory (one level up from contracts/)
require("dotenv").config({ path: path.join(__dirname, "../.env") });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      hardfork: "london", // Enables EIP-1559
      // EIP-1559: Zero gas fees configuration
      gasPrice: 0, // Legacy transactions
      initialBaseFeePerGas: 0, // Base fee set to 0 (EIP-1559)
    },
    localhost: {
      url: process.env.YOUR_CHAIN_LOCAL_RPC_URL || "http://127.0.0.1:8545",
      chainId: parseInt(process.env.YOUR_CHAIN_ID || "31337"),
      // EIP-1559: Zero gas fees configuration
      gasPrice: 0, // Legacy transactions
    },
    custom: {
      url: process.env.YOUR_CHAIN_RPC_URL || "https://p01--poa-chain--wdqd5crrcgfg.code.run/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.YOUR_CHAIN_ID || "31337"),
      timeout: 60000,
      // EIP-1559: Zero gas fees configuration
      gasPrice: 0, // Legacy transactions
      maxFeePerGas: 0, // EIP-1559 transactions
      maxPriorityFeePerGas: 0, // EIP-1559 transactions
    },
  },
  etherscan: {
    apiKey: {
      custom: process.env.YOUR_CHAIN_EXPLORER_API_KEY || "",
    },
    customChains: process.env.YOUR_CHAIN_EXPLORER_URL
      ? [
          {
            network: "custom",
            chainId: parseInt(process.env.YOUR_CHAIN_ID || "31337"),
            urls: {
              apiURL: process.env.YOUR_CHAIN_EXPLORER_API_URL || "",
              browserURL: process.env.YOUR_CHAIN_EXPLORER_URL || "",
            },
          },
        ]
      : [],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

