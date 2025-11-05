#!/bin/bash

# Proof-of-Art Network - Cloud Deployment Script

set -e

echo "🚀 Proof-of-Art Network - Cloud Deployment"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script should be run as root or with sudo"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y

# Install dependencies
echo "📦 Installing dependencies..."
apt-get install -y docker.io docker-compose git curl

# Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Start Docker service
echo "🐳 Starting Docker service..."
systemctl start docker
systemctl enable docker

# Clone repository (if not already cloned)
if [ ! -d "/opt/proof-of-art-network" ]; then
    echo "📥 Cloning repository..."
    cd /opt
    git clone https://github.com/proof-of-art/proof-of-art-network.git
    cd proof-of-art-network
else
    echo "📥 Updating repository..."
    cd /opt/proof-of-art-network
    git pull
fi

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Create environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Create SSL directory
echo "🔒 Setting up SSL..."
mkdir -p cloud/ssl
if [ ! -f "cloud/ssl/cert.pem" ]; then
    echo "⚠️  SSL certificates not found. Please add cert.pem and key.pem to cloud/ssl/"
    echo "   You can use Let's Encrypt: certbot certonly --standalone -d your-domain.com"
fi

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f cloud/docker-compose.prod.yml build

# Start services
echo "🚀 Starting services..."
docker-compose -f cloud/docker-compose.prod.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker ps | grep -q poa-network-prod; then
    echo "✅ POA Network is running"
else
    echo "❌ POA Network failed to start"
    docker-compose -f cloud/docker-compose.prod.yml logs
    exit 1
fi

if docker ps | grep -q poa-nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx failed to start"
    docker-compose -f cloud/docker-compose.prod.yml logs
    exit 1
fi

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Set up SSL certificates (if not already done)"
echo "3. Edit .env file with your configuration"
echo "4. Deploy POA token: npm run deploy:cloud"
echo "5. Test RPC endpoint: curl https://your-domain.com"
echo ""
echo "📊 Service status:"
docker-compose -f cloud/docker-compose.prod.yml ps
echo ""
echo "📝 View logs:"
echo "   docker-compose -f cloud/docker-compose.prod.yml logs -f"

