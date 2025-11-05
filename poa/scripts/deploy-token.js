const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting POA Token deployment...");
  
  const networkName = hre.network.name;
  console.log(`Network: ${networkName}`);
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);
  
  // Deploy POA Token
  console.log("\nDeploying POAToken contract...");
  const initialSupply = process.env.INITIAL_SUPPLY || "1000000"; // 1,000,000 POA
  
  const POAToken = await hre.ethers.getContractFactory("POAToken");
  const poaToken = await POAToken.deploy(initialSupply);
  
  await poaToken.waitForDeployment();
  const tokenAddress = await poaToken.getAddress();
  
  console.log(`POAToken deployed to: ${tokenAddress}`);
  
  // Get token info
  const name = await poaToken.name();
  const symbol = await poaToken.symbol();
  const decimals = await poaToken.decimals();
  const totalSupply = await poaToken.totalSupply();
  
  console.log("\nToken Information:");
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  console.log(`Owner: ${deployer.address}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contract: "POAToken",
    address: tokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    tokenInfo: {
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: totalSupply.toString(),
      totalSupplyFormatted: hre.ethers.formatUnits(totalSupply, decimals)
    }
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment file
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);
  
  // Save ABI
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "POAToken.sol", "POAToken.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiFile = path.join(deploymentsDir, `POAToken-abi.json`);
    fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
    console.log(`ABI saved to: ${abiFile}`);
  }
  
  console.log("\n✅ Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Add the token to MetaMask using the contract address above");
  console.log("2. Import the network configuration in your project");
  console.log("3. Run 'npm run export:config' to update exported configuration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

