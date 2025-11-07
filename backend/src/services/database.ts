import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    });

    // Test connection
    pool.query('SELECT NOW()', (err: Error | null) => {
      if (err) {
        console.error('❌ Database connection error:', err.message);
      } else {
        console.log('✅ Database connected successfully');
      }
    });
  }

  return pool;
}

export async function initializeDatabase(): Promise<void> {
  try {
    const pool = getDatabasePool();
    
    // Create artworks table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS artworks (
        id SERIAL PRIMARY KEY,
        content_hash VARCHAR(66) UNIQUE NOT NULL,
        prompt_hash VARCHAR(66) NOT NULL,
        prompt TEXT,
        creator_address VARCHAR(42) NOT NULL,
        ipfs_cid VARCHAR(255) NOT NULL,
        model_used VARCHAR(100) NOT NULL,
        metadata_uri TEXT,
        certificate_token_id BIGINT,
        -- Visual matching fields for detecting screenshots and modifications
        perceptual_hash VARCHAR(128),
        dhash VARCHAR(128),
        ahash VARCHAR(128),
        wavelet_hash VARCHAR(128),
        visual_features JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on creator_address for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_creator_address ON artworks(creator_address);
    `);

    // Create index on content_hash for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_content_hash ON artworks(content_hash);
    `);

    // Create indexes on perceptual hashes for visual similarity search
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_perceptual_hash ON artworks(perceptual_hash);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_dhash ON artworks(dhash);
    `);

    console.log('✅ Database tables initialized');
  } catch (error: any) {
    if (error.message?.includes('DATABASE_URL is not set')) {
      console.warn('⚠️ Database not configured, continuing without database');
    } else {
      throw error;
    }
  }
}

