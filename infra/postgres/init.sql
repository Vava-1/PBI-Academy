-- Initialize database extensions and base setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for common queries
-- These will be created by SQLAlchemy migrations, but can be pre-declared here if needed
