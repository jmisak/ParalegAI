-- =============================================================================
-- IRONCLAD - Row Level Security (RLS) Policies Migration
-- =============================================================================
-- This migration implements PostgreSQL Row-Level Security for multi-tenant
-- isolation. All tenant-scoped tables are protected to ensure data isolation
-- between organizations.
-- =============================================================================
-- Security Model:
--   - All queries must set: SET app.current_organization_id = '<uuid>'
--   - RLS policies filter rows automatically based on organization_id
--   - The current_setting(..., true) pattern returns NULL if not set
-- =============================================================================

-- =============================================================================
-- ORGANIZATIONS TABLE (Special Case: Owner-only access)
-- =============================================================================

ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_tenant_isolation" ON "organizations"
  FOR ALL
  USING (id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "organizations_tenant_insert" ON "organizations"
  FOR INSERT
  WITH CHECK (id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- USERS TABLE
-- =============================================================================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_tenant_isolation" ON "users"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "users_tenant_insert" ON "users"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- MATTERS TABLE
-- =============================================================================

ALTER TABLE "matters" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matters_tenant_isolation" ON "matters"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "matters_tenant_insert" ON "matters"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- DOCUMENTS TABLE
-- =============================================================================

ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_tenant_isolation" ON "documents"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "documents_tenant_insert" ON "documents"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- DOCUMENT_VERSIONS TABLE
-- =============================================================================

ALTER TABLE "document_versions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_versions_tenant_isolation" ON "document_versions"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "document_versions_tenant_insert" ON "document_versions"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- PARTIES TABLE
-- =============================================================================

ALTER TABLE "parties" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parties_tenant_isolation" ON "parties"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "parties_tenant_insert" ON "parties"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- MATTER_PARTIES TABLE
-- =============================================================================

ALTER TABLE "matter_parties" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matter_parties_tenant_isolation" ON "matter_parties"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "matter_parties_tenant_insert" ON "matter_parties"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- PROPERTIES TABLE
-- =============================================================================

ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_tenant_isolation" ON "properties"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "properties_tenant_insert" ON "properties"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- TRANSACTIONS TABLE
-- =============================================================================

ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_tenant_isolation" ON "transactions"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "transactions_tenant_insert" ON "transactions"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- AUDIT_LOGS TABLE (Special Case: Append-only / READ-ONLY for app)
-- =============================================================================

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_tenant_select" ON "audit_logs"
  FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "audit_logs_tenant_insert" ON "audit_logs"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "audit_logs_no_update" ON "audit_logs"
  AS RESTRICTIVE
  FOR UPDATE
  USING (false);

CREATE POLICY "audit_logs_no_delete" ON "audit_logs"
  AS RESTRICTIVE
  FOR DELETE
  USING (false);

-- =============================================================================
-- TRUST_ACCOUNTS TABLE
-- =============================================================================

ALTER TABLE "trust_accounts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trust_accounts_tenant_isolation" ON "trust_accounts"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "trust_accounts_tenant_insert" ON "trust_accounts"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- TRUST_TRANSACTIONS TABLE
-- =============================================================================

ALTER TABLE "trust_transactions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trust_transactions_tenant_isolation" ON "trust_transactions"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "trust_transactions_tenant_insert" ON "trust_transactions"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- TASKS TABLE
-- =============================================================================

ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_tenant_isolation" ON "tasks"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "tasks_tenant_insert" ON "tasks"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- WORKFLOWS TABLE
-- =============================================================================

ALTER TABLE "workflows" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflows_tenant_isolation" ON "workflows"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "workflows_tenant_insert" ON "workflows"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- WORKFLOW_INSTANCES TABLE
-- =============================================================================

ALTER TABLE "workflow_instances" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_instances_tenant_isolation" ON "workflow_instances"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "workflow_instances_tenant_insert" ON "workflow_instances"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- ADDITIONAL TABLES WITH organization_id
-- =============================================================================

-- DOCUMENT_TEMPLATES
ALTER TABLE "document_templates" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_templates_tenant_isolation" ON "document_templates"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "document_templates_tenant_insert" ON "document_templates"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- DOCUMENT_CHUNKS
ALTER TABLE "document_chunks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_chunks_tenant_isolation" ON "document_chunks"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "document_chunks_tenant_insert" ON "document_chunks"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- DEADLINES
ALTER TABLE "deadlines" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deadlines_tenant_isolation" ON "deadlines"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "deadlines_tenant_insert" ON "deadlines"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- TASK_ASSIGNMENTS
ALTER TABLE "task_assignments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_assignments_tenant_isolation" ON "task_assignments"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "task_assignments_tenant_insert" ON "task_assignments"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- WORKFLOW_STEPS
ALTER TABLE "workflow_steps" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_steps_tenant_isolation" ON "workflow_steps"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "workflow_steps_tenant_insert" ON "workflow_steps"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- COMMUNICATIONS
ALTER TABLE "communications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "communications_tenant_isolation" ON "communications"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "communications_tenant_insert" ON "communications"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- TIME_ENTRIES
ALTER TABLE "time_entries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_entries_tenant_isolation" ON "time_entries"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "time_entries_tenant_insert" ON "time_entries"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- TITLE_RECORDS
ALTER TABLE "title_records" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "title_records_tenant_isolation" ON "title_records"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "title_records_tenant_insert" ON "title_records"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- ENCUMBRANCES
ALTER TABLE "encumbrances" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encumbrances_tenant_isolation" ON "encumbrances"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "encumbrances_tenant_insert" ON "encumbrances"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- COMPLIANCE_CHECKS
ALTER TABLE "compliance_checks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_checks_tenant_isolation" ON "compliance_checks"
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "compliance_checks_tenant_insert" ON "compliance_checks"
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION set_current_organization(org_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_organization_id', org_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_organization()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_organization_id', true)::uuid;
END;
$$ LANGUAGE plpgsql STABLE;
