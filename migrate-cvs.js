// Quick migration script for cvs table
// Run: node migrate-cvs.js

import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
});

async function migrateCVS() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running cvs table migration...');

    // Add columns one by one
    await client.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS path TEXT`);
    console.log('✅ Added path column');

    await client.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS originalname VARCHAR(255)`);
    console.log('✅ Added originalname column');

    await client.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS mimetype VARCHAR(50)`);
    console.log('✅ Added mimetype column');

    await client.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS size INTEGER`);
    console.log('✅ Added size column');

    await client.query(`ALTER TABLE cvs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('✅ Added created_at column');

    // Rename uploaded_at to created_at if it exists
    try {
      await client.query(`ALTER TABLE cvs RENAME COLUMN uploaded_at TO created_at`);
      console.log('✅ Renamed uploaded_at to created_at');
    } catch (e) {
      // Column might not exist or already renamed
      console.log('ℹ️ uploaded_at column already handled');
    }

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateCVS();
