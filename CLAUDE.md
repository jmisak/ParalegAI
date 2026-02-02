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
