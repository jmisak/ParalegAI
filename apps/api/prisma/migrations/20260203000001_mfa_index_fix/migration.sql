-- =============================================================================
-- IRONCLAD - Fix MFA Partial Unique Index (B-001)
-- =============================================================================
-- The user_mfa table has a blanket UNIQUE("user_id") constraint which prevents
-- the ON CONFLICT (user_id) WHERE is_active = false clause in mfa.service.ts
-- from working correctly. A user who already has an active MFA row cannot
-- re-enroll (the full unique blocks the insert before the partial predicate
-- is evaluated).
--
-- Solution: Replace the single UNIQUE constraint with two partial unique
-- indexes — one for active rows and one for inactive rows. This allows:
--   - At most ONE active MFA enrollment per user
--   - At most ONE pending (inactive) enrollment per user
--   - The ON CONFLICT clause to target only inactive rows
-- =============================================================================

-- Drop the existing blanket unique constraint
ALTER TABLE "user_mfa" DROP CONSTRAINT IF EXISTS "user_mfa_user_unique";

-- Partial unique index for active MFA (only one active enrollment per user)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_mfa_user_id_active"
  ON "user_mfa" ("user_id")
  WHERE is_active = true;

-- Partial unique index for inactive/pending MFA (matches ON CONFLICT predicate)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_mfa_user_id_inactive"
  ON "user_mfa" ("user_id")
  WHERE is_active = false;
