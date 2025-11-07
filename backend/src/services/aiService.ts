import OpenAI from 'openai';
import axios from 'axios';
import Bytez from 'bytez.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || '';
const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY || '';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

/**
 * AI Service for generating images using multiple providers
 */
export class AIService {
  private openai: OpenAI | null = null;
  private stabilityApiKey: string;
  private bytezSdk: Bytez | null = null;
  private bytezApiKey: string;
  private huggingfaceApiKey: string;

  constructor() {
    if (OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
    }
    this.stabilityApiKey = STABILITY_API_KEY;
    this.bytezApiKey = BYTEZ_API_KEY;
    this.huggingfaceApiKey = HUGGINGFACE_API_KEY;
    
    if (BYTEZ_API_KEY) {
      try {
        this.bytezSdk = new Bytez(BYTEZ_API_KEY);
        console.log('✅ Bytez SDK initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Bytez SDK:', error);
      }
    } else {
      console.warn('⚠️ BYTEZ_API_KEY is not set in environment variables');
    }

    if (HUGGINGFACE_API_KEY) {
      console.log('✅ Hugging Face API key configured');
    } else {
      console.warn('⚠️ HUGGINGFACE_API_KEY is not set in environment variables');
    }
  }

  /**
   * Generate image using DALL-E 3
   */
  async generateDALLE(
    prompt: string,
    options?: {
      size?: '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      style?: 'vivid' | 'natural';
    }
  ): Promise<{ imageUrl: string; revisedPrompt?: string }> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard',
        style: options?.style || 'vivid',
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No data returned from DALL-E');
      }

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt;

      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }

      return {
        imageUrl,
        revisedPrompt,
      };
    } catch (error: any) {
      console.error('DALL-E generation error:', error);
      throw new Error(`DALL-E generation failed: ${error.message}`);
    }
  }

  /**
   * Generate image using Stability AI
   */
  async generateStabilityAI(
    prompt: string,
    options?: {
      width?: number;
      height?: number;
      style_preset?: string;
    }
  ): Promise<{ imageUrl: string; seed?: number }> {
    if (!this.stabilityApiKey) {
      throw new Error('Stability AI API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.stability.ai/v2beta/stable-image/generate/core',
        {
          prompt,
          output_format: 'png',
          width: options?.width || 1024,
          height: options?.height || 1024,
          style_preset: options?.style_preset || 'enhance',
        },
        {
          headers: {
            Authorization: `Bearer ${this.stabilityApiKey}`,
            Accept: 'image/*',
          },
          responseType: 'arraybuffer',
        }
      );

      if (!response.data) {
        throw new Error('No data returned from Stability AI');
      }

      const base64 = Buffer.from(response.data).toString('base64');
      const imageUrl = `data:image/png;base64,${base64}`;

      return {
        imageUrl,
      };
    } catch (error: any) {
      console.error('Stability AI generation error:', error);
      throw new Error(`Stability AI generation failed: ${error.message}`);
    }
  }

  /**
   * Generate image using Bytez.com API
   */
  async generateBytez(
    prompt: string,
    modelId: string = 'dreamlike-art/dreamlike-photoreal-2.0',
    options?: any
  ): Promise<{ imageUrl: string; metadata?: any }> {
    if (!this.bytezSdk) {
      throw new Error('Bytez API key not configured');
    }

    try {
      console.log(`🎨 Generating image with Bytez model: ${modelId}`);
      console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
      
      const model = this.bytezSdk.model(modelId);
      
      // Add timeout for Bytez API call (5 minutes)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Bytez API timeout after 300 seconds')), 300000)
      );
      
      const generationPromise = model.run(prompt);
      const { error, output } = await Promise.race([generationPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Bytez API error:', error);
        throw new Error(`Bytez generation error: ${error}`);
      }

      if (!output) {
        throw new Error('No output returned from Bytez');
      }

      console.log(`✅ Bytez generation successful. Image URL received.`);
      
      // Bytez returns the image URL directly
      return {
        imageUrl: output,
        metadata: {
          modelId,
          provider: 'bytez',
        },
      };
    } catch (error: any) {
      console.error('❌ Bytez generation error:', error);
      if (error.message?.includes('timeout')) {
        throw new Error('Image generation timed out. Please try again with a shorter prompt or different model.');
      }
      throw new Error(`Bytez generation failed: ${error.message}`);
    }
  }

  /**
   * Generate audio using Bytez.com API
   */
  async generateBytezAudio(
    prompt: string,
    modelId: string = 'facebook/musicgen-melody-large',
    options?: any
  ): Promise<{ audioUrl: string; audioBuffer?: string; metadata?: any }> {
    if (!this.bytezSdk) {
      throw new Error('Bytez API key not configured');
    }

    try {
      console.log(`🎵 Generating audio with Bytez model: ${modelId}`);
      console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
      console.log(`🔑 Bytez API key: ${this.bytezApiKey?.substring(0, 8)}...`);
      
      const model = this.bytezSdk.model(modelId);
      
      // Add timeout for Bytez API call (5 minutes)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Bytez API timeout after 300 seconds')), 300000)
      );
      
      console.log(`⏳ Calling Bytez API for model: ${modelId}...`);
      
      // Run the model with timeout - model.run() returns { error, output }
      const generationPromise = model.run(prompt);
      const result = await Promise.race([generationPromise, timeoutPromise]) as any;

      console.log('🔍 Bytez audio generation result:', { 
        hasError: !!result.error, 
        hasOutput: !!result.output,
        outputType: typeof result.output,
        errorDetails: result.error ? JSON.stringify(result.error) : 'none'
      });

      if (result.error) {
        console.error('❌ Bytez API error (full):', JSON.stringify(result.error, null, 2));
        
        // Check for specific error types
        const errorMsg = typeof result.error === 'string' ? result.error : 
                        result.error?.message || 
                        JSON.stringify(result.error);
        
        // Provide helpful error messages
        if (errorMsg.includes('fetch failed') || errorMsg.includes('ENOTFOUND')) {
          throw new Error('Network error: Cannot reach Bytez API. Please check your internet connection.');
        } else if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
          throw new Error('Invalid Bytez API key. Please check your BYTEZ_API_KEY in .env file.');
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          throw new Error(`Model "${modelId}" not found. Please verify the model ID is correct.`);
        } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
          throw new Error('Bytez API rate limit exceeded. Please try again later.');
        }
        
        throw new Error(`Bytez audio generation error: ${errorMsg}`);
      }

      if (!result.output) {
        console.error('❌ No output in result:', result);
        throw new Error('No output returned from Bytez');
      }

      console.log(`✅ Bytez audio generation successful. Output type: ${typeof result.output}`);
      
      // Bytez returns base64-encoded audio data, not a URL
      // Convert to data URL for frontend playback
      const audioBase64 = result.output;
      const audioDataUrl = `data:audio/wav;base64,${audioBase64}`;
      
      console.log(`✅ Audio data URL created (${audioBase64.length} base64 chars)`);
      
      return {
        audioUrl: audioDataUrl,
        audioBuffer: audioBase64, // Also return raw base64 for saving
        metadata: {
          modelId,
          provider: 'bytez',
          format: 'wav',
          size: audioBase64.length,
        },
      };
    } catch (error: any) {
      console.error('❌ Bytez audio generation error (full stack):', error);
      if (error.message?.includes('timeout')) {
        throw new Error('Audio generation timed out. Please try again with a shorter prompt or different model.');
      }
      throw new Error(`Bytez audio generation failed: ${error.message}`);
    }
  }

  /**
   * Generate video using Bytez.com API
   */
  async generateBytezVideo(
    prompt: string,
    modelId: string = 'ali-vilab/text-to-video-ms-1.7b',
    options?: any
  ): Promise<{ videoUrl: string; metadata?: any }> {
    if (!this.bytezSdk) {
      throw new Error('Bytez API key not configured');
    }

    try {
      console.log(`🎬 Generating video with Bytez model: ${modelId}`);
      console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
      
      const model = this.bytezSdk.model(modelId);
      
      // Add timeout for Bytez API call (5 minutes)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Bytez API timeout after 300 seconds')), 300000)
      );
      
      const generationPromise = model.run(prompt);
      const { error, output } = await Promise.race([generationPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Bytez API error:', error);
        throw new Error(`Bytez video generation error: ${error}`);
      }

      if (!output) {
        throw new Error('No output returned from Bytez');
      }

      console.log(`✅ Bytez video generation successful. Video URL received.`);
      
      return {
        videoUrl: output,
        metadata: {
          modelId,
          provider: 'bytez',
        },
      };
    } catch (error: any) {
      console.error('❌ Bytez video generation error:', error);
      if (error.message?.includes('timeout')) {
        throw new Error('Video generation timed out. Please try again with a shorter prompt or different model.');
      }
      throw new Error(`Bytez video generation failed: ${error.message}`);
    }
  }

  /**
   * Generate text using Bytez.com API
   */
  async generateBytezText(
    prompt: string | Array<{ role: string; content: string }>,
    modelId: string = 'Qwen/Qwen3-4B',
    options?: any
  ): Promise<{ text: string; metadata?: any }> {
    if (!this.bytezSdk) {
      throw new Error('Bytez API key not configured');
    }

    try {
      console.log(`📝 Generating text with Bytez model: ${modelId}`);
      
      const model = this.bytezSdk.model(modelId);
      
      // Add timeout for Bytez API call (5 minutes)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Bytez API timeout after 300 seconds')), 300000)
      );
      
      // If prompt is a string, convert it to message format
      const input = typeof prompt === 'string' 
        ? [{ role: 'user', content: prompt }]
        : prompt;
      
      const generationPromise = model.run(input);
      const { error, output } = await Promise.race([generationPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Bytez API error:', error);
        throw new Error(`Bytez text generation error: ${error}`);
      }

      if (!output) {
        throw new Error('No output returned from Bytez');
      }

      console.log(`✅ Bytez text generation successful.`);
      
      return {
        text: output,
        metadata: {
          modelId,
          provider: 'bytez',
        },
      };
    } catch (error: any) {
      console.error('❌ Bytez text generation error:', error);
      if (error.message?.includes('timeout')) {
        throw new Error('Text generation timed out. Please try again with a shorter prompt or different model.');
      }
      throw new Error(`Bytez text generation failed: ${error.message}`);
    }
  }

  /**
   * Generate image using Hugging Face Inference API
   */
  async generateHuggingFace(
    prompt: string,
    modelId: string = 'stabilityai/stable-diffusion-xl-base-1.0',
    options?: any
  ): Promise<{ imageUrl: string; metadata?: any }> {
    if (!this.huggingfaceApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      console.log(`🎨 Generating image with Hugging Face model: ${modelId}`);
      console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

      // Hugging Face Inference API endpoint
      const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;

      const response = await axios.post(
        apiUrl,
        {
          inputs: prompt,
          parameters: {
            num_inference_steps: options?.num_inference_steps || 50,
            guidance_scale: options?.guidance_scale || 7.5,
            width: options?.width || 1024,
            height: options?.height || 1024,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 300000, // 5 minutes timeout
        }
      );

      if (!response.data) {
        throw new Error('No data returned from Hugging Face');
      }

      // Convert arraybuffer to base64 data URL
      const base64 = Buffer.from(response.data).toString('base64');
      const imageUrl = `data:image/png;base64,${base64}`;

      console.log(`✅ Hugging Face generation successful. Image generated.`);

      return {
        imageUrl,
        metadata: {
          modelId,
          provider: 'huggingface',
        },
      };
    } catch (error: any) {
      console.error('❌ Hugging Face generation error:', error);
      if (error.response?.status === 503) {
        throw new Error('Model is currently loading. Please wait a moment and try again.');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid Hugging Face API key. Please check your HUGGINGFACE_API_KEY.');
      }
      throw new Error(`Hugging Face generation failed: ${error.message}`);
    }
  }

  /**
   * Generate image using specified model
   */
  async generateImage(
    prompt: string,
    model: 'dall-e-3' | 'stability-ai' | string,
    options?: any
  ): Promise<{ imageUrl: string; metadata?: any }> {
    // Check if it's a Bytez model (models are in format 'bytez:model-id')
    if (model.startsWith('bytez:')) {
      const bytezModelId = model.replace('bytez:', '');
      const bytezResult = await this.generateBytez(prompt, bytezModelId, options);
      return {
        imageUrl: bytezResult.imageUrl,
        metadata: bytezResult.metadata,
      };
    }

    // Check if it's a Hugging Face model (models are in format 'huggingface:model-id')
    if (model.startsWith('huggingface:')) {
      const hfModelId = model.replace('huggingface:', '');
      const hfResult = await this.generateHuggingFace(prompt, hfModelId, options);
      return {
        imageUrl: hfResult.imageUrl,
        metadata: hfResult.metadata,
      };
    }

    switch (model) {
      case 'dall-e-3':
        const dalleResult = await this.generateDALLE(prompt, options);
        return {
          imageUrl: dalleResult.imageUrl,
          metadata: {
            revisedPrompt: dalleResult.revisedPrompt,
          },
        };

      case 'stability-ai':
        const stabilityResult = await this.generateStabilityAI(prompt, options);
        return {
          imageUrl: stabilityResult.imageUrl,
          metadata: {
            seed: stabilityResult.seed,
          },
        };

      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }

  /**
   * Generate content based on content type
   */
  async generateContent(
    prompt: string | Array<{ role: string; content: string }>,
    contentType: 'text' | 'image' | 'music' | 'code' | 'video',
    model: string,
    options?: any
  ): Promise<{ contentUrl?: string; imageUrl?: string; videoUrl?: string; audioUrl?: string; text?: string; content?: string; metadata?: any }> {
    // Check if it's a Bytez model
    if (model.startsWith('bytez:')) {
      const bytezModelId = model.replace('bytez:', '');
      
      switch (contentType) {
        case 'music':
          const audioResult = await this.generateBytezAudio(typeof prompt === 'string' ? prompt : prompt[prompt.length - 1].content, bytezModelId, options);
          return {
            audioUrl: audioResult.audioUrl,
            contentUrl: audioResult.audioUrl,
            metadata: audioResult.metadata,
          };
        
        case 'video':
          const videoResult = await this.generateBytezVideo(typeof prompt === 'string' ? prompt : prompt[prompt.length - 1].content, bytezModelId, options);
          return {
            videoUrl: videoResult.videoUrl,
            contentUrl: videoResult.videoUrl,
            metadata: videoResult.metadata,
          };
        
        case 'text':
        case 'code':
          const textResult = await this.generateBytezText(prompt, bytezModelId, options);
          return {
            text: textResult.text,
            content: textResult.text,
            metadata: textResult.metadata,
          };
        
        case 'image':
        default:
          const imageResult = await this.generateBytez(typeof prompt === 'string' ? prompt : prompt[prompt.length - 1].content, bytezModelId, options);
          return {
            imageUrl: imageResult.imageUrl,
            contentUrl: imageResult.imageUrl,
            metadata: imageResult.metadata,
          };
      }
    }

    // Check if it's a Hugging Face model (for images)
    if (model.startsWith('huggingface:') && (contentType === 'image' || !contentType)) {
      const hfModelId = model.replace('huggingface:', '');
      const hfResult = await this.generateHuggingFace(typeof prompt === 'string' ? prompt : prompt[prompt.length - 1].content, hfModelId, options);
      return {
        imageUrl: hfResult.imageUrl,
        contentUrl: hfResult.imageUrl,
        metadata: hfResult.metadata,
      };
    }

    // For non-Bytez models, default to image generation
    if (contentType === 'image' || !contentType) {
      const imageResult = await this.generateImage(typeof prompt === 'string' ? prompt : prompt[prompt.length - 1].content, model, options);
      return {
        imageUrl: imageResult.imageUrl,
        contentUrl: imageResult.imageUrl,
        metadata: imageResult.metadata,
      };
    }

    throw new Error(`Content type ${contentType} is only supported with Bytez models`);
  }

  /**
   * Check if AI service is configured
   */
  isConfigured(model: 'dall-e-3' | 'stability-ai' | string): boolean {
    // Check if it's a Bytez model
    if (model.startsWith('bytez:')) {
      const hasKey = !!BYTEZ_API_KEY && BYTEZ_API_KEY.trim().length > 0;
      const hasSdk = !!this.bytezSdk;
      
      // Only log in development to avoid spam
      if (process.env.NODE_ENV === 'development') {
        if (!hasKey) {
          console.log(`🔍 Bytez model "${model}": API key not found or empty`);
        } else if (!hasSdk) {
          console.log(`🔍 Bytez model "${model}": SDK not initialized`);
        } else {
          console.log(`✅ Bytez model "${model}": Configured and ready`);
        }
      }
      
      return hasKey && hasSdk;
    }

    // Check if it's a Hugging Face model
    if (model.startsWith('huggingface:')) {
      const hasKey = !!HUGGINGFACE_API_KEY && HUGGINGFACE_API_KEY.trim().length > 0;
      
      // Only log in development to avoid spam
      if (process.env.NODE_ENV === 'development') {
        if (!hasKey) {
          console.log(`🔍 Hugging Face model "${model}": API key not found or empty`);
        } else {
          console.log(`✅ Hugging Face model "${model}": Configured and ready`);
        }
      }
      
      return hasKey;
    }

    if (model === 'dall-e-3') {
      return !!OPENAI_API_KEY && !!this.openai;
    }
    if (model === 'stability-ai') {
      return !!STABILITY_API_KEY;
    }
    return false;
  }

  /**
   * Get available Bytez models for text-to-image
   */
  async getBytezModels(): Promise<Array<{ id: string; name: string; description?: string }>> {
    // Default Bytez models - always return these
    const defaultModels = [
    //   { id: 'black-forest-labs/FLUX.1-dev', name: 'FLUX.1-dev', description: 'Black Forest Labs FLUX.1-dev - Advanced image generation model' },
      { id: 'Linaqruf/animagine-xl-3.0', name: 'Animagine XL 3.0', description: 'Create images of animals and humans in anime style' },
      { id: 'dreamlike-art/dreamlike-photoreal-2.0', name: 'Dreamlike Photoreal 2.0', description: 'High-quality photorealistic image generation' },
      { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL', description: 'Advanced Stable Diffusion XL model' },
      { id: 'dataautogpt3/ProteusV0.2', name: 'Proteus V0.2', description: 'Proteus V0.2 - Advanced image generation model' },
      { id: 'danhtran2mind/Ghibli-Stable-Diffusion-2.1-Base-finetuning', name: 'Ghibli Stable Diffusion 2.1', description: 'Ghibli Style Advanced image generation model' },
      { id: 'playgroundai/playground-v2.5-1024px-aesthetic', name: 'Playground v2.5', description: 'Aesthetic-focused image generation' },
    ];

    // For now, always return default models to ensure fast response
    // The API call can be slow and cause the endpoint to hang
    // TODO: Add async model fetching with caching in the future
    return defaultModels;
    
    // Uncomment below to fetch from API (may cause slow responses)
    /*
    if (!this.bytezSdk) {
      return defaultModels;
    }

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Bytez API timeout')), 3000)
      );
      
      const modelsPromise = this.bytezSdk.list.models();
      const { error, output } = await Promise.race([modelsPromise, timeoutPromise]) as any;
      
      if (error || !output) {
        return defaultModels;
      }

      const textToImageModels = output.filter((model: any) => 
        model.tasks?.some((task: any) => task.name === 'text-to-image')
      );

      if (textToImageModels.length > 0) {
        return textToImageModels.map((model: any) => ({
          id: model.id,
          name: model.name || model.id,
          description: model.description,
        }));
      }

      return defaultModels;
    } catch (error: any) {
      console.error('Error fetching Bytez models:', error);
      return defaultModels;
    }
    */
  }
}

// Export singleton instance
export const aiService = new AIService();
