/**
 * Example Backend API for Proof of Art Extension
 * 
 * This is a simple Node.js/Express server that implements
 * the required API endpoints for the extension.
 * 
 * To use:
 * 1. npm init -y
 * 2. npm install express cors body-parser mongoose
 * 3. Set up MongoDB
 * 4. node server.js
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// In-memory storage (use database in production!)
const proofs = new Map();

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Proof of Art API is running',
    version: '1.0.0'
  });
});

/**
 * Verify a proof
 * POST /api/verify
 */
app.post('/api/verify', async (req, res) => {
  try {
    const { 
      contentHash, 
      ipfsCid, 
      fingerprint, 
      timestamp, 
      platform, 
      model 
    } = req.body;

    // Validate required fields
    if (!contentHash || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contentHash and timestamp'
      });
    }

    // Verify timestamp is not in the future
    const proofTime = new Date(timestamp).getTime();
    const now = Date.now();
    
    if (proofTime > now) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Timestamp is in the future'
      });
    }

    // Check if proof already exists
    const existingProof = Array.from(proofs.values())
      .find(p => p.contentHash === contentHash);

    if (existingProof) {
      return res.json({
        success: true,
        verified: true,
        message: 'Proof already registered',
        registrationId: existingProof.registrationId,
        originalTimestamp: existingProof.timestamp
      });
    }

    // Verify IPFS CID if provided
    if (ipfsCid) {
      // In production, fetch from IPFS and verify hash matches
      // const ipfsContent = await fetchFromIPFS(ipfsCid);
      // const ipfsHash = await computeHash(ipfsContent);
      // if (ipfsHash !== contentHash) return error;
    }

    // Proof is valid
    res.json({
      success: true,
      verified: true,
      message: 'Proof verified successfully',
      data: {
        contentHash,
        platform,
        model,
        timestamp
      }
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Register a new proof
 * POST /api/register
 */
app.post('/api/register', async (req, res) => {
  try {
    const {
      id,
      prompt,
      contentHash,
      ipfsCid,
      fingerprint,
      timestamp,
      generatedAt,
      platform,
      model,
      contentType,
      metadata
    } = req.body;

    // Validate required fields
    if (!contentHash || !timestamp || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if already registered
    if (proofs.has(contentHash)) {
      return res.status(409).json({
        success: false,
        error: 'Proof already registered',
        registrationId: proofs.get(contentHash).registrationId
      });
    }

    // Generate registration ID
    const registrationId = `POA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store proof
    const proof = {
      id: id || registrationId,
      registrationId,
      prompt,
      contentHash,
      ipfsCid,
      fingerprint,
      timestamp,
      generatedAt,
      platform,
      model,
      contentType,
      metadata,
      registeredAt: new Date().toISOString()
    };

    proofs.set(contentHash, proof);

    // In production: Save to database
    // await Proof.create(proof);

    res.json({
      success: true,
      registrationId,
      message: 'Proof registered successfully',
      data: {
        id: proof.id,
        registrationId,
        contentHash,
        timestamp
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get proof by ID
 * GET /api/proof/:id
 */
app.get('/api/proof/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Find proof
    const proof = Array.from(proofs.values())
      .find(p => p.id === id || p.registrationId === id);

    if (!proof) {
      return res.status(404).json({
        success: false,
        error: 'Proof not found'
      });
    }

    res.json({
      success: true,
      data: proof
    });

  } catch (error) {
    console.error('Get proof error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Search proofs
 * GET /api/search?platform=midjourney&model=v6
 */
app.get('/api/search', (req, res) => {
  try {
    const { platform, model, contentHash } = req.query;

    let results = Array.from(proofs.values());

    if (platform) {
      results = results.filter(p => 
        p.platform?.toLowerCase() === platform.toLowerCase()
      );
    }

    if (model) {
      results = results.filter(p => 
        p.model?.toLowerCase().includes(model.toLowerCase())
      );
    }

    if (contentHash) {
      results = results.filter(p => 
        p.contentHash === contentHash
      );
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Check if content hash exists
 * POST /api/check-hash
 */
app.post('/api/check-hash', (req, res) => {
  try {
    const { contentHash } = req.body;

    if (!contentHash) {
      return res.status(400).json({
        success: false,
        error: 'contentHash is required'
      });
    }

    const proof = proofs.get(contentHash);

    res.json({
      success: true,
      exists: !!proof,
      data: proof ? {
        registrationId: proof.registrationId,
        timestamp: proof.timestamp,
        platform: proof.platform
      } : null
    });

  } catch (error) {
    console.error('Check hash error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's proofs (mock - implement auth in production)
 * GET /api/user/proofs
 */
app.get('/api/user/proofs', (req, res) => {
  try {
    // In production: Get user from auth token
    // const userId = req.user.id;
    // const userProofs = await Proof.find({ userId });

    const allProofs = Array.from(proofs.values());

    res.json({
      success: true,
      count: allProofs.length,
      data: allProofs
    });

  } catch (error) {
    console.error('Get user proofs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Statistics endpoint
 * GET /api/stats
 */
app.get('/api/stats', (req, res) => {
  try {
    const allProofs = Array.from(proofs.values());
    
    const stats = {
      totalProofs: allProofs.length,
      platforms: {},
      models: {},
      withIPFS: allProofs.filter(p => p.ipfsCid).length
    };

    // Count by platform
    allProofs.forEach(p => {
      stats.platforms[p.platform] = (stats.platforms[p.platform] || 0) + 1;
      stats.models[p.model] = (stats.models[p.model] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proof of Art API running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

