# Proof-of-Art: Biometric Authentication System

## Overview

This system implements **proof-of-human authentication** using facial capture at the time of artwork creation. Users' biometric data is securely hashed and tied to their digital identity through a verifiable process, ensuring that AI-generated content is authentically created by a verified human.

## Key Features

### 🔐 Secure Facial Authentication
- Captures minimal biometric data (facial hash) using webcam/IoT devices
- One-way hash generation - original biometric data is never stored
- Time-limited authentication tokens (5-minute validity)
- Entropy-based uniqueness verification

### 🎨 Artwork Creation Flow
1. **User connects wallet** → Ethereum-based authentication
2. **Facial capture** → Webcam captures user's face
3. **Biometric processing** → Server generates facial hash + proof-of-human signature
4. **Content generation** → AI generates artwork with embedded proof-of-human
5. **IPFS upload** → Artwork + biometric proof stored on IPFS
6. **Blockchain registration** → NFT certificate minted with full proof package

### 📦 Proof Package Structure
Each artwork includes:
```typescript
{
  creator: {
    address: "0x...",           // Wallet address
    biometricProof: {
      facialHash: "0x...",      // One-way hash of facial data
      signature: "0x...",        // Proof-of-human signature
      timestamp: "2024-...",     // Capture timestamp
      verified: true,            // Verification status
      entropy: 3.85              // Uniqueness measure
    }
  },
  output: {
    contentHash: "0x...",        // Artwork content hash
    ipfsCID: "Qm..."            // IPFS identifier
  }
}
```

## Architecture

### Backend Components

#### 1. Biometric Service (`backend/src/services/biometricService.ts`)
- `generateFacialHash()` - Creates SHA-256 hash from facial image data
- `generateProofOfHuman()` - Combines facial hash + wallet address + timestamp
- `verifyProofOfHuman()` - Validates proof-of-human signatures
- `createBiometricToken()` - Generates time-limited authentication token

#### 2. Biometric Routes (`backend/src/routes/biometric.ts`)
- `POST /api/biometric/capture` - Process facial capture (requires auth)
- `POST /api/biometric/verify` - Verify proof-of-human signature
- `GET /api/biometric/status` - Check biometric auth status

#### 3. Proof Service Integration (`backend/src/services/proofService.ts`)
- Updated to include biometric data in proof packages
- Maintains backward compatibility (biometric data is optional)

### Frontend Components

#### 1. FacialCapture Component (`frontend/src/components/FacialCapture.tsx`)
- Live webcam preview with face detection guide
- 3-second countdown before capture
- Real-time processing feedback
- Privacy-first design (camera stops after capture)

#### 2. Create Page Integration (`frontend/src/app/create/page.tsx`)
- Biometric verification gate before artwork generation
- Verification status display
- Re-verification option
- Automatic inclusion of biometric proof in IPFS uploads

## Security & Privacy

### ✅ What We Do
- Convert facial images to **one-way SHA-256 hashes**
- Never store original biometric images
- Use time-limited tokens (5-minute expiry)
- Include biometric proof in immutable blockchain records

### ❌ What We Don't Do
- Store raw facial images
- Share biometric data with third parties
- Use biometric data for identification (only verification)
- Keep biometric data after proof generation

## API Endpoints

### Capture Biometric Data
```bash
POST /api/biometric/capture
Authorization: Bearer <JWT_TOKEN>

{
  "imageData": "data:image/jpeg;base64,..."
}

Response:
{
  "success": true,
  "biometric": {
    "facialHash": "0x...",
    "signature": "0x...",
    "timestamp": "2024-11-06T...",
    "features": { "entropy": 3.85 },
    "token": "0x...",
    "expiresAt": "2024-11-06T..."
  }
}
```

### Verify Proof-of-Human
```bash
POST /api/biometric/verify

{
  "signature": "0x...",
  "facialHash": "0x...",
  "userAddress": "0x...",
  "timestamp": "2024-11-06T..."
}

Response:
{
  "success": true,
  "verified": true
}
```

## Usage Example

### Frontend Integration
```typescript
import { FacialCapture, BiometricData } from '@/components/FacialCapture';

function MyComponent() {
  const [biometricData, setBiometricData] = useState<BiometricData | null>(null);

  return (
    <FacialCapture
      onCapture={(data) => {
        setBiometricData(data);
        // Use data.facialHash, data.signature, etc.
      }}
      autoStart={true}
    />
  );
}
```

### Backend Integration
```typescript
import { biometricService } from './services/biometricService';

// Generate facial hash
const facialHash = biometricService.generateFacialHash(imageData);

// Create proof-of-human
const proof = biometricService.generateProofOfHuman({
  facialHash,
  userAddress: '0x...',
  timestamp: new Date().toISOString()
});
```

## Installation & Setup

### 1. Backend Dependencies
Already included in existing `backend/package.json`:
- `crypto` (Node.js built-in)
- `jsonwebtoken`
- `express`

### 2. Environment Variables
No additional environment variables required. Uses existing:
- `JWT_SECRET` - For authentication tokens

### 3. Start Services
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Testing

### Manual Testing Flow
1. Navigate to `/create` page
2. Connect wallet and authenticate
3. Click "Start Camera" in facial capture section
4. Position face within the oval guide
5. Click "Capture & Verify"
6. Wait for processing (2-3 seconds)
7. See "Identity Verified" confirmation
8. Generate artwork (biometric proof automatically included)

### Browser Requirements
- **Camera access** - Required
- **HTTPS** - Required in production (localhost exempted)
- **Supported browsers** - Chrome, Firefox, Safari, Edge (latest versions)

## Technical Specifications

### Hashing Algorithm
- **Algorithm:** SHA-256
- **Output:** 64-character hex string (0x prefix)
- **Entropy range:** 0-4 bits (3.5+ indicates high uniqueness)

### Token Expiry
- **Biometric tokens:** 5 minutes
- **JWT tokens:** 7 days (existing)
- **Proof verification:** 1 hour validity window

### Image Processing
- **Format:** JPEG (base64 encoded)
- **Max size:** 10MB
- **Resolution:** 1280x720 (ideal)
- **Compression:** 0.8 quality

## Troubleshooting

### Camera Not Working
- Check browser permissions: Settings → Privacy → Camera
- Ensure HTTPS (or localhost)
- Try different browser
- Check if camera is already in use

### "Authentication Required" Error
- Ensure wallet is connected
- Re-sign authentication message
- Check JWT token in localStorage

### "Failed to Process Biometric Data"
- Ensure backend server is running on port 5000
- Check CORS settings
- Verify image size < 10MB
- Try recapturing with better lighting

## Future Enhancements

- [ ] Support for multiple biometric modalities (fingerprint, voice)
- [ ] Liveness detection to prevent photo/video spoofing
- [ ] Multi-factor biometric authentication
- [ ] Decentralized biometric verification (on-chain)
- [ ] Privacy-preserving biometric matching (zero-knowledge proofs)

## License

MIT License - See LICENSE file for details

---

**Built for the Proof-of-Art Platform**  
Secure, verifiable, human-authenticated AI content creation on blockchain.

