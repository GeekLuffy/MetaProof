# Cloud Deployment Setup

This guide covers deploying the Proof-of-Art Network to the cloud for public access.

## Overview

Deploy your blockchain network to the cloud to provide:
- Public RPC endpoint (HTTPS)
- WebSocket support (optional)
- SSL/TLS encryption
- High availability
- Auto-restart on failure
- Professional infrastructure

## Prerequisites

- Cloud server or platform account
- Domain name (recommended for SSL)
- Docker and Docker Compose installed on server
- Basic knowledge of Linux/server administration

## Quick Deployment

### 1. Prepare Environment

```bash
# Clone repository on your server
git clone https://github.com/proof-of-art/proof-of-art-network.git
cd proof-of-art-network

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env
```

### 2. Configure Environment

Edit `.env`:

```bash
# Network Configuration
CHAIN_ID=31337
NETWORK_NAME="Proof-of-Art Network"

# Cloud RPC URLs
CLOUD_RPC_URL=https://your-domain.com:8545
CLOUD_WS_URL=wss://your-domain.com:8546

# Deployment
INITIAL_SUPPLY=1000000
PRIVATE_KEY=your_deployment_private_key_here

NODE_ENV=production
```

### 3. Set Up SSL Certificates

#### Option A: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo mkdir -p cloud/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem cloud/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem cloud/ssl/key.pem
```

#### Option B: Self-Signed (Development Only)

```bash
mkdir -p cloud/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout cloud/ssl/key.pem \
  -out cloud/ssl/cert.pem
```

### 4. Deploy with Docker

```bash
# Build Docker image
npm run docker:build

# Start production containers
npm run docker:prod:up

# Check status
docker-compose -f cloud/docker-compose.prod.yml ps

# View logs
docker-compose -f cloud/docker-compose.prod.yml logs -f
```

### 5. Deploy POA Token

```bash
# Deploy token to cloud network
npm run deploy:cloud

# Export configuration
npm run export:config
```

### 6. Verify Deployment

```bash
# Test RPC endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://your-domain.com

# Check health
curl https://your-domain.com/health
```

## Deployment Methods

### Method 1: Docker Compose (Recommended)

Best for: Single server, full control, easy setup

```bash
# Production deployment
npm run docker:prod:up

# Stop deployment
npm run docker:prod:down

# View logs
npm run docker:logs
```

### Method 2: Automated Script

Use the automated deployment script:

```bash
# Run as root
sudo bash cloud/deploy.sh
```

This script will:
1. Update system packages
2. Install Docker and dependencies
3. Build Docker images
4. Configure SSL
5. Start services
6. Verify deployment

### Method 3: Manual Deployment

For advanced users who want full control:

1. Install Node.js and dependencies
2. Configure Nginx reverse proxy
3. Set up PM2 for process management
4. Configure SSL/TLS
5. Set up monitoring

See detailed steps below.

## Architecture

### Docker Compose Setup

The production setup includes:

```
┌─────────────────────────────────────┐
│         Internet (Port 443)         │
└─────────────┬───────────────────────┘
              │
         ┌────▼────┐
         │  Nginx  │  (SSL termination, reverse proxy)
         └────┬────┘
              │
    ┌─────────▼──────────┐
    │  POA Network Node  │  (Hardhat node)
    │    Port 8545       │
    └────────────────────┘
```

### Components

1. **POA Network Node**: Hardhat node running the blockchain
2. **Nginx**: Reverse proxy with SSL/TLS termination
3. **Docker**: Containerization for easy deployment
4. **Let's Encrypt**: Free SSL certificates

## Server Requirements

### Minimum Requirements

- **CPU**: 1 core
- **RAM**: 2 GB
- **Storage**: 20 GB
- **Network**: Public IP address
- **OS**: Linux (Ubuntu 20.04+ recommended)

### Recommended Requirements

- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 50 GB SSD
- **Network**: Public IP with domain
- **OS**: Linux (Ubuntu 22.04)

## Firewall Configuration

Open required ports:

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (for Let's Encrypt)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Or iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Advanced Configuration

### Custom Nginx Configuration

Edit `cloud/nginx.conf` to customize:

- Rate limiting
- CORS headers
- Authentication
- Load balancing
- Caching

### PM2 Process Management

Use PM2 for non-Docker deployments:

```bash
# Install PM2
npm install -g pm2

# Start with ecosystem config
pm2 start cloud/ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs poa-network

# Restart
pm2 restart poa-network

# Auto-start on boot
pm2 startup
pm2 save
```

### Monitoring

Add monitoring with PM2:

```bash
# Install PM2 Plus (optional)
pm2 install pm2-server-monit

# View monitoring dashboard
pm2 monit
```

### Log Rotation

Configure log rotation:

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/poa-network
```

Add:

```
/opt/proof-of-art-network/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 root root
    sharedscripts
}
```

## Security Best Practices

### 1. Secure Private Keys

```bash
# Use environment variables
export PRIVATE_KEY="your_key_here"

# Or use secrets management
# - AWS Secrets Manager
# - HashiCorp Vault
# - Google Secret Manager
```

### 2. Rate Limiting

Configure in `cloud/nginx.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=rpc_limit:10m rate=100r/s;
limit_req zone=rpc_limit burst=20 nodelay;
```

### 3. Firewall Rules

- Only allow necessary ports
- Use fail2ban for SSH protection
- Consider IP whitelisting

### 4. SSL/TLS

- Use strong ciphers
- Enable HSTS
- Disable old TLS versions

### 5. Regular Updates

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade

# Update Docker images
docker-compose pull
docker-compose up -d

# Update npm packages
npm update
```

## Maintenance

### Backup

```bash
# Backup blockchain data
docker-compose -f cloud/docker-compose.prod.yml exec poa-network \
  tar -czf /backup/poa-data-$(date +%Y%m%d).tar.gz /app/data

# Backup deployments
tar -czf deployments-backup.tar.gz deployments/
```

### Updates

```bash
# Pull latest changes
git pull

# Rebuild and restart
npm run docker:prod:down
npm run docker:build
npm run docker:prod:up
```

### Troubleshooting

```bash
# Check container status
docker ps

# View logs
docker-compose -f cloud/docker-compose.prod.yml logs -f

# Restart services
docker-compose -f cloud/docker-compose.prod.yml restart

# Check disk space
df -h

# Check memory usage
free -h
```

## Scaling

### Horizontal Scaling

Deploy multiple nodes with load balancer:

```nginx
upstream poa_network {
    server node1:8545;
    server node2:8545;
    server node3:8545;
}
```

### Vertical Scaling

Upgrade server resources:
- More CPU cores
- More RAM
- Faster storage (SSD/NVMe)

## Monitoring & Alerts

### Health Checks

```bash
# RPC health check
curl https://your-domain.com/health

# Block number check
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://your-domain.com
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

### Log Monitoring

Forward logs to:
- ELK Stack
- Splunk
- Datadog
- CloudWatch

## Cost Optimization

### Choose Right Provider

Compare costs:
- DigitalOcean: $5-20/month
- AWS EC2: $10-50/month
- Google Cloud: $10-50/month
- Railway: $5-20/month

### Use Spot Instances

For non-production:
- AWS Spot Instances (up to 90% savings)
- Google Preemptible VMs

### Monitor Resources

- Use monitoring to right-size
- Scale down during low usage
- Use auto-scaling

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f cloud/docker-compose.prod.yml logs

# Check if port is in use
sudo netstat -tulpn | grep 8545

# Restart Docker
sudo systemctl restart docker
```

### SSL Certificate Issues

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem cloud/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem cloud/ssl/key.pem

# Restart Nginx
docker-compose -f cloud/docker-compose.prod.yml restart nginx
```

### High Memory Usage

```bash
# Check container memory
docker stats

# Increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Next Steps

- [Provider-Specific Guides](PROVIDERS.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Token Setup](TOKEN_SETUP.md)

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

