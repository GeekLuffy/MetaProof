import express, { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { ipfsService } from '../services/ipfsService';
import { proofService } from '../services/proofService';
import { generateContentHash, generatePromptHash } from '../utils/crypto';
import { authenticateToken } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    address: string;
  };
}

/**
 * POST /api/generate
 * Generate AI artwork and create proof package
 */
router.post(
  '/',
  authenticateToken,
  [
    body('prompt').trim().isLength({ min: 1, max: 1000 }).withMessage('Prompt must be 1-1000 characters'),
    body('model').notEmpty().withMessage('Model is required'),
    body('parameters').optional().isObject(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { prompt, model, parameters, biometricData } = req.body;
      const creatorAddress = req.user?.address;

      if (!creatorAddress) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if AI service is configured
      if (!aiService.isConfigured(model)) {
        return res.status(503).json({
          error: `${model} API key not configured`,
          message: 'Please configure API keys in environment variables',
        });
      }

      // Step 1: Generate image using AI service
      console.log(`🎨 Starting image generation with model: ${model}`);
      console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
      const generationResult = await aiService.generateImage(prompt, model, parameters);
      console.log(`✅ Image generation completed. URL: ${generationResult.imageUrl?.substring(0, 100)}...`);

      // Step 2: Download image from URL
      console.log(`📥 Downloading image from Bytez...`);
      const imageResponse = await fetch(generationResult.imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to download generated image');
      }

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      console.log(`✅ Image downloaded. Size: ${imageBuffer.length} bytes`);

      // Step 3: Generate content hash
      console.log(`🔐 Generating content hash...`);
      const contentHash = generateContentHash(imageBuffer);
      const promptHash = generatePromptHash(prompt);
      console.log(`✅ Hashes generated`);

      // Step 4: Upload to IPFS
      console.log(`📤 Uploading to IPFS...`);
      let ipfsResult;
      try {
        ipfsResult = await ipfsService.uploadFile(
          imageBuffer,
          `artwork-${Date.now()}.png`,
          {
            name: 'AI Generated Artwork',
            keyValues: {
              creator: creatorAddress,
              model,
              promptHash,
              contentHash,
            },
          }
        );
        console.log(`✅ IPFS upload successful. CID: ${ipfsResult.cid}`);
      } catch (ipfsError: any) {
        console.error('❌ IPFS upload failed:', ipfsError);
        // Return response with original image URL if IPFS fails
        res.json({
          success: true,
          imageUrl: generationResult.imageUrl, // Use original Bytez URL
          ipfsCID: null,
          contentHash,
          promptHash,
          proofPackage: null,
          metadataURI: null,
          model,
          metadata: generationResult.metadata,
          warning: 'IPFS upload failed, using original image URL',
        });
        return;
      }

      // Step 5: Create proof package
      console.log(`📦 Creating proof package...`);
      const proofPackage = await proofService.createArtworkProof({
        creatorAddress,
        prompt,
        contentBuffer: imageBuffer,
        ipfsCID: ipfsResult.cid,
        modelUsed: model,
        parameters: parameters || {},
        biometricData,
        encryptPrompt: false,
      });
      console.log(`✅ Proof package created`);

      // Step 6: Upload proof package metadata to IPFS
      console.log(`📤 Uploading metadata to IPFS...`);
      let metadataResult;
      try {
        metadataResult = await ipfsService.uploadJSON(proofPackage);
        console.log(`✅ Metadata uploaded. CID: ${metadataResult.cid}`);
      } catch (metadataError: any) {
        console.error('❌ Metadata upload failed:', metadataError);
        metadataResult = { cid: null };
      }

      console.log(`✅ Sending response to client...`);
      res.json({
        success: true,
        imageUrl: ipfsResult.url,
        ipfsCID: ipfsResult.cid,
        contentHash,
        promptHash,
        proofPackage,
        metadataURI: metadataResult.cid ? `ipfs://${metadataResult.cid}` : null,
        model,
        metadata: generationResult.metadata,
      });
      console.log(`✅ Response sent successfully`);
    } catch (error: any) {
      console.error('Generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate artwork',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/generate/models
 * Get available AI models
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching models...');
    const models: any[] = [
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        provider: 'OpenAI',
        available: aiService.isConfigured('dall-e-3'),
        description: 'OpenAI DALL-E 3 - High quality image generation',
        features: ['1024x1024', '1792x1024', '1024x1792', 'HD quality'],
      },
      {
        id: 'stability-ai',
        name: 'Stability AI',
        provider: 'Stability AI',
        available: aiService.isConfigured('stability-ai'),
        description: 'Stable Diffusion - Fast and flexible generation',
        features: ['Custom sizes', 'Style presets', 'High quality'],
      },
    ];

    // Fetch Bytez models
    console.log('🔍 Fetching Bytez models...');
    const bytezModels = await aiService.getBytezModels();
    console.log(`✅ Found ${bytezModels.length} Bytez models`);
    
    bytezModels.forEach((model: { id: string; name: string; description?: string }) => {
      const modelId = `bytez:${model.id}`;
      const isAvailable = aiService.isConfigured(modelId);
      console.log(`  - ${model.name} (${modelId}): ${isAvailable ? '✅ Available' : '❌ Not configured'}`);
      
      models.push({
        id: modelId,
        name: model.name,
        provider: 'Bytez',
        available: isAvailable,
        description: model.description || `Bytez ${model.name} - Text to image generation`,
        features: ['Text-to-image', 'High quality'],
        bytezModelId: model.id,
      });
    });

    console.log(`📦 Returning ${models.length} total models`);
    console.log('📋 Models being returned:', JSON.stringify(models.map(m => ({ id: m.id, name: m.name, provider: m.provider, available: m.available })), null, 2));
    
    const response = { models };
    res.json(response);
    console.log('✅ Response sent successfully');
  } catch (error: any) {
    console.error('❌ Error fetching models:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch models',
      message: error.message,
    });
  }
});

export default router;

