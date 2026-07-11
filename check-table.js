// Check cvs table structure
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
});

async function checkTable() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'cvs'
      ORDER BY ordinal_position
    `);

    console.log('📋 cvs table structure:');
    console.table(result.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTable();
