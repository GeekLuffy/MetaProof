import { getDatabasePool } from './database';

export interface ArtworkRecord {
  id?: number;
  contentHash: string;
  promptHash: string;
  prompt?: string;
  creatorAddress: string;
  ipfsCID: string;
  modelUsed: string;
  metadataURI?: string;
  certificateTokenId?: bigint | number;
  // Visual matching fields for detecting screenshots/modifications
  perceptualHash?: string;
  dhash?: string;
  ahash?: string;
  waveletHash?: string;
  visualFeatures?: string; // JSON string of VisualFeatures
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Service for managing artwork records in the database
 */
export class ArtworkService {
  /**
   * Save an artwork to the database
   */
  async saveArtwork(artwork: ArtworkRecord): Promise<ArtworkRecord> {
    try {
      let pool;
      try {
        pool = getDatabasePool();
      } catch (error: any) {
        if (error.message?.includes('DATABASE_URL is not set')) {
          console.warn('⚠️ Database not available, skipping artwork save');
          return artwork;
        }
        throw error;
      }
      
      // Normalize hashes before saving
      const normalizeHash = (hash: string): string => {
        if (!hash) return hash;
        const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
        // Ensure it's exactly 64 characters
        if (cleanHash.length !== 64) {
          console.warn(`⚠️ Attempting to save hash with invalid length: ${cleanHash.length} chars. Hash: ${hash}`);
        }
        return `0x${cleanHash}`;
      };

      const normalizedContentHash = normalizeHash(artwork.contentHash);
      const normalizedPromptHash = normalizeHash(artwork.promptHash);

      console.log(`💾 Saving artwork with contentHash: ${normalizedContentHash} (length: ${normalizedContentHash.length})`);
      
      const result = await pool.query(
        `INSERT INTO artworks (
          content_hash, 
          prompt_hash, 
          prompt,
          creator_address, 
          ipfs_cid, 
          model_used, 
          metadata_uri,
          certificate_token_id,
          perceptual_hash,
          dhash,
          ahash,
          wavelet_hash,
          visual_features
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (content_hash) 
        DO UPDATE SET
          prompt_hash = EXCLUDED.prompt_hash,
          prompt = EXCLUDED.prompt,
          metadata_uri = EXCLUDED.metadata_uri,
          certificate_token_id = COALESCE(EXCLUDED.certificate_token_id, artworks.certificate_token_id),
          perceptual_hash = COALESCE(EXCLUDED.perceptual_hash, artworks.perceptual_hash),
          dhash = COALESCE(EXCLUDED.dhash, artworks.dhash),
          ahash = COALESCE(EXCLUDED.ahash, artworks.ahash),
          wavelet_hash = COALESCE(EXCLUDED.wavelet_hash, artworks.wavelet_hash),
          visual_features = COALESCE(EXCLUDED.visual_features, artworks.visual_features),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
        [
          normalizedContentHash,
          normalizedPromptHash,
          artwork.prompt || null,
          artwork.creatorAddress.toLowerCase(),
          artwork.ipfsCID,
          artwork.modelUsed,
          artwork.metadataURI || null,
          artwork.certificateTokenId ? Number(artwork.certificateTokenId) : null,
          artwork.perceptualHash || null,
          artwork.dhash || null,
          artwork.ahash || null,
          artwork.waveletHash || null,
          artwork.visualFeatures || null,
        ]
      );

      const row = result.rows[0];
      return this.mapRowToArtwork(row);
    } catch (error: any) {
      // If database is not available, just log and continue
      if (error.message?.includes('DATABASE_URL is not set') || error.message?.includes('connection')) {
        console.warn('⚠️ Database not available, skipping artwork save:', error.message);
        return artwork;
      }
      console.error('❌ Error saving artwork to database:', error);
      throw error;
    }
  }

  /**
   * Get all artworks for a specific creator
   */
  async getArtworksByCreator(creatorAddress: string): Promise<ArtworkRecord[]> {
    try {
      let pool;
      try {
        pool = getDatabasePool();
      } catch (error: any) {
        if (error.message?.includes('DATABASE_URL is not set')) {
          return [];
        }
        throw error;
      }
      
      const result = await pool.query(
        `SELECT * FROM artworks 
         WHERE creator_address = $1 
         ORDER BY created_at DESC`,
        [creatorAddress.toLowerCase()]
      );

      return result.rows.map((row) => this.mapRowToArtwork(row));
    } catch (error: any) {
      // If database is not available, return empty array
      if (error.message?.includes('DATABASE_URL is not set') || error.message?.includes('connection')) {
        console.warn('⚠️ Database not available, returning empty artworks list');
        return [];
      }
      console.error('❌ Error fetching artworks:', error);
      throw error;
    }
  }

  /**
   * Get all artworks (optional filter by creator)
   */
  async getAllArtworks(creatorAddress?: string): Promise<ArtworkRecord[]> {
    try {
      let pool;
      try {
        pool = getDatabasePool();
      } catch (error: any) {
        if (error.message?.includes('DATABASE_URL is not set')) {
          return [];
        }
        throw error;
      }
      
      let query = 'SELECT * FROM artworks ORDER BY created_at DESC';
      const params: any[] = [];
      
      if (creatorAddress) {
        query = 'SELECT * FROM artworks WHERE creator_address = $1 ORDER BY created_at DESC';
        params.push(creatorAddress.toLowerCase());
      }
      
      const result = await pool.query(query, params);
      return result.rows.map((row) => this.mapRowToArtwork(row));
    } catch (error: any) {
      // If database is not available, return empty array
      if (error.message?.includes('DATABASE_URL is not set') || error.message?.includes('connection')) {
        console.warn('⚠️ Database not available, returning empty artworks list');
        return [];
      }
      console.error('❌ Error fetching artworks:', error);
      throw error;
    }
  }

  /**
   * Get artwork by content hash
   */
  async getArtworkByContentHash(contentHash: string): Promise<ArtworkRecord | null> {
    try {
      let pool;
      try {
        pool = getDatabasePool();
      } catch (error: any) {
        if (error.message?.includes('DATABASE_URL is not set')) {
          return null;
        }
        throw error;
      }
      
      const result = await pool.query(
        'SELECT * FROM artworks WHERE content_hash = $1',
        [contentHash]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToArtwork(result.rows[0]);
    } catch (error: any) {
      // If database is not available, return null
      if (error.message?.includes('DATABASE_URL is not set') || error.message?.includes('connection')) {
        console.warn('⚠️ Database not available, returning null');
        return null;
      }
      console.error('❌ Error fetching artwork:', error);
      throw error;
    }
  }

  /**
   * Update certificate token ID for an artwork
   */
  async updateCertificateTokenId(contentHash: string, tokenId: bigint | number): Promise<void> {
    try {
      let pool;
      try {
        pool = getDatabasePool();
      } catch (error: any) {
        if (error.message?.includes('DATABASE_URL is not set')) {
          return;
        }
        throw error;
      }
      
      await pool.query(
        'UPDATE artworks SET certificate_token_id = $1, updated_at = CURRENT_TIMESTAMP WHERE content_hash = $2',
        [Number(tokenId), contentHash]
      );
    } catch (error: any) {
      // If database is not available, just log and continue
      if (error.message?.includes('DATABASE_URL is not set') || error.message?.includes('connection')) {
        console.warn('⚠️ Database not available, skipping certificate update');
        return;
      }
      console.error('❌ Error updating certificate token ID:', error);
      throw error;
    }
  }

  /**
   * Map database row to ArtworkRecord
   */
  private mapRowToArtwork(row: any): ArtworkRecord {
    // Normalize hashes to ensure they're exactly 66 characters (0x + 64 hex)
    const normalizeHash = (hash: string): string => {
      if (!hash) return hash;
      // Remove 0x prefix if present
      const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
      // Ensure it's exactly 64 characters
      if (cleanHash.length !== 64) {
        console.warn(`⚠️ Hash length mismatch in database: ${cleanHash.length} chars, expected 64. Hash: ${hash}`);
        // If it's 65 chars and starts with '0', remove the leading zero
        if (cleanHash.length === 65 && cleanHash.startsWith('0')) {
          console.log(`🔧 Fixing hash by removing leading zero: ${cleanHash} -> ${cleanHash.slice(1)}`);
          return `0x${cleanHash.slice(1)}`;
        }
      }
      return `0x${cleanHash}`;
    };

    return {
      id: row.id,
      contentHash: normalizeHash(row.content_hash),
      promptHash: normalizeHash(row.prompt_hash),
      prompt: row.prompt,
      creatorAddress: row.creator_address,
      ipfsCID: row.ipfs_cid,
      modelUsed: row.model_used,
      metadataURI: row.metadata_uri,
      certificateTokenId: row.certificate_token_id,
      perceptualHash: row.perceptual_hash,
      dhash: row.dhash,
      ahash: row.ahash,
      waveletHash: row.wavelet_hash,
      visualFeatures: row.visual_features,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Find similar artworks using perceptual hashes
   */
  async findSimilarArtworks(perceptualHash: string, dhash: string, limit: number = 10): Promise<ArtworkRecord[]> {
    try {
      let pool;
      try {
        pool = getDatabasePool();
      } catch (error: any) {
        if (error.message?.includes('DATABASE_URL is not set')) {
          return [];
        }
        throw error;
      }
      
      // Find artworks with similar hashes
      // This is a simple approach - for production, consider using specialized similarity search
      const result = await pool.query(
        `SELECT * FROM artworks 
         WHERE perceptual_hash IS NOT NULL 
         AND dhash IS NOT NULL
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit * 5] // Get more results for filtering
      );

      return result.rows.map((row) => this.mapRowToArtwork(row));
    } catch (error: any) {
      if (error.message?.includes('DATABASE_URL is not set') || error.message?.includes('connection')) {
        console.warn('⚠️ Database not available, returning empty list');
        return [];
      }
      console.error('❌ Error finding similar artworks:', error);
      throw error;
    }
  }
}


export const artworkService = new ArtworkService();

