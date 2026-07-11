-- Migration: Update cvs table for Cloudinary upload
-- Run this in your PostgreSQL database (e.g., using pgAdmin or psql)

-- Add path column if it doesn't exist
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS path TEXT;

-- Add originalname column if it doesn't exist
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS originalname VARCHAR(255);

-- Add mimetype column if it doesn't exist
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS mimetype VARCHAR(50);

-- Add size column if it doesn't exist
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS size INTEGER;

-- Add created_at column if it doesn't exist (rename from uploaded_at if needed)
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Drop uploaded_at if it exists and created_at doesn't (cleanup old schema)
-- ALTER TABLE cvs DROP COLUMN IF EXISTS uploaded_at;

-- Rename uploaded_at to created_at if uploaded_at exists
ALTER TABLE cvs RENAME COLUMN uploaded_at TO created_at;

-- Drop path column if you want to re-add it (for clean migration)
-- ALTER TABLE cvs DROP COLUMN IF EXISTS path;

-- Update existing rows to have created_at from uploaded_at if available
-- UPDATE cvs SET created_at = uploaded_at WHERE created_at IS NULL;

-- Make sure created_at has a default value
ALTER TABLE cvs ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
