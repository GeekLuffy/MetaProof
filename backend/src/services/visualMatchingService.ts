import sharp from 'sharp';
import crypto from 'crypto';

/**
 * Visual Matching Service
 * Detects screenshots and visually similar images using perceptual hashing
 * and feature extraction techniques
 */

export interface PerceptualHashes {
  pHash: string;      // Perceptual hash (DCT-based)
  dHash: string;      // Difference hash (gradient-based)
  aHash: string;      // Average hash
  waveletHash: string; // Wavelet hash (frequency domain)
}

export interface VisualFeatures {
  colorHistogram: number[];    // RGB histogram (64 bins)
  dominantColors: Array<{r: number, g: number, b: number}>; // Top 5 colors
  brightness: number;          // Average brightness
  contrast: number;            // Contrast level
  edgeStrength: number;        // Edge detection strength
  textureComplexity: number;   // Texture complexity score
}

export interface VisualFingerprint {
  hashes: PerceptualHashes;
  features: VisualFeatures;
}

export interface SimilarityResult {
  isSimilar: boolean;
  confidence: number;           // 0-100
  matchType: 'exact' | 'perceptual' | 'visual' | 'none';
  details: {
    hashSimilarity: number;     // 0-100
    colorSimilarity: number;    // 0-100
    structureSimilarity: number; // 0-100
    hammingDistance?: number;
  };
}

export class VisualMatchingService {
  // Similarity thresholds
  private readonly HASH_SIMILARITY_THRESHOLD = 90; // 90% similar
  private readonly COLOR_SIMILARITY_THRESHOLD = 85;
  private readonly OVERALL_SIMILARITY_THRESHOLD = 80;

  /**
   * Generate complete visual fingerprint for an image
   */
  async generateVisualFingerprint(imageBuffer: Buffer): Promise<VisualFingerprint> {
    try {
      const [hashes, features] = await Promise.all([
        this.generatePerceptualHashes(imageBuffer),
        this.extractVisualFeatures(imageBuffer)
      ]);

      return { hashes, features };
    } catch (error) {
      console.error('Error generating visual fingerprint:', error);
      throw new Error('Failed to generate visual fingerprint');
    }
  }

  /**
   * Generate perceptual hashes (multiple algorithms for better detection)
   */
  private async generatePerceptualHashes(imageBuffer: Buffer): Promise<PerceptualHashes> {
    // Resize to standard size for consistent hashing
    const standardSize = 32;
    const img = sharp(imageBuffer);

    const [pHash, dHash, aHash, waveletHash] = await Promise.all([
      this.computePHash(img, standardSize),
      this.computeDHash(img, standardSize),
      this.computeAHash(img, standardSize),
      this.computeWaveletHash(img, standardSize)
    ]);

    return { pHash, dHash, aHash, waveletHash };
  }

  /**
   * Perceptual Hash (pHash) - DCT-based
   * Resilient to screenshots, resizing, slight color changes
   */
  private async computePHash(img: sharp.Sharp, size: number): Promise<string> {
    // Resize to size x size, convert to grayscale
    const { data } = await img
      .clone()
      .resize(size, size, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Compute DCT (Discrete Cosine Transform) approximation
    const dctCoeffs = this.computeDCT(data, size);

    // Keep only low frequency components (top-left 8x8)
    const lowFreq = dctCoeffs.slice(0, 8).map(row => row.slice(0, 8)).flat();

    // Calculate median
    const sorted = [...lowFreq].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    // Generate hash: 1 if above median, 0 otherwise
    const hash = lowFreq.map(val => val > median ? '1' : '0').join('');
    
    return this.binaryToHex(hash);
  }

  /**
   * Difference Hash (dHash) - Gradient-based
   * Fast and effective for detecting modifications
   */
  private async computeDHash(img: sharp.Sharp, size: number): Promise<string> {
    const { data } = await img
      .clone()
      .resize(size + 1, size, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let hash = '';
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const left = data[y * (size + 1) + x];
        const right = data[y * (size + 1) + x + 1];
        hash += left < right ? '1' : '0';
      }
    }

    return this.binaryToHex(hash);
  }

  /**
   * Average Hash (aHash) - Simple and fast
   */
  private async computeAHash(img: sharp.Sharp, size: number): Promise<string> {
    const { data } = await img
      .clone()
      .resize(size, size, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Calculate average brightness
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;

    // Generate hash
    const hash = Array.from(data).map(val => val > avg ? '1' : '0').join('');
    
    return this.binaryToHex(hash);
  }

  /**
   * Wavelet Hash - Frequency domain analysis
   */
  private async computeWaveletHash(img: sharp.Sharp, size: number): Promise<string> {
    const { data } = await img
      .clone()
      .resize(size, size, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Simple Haar wavelet transform approximation
    const coeffs = this.haarWavelet(data, size);
    
    // Use low-frequency coefficients
    const avg = coeffs.reduce((sum, val) => sum + val, 0) / coeffs.length;
    const hash = coeffs.map(val => val > avg ? '1' : '0').join('');
    
    return this.binaryToHex(hash);
  }

  /**
   * Extract visual features for similarity comparison
   */
  private async extractVisualFeatures(imageBuffer: Buffer): Promise<VisualFeatures> {
    const img = sharp(imageBuffer);
    const metadata = await img.metadata();

    // Get raw pixel data
    const { data, info } = await img
      .resize(256, 256, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels || 3;

    // Extract features
    const [colorHistogram, dominantColors] = this.analyzeColors(data, channels);
    const { brightness, contrast } = this.analyzeBrightnessContrast(data, channels);
    const edgeStrength = this.detectEdges(data, info.width, info.height, channels);
    const textureComplexity = this.analyzeTexture(data, info.width, info.height, channels);

    return {
      colorHistogram,
      dominantColors,
      brightness,
      contrast,
      edgeStrength,
      textureComplexity
    };
  }

  /**
   * Analyze color distribution
   */
  private analyzeColors(data: Buffer, channels: number): [number[], Array<{r: number, g: number, b: number}>] {
    // Create histogram with 4 bins per channel (4x4x4 = 64 bins)
    const histogramSize = 64;
    const histogram = new Array(histogramSize).fill(0);
    const colorCounts = new Map<string, number>();

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Histogram bin (4 bins per channel)
      const rBin = Math.floor(r / 64);
      const gBin = Math.floor(g / 64);
      const bBin = Math.floor(b / 64);
      const bin = rBin * 16 + gBin * 4 + bBin;
      histogram[bin]++;

      // Count dominant colors (quantized)
      const rQuant = Math.floor(r / 32) * 32;
      const gQuant = Math.floor(g / 32) * 32;
      const bQuant = Math.floor(b / 32) * 32;
      const colorKey = `${rQuant},${gQuant},${bQuant}`;
      colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
    }

    // Normalize histogram
    const total = data.length / channels;
    const normalizedHistogram = histogram.map(count => count / total);

    // Get top 5 dominant colors
    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return { r, g, b };
      });

    return [normalizedHistogram, sortedColors];
  }

  /**
   * Analyze brightness and contrast
   */
  private analyzeBrightnessContrast(data: Buffer, channels: number): { brightness: number, contrast: number } {
    let totalBrightness = 0;
    let minBrightness = 255;
    let maxBrightness = 0;

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      totalBrightness += brightness;
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }

    const avgBrightness = totalBrightness / (data.length / channels);
    const contrast = maxBrightness - minBrightness;

    return {
      brightness: avgBrightness,
      contrast: contrast
    };
  }

  /**
   * Edge detection using Sobel operator
   */
  private detectEdges(data: Buffer, width: number, height: number, channels: number): number {
    let edgeStrength = 0;

    // Sobel kernels
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;

        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const px = x + kx - 1;
            const py = y + ky - 1;
            const idx = (py * width + px) * channels;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            gx += brightness * sobelX[ky][kx];
            gy += brightness * sobelY[ky][kx];
          }
        }

        edgeStrength += Math.sqrt(gx * gx + gy * gy);
      }
    }

    return edgeStrength / ((width - 2) * (height - 2));
  }

  /**
   * Analyze texture complexity
   */
  private analyzeTexture(data: Buffer, width: number, height: number, channels: number): number {
    let variance = 0;
    let mean = 0;

    // Calculate mean
    for (let i = 0; i < data.length; i += channels) {
      mean += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    mean /= (data.length / channels);

    // Calculate variance
    for (let i = 0; i < data.length; i += channels) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      variance += Math.pow(brightness - mean, 2);
    }
    variance /= (data.length / channels);

    return Math.sqrt(variance); // Standard deviation
  }

  /**
   * Compare two visual fingerprints
   */
  compareFingerprints(fp1: VisualFingerprint, fp2: VisualFingerprint): SimilarityResult {
    // Compare perceptual hashes
    const hashSimilarity = this.compareHashes(fp1.hashes, fp2.hashes);
    
    // Compare color features
    const colorSimilarity = this.compareColorFeatures(fp1.features, fp2.features);
    
    // Compare structural features
    const structureSimilarity = this.compareStructuralFeatures(fp1.features, fp2.features);

    // Calculate overall confidence (weighted average)
    const confidence = (
      hashSimilarity * 0.5 +      // Hashes are most important
      colorSimilarity * 0.3 +      // Colors are important
      structureSimilarity * 0.2    // Structure matters less
    );

    // Determine match type
    let matchType: 'exact' | 'perceptual' | 'visual' | 'none' = 'none';
    if (confidence >= 95) {
      matchType = 'exact';
    } else if (hashSimilarity >= this.HASH_SIMILARITY_THRESHOLD) {
      matchType = 'perceptual';
    } else if (confidence >= this.OVERALL_SIMILARITY_THRESHOLD) {
      matchType = 'visual';
    }

    return {
      isSimilar: confidence >= this.OVERALL_SIMILARITY_THRESHOLD,
      confidence: Math.round(confidence * 100) / 100,
      matchType,
      details: {
        hashSimilarity: Math.round(hashSimilarity * 100) / 100,
        colorSimilarity: Math.round(colorSimilarity * 100) / 100,
        structureSimilarity: Math.round(structureSimilarity * 100) / 100
      }
    };
  }

  /**
   * Compare perceptual hashes using Hamming distance
   */
  private compareHashes(hashes1: PerceptualHashes, hashes2: PerceptualHashes): number {
    const pHashSim = this.hashSimilarity(hashes1.pHash, hashes2.pHash);
    const dHashSim = this.hashSimilarity(hashes1.dHash, hashes2.dHash);
    const aHashSim = this.hashSimilarity(hashes1.aHash, hashes2.aHash);
    const waveletSim = this.hashSimilarity(hashes1.waveletHash, hashes2.waveletHash);

    // Average of all hash similarities (more reliable)
    return (pHashSim + dHashSim + aHashSim + waveletSim) / 4;
  }

  /**
   * Calculate hash similarity (100 = identical, 0 = completely different)
   */
  private hashSimilarity(hash1: string, hash2: string): number {
    if (hash1 === hash2) return 100;
    
    const distance = this.hammingDistance(hash1, hash2);
    const maxDistance = hash1.length * 4; // Each hex char = 4 bits
    
    return ((maxDistance - distance) / maxDistance) * 100;
  }

  /**
   * Hamming distance between two hex strings
   */
  private hammingDistance(hex1: string, hex2: string): number {
    if (hex1.length !== hex2.length) return Infinity;

    let distance = 0;
    for (let i = 0; i < hex1.length; i++) {
      const xor = parseInt(hex1[i], 16) ^ parseInt(hex2[i], 16);
      // Count set bits
      for (let bit = 0; bit < 4; bit++) {
        if (xor & (1 << bit)) distance++;
      }
    }

    return distance;
  }

  /**
   * Compare color features
   */
  private compareColorFeatures(features1: VisualFeatures, features2: VisualFeatures): number {
    // Histogram correlation
    const histCorr = this.correlationCoefficient(
      features1.colorHistogram,
      features2.colorHistogram
    );

    // Dominant color similarity
    const colorSim = this.compareDominantColors(
      features1.dominantColors,
      features2.dominantColors
    );

    return (histCorr + colorSim) / 2;
  }

  /**
   * Compare structural features
   */
  private compareStructuralFeatures(features1: VisualFeatures, features2: VisualFeatures): number {
    // Normalize differences to 0-100 scale
    const brightnessSim = 100 - Math.min(100, Math.abs(features1.brightness - features2.brightness) / 2.55);
    const contrastSim = 100 - Math.min(100, Math.abs(features1.contrast - features2.contrast) / 2.55);
    const edgeSim = 100 - Math.min(100, Math.abs(features1.edgeStrength - features2.edgeStrength) / 2);
    const textureSim = 100 - Math.min(100, Math.abs(features1.textureComplexity - features2.textureComplexity) / 2);

    return (brightnessSim + contrastSim + edgeSim + textureSim) / 4;
  }

  /**
   * Correlation coefficient for histograms
   */
  private correlationCoefficient(arr1: number[], arr2: number[]): number {
    const n = arr1.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

    for (let i = 0; i < n; i++) {
      sum1 += arr1[i];
      sum2 += arr2[i];
      sum1Sq += arr1[i] * arr1[i];
      sum2Sq += arr2[i] * arr2[i];
      pSum += arr1[i] * arr2[i];
    }

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    if (den === 0) return 0;
    
    const correlation = num / den;
    // Convert -1 to 1 range to 0 to 100
    return (correlation + 1) * 50;
  }

  /**
   * Compare dominant colors
   */
  private compareDominantColors(colors1: Array<{r: number, g: number, b: number}>, colors2: Array<{r: number, g: number, b: number}>): number {
    let totalSimilarity = 0;
    let matches = 0;

    for (const c1 of colors1) {
      let minDist = Infinity;
      for (const c2 of colors2) {
        const dist = Math.sqrt(
          Math.pow(c1.r - c2.r, 2) +
          Math.pow(c1.g - c2.g, 2) +
          Math.pow(c1.b - c2.b, 2)
        );
        minDist = Math.min(minDist, dist);
      }
      // Max distance in RGB space is sqrt(3 * 255^2) = ~441
      const similarity = 100 - Math.min(100, (minDist / 441) * 100);
      if (similarity > 70) matches++;
      totalSimilarity += similarity;
    }

    return totalSimilarity / colors1.length;
  }

  /**
   * DCT approximation for pHash
   */
  private computeDCT(data: Buffer, size: number): number[][] {
    const matrix: number[][] = [];
    
    for (let u = 0; u < size; u++) {
      matrix[u] = [];
      for (let v = 0; v < size; v++) {
        let sum = 0;
        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            const pixel = data[y * size + x];
            sum += pixel * 
              Math.cos((2 * x + 1) * u * Math.PI / (2 * size)) *
              Math.cos((2 * y + 1) * v * Math.PI / (2 * size));
          }
        }
        matrix[u][v] = sum;
      }
    }
    
    return matrix;
  }

  /**
   * Haar wavelet transform approximation
   */
  private haarWavelet(data: Buffer, size: number): number[] {
    const result: number[] = [];
    const halfSize = Math.floor(size / 2);

    for (let i = 0; i < halfSize; i++) {
      for (let j = 0; j < halfSize; j++) {
        const idx1 = (i * 2) * size + (j * 2);
        const idx2 = (i * 2) * size + (j * 2 + 1);
        const idx3 = (i * 2 + 1) * size + (j * 2);
        const idx4 = (i * 2 + 1) * size + (j * 2 + 1);
        
        const avg = (data[idx1] + data[idx2] + data[idx3] + data[idx4]) / 4;
        result.push(avg);
      }
    }

    return result;
  }

  /**
   * Convert binary string to hex
   */
  private binaryToHex(binary: string): string {
    let hex = '';
    for (let i = 0; i < binary.length; i += 4) {
      const chunk = binary.substr(i, 4);
      hex += parseInt(chunk, 2).toString(16);
    }
    return hex;
  }

  /**
   * Serialize fingerprint for database storage
   */
  serializeFingerprint(fingerprint: VisualFingerprint): string {
    return JSON.stringify(fingerprint);
  }

  /**
   * Deserialize fingerprint from database
   */
  deserializeFingerprint(data: string): VisualFingerprint {
    return JSON.parse(data);
  }
}

export const visualMatchingService = new VisualMatchingService();

