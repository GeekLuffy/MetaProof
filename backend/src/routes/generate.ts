import express, { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { ipfsService } from '../services/ipfsService';
import { proofService } from '../services/proofService';
import { artworkService } from '../services/artworkService';
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
    body('contentType').optional().isIn(['text', 'image', 'music', 'code', 'video']),
    body('parameters').optional().isObject(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { prompt, model, contentType = 'image', parameters, biometricData } = req.body;
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

      const startTime = Date.now();
      
      // Step 1: Generate content using AI service
      const contentTypeLabel = contentType === 'image' ? 'image' : contentType === 'video' ? 'video' : contentType === 'music' ? 'audio' : contentType === 'text' ? 'text' : 'content';
      console.log(`🎨 [Step 1/3] Starting ${contentTypeLabel} generation with model: ${model}`);
      console.log(`📝 Prompt: ${typeof prompt === 'string' ? prompt.substring(0, 100) : 'Message chain'}...`);
      const step1Start = Date.now();
      const generationResult = await aiService.generateContent(prompt, contentType, model, parameters);
      console.log(`✅ [Step 1/3] ${contentTypeLabel} generation completed in ${Date.now() - step1Start}ms`);

      // Step 2: Download content from URL to compute hash (or use text directly)
      console.log(`📥 [Step 2/3] Processing content...`);
      const step2Start = Date.now();
      let contentBuffer: Buffer;
      let contentUrl: string | undefined;

      if (contentType === 'text' || contentType === 'code') {
        // For text/code, use the text directly
        const textContent = generationResult.text || generationResult.content || '';
        contentBuffer = Buffer.from(textContent, 'utf-8');
        contentUrl = undefined;
      } else if (contentType === 'music' && (generationResult as any).audioBuffer) {
        // For audio with base64 buffer (Bytez audio)
        contentUrl = generationResult.audioUrl; // data URL for playback
        contentBuffer = Buffer.from((generationResult as any).audioBuffer, 'base64');
        console.log(`✅ Audio buffer extracted (${contentBuffer.length} bytes)`);
      } else {
        // For image/video/audio with URLs, download from URL
        contentUrl = generationResult.contentUrl || generationResult.imageUrl || generationResult.videoUrl || generationResult.audioUrl;
        if (!contentUrl) {
          throw new Error('No content URL returned from generation');
        }
        
        // Skip fetch for data URLs (already have the data)
        if (contentUrl.startsWith('data:')) {
          // Extract base64 data from data URL
          const matches = contentUrl.match(/^data:[^;]+;base64,(.+)$/);
          if (matches && matches[1]) {
            contentBuffer = Buffer.from(matches[1], 'base64');
            console.log(`✅ Content extracted from data URL (${contentBuffer.length} bytes)`);
          } else {
            throw new Error('Invalid data URL format');
          }
        } else {
          // Fetch from external URL
        const contentResponse = await fetch(contentUrl);
        if (!contentResponse.ok) {
          throw new Error(`Failed to download generated ${contentType}`);
        }
        contentBuffer = Buffer.from(await contentResponse.arrayBuffer());
        }
      }
      console.log(`✅ [Step 2/3] Content processed in ${Date.now() - step2Start}ms. Size: ${(contentBuffer.length / 1024).toFixed(2)} KB`);

      // Step 3: Generate content hash (FAST)
      console.log(`🔐 [Step 3/3] Generating content hash...`);
      const step3Start = Date.now();
      const contentHash = generateContentHash(contentBuffer);
      const promptHash = generatePromptHash(typeof prompt === 'string' ? prompt : JSON.stringify(prompt));
      console.log(`✅ [Step 3/3] Hashes generated in ${Date.now() - step3Start}ms`);

      const totalTime = Date.now() - startTime;
      console.log(`✅ 🎉 FAST RESPONSE! Total time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
      console.log(`📤 Note: IPFS upload and blockchain registration will be done by user action`);
      
      // Return immediately with original content URL or text
      // User can then upload to IPFS and register on blockchain separately
      const response: any = {
        success: true,
        contentUrl: contentUrl,
        contentBuffer: contentBuffer.toString('base64'), // Send buffer for frontend to upload
        contentHash,
        promptHash,
        model,
        contentType,
        metadata: generationResult.metadata,
        ipfsReady: false, // Flag to indicate IPFS upload is pending
        timing: {
          total: totalTime,
          aiGeneration: Date.now() - step1Start,
        },
      };

      // Add type-specific fields for backward compatibility
      if (contentType === 'image') {
        response.imageUrl = contentUrl;
        response.imageBuffer = contentBuffer.toString('base64');
      } else if (contentType === 'video') {
        response.videoUrl = contentUrl;
      } else if (contentType === 'music') {
        response.audioUrl = contentUrl;
        response.audioBuffer = contentBuffer.toString('base64');
      } else if (contentType === 'text' || contentType === 'code') {
        response.text = generationResult.text || generationResult.content;
        response.content = generationResult.text || generationResult.content;
      }

      res.json(response);
    } catch (error: any) {
      console.error('Generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate content',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/generate/upload-ipfs
 * Upload generated artwork to IPFS (separate from generation)
 */
router.post(
  '/upload-ipfs',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { contentBuffer, imageBuffer, contentHash, promptHash, model, contentType = 'image' } = req.body;
      const creatorAddress = req.user?.address;

      if (!creatorAddress) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if ((!contentBuffer && !imageBuffer) || !contentHash || !promptHash) {
        return res.status(400).json({ error: 'Missing required data' });
      }

      console.log(`📤 Starting IPFS upload for hash: ${contentHash.substring(0, 16)}...`);
      const startTime = Date.now();

      // Convert base64 back to buffer
      const buffer = Buffer.from(contentBuffer || imageBuffer, 'base64');
      
      // Determine file extension based on content type
      const fileExtension = contentType === 'image' ? 'png' : 
                           contentType === 'video' ? 'mp4' : 
                           contentType === 'music' ? 'mp3' : 
                           contentType === 'text' || contentType === 'code' ? 'txt' : 'bin';

      // Step 1: Upload to IPFS
      console.log(`📤 [Step 1/4] Uploading to IPFS...`);
      let ipfsResult;
      try {
        ipfsResult = await ipfsService.uploadFile(
          buffer,
          `content-${Date.now()}.${fileExtension}`,
          {
            name: `AI Generated ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
            keyValues: {
              creator: creatorAddress,
              model: model || 'unknown',
              contentType: contentType,
              promptHash,
              contentHash,
            },
          }
        );
        console.log(`✅ [Step 1/4] IPFS upload successful. CID: ${ipfsResult.cid}`);
      } catch (ipfsError: any) {
        console.error(`❌ IPFS upload failed:`, ipfsError);
        return res.status(500).json({
          success: false,
          error: 'IPFS upload failed',
          message: ipfsError.message,
        });
      }

      // Get biometricData from request body if provided
      const { biometricData } = req.body;
      
      // Step 2: Create proof package
      console.log(`📦 [Step 2/4] Creating proof package...`);
      if (biometricData) {
        console.log(`🔐 Including biometric proof-of-human data`);
      }
      const proofPackage = await proofService.createArtworkProof({
        creatorAddress,
        prompt: '', // Prompt not stored for privacy
        contentBuffer: buffer,
        ipfsCID: ipfsResult.cid,
        modelUsed: model || 'unknown',
        parameters: {},
        biometricData: biometricData || undefined,
        encryptPrompt: false,
      });
      console.log(`✅ [Step 2/4] Proof package created`);

      // Step 3: Upload metadata to IPFS (with timeout)
      console.log(`📤 [Step 3/4] Uploading metadata to IPFS...`);
      let metadataResult = { cid: undefined };
      try {
        const metadataUploadPromise = ipfsService.uploadJSON(proofPackage);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Metadata upload timeout')), 5000)
        );
        metadataResult = await Promise.race([metadataUploadPromise, timeoutPromise]) as any;
        console.log(`✅ [Step 3/4] Metadata uploaded. CID: ${metadataResult.cid}`);
      } catch (metadataError: any) {
        console.error(`⚠️ [Step 3/4] Metadata upload failed (non-critical):`, metadataError.message);
      }

      // Step 4: Save to database
      console.log(`💾 [Step 4/4] Saving artwork to database...`);
      try {
        // Get prompt from request body (it was passed in)
        const { prompt: originalPrompt } = req.body;
        const promptString = typeof originalPrompt === 'string' ? originalPrompt : JSON.stringify(originalPrompt);
        
        await artworkService.saveArtwork({
          contentHash,
          promptHash,
          prompt: promptString,
          creatorAddress: creatorAddress,
          ipfsCID: ipfsResult.cid,
          modelUsed: model || 'unknown',
          metadataURI: metadataResult.cid ? `ipfs://${metadataResult.cid}` : undefined,
        });
        console.log(`✅ [Step 4/4] Artwork saved to database with prompt`);
      } catch (dbError: any) {
        console.error('⚠️ Failed to save artwork to database:', dbError.message);
      }

      const totalTime = Date.now() - startTime;
      console.log(`✅ 🎉 IPFS upload complete! Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);

      res.json({
        success: true,
        ipfsCID: ipfsResult.cid,
        ipfsUrl: ipfsResult.url,
        proofPackage,
        metadataURI: metadataResult.cid ? `ipfs://${metadataResult.cid}` : null,
        timing: {
          total: totalTime,
        },
      });
    } catch (error: any) {
      console.error('IPFS upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload to IPFS',
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
    const contentType = req.query.contentType as string || 'image';
    console.log(`📋 Fetching models for content type: ${contentType}...`);
    const models: any[] = [];

    // Add image models for image content type
    if (contentType === 'image') {
      models.push(
        {
          id: 'dall-e-3',
          name: 'DALL-E 3',
          provider: 'OpenAI',
          available: aiService.isConfigured('dall-e-3'),
          description: 'OpenAI DALL-E 3 - High quality image generation',
          features: ['1024x1024', '1792x1024', '1024x1792', 'HD quality'],
          contentType: 'image',
        },
        {
          id: 'stability-ai',
          name: 'Stability AI',
          provider: 'Stability AI',
          available: aiService.isConfigured('stability-ai'),
          description: 'Stable Diffusion - Fast and flexible generation',
          features: ['Custom sizes', 'Style presets', 'High quality'],
          contentType: 'image',
        }
      );

      // Fetch Bytez image models
      console.log('🔍 Fetching Bytez image models...');
      try {
        const bytezModels = await aiService.getBytezModels();
        console.log(`✅ Found ${bytezModels.length} Bytez image models`);
        
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
            contentType: 'image',
            bytezModelId: model.id,
          });
        });
      } catch (bytezError: any) {
        console.error('⚠️ Error fetching Bytez models (non-critical, using defaults):', bytezError.message);
        // Add default Bytez models even if fetch fails
        const defaultBytezModels = [
          { id: 'Linaqruf/animagine-xl-3.0', name: 'Animagine XL 3.0', description: 'Create images of animals and humans in anime style' },
          { id: 'dreamlike-art/dreamlike-photoreal-2.0', name: 'Dreamlike Photoreal 2.0', description: 'High-quality photorealistic image generation' },
          { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL', description: 'Advanced Stable Diffusion XL model' },
          { id: 'dataautogpt3/ProteusV0.2', name: 'Proteus V0.2', description: 'Proteus V0.2 - Advanced image generation model' },
          { id: 'danhtran2mind/Ghibli-Stable-Diffusion-2.1-Base-finetuning', name: 'Ghibli Stable Diffusion 2.1', description: 'Ghibli Style Advanced image generation model' },
          { id: 'playgroundai/playground-v2.5-1024px-aesthetic', name: 'Playground v2.5', description: 'Aesthetic-focused image generation' },
        ];
        
        defaultBytezModels.forEach((model) => {
          const modelId = `bytez:${model.id}`;
          const isAvailable = aiService.isConfigured(modelId);
          models.push({
            id: modelId,
            name: model.name,
            provider: 'Bytez',
            available: isAvailable,
            description: model.description || `Bytez ${model.name} - Text to image generation`,
            features: ['Text-to-image', 'High quality'],
            contentType: 'image',
            bytezModelId: model.id,
          });
        });
      }
    } else if (contentType === 'video') {
      // Add Bytez video models
      models.push({
        id: 'bytez:ali-vilab/text-to-video-ms-1.7b',
        name: 'Stable Video Diffusion (Bytez)',
        provider: 'Bytez',
        available: aiService.isConfigured('bytez:ali-vilab/text-to-video-ms-1.7b'),
        description: 'Generate short video clips from text prompts',
        features: ['Text-to-video', 'Short clips'],
        contentType: 'video',
        bytezModelId: 'ali-vilab/text-to-video-ms-1.7b',
      });
    } else if (contentType === 'music') {
      // Add Bytez audio models
      models.push({
        id: 'bytez:facebook/musicgen-melody-large',
        name: 'MusicGen Melody Large (Bytez)',
        provider: 'Bytez',
        available: aiService.isConfigured('bytez:facebook/musicgen-melody-large'),
        description: 'Generate moody jazz music with saxophones and other styles from text prompts',
        features: ['Text-to-music', 'Melody generation', 'Jazz & orchestral'],
        contentType: 'music',
        bytezModelId: 'facebook/musicgen-melody-large',
      });
    } else if (contentType === 'text' || contentType === 'code') {
      // Add Bytez text models
      models.push({
        id: 'bytez:Qwen/Qwen3-4B',
        name: 'Qwen3-4B (Bytez)',
        provider: 'Bytez',
        available: aiService.isConfigured('bytez:Qwen/Qwen3-4B'),
        description: 'Generate text from message chains for story generation, dialogue systems, and creative writing',
        features: ['Text generation', 'Conversational', 'Creative writing'],
        contentType: contentType,
        bytezModelId: 'Qwen/Qwen3-4B',
      });
    }

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

