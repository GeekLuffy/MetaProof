# Proof of Art - Backend API Example

This is a simple example backend API for the Proof of Art Chrome Extension.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Or with auto-reload (development)
npm install -g nodemon
npm run dev
```

Server will run on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Verify Proof
```
POST /api/verify
Content-Type: application/json

{
  "contentHash": "abc123...",
  "ipfsCid": "Qm...",
  "fingerprint": "def456...",
  "timestamp": "2025-01-01T00:00:00Z",
  "platform": "midjourney",
  "model": "midjourney-v6"
}
```

### Register Proof
```
POST /api/register
Content-Type: application/json

{
  "id": "uuid",
  "prompt": "a beautiful sunset",
  "contentHash": "abc123...",
  "ipfsCid": "Qm...",
  "fingerprint": "def456...",
  "timestamp": "2025-01-01T00:00:00Z",
  "generatedAt": "2025-01-01T00:00:10Z",
  "platform": "midjourney",
  "model": "midjourney-v6",
  "contentType": "image/png",
  "metadata": {}
}
```

### Get Proof
```
GET /api/proof/:id
```

### Search Proofs
```
GET /api/search?platform=midjourney&model=v6
```

### Check Content Hash
```
POST /api/check-hash
Content-Type: application/json

{
  "contentHash": "abc123..."
}
```

### Get User Proofs
```
GET /api/user/proofs
```

### Statistics
```
GET /api/stats
```

## Extension Configuration

In the Chrome extension settings, set the API endpoint to:
```
http://localhost:3000
```

Or your production URL:
```
https://your-api-domain.com
```

## Production Deployment

### Important Changes for Production:

1. **Use a Database**
   - Replace the in-memory Map with MongoDB/PostgreSQL
   - Add connection pooling
   - Implement data persistence

2. **Add Authentication**
   - Implement JWT or OAuth
   - Protect endpoints with auth middleware
   - Associate proofs with user accounts

3. **Security**
   - Add rate limiting
   - Implement input validation
   - Use HTTPS only
   - Add API key authentication

4. **IPFS Verification**
   - Actually fetch from IPFS
   - Verify content hash matches
   - Handle timeouts gracefully

5. **Error Handling**
   - Add comprehensive error handling
   - Log errors to monitoring service
   - Return appropriate HTTP status codes

6. **Performance**
   - Add caching (Redis)
   - Implement pagination
   - Optimize database queries
   - Add CDN for static assets

### Example with MongoDB:

```javascript
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/proof-of-art');

// Define schema
const ProofSchema = new mongoose.Schema({
  registrationId: { type: String, unique: true, required: true },
  contentHash: { type: String, unique: true, required: true },
  prompt: String,
  ipfsCid: String,
  fingerprint: String,
  timestamp: Date,
  generatedAt: Date,
  platform: String,
  model: String,
  contentType: String,
  metadata: Object,
  registeredAt: { type: Date, default: Date.now }
});

const Proof = mongoose.model('Proof', ProofSchema);

// Use in endpoints
app.post('/api/register', async (req, res) => {
  const proof = new Proof(req.body);
  await proof.save();
  res.json({ success: true, data: proof });
});
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/proof-of-art
JWT_SECRET=your-secret-key
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## Docker Deployment

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t proof-of-art-api .
docker run -p 3000:3000 proof-of-art-api
```

## Testing

```bash
# Test health
curl http://localhost:3000/api/health

# Test register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "test",
    "contentHash": "test123",
    "timestamp": "2025-01-01T00:00:00Z",
    "platform": "test"
  }'

# Test verify
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "contentHash": "test123",
    "timestamp": "2025-01-01T00:00:00Z"
  }'
```

## License

MIT

