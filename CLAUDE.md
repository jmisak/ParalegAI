# IRONCLAD - AI-Powered Paralegal Assistant for Real Estate Law

## Project Overview
IRONCLAD is a comprehensive paralegal AI assistant designed specifically for real estate law practices. It combines intelligent document automation, workflow management, and AI-assisted legal analysis.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TanStack Query, Tailwind CSS
- **Backend**: NestJS, PostgreSQL 16, Redis, BullMQ
- **AI**: LangChain, Claude/GPT-4 via abstraction layer
- **Search**: PostgreSQL FTS + pgvector (MVP), Elasticsearch (scale)
- **Auth**: Multi-tenant ABAC with MFA

### Monorepo Structure
```
G:/apps/IronClad/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared/       # Shared types, utilities
│   └── ui/           # Component library
├── docs/             # Documentation
├── scripts/          # Build/deploy scripts
└── .github/          # CI/CD workflows
```

### Core Modules
1. **AuthModule** - Authentication, RBAC/ABAC, tenant context
2. **MatterModule** - Case/matter management
3. **DocumentModule** - Document storage, versioning, templates
4. **AIModule** - LLM gateway, RAG, embeddings
5. **WorkflowModule** - Task automation, deadlines, events
6. **SearchModule** - Full-text + semantic search
7. **BillingModule** - Time tracking, invoicing, trust accounting

## Development Guidelines

### Code Standards
- TypeScript strict mode enabled
- ESLint + Prettier enforced
- All public APIs must have JSDoc comments
- Repository pattern for data access
- Services contain business logic only
- Controllers are thin (validation + routing only)

### Database Rules
- NEVER hard delete - use soft deletes (`deleted_at`)
- ALL tables require audit fields (`created_at`, `updated_at`, `created_by`, `updated_by`)
- Documents are immutable - create new versions
- All tables must have `organization_id` for tenant isolation
- Use Row-Level Security (RLS) policies

### Security Requirements (CRITICAL)
- Prompt injection defense on all AI document processing
- Field-level encryption for PII (SSN, EIN, DOB)
- Attorney-client privilege tagging on all documents
- No client data used for AI training
- MFA required for all internal users
- 15-minute session timeout, 8-hour absolute timeout

### AI Integration Rules
- NEVER call LLM providers directly from controllers
- Use `AIGatewayService` abstraction layer
- All prompts must be version-controlled in `PromptTemplateService`
- Track token usage per organization
- Human-in-loop required for high-stakes actions

## Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Database schema with Prisma + RLS
- [ ] Auth module with tenant context
- [ ] Matter management CRUD
- [ ] Document upload/storage
- [ ] Basic template engine

### Phase 2: Document Engine
- [ ] 50+ document templates
- [ ] Smart field population
- [ ] Jurisdiction variants
- [ ] PDF generation pipeline

### Phase 3: Workflow Automation
- [ ] Transaction pipelines
- [ ] Deadline engine with calendar sync
- [ ] Task automation triggers
- [ ] Notification system

### Phase 4: AI Intelligence
- [ ] Contract analysis
- [ ] Title review automation
- [ ] Compliance checking
- [ ] Risk scoring

### Phase 5: Integrations
- [ ] DocuSign/Notarize e-signature
- [ ] Lender LOS connectors
- [ ] Title company APIs
- [ ] Client portal

### Phase 6: Security & Compliance
- [ ] SOC 2 Type II controls
- [ ] State bar ethics review
- [ ] Penetration testing
- [ ] Production hardening

## Environment Variables
```
# Database
DATABASE_URL=
REDIS_URL=

# Auth
JWT_SECRET=
SESSION_SECRET=

# AI Providers
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Storage
S3_BUCKET=
S3_REGION=

# Integrations
DOCUSIGN_INTEGRATION_KEY=
```

## Commands
```bash
# Development
pnpm dev              # Start all apps
pnpm dev:web          # Start frontend only
pnpm dev:api          # Start backend only

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed dev data
pnpm db:studio        # Open Prisma Studio

# Testing
pnpm test             # Run all tests
pnpm test:e2e         # E2E tests
pnpm test:coverage    # Coverage report

# Build
pnpm build            # Production build
pnpm lint             # Lint all packages
pnpm typecheck        # TypeScript check
```

## Agent Delegation Protocol
When working on IRONCLAD, follow the Iron Legion chain of command:
1. @Planner - Strategic planning and task breakdown
2. @Foreman - Architecture validation before implementation
3. @Writer - Code implementation
4. @Reviewer - Code review and logic audit
5. @Ralph - Security review (mandatory for auth, AI, integrations)
6. @Testy - Functional testing
7. @MaDness - Documentation updates

## Key Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-02 | Modular monolith for MVP | Microservices complexity not justified for initial launch |
| 2026-02-02 | PostgreSQL FTS over Elasticsearch | Simpler ops, sufficient for MVP scale |
| 2026-02-02 | ABAC over RBAC | Required for Chinese wall / conflict management |
| 2026-02-02 | Shared DB, separate schemas | Balance of isolation and cost efficiency |
| 2026-02-03 | set_config(..., true) for RLS | Transaction-local scope prevents tenant bleed across pooled connections |
| 2026-02-03 | Remove skipConflictCheck from API body | Chinese Wall bypass must never be user-controllable |
| 2026-02-03 | MFA challenge token pattern for login | Login returns mfaToken (5m TTL) instead of full JWT when MFA enabled |
| 2026-02-03 | TenantGuard fail-closed in production | Dev returns fallback context; prod returns null (403) on DB error |
| 2026-02-03 | organizationId removed from RegisterDto | Tenant assignment is admin-only; self-registration creates new isolated org |

## Audit Log (2026-02-03)

### Completed: Full 4-Agent Security Audit
Agents deployed: @data_lord (persistence), @bug_hunter (frontend + backend), @Reviewer (6-path logic audit), @sentinel (10-sector sweep).

### Fixes Applied (21 total across 19 files)

**Tenant Isolation (5 fixes)**
- `tenant-context.interceptor.ts:120` — `set_config(..., false)` → `true` (transaction-local)
- `matter.repository.ts` — Added `organization_id` filter to `update()`, `softDelete()`, `assignTeam()`, `getActivityHistory()`, `getParties()`
- `template.repository.ts` — Added `organization_id` + `is_active` filter to `update()`, `softDelete()`
- `storage.service.ts` — Added tenant key prefix validation on `downloadFile()`, `deleteFile()`
- `tenant.guard.ts` — Fail-closed in production (`NODE_ENV=production` returns null instead of enterprise mock)

**Auth & MFA (6 fixes)**
- `auth.service.ts` — Login now checks `isMfaEnabled()`, returns `mfaToken` challenge if MFA active
- `auth.service.ts` — New `verifyMfaLogin()` method validates MFA token + TOTP/backup code
- `mfa.controller.ts` — New `POST /auth/mfa/verify` endpoint (was missing, frontend called it)
- `mfa.controller.ts` — Added class-validator decorators (`@IsString`, `@Length`, `@IsIn`) to all DTOs
- `register.dto.ts` — Removed `organizationId` from public registration DTO
- `auth.service.ts` — Sanitized error logging (no more raw error objects in logs)

**Data Integrity (4 fixes)**
- `matter.repository.ts:assignTeam()` — Wrapped in `$transaction()` to prevent orphaned state
- `matter.controller.ts` — `skipConflictCheck` removed from request body (always `false`)
- `template.service.ts:render()` — Wrapped in try-catch, throws `BadRequestException`
- `session.service.ts` — Redis session set now has TTL matching absolute timeout

**Storage Security (1 fix)**
- `local.provider.ts` — Path traversal prevention via `safePath()` on all file operations

**Frontend (3 fixes)**
- `auth-provider.tsx` — Handles `mfaRequired` response, stores `mfaToken` in sessionStorage
- `login/page.tsx` — Removed double `router.push`
- `verify-mfa/page.tsx` — Sends `mfaToken` from sessionStorage with verification request

### Known Issues — Next Session Backlog

**Phase 1 Cleanup (Do Before Real Data)**
| ID | Issue | File | Effort |
|----|-------|------|--------|
| B-001 | MFA `ON CONFLICT (user_id) WHERE is_active = false` references nonexistent partial index | `mfa.service.ts:111` | Add migration for partial unique index |
| B-002 | Conflict check SQL uses nested `$queryRaw` inside tagged template (runtime error when `excludeMatterId` provided) | `matter.repository.ts:302` | Rewrite as conditional SQL |
| B-003 | Frontend hooks return mock data with no API toggle | `use-templates.ts`, `use-matter.ts` | Add `NEXT_PUBLIC_USE_MOCKS` env flag |
| B-004 | `template.status` frontend type doesn't map to backend `isActive` boolean | `use-templates.ts:39` | Align types when switching to real API |

**Phase 2 (Feature Completion)**
| ID | Issue | File | Effort |
|----|-------|------|--------|
| B-005 | ABAC guard not wired to any controller | `abac.guard.ts` | Wire to matter + template controllers with `@AbacPolicy()` |
| B-006 | Chinese Wall policy hardcoded `return false` | `policies.ts:54` | Implement actual conflict party lookup |
| B-007 | ABAC guard defaults `resource.organizationId` to user's org | `abac.guard.ts:83` | Require `getResource` extractor on all policy-guarded routes |
| B-008 | MFA disable endpoint requires no password re-verification | `mfa.controller.ts` | Add password confirmation param |
| B-009 | TOTP replay within 30s window (no counter check) | `mfa.service.ts:214` | Check `last_used_at` before accepting code |
| B-010 | ILIKE search doesn't escape `%`/`_` wildcards | `matter.repository.ts`, `template.repository.ts` | Add `escapeLike()` utility |
| B-011 | Template engine output not HTML-sanitized (XSS in rendered docs) | `template.engine.ts:350` | Add sanitization layer before PDF/HTML output |
| B-012 | `MatterController` missing `@TenantScoped()` decorator (RLS not set for matter queries) | `matter.controller.ts` | Add decorator; requires testing RLS integration |

**Phase 3 (Workflow)**
| ID | Issue | File | Effort |
|----|-------|------|--------|
| B-013 | Refresh token is stateless JWT with no revocation | `auth.service.ts:99` | Add token family tracking + rotation |

**Phase 6 (Production Hardening)**
| ID | Issue | File | Effort |
|----|-------|------|--------|
| B-014 | MFA encryption key falls back to `'default-key'` | `mfa.service.ts:44` | Require `MFA_ENCRYPTION_KEY` env var, fail on startup if missing |
| B-015 | MFA key derivation uses hardcoded salt `'mfa-salt'` | `mfa.service.ts:46` | Use per-deployment salt from env |
| B-016 | Local storage provider reuses `JWT_SECRET` for URL signing | `local.provider.ts:28` | Use separate `STORAGE_SIGNING_SECRET` |
| B-017 | Backup codes use SHA-256 (GPU-crackable) | `mfa.service.ts:368` | Migrate to bcrypt or argon2 |
| B-018 | Auth queries run without RLS tenant context | `auth.service.ts` | Use BYPASSRLS service role for auth queries, or add permissive RLS policy on `users` table |
| B-019 | No CSRF protection on API client | `api.ts` | Add CSRF token header; add `csurf` middleware |
| B-020 | No rate limiting on auth endpoints | `auth.controller.ts` | Add `@Throttle()` from `@nestjs/throttler` |
| B-021 | PII fields (SSN, EIN, DOB) stored as plaintext | Prisma schema | Implement field-level encryption via Prisma middleware |
| B-022 | Session timeout vs JWT expiry mismatch possible | Configuration | Enforce `JWT_EXPIRES_IN` < `SESSION_TIMEOUT_MINUTES` |
| B-023 | Redis connection not closed on shutdown | `session.service.ts` | Implement `OnModuleDestroy` lifecycle hook |
