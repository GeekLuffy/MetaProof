import { getDatabasePool } from './database';

export interface ArtworkRecord {
  id?: number;
  contentHash: string;
  promptHash: string;
  creatorAddress: string;
  ipfsCID: string;
  modelUsed: string;
  metadataURI?: string;
  certificateTokenId?: bigint | number;
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
      
      const result = await pool.query(
        `INSERT INTO artworks (
          content_hash, 
          prompt_hash, 
          creator_address, 
          ipfs_cid, 
          model_used, 
          metadata_uri,
          certificate_token_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (content_hash) 
        DO UPDATE SET
          prompt_hash = EXCLUDED.prompt_hash,
          metadata_uri = EXCLUDED.metadata_uri,
          certificate_token_id = COALESCE(EXCLUDED.certificate_token_id, artworks.certificate_token_id),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
        [
          artwork.contentHash,
          artwork.promptHash,
          artwork.creatorAddress.toLowerCase(),
          artwork.ipfsCID,
          artwork.modelUsed,
          artwork.metadataURI || null,
          artwork.certificateTokenId ? Number(artwork.certificateTokenId) : null,
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
    return {
      id: row.id,
      contentHash: row.content_hash,
      promptHash: row.prompt_hash,
      creatorAddress: row.creator_address,
      ipfsCID: row.ipfs_cid,
      modelUsed: row.model_used,
      metadataURI: row.metadata_uri,
      certificateTokenId: row.certificate_token_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const artworkService = new ArtworkService();

