# My Tasco Secure Agentic RAG — Implementation TODO

Scaffold is complete. Every item below is a pick-up task for parallel team work.
Ownership follows architecture ownership: **BE / AIE1 / AIE2 / AIE3 / FS**.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## BE — Backend platform (API composition root, auth, infra)

### Config & composition root
- [ ] Wire real JWT validation in `apps/api/src/dependencies.py::get_current_subject`
- [ ] Implement Idempotency-Key Redis cache/replay in `require_idempotency_key`
- [ ] Configure OpenTelemetry resource + exporters in `apps/api/src/main.py` lifespan
- [ ] Map all HTTPException paths to COP `ErrorEnvelope` (not FastAPI default)
- [ ] Add structured logging middleware that binds `requestId` on every log line

### Database & migrations
- [ ] Author first Alembic revision for Document, Chunk, AuditEvent, AgentRun, Action, Session
- [ ] Enable `pgvector` extension in migration
- [x] Align prototype embedding column with the Qwen3 512-d `halfvec` registry decision
- [ ] Add ACL / version / status columns to Document
- [ ] Seed non-sensitive demo data under `database/seeds/`

### Documents API (`apps/api/src/routes/documents/`)
- [ ] `listDocuments` — paginated ACL-aware inventory
- [ ] `createDocument` — multipart upload, metadata, enqueue ingestion job
- [ ] `createDocumentVersion` — immutable version + re-ingestion
- [ ] `publishDocument` / `archiveDocument` — status transitions

### Chat / runs API (`apps/api/src/routes/chat/`)
- [ ] `createChatSession` — persist Session, return SessionEnvelope
- [ ] `createAgentRun` — accept run, enqueue worker, return 202 AgentRunEnvelope
- [ ] `getAgentRun` — load owned run state
- [ ] `streamAgentRunEvents` — SSE status-only stream (no answer tokens)
- [ ] `cancelAgentRun` — signal cancellation on state machine

### Actions API (`apps/api/src/routes/actions/`)
- [ ] `getActionPreview` — immutable preview load
- [ ] `confirmAction` — token verify + idempotent execute
- [ ] `rejectAction` — mark rejected without upstream mutation

### Worker infra (`apps/worker/`)
- [ ] Job queue consumer loop (Redis/streams or Postgres SKIP LOCKED)
- [ ] Wire `run_job` / `ingest_job` / `eval_job` entrypoints to queue
- [ ] Graceful shutdown and retry policy

### Tests (BE)
- [ ] Integration health test against `docker compose` Postgres + Redis
- [ ] Contract tests for ErrorEnvelope / App-Code middleware
- [ ] Idempotency key unit tests


## AIE1 — Knowledge ingestion

### Corpus and intake
- [x] Profile the participant workbook and validate `Documents` against `Document_Metadata`
- [x] Define fail-closed classification/access bootstrap taxonomy and quarantine reasons
- [x] Implement deterministic XLSM loader without macro execution
- [x] Export normalized demo documents and corpus profile under `database/seeds/aie1/`

### Parsing and chunking
- [x] Implement Vietnamese Markdown heading-aware chunking
- [x] Bind every chunk to document version, source provenance, classification, department, and access metadata
- [ ] Add parsers for the remaining Phase 2 approved demo formats after format freeze
- [ ] Add PII/secret/prompt-injection annotations with AIE3 guardrail contracts

### Versioning and indexing
- [ ] Align immutable document/version/chunk/job schemas with BE migrations
- [ ] Implement ingestion state machine, retries, quarantine workflow, and atomic publish
- [x] Lock internal Qwen3 embedding registry and typed embedding/index contracts
- [x] Pin the Qwen3 snapshot and implement CUDA/CPU batch embedding inference
- [x] Generate and validate 361 demo embeddings with an atomic provenance manifest
- [ ] Benchmark Qwen3 512 dimensions against native 1024 and confirm the production dimension with AIE3
- [ ] Write BM25 and pgvector indexes with versioned, idempotent rebuilds
- [ ] Hand AIE2 an ACL-filtered retrieval boundary and result-recheck metadata

### QA and handoff
- [ ] Add version replacement, interrupted publish, malformed source, and security metadata tests
- [ ] Produce ingestion QA metrics and steward review queue
- [ ] Tune entity aliases/indexes from the Vietnamese retrieval benchmark
- [ ] Document production corpus, re-index, rollback, and steward workflows


## AIE2 — Retrieval and agent orchestration

### Hybrid retrieval vertical slice
- [x] Integrate internal Qwen3 query embeddings with the AIE1 artifact index
- [x] Implement deterministic Vietnamese BM25 candidate generation
- [x] Apply tenant/classification/department permission predicates before BM25/vector scoring
- [x] Implement dense cosine retrieval and stable-ID RRF fusion (`k=60`)
- [x] Pin and integrate the internal Qwen3 0.6B reranker for authorized candidates only
- [x] Return BM25, vector, fused and reranker score breakdowns
- [x] Recheck result permission before returning each hit
- [x] Evaluate all 50 public workbook cases, including multi-source expected documents

### Production retrieval integration
- [ ] Replace the JSONL artifact store with Supabase/PostgreSQL BM25 + pgvector queries
- [ ] Resolve authoritative SubjectContext and versioned Policy Engine decisions from BE
- [ ] Enforce active document/index versions and purpose predicates inside database queries
- [ ] Wire `knowledge.search` and the public Search API after JWT/policy dependencies are real
- [ ] Add evidence thresholds, duplicate/conflict handling, manifests, and insufficient-evidence state
- [ ] Implement Route A/B state-machine integration, budgets, cancellation, and degraded modes
- [ ] Add Route C planner, two-round retrieval, evidence evaluator, and B→C escalation accounting


## FS — Full-stack / DX / contracts

### Contracts layer
- [ ] Thin re-exports or typed protocols under each `modules/*/contracts/`
- [ ] Keep `openapi.yaml` as source of truth; add codegen later if needed

### Web / Flutter (out of current scaffold scope, tracked for planning)
- [ ] `apps/web` BFF client for chat sessions/runs + SSE
- [ ] Action confirm/reject UX with confirmation token
- [ ] `apps/flutter_adapter` package surface

### DX
- [ ] `.env.example` with non-secret defaults
- [ ] `scripts/` smoke: compose up → migrate → health curl
- [ ] CI: import check, pytest, openai URL grep, ruff/mypy

---

## Shared / cross-cutting checklist

- [x] Monorepo skeleton + FastAPI composition root
- [x] Pydantic schemas from OpenAPI
- [x] Router stubs for all OpenAPI operationIds
- [x] Real `GET /health` (DB + Redis probe)
- [x] Module service stubs
- [x] Worker job stubs
- [x] docker-compose (pgvector + redis)
- [x] pyproject.toml + alembic skeleton
- [x] Placeholder tests + this TODO
- [ ] First real Alembic revision
- [ ] JWT auth end-to-end
- [ ] First end-to-end agent run (create → worker → get/SSE)
- [ ] Security invariants S1–S12 as release gate
