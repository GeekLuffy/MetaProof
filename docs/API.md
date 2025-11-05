# Proof-of-Art API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.proof-of-art.io/api
```

## Authentication
Most endpoints require Web3 wallet authentication. Include the wallet signature in the request headers:
```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-05T10:00:00Z",
  "uptime": 12345
}
```

---

### Generate AI Artwork
```http
POST /api/generate
```

**Request Body:**
```json
{
  "prompt": "Cyberpunk dragon in neon city",
  "model": "dall-e-3",
  "parameters": {
    "size": "1024x1024",
    "quality": "hd",
    "style": "vivid"
  },
  "biometricData": "optional_facial_hash"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://ipfs.io/ipfs/QmX...",
  "ipfsCID": "QmX...",
  "proofPackage": { ... },
  "certificateTokenId": 42
}
```

---

### Upload to IPFS
```http
POST /api/upload
```

**Request (multipart/form-data):**
- `file`: Image file
- `metadata`: JSON metadata

**Response:**
```json
{
  "success": true,
  "ipfsCID": "QmX...",
  "url": "https://gateway.pinata.cloud/ipfs/QmX..."
}
```

---

### Verify Artwork
```http
POST /api/verify
```

**Request Body:**
```json
{
  "contentHash": "abc123...",
  "ipfsCID": "QmX..."
}
```

**Response:**
```json
{
  "verified": true,
  "artwork": { ... },
  "verificationScore": 100,
  "timesVerified": 45
}
```

---

### Get User Artworks
```http
GET /api/artworks?address=0x742d35Cc...
```

**Response:**
```json
{
  "artworks": [
    {
      "id": "uuid",
      "proofPackage": { ... },
      "verified": true,
      "createdAt": "2025-11-05T10:00:00Z"
    }
  ],
  "total": 10
}
```

---

### Get Dashboard Stats
```http
GET /api/stats
```

**Response:**
```json
{
  "totalArtworks": 1247,
  "uniqueCreators": 342,
  "verificationsPerformed": 5830,
  "averageBlockConfirmationTime": "4.2s",
  "plagiarismDetections": 23
}
```

---

## Error Responses

All endpoints return errors in the following format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `501` - Not Implemented

---

## Rate Limiting
- 100 requests per 15 minutes per IP
- Additional limits for resource-intensive endpoints

