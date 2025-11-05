#!/usr/bin/env node

// Proof-of-Art Network CLI

const { exec } = require("child_process");
const path = require("path");

const command = process.argv[2];

if (!command) {
  console.log("Proof-of-Art Network CLI");
  console.log("\nUsage:");
  console.log("  npx proof-of-art-network <command>");
  console.log("\nCommands:");
  console.log("  start-node    Start the blockchain network");
  console.log("  deploy        Deploy POA token to localhost");
  console.log("  help          Show this help message");
  process.exit(0);
}

const commands = {
  "start-node": "node scripts/start-node.js",
  "deploy": "npm run deploy:local",
  "help": () => {
    console.log("Proof-of-Art Network CLI");
    console.log("\nCommands:");
    console.log("  start-node    Start the blockchain network");
    console.log("  deploy        Deploy POA token to localhost");
    console.log("  help          Show this help message");
  }
};

if (command === "help") {
  commands.help();
  process.exit(0);
}

if (!commands[command]) {
  console.error(`Unknown command: ${command}`);
  console.log("Run 'npx proof-of-art-network help' for usage information.");
  process.exit(1);
}

// Execute command
const cmd = commands[command];
const child = exec(cmd, { cwd: __dirname + "/.." });

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on("exit", (code) => {
  process.exit(code);
});

