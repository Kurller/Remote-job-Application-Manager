import 'dotenv/config';
import { pool } from './config/db.js';

async function migrate() {
  try {
    // USERS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // JOBS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // CVS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cvs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        originalname VARCHAR(255) NOT NULL,
        path TEXT,
        mimetype VARCHAR(50),
        size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // APPLICATIONS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        cv_id INTEGER NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'applied',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ All tables migrated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrate();
