const hre = require("hardhat");
const path = require("path");

// Load .env from root directory (one level up from contracts/)
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

async function main() {
  console.log("🔍 Checking testnet setup...\n");

  // Check environment variables
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.YOUR_CHAIN_RPC_URL || process.env.YOUR_CHAIN_LOCAL_RPC_URL || "http://127.0.0.1:8545";
  const expectedChainId = parseInt(process.env.YOUR_CHAIN_ID || "31337");

  if (!privateKey) {
    console.error("❌ PRIVATE_KEY not found in environment variables");
    console.log("\n   Troubleshooting:");
    console.log("   1. Make sure .env file exists in: D:\\Proof-of-Art\\.env");
    console.log("   2. Add PRIVATE_KEY=your_private_key_here (no quotes)");
    console.log("   3. Make sure you're running from: D:\\Proof-of-Art\\contracts");
    console.log("   4. The .env file should be in the root directory, not in contracts/");
    process.exit(1);
  }

  console.log("✅ PRIVATE_KEY found");

  // Check network connection
  try {
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    
    if (BigInt(network.chainId) !== BigInt(expectedChainId)) {
      console.error(`❌ Wrong network! Expected chain ID ${expectedChainId}, got ${network.chainId}`);
      process.exit(1);
    }

    console.log(`✅ Connected to custom blockchain (Chain ID: ${network.chainId})`);

    // Check account balance
    const wallet = new hre.ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = hre.ethers.formatEther(balance);

    console.log(`✅ Wallet address: ${wallet.address}`);
    console.log(`💰 Balance: ${balanceInEth} ETH`);

    if (parseFloat(balanceInEth) < 0.01) {
      console.warn("\n⚠️  Low balance! You may need more ETH for deployment.");
      console.log("   Ensure your custom blockchain node is running and your account has sufficient funds.");
    } else {
      console.log("✅ Sufficient balance for deployment");
    }

    console.log("\n🎉 Setup looks good! You're ready to deploy.");
    console.log("\nNext steps:");
    console.log("  1. Run: npm run deploy:custom");
    console.log("  2. Copy the deployed contract address");
    console.log("  3. Add NEXT_PUBLIC_PROOF_OF_ART_ADDRESS to your .env file");
    console.log("  4. Restart your frontend dev server");

  } catch (error) {
    console.error("❌ Error connecting to network:", error.message);
    console.log("\nTroubleshooting:");
    console.log("  - Check your internet connection");
    console.log("  - Verify YOUR_CHAIN_RPC_URL is correct");
    console.log("  - Ensure your custom blockchain node is running");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup check failed:", error);
    process.exit(1);
  });

