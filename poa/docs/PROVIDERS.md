# Cloud Provider Deployment Guides

Platform-specific deployment guides for various cloud providers.

## Table of Contents

1. [AWS (Amazon Web Services)](#aws-amazon-web-services)
2. [DigitalOcean](#digitalocean)
3. [Google Cloud Platform](#google-cloud-platform)
4. [Microsoft Azure](#microsoft-azure)
5. [Railway.app](#railwayapp)
6. [Render.com](#rendercom)
7. [Fly.io](#flyio)
8. [Cost Comparison](#cost-comparison)

---

## AWS (Amazon Web Services)

### Deployment Options

#### Option 1: EC2 (Recommended)

**Best for**: Full control, predictable pricing

1. **Launch EC2 Instance**
   ```bash
   # Choose Ubuntu Server 22.04 LTS
   # Instance type: t3.medium (2 vCPU, 4 GB RAM)
   # Storage: 30 GB SSD
   ```

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io docker-compose nodejs npm -y
   ```

4. **Deploy Application**
   ```bash
   git clone https://github.com/proof-of-art/proof-of-art-network.git
   cd proof-of-art-network
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run docker:prod:up
   ```

5. **Configure Security Group**
   - Allow inbound: 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - Allow outbound: All

6. **Set Up Elastic IP** (optional)
   - Allocate Elastic IP for static IP address

#### Option 2: ECS (Elastic Container Service)

**Best for**: Scalability, managed container orchestration

1. Create ECS cluster
2. Define task definition with Docker image
3. Create service with load balancer
4. Configure auto-scaling

#### Option 3: Lightsail

**Best for**: Simplicity, predictable pricing

1. Create Lightsail instance ($10-20/month)
2. Follow EC2 deployment steps
3. Attach static IP

### AWS-Specific Tips

- Use CloudWatch for monitoring
- Set up automated backups with AWS Backup
- Consider using Secrets Manager for keys
- Use Route 53 for DNS management

### Estimated Costs

- **t3.medium EC2**: ~$30/month
- **ECS Fargate**: ~$25-50/month
- **Lightsail**: $10-20/month

---

## DigitalOcean

### Deployment Options

#### Option 1: Droplet (Recommended)

**Best for**: Simple deployment, great pricing

1. **Create Droplet**
   ```
   Distribution: Ubuntu 22.04
   Plan: Basic
   CPU: 2 vCPU, 4 GB RAM
   Storage: 80 GB SSD
   Cost: $24/month
   ```

2. **Connect to Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com | sh
   apt-get install docker-compose -y
   ```

4. **Deploy Application**
   ```bash
   git clone https://github.com/proof-of-art/proof-of-art-network.git
   cd proof-of-art-network
   npm install
   cp .env.example .env
   nano .env  # Configure
   npm run docker:prod:up
   ```

5. **Configure Firewall**
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

6. **Add Domain** (DigitalOcean DNS)
   - Add A record pointing to droplet IP
   - Wait for DNS propagation

#### Option 2: App Platform

**Best for**: Managed deployment, CI/CD

1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy automatically

### DigitalOcean-Specific Tips

- Use managed PostgreSQL for additional data storage
- Enable automated backups ($4.80/month)
- Use Spaces for artifact storage
- Monitor with built-in monitoring

### Estimated Costs

- **Basic Droplet**: $24/month
- **App Platform**: $12-25/month
- **With backups**: +$4.80/month

---

## Google Cloud Platform

### Deployment Options

#### Option 1: Compute Engine

**Best for**: Full control, Google ecosystem integration

1. **Create VM Instance**
   ```
   Machine type: e2-medium (2 vCPU, 4 GB)
   Boot disk: Ubuntu 22.04 LTS, 30 GB
   Region: Choose closest to users
   ```

2. **Connect via SSH**
   ```bash
   gcloud compute ssh your-instance-name
   ```

3. **Install Dependencies**
   ```bash
   sudo apt-get update
   curl -fsSL https://get.docker.com | sudo sh
   sudo apt-get install docker-compose nodejs npm -y
   ```

4. **Deploy Application**
   ```bash
   git clone https://github.com/proof-of-art/proof-of-art-network.git
   cd proof-of-art-network
   npm install
   cp .env.example .env
   # Configure .env
   npm run docker:prod:up
   ```

5. **Configure Firewall Rules**
   - Create firewall rules for ports 80, 443
   - Apply to instance

6. **Reserve Static IP**
   ```bash
   gcloud compute addresses create poa-network-ip --region=us-central1
   ```

#### Option 2: Cloud Run

**Best for**: Serverless, auto-scaling

1. Build and push Docker image to GCR
2. Deploy to Cloud Run
3. Configure custom domain
4. Set environment variables

### GCP-Specific Tips

- Use Cloud Monitoring for observability
- Store secrets in Secret Manager
- Use Cloud DNS for domain management
- Enable Cloud Armor for DDoS protection

### Estimated Costs

- **e2-medium**: ~$25/month
- **Cloud Run**: Pay per use (~$10-30/month)
- **With static IP**: +$7.30/month

---

## Microsoft Azure

### Deployment Options

#### Option 1: Virtual Machine

**Best for**: Enterprise, Windows integration

1. **Create VM**
   ```
   Image: Ubuntu Server 22.04
   Size: Standard_B2s (2 vCPU, 4 GB)
   Disk: 30 GB SSD
   ```

2. **Connect via SSH**
   ```bash
   ssh azureuser@your-vm-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt-get update
   curl -fsSL https://get.docker.com | sudo sh
   sudo apt-get install docker-compose -y
   ```

4. **Deploy Application**
   ```bash
   git clone https://github.com/proof-of-art/proof-of-art-network.git
   cd proof-of-art-network
   npm install
   cp .env.example .env
   npm run docker:prod:up
   ```

5. **Configure NSG (Network Security Group)**
   - Allow inbound: 22, 80, 443

#### Option 2: Container Instances

**Best for**: Quick deployment, pay per use

1. Create container group
2. Specify Docker image
3. Configure networking
4. Set environment variables

### Azure-Specific Tips

- Use Azure Monitor for logging
- Store secrets in Key Vault
- Use Azure DNS for domain management
- Consider Azure Front Door for CDN

### Estimated Costs

- **B2s VM**: ~$30/month
- **Container Instances**: ~$20-40/month
- **With managed disk**: +$5/month

---

## Railway.app

### Deployment (Easiest!)

**Best for**: Quick deployment, developers

1. **Sign up at Railway.app**

2. **Create New Project**
   - Choose "Deploy from GitHub"
   - Connect repository

3. **Configure Project**
   ```bash
   # Railway will detect Docker setup automatically
   # Or add railway.json:
   {
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "./Dockerfile"
     },
     "deploy": {
       "startCommand": "npm run node"
     }
   }
   ```

4. **Add Environment Variables**
   - Go to Variables tab
   - Add from .env.example

5. **Deploy**
   - Railway deploys automatically
   - Get public URL

6. **Add Custom Domain** (optional)
   - Go to Settings > Networking
   - Add your domain
   - Update DNS records

### Railway-Specific Tips

- Use Railway CLI for local testing
- Enable automatic deployments on push
- Monitor usage in dashboard
- Use Railway database plugins if needed

### Estimated Costs

- **Starter Plan**: $5/month (500 hours)
- **Developer Plan**: $20/month (unlimited)
- Pay per use beyond free tier

---

## Render.com

### Deployment

**Best for**: Modern deployment, great DX

1. **Sign up at Render.com**

2. **Create Web Service**
   - Connect GitHub repository
   - Choose "Docker" environment

3. **Configure Service**
   ```yaml
   # render.yaml
   services:
     - type: web
       name: poa-network
       env: docker
       dockerfilePath: ./Dockerfile
       envVars:
         - key: CHAIN_ID
           value: 31337
         - key: NODE_ENV
           value: production
   ```

4. **Set Environment Variables**
   - Add from dashboard or render.yaml

5. **Deploy**
   - Render deploys automatically
   - Get .onrender.com URL

6. **Add Custom Domain**
   - Go to Settings
   - Add custom domain
   - Update DNS

### Render-Specific Tips

- Use Render Disks for persistent storage
- Enable automatic TLS certificates
- Set up health checks
- Use Render Blueprints for IaC

### Estimated Costs

- **Starter**: $7/month
- **Standard**: $25/month
- **Pro**: $85/month

---

## Fly.io

### Deployment

**Best for**: Edge deployment, global distribution

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Initialize App**
   ```bash
   cd proof-of-art-network
   fly launch
   # Follow prompts
   ```

4. **Configure fly.toml**
   ```toml
   app = "poa-network"
   
   [build]
   dockerfile = "Dockerfile"
   
   [[services]]
   http_checks = []
   internal_port = 8545
   processes = ["app"]
   protocol = "tcp"
   
   [[services.ports]]
   port = 80
   handlers = ["http"]
   
   [[services.ports]]
   port = 443
   handlers = ["tls", "http"]
   ```

5. **Set Secrets**
   ```bash
   fly secrets set PRIVATE_KEY=your_key
   fly secrets set CHAIN_ID=31337
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```

7. **Add Custom Domain**
   ```bash
   fly certs add your-domain.com
   ```

### Fly-Specific Tips

- Deploy to multiple regions for HA
- Use Fly Volumes for persistent storage
- Monitor with Fly metrics
- Use Fly Postgres if needed

### Estimated Costs

- **Shared CPU**: $3-10/month
- **Dedicated CPU**: $30+/month
- Pay per use model

---

## Cost Comparison

### Monthly Costs (2 vCPU, 4 GB RAM)

| Provider | Plan | Cost | Notes |
|----------|------|------|-------|
| AWS EC2 | t3.medium | ~$30 | + data transfer |
| DigitalOcean | Basic Droplet | $24 | Includes bandwidth |
| Google Cloud | e2-medium | ~$25 | + egress costs |
| Azure | B2s | ~$30 | + bandwidth |
| Railway | Developer | $20 | Unlimited hours |
| Render | Standard | $25 | Includes SSL |
| Fly.io | Shared CPU | $10-15 | Pay per use |

### Free Tiers

- **AWS**: 12 months free (t2.micro)
- **Google Cloud**: $300 credits, always-free tier
- **Azure**: $200 credits, free services
- **Railway**: $5 credit monthly
- **Render**: Free tier available (limited)
- **Fly.io**: Free allowances

### Recommendations by Use Case

**Development/Testing**
- Railway.app or Render.com (easiest)
- Fly.io (cheapest)

**Small Production**
- DigitalOcean Droplet (best value)
- Railway Developer plan

**Enterprise/Scale**
- AWS EC2/ECS (most features)
- Google Cloud (best integration)
- Azure (enterprise support)

**Global Distribution**
- Fly.io (edge deployment)
- Cloudflare + any provider

## General Deployment Checklist

Regardless of provider:

- [ ] Server/instance created
- [ ] Docker installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] SSL certificates obtained
- [ ] Firewall configured
- [ ] Services started
- [ ] Contracts deployed
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Backups configured

## Next Steps

- [Back to Cloud Setup](CLOUD_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Network Setup](NETWORK_SETUP.md)

## Support

Each provider has excellent documentation:

- [AWS Documentation](https://docs.aws.amazon.com/)
- [DigitalOcean Docs](https://docs.digitalocean.com/)
- [Google Cloud Docs](https://cloud.google.com/docs)
- [Azure Documentation](https://docs.microsoft.com/azure)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs/)

