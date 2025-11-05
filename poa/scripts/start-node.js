const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Proof-of-Art Network...");
console.log("Network: Proof-of-Art Network");
console.log("Chain ID: 31337");
console.log("RPC URL: http://127.0.0.1:8545");
console.log("WebSocket URL: ws://127.0.0.1:8545");
console.log("\n⏳ Starting Hardhat node...\n");

// Start Hardhat node
const nodeProcess = exec("npx hardhat node", {
  cwd: __dirname + "/.."
});

nodeProcess.stdout.on("data", (data) => {
  console.log(data.toString());
});

nodeProcess.stderr.on("data", (data) => {
  console.error(data.toString());
});

nodeProcess.on("exit", (code) => {
  console.log(`\nNode process exited with code ${code}`);
});

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down Proof-of-Art Network...");
  nodeProcess.kill();
  process.exit();
});

console.log("📝 To deploy POA token, run in another terminal:");
console.log("   npm run deploy:local\n");
console.log("📝 To add to MetaMask:");
console.log("   Network Name: Proof-of-Art Network");
console.log("   RPC URL: http://127.0.0.1:8545");
console.log("   Chain ID: 31337");
console.log("   Currency Symbol: ETH\n");

