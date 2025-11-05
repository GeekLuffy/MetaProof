const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("☁️  Proof-of-Art Network - Cloud Deployment Setup\n");
  console.log("This script will help you deploy the network to the cloud.\n");
  
  // Ask for cloud provider
  console.log("Supported cloud providers:");
  console.log("1. Docker (Manual - Use docker-compose)");
  console.log("2. AWS (EC2/ECS)");
  console.log("3. DigitalOcean (Droplet/App Platform)");
  console.log("4. Google Cloud (Compute Engine)");
  console.log("5. Azure (VM/Container Instances)");
  console.log("6. Railway.app");
  console.log("7. Render.com");
  console.log("8. Fly.io\n");
  
  const provider = await question("Select cloud provider (1-8): ");
  
  if (provider === "1") {
    console.log("\n📦 Docker Deployment Selected");
    console.log("\nSteps to deploy:");
    console.log("1. Set up environment variables in .env");
    console.log("2. Build Docker image: npm run docker:build");
    console.log("3. Start production containers: npm run docker:prod:up");
    console.log("4. Configure SSL/TLS (see docs/CLOUD_SETUP.md)");
    console.log("5. Deploy POA token: npm run deploy:cloud");
    console.log("\nFor detailed instructions, see: docs/CLOUD_SETUP.md");
  } else {
    const providerName = {
      "2": "AWS",
      "3": "DigitalOcean",
      "4": "Google Cloud",
      "5": "Azure",
      "6": "Railway.app",
      "7": "Render.com",
      "8": "Fly.io"
    }[provider];
    
    console.log(`\n☁️  ${providerName} Deployment Selected`);
    console.log(`\nPlease refer to docs/PROVIDERS.md for ${providerName} deployment instructions.`);
    console.log("\nGeneral steps:");
    console.log("1. Create a server/instance on your cloud provider");
    console.log("2. Install Docker and Docker Compose");
    console.log("3. Clone this repository");
    console.log("4. Set up environment variables");
    console.log("5. Run: npm run docker:prod:up");
    console.log("6. Configure SSL/TLS certificates");
    console.log("7. Deploy POA token: npm run deploy:cloud");
  }
  
  rl.close();
}

main().catch((error) => {
  console.error(error);
  rl.close();
  process.exit(1);
});

