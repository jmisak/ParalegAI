-- =============================================================================
-- IRONCLAD Database Initialization Script
-- =============================================================================
-- This script runs on first database container initialization.
-- It sets up extensions and initial configuration.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create application user with limited privileges (for non-migration operations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ironclad_app') THEN
    CREATE ROLE ironclad_app WITH LOGIN PASSWORD 'ironclad_app_password';
  END IF;
END
$$;

-- Grant connect privilege
GRANT CONNECT ON DATABASE ironclad TO ironclad_app;

-- Note: Schema and table privileges will be granted after Prisma migrations run
-- The main ironclad user is used for migrations with full privileges

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'IRONCLAD database initialized at %', NOW();
END
$$;
