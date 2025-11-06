const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Proof-of-Art deployment...\n");

  // Get deployer account
  const signers = await hre.ethers.getSigners();
  
  if (!signers || signers.length === 0) {
    console.error("❌ No signers found. Please check your configuration:");
    console.error("   1. Make sure PRIVATE_KEY is set in your .env file (in the root directory)");
    console.error("   2. Verify the .env file is in D:\\Proof-of-Art\\.env");
    console.error("   3. Check that PRIVATE_KEY doesn't have quotes around it");
    process.exit(1);
  }
  
  const [deployer] = signers;
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  const balanceInEth = parseFloat(hre.ethers.formatEther(balance));
  console.log("💰 Account balance:", balanceInEth.toFixed(4), "MATIC");
  
  // Check if balance is sufficient (need at least 0.2 MATIC for deployment)
  const minRequired = 0.2;
  if (balanceInEth < minRequired) {
    console.error("\n❌ Insufficient funds for deployment!");
    console.error(`   Current balance: ${balanceInEth.toFixed(4)} MATIC`);
    console.error(`   Recommended: At least ${minRequired} MATIC`);
    console.error("\n💡 Get test MATIC from:");
    console.error("   1. https://faucet.polygon.technology/ (select Polygon Amoy)");
    console.error("   2. https://www.alchemy.com/faucets/polygon-amoy");
    console.error("   3. https://faucet.quicknode.com/polygon/amoy");
    console.error(`\n   Your address: ${deployer.address}`);
    process.exit(1);
  }
  
  console.log("✅ Sufficient balance for deployment\n");

  // Deploy ProofOfArt contract (which also deploys ProofCertificate)
  console.log("📄 Deploying ProofOfArt contract...");
  const ProofOfArt = await hre.ethers.getContractFactory("ProofOfArt");
  const proofOfArt = await ProofOfArt.deploy();
  await proofOfArt.waitForDeployment();
  
  const proofOfArtAddress = await proofOfArt.getAddress();
  console.log("✅ ProofOfArt deployed to:", proofOfArtAddress);

  // Get ProofCertificate address
  const certificateAddress = await proofOfArt.getCertificateContract();
  console.log("✅ ProofCertificate deployed to:", certificateAddress);

  // Deploy ProofMarketplace
  console.log("\n📄 Deploying ProofMarketplace contract...");
  const ProofMarketplace = await hre.ethers.getContractFactory("ProofMarketplace");
  const marketplace = await ProofMarketplace.deploy(certificateAddress);
  await marketplace.waitForDeployment();
  
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ ProofMarketplace deployed to:", marketplaceAddress);

  // Display deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("\nContracts:");
  console.log("  ProofOfArt:        ", proofOfArtAddress);
  console.log("  ProofCertificate:  ", certificateAddress);
  console.log("  ProofMarketplace:  ", marketplaceAddress);
  console.log("=".repeat(60));

  // Save deployment addresses to file
  const fs = require("fs");
  const deploymentData = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ProofOfArt: proofOfArtAddress,
      ProofCertificate: certificateAddress,
      ProofMarketplace: marketplaceAddress,
    },
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(`\n✅ Deployment info saved to ${deploymentsDir}/${hre.network.name}.json`);

  // Verification instructions
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n📝 To verify contracts on block explorer, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${proofOfArtAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${marketplaceAddress} ${certificateAddress}`);
  }

  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    
    // Check for insufficient funds error
    if (error.message && error.message.includes("insufficient funds")) {
      console.error("\n💡 Insufficient funds for gas fees!");
      console.error("   Get more test MATIC from:");
      console.error("   1. https://faucet.polygon.technology/ (select Polygon Amoy)");
      console.error("   2. https://www.alchemy.com/faucets/polygon-amoy");
      console.error("   3. https://faucet.quicknode.com/polygon/amoy");
    } else {
      console.error(error.message || error);
    }
    
    process.exit(1);
  });

