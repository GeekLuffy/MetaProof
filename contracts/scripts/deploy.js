const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Proof-of-Art deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

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
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

