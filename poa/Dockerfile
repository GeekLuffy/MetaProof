# Proof-of-Art Network - Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy project files
COPY . .

# Compile contracts
RUN npm run compile

# Expose ports
EXPOSE 8545 8546

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8545', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Start Hardhat node
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]

