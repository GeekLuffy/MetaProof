const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking ProofOfArt contract status...\n");

  const contractAddress = process.env.PROOF_OF_ART_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("Contract Address:", contractAddress);
  
  try {
    const [signer] = await hre.ethers.getSigners();
    console.log("Checking with account:", signer.address);
    
    const ProofOfArt = await hre.ethers.getContractFactory("ProofOfArt");
    const proofOfArt = ProofOfArt.attach(contractAddress);
    
    // Check if contract exists
    const code = await hre.ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("\n❌ ERROR: No contract deployed at this address!");
      console.log("   Solution: Redeploy the contract");
      console.log("   Run: npm run deploy\n");
      process.exit(1);
    }
    
    console.log("✅ Contract exists at address");
    
    // Check certificate contract
    try {
      const certAddress = await proofOfArt.getCertificateContract();
      console.log("✅ Certificate contract:", certAddress);
      
      const certCode = await hre.ethers.provider.getCode(certAddress);
      if (certCode === "0x") {
        console.log("\n❌ ERROR: Certificate contract not deployed!");
        console.log("   Solution: Redeploy both contracts");
        console.log("   Run: npm run deploy\n");
        process.exit(1);
      }
      console.log("✅ Certificate contract is deployed");
      
    } catch (err) {
      console.log("\n❌ ERROR: Cannot get certificate contract");
      console.log("   Error:", err.message);
      console.log("   Solution: Redeploy the contract");
      console.log("   Run: npm run deploy\n");
      process.exit(1);
    }
    
    // Check if contract is paused
    try {
      const isPaused = await proofOfArt.paused();
      if (isPaused) {
        console.log("\n⚠️  WARNING: Contract is PAUSED");
        console.log("   Solution: Unpause the contract");
        console.log("   Run: npx hardhat run scripts/unpause.js --network localhost\n");
      } else {
        console.log("✅ Contract is not paused");
      }
    } catch (err) {
      console.log("⚠️  Could not check pause status:", err.message);
    }
    
    // Try to get total artworks
    try {
      const totalArtworks = await proofOfArt.totalArtworks();
      console.log("✅ Total artworks registered:", totalArtworks.toString());
    } catch (err) {
      console.log("⚠️  Could not get total artworks:", err.message);
    }
    
    // Test registration with sample data
    console.log("\n🧪 Testing registration function...");
    try {
      // Just estimate gas, don't actually send
      const testHash = "0x" + "1".repeat(64);
      const testPromptHash = "0x" + "2".repeat(64);
      
      const gasEstimate = await proofOfArt.registerArtwork.estimateGas(
        testHash,
        testPromptHash,
        "QmTest123456789",
        "test-model",
        "ipfs://test"
      );
      
      console.log("✅ Registration function is callable");
      console.log("   Estimated gas:", gasEstimate.toString());
      
    } catch (err) {
      console.log("\n❌ ERROR: Registration function fails!");
      console.log("   Error:", err.message);
      
      if (err.message.includes("Artwork already registered")) {
        console.log("   Note: This test hash is already registered (this is OK)");
      } else if (err.message.includes("certificateContract")) {
        console.log("\n   🔴 CERTIFICATE CONTRACT ISSUE DETECTED!");
        console.log("   Solution: Redeploy both contracts");
        console.log("   Run: npm run deploy\n");
        process.exit(1);
      } else {
        console.log("   Solution: Check contract state and redeploy if needed\n");
      }
    }
    
    console.log("\n✅ Contract check complete!");
    console.log("\nIf you're still having issues:");
    console.log("1. Restart your blockchain node");
    console.log("2. Redeploy contracts: npm run deploy");
    console.log("3. Update PROOF_OF_ART_ADDRESS in frontend/.env.local\n");
    
  } catch (error) {
    console.error("\n❌ Check failed:", error.message);
    console.log("\nSolution: Redeploy the contract");
    console.log("Run: npm run deploy\n");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

