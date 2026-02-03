-- =============================================================================
-- IRONCLAD - Auxiliary RLS Policies & Database Role Hardening
-- =============================================================================
-- This migration addresses security findings:
-- 1. Missing RLS on auxiliary/junction tables
-- 2. Database role configuration for RLS enforcement
-- 3. MFA table creation
-- =============================================================================

-- =============================================================================
-- AUXILIARY TABLES - RLS Policies
-- =============================================================================

-- MATTER_ASSIGNMENTS (junction table)
ALTER TABLE "matter_assignments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matter_assignments_tenant_isolation" ON "matter_assignments"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM matters m
      WHERE m.id = matter_assignments.matter_id
        AND m.organization_id = current_setting('app.current_organization_id', true)::uuid
    )
  );

CREATE POLICY "matter_assignments_tenant_insert" ON "matter_assignments"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matters m
      WHERE m.id = matter_assignments.matter_id
        AND m.organization_id = current_setting('app.current_organization_id', true)::uuid
    )
  );

-- MATTER_ACTIVITIES (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matter_activities') THEN
    EXECUTE 'ALTER TABLE "matter_activities" ENABLE ROW LEVEL SECURITY';

    EXECUTE $policy$
      CREATE POLICY "matter_activities_tenant_isolation" ON "matter_activities"
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM matters m
            WHERE m.id = matter_activities.matter_id
              AND m.organization_id = current_setting('app.current_organization_id', true)::uuid
          )
        )
    $policy$;
  END IF;
END $$;

-- USER_ROLES (junction table)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    EXECUTE 'ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY';

    EXECUTE $policy$
      CREATE POLICY "user_roles_tenant_isolation" ON "user_roles"
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = user_roles.user_id
              AND u.organization_id = current_setting('app.current_organization_id', true)::uuid
          )
        )
    $policy$;
  END IF;
END $$;

-- ROLE_PERMISSIONS (junction table - read-only for app)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
    EXECUTE 'ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY';

    -- Role permissions are global (not tenant-specific), allow read for all
    EXECUTE $policy$
      CREATE POLICY "role_permissions_read_all" ON "role_permissions"
        FOR SELECT
        USING (true)
    $policy$;

    -- Restrict writes to prevent privilege escalation
    EXECUTE $policy$
      CREATE POLICY "role_permissions_no_write" ON "role_permissions"
        AS RESTRICTIVE
        FOR INSERT
        USING (false)
    $policy$;
  END IF;
END $$;

-- DOCUMENT_SIGNATURES (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_signatures') THEN
    EXECUTE 'ALTER TABLE "document_signatures" ENABLE ROW LEVEL SECURITY';

    EXECUTE $policy$
      CREATE POLICY "document_signatures_tenant_isolation" ON "document_signatures"
        FOR ALL
        USING (organization_id = current_setting('app.current_organization_id', true)::uuid)
    $policy$;
  END IF;
END $$;

-- =============================================================================
-- USER_MFA TABLE (New - for MFA support)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "user_mfa" (
  "id" UUID PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "secret_encrypted" TEXT NOT NULL,
  "backup_codes_hash" TEXT NOT NULL DEFAULT '[]',
  "is_active" BOOLEAN NOT NULL DEFAULT false,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "last_used_at" TIMESTAMPTZ,
  "last_used_counter" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "user_mfa_user_unique" UNIQUE ("user_id")
);

CREATE INDEX IF NOT EXISTS "idx_user_mfa_user_id" ON "user_mfa" ("user_id");

-- RLS for user_mfa
ALTER TABLE "user_mfa" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_mfa_tenant_isolation" ON "user_mfa"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_mfa.user_id
        AND u.organization_id = current_setting('app.current_organization_id', true)::uuid
    )
  );

-- Add mfa_enabled column to users if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'mfa_enabled'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- =============================================================================
-- DATABASE ROLE HARDENING
-- =============================================================================
-- Create a dedicated application role that cannot bypass RLS
-- This prevents the application from accidentally accessing data
-- outside the set tenant context

DO $$
BEGIN
  -- Create the ironclad_app role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ironclad_app') THEN
    CREATE ROLE ironclad_app WITH
      LOGIN
      NOBYPASSRLS
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE;
  ELSE
    -- Ensure existing role has correct settings
    ALTER ROLE ironclad_app NOBYPASSRLS;
    ALTER ROLE ironclad_app NOSUPERUSER;
  END IF;

  -- Grant schema usage
  GRANT USAGE ON SCHEMA public TO ironclad_app;

  -- Grant table permissions (SELECT, INSERT, UPDATE, DELETE on all tables)
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ironclad_app;

  -- Grant sequence permissions (for auto-generated IDs)
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ironclad_app;

  -- Grant execute on functions
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ironclad_app;

  -- Ensure future tables also get permissions
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ironclad_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO ironclad_app;
END $$;

-- =============================================================================
-- BYPASS RLS POLICY FOR ADMIN OPERATIONS
-- =============================================================================
-- Create a separate admin role for migrations and maintenance
-- This role CAN bypass RLS for administrative operations

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ironclad_admin') THEN
    CREATE ROLE ironclad_admin WITH
      LOGIN
      BYPASSRLS
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE;
  END IF;

  GRANT USAGE ON SCHEMA public TO ironclad_admin;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ironclad_admin;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ironclad_admin;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ironclad_admin;
END $$;
