# Codex–Claude Handoff System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and validate the Git-backed task ledger, instruction integration, and dependency-light `agent-handoff` shell CLI defined by ADR-0003.

**Architecture:** A Bash entrypoint invokes small Node.js ESM modules that use only Node built-ins and Git. JSON Schemas and focused validators enforce ledger structure, Git reconciliation, locks, lifecycle transitions, verification freshness, and sensitive-data boundaries. All mutations stage a complete candidate ledger, validate it, then atomically rename files; product code and Git state are never modified by the CLI.

**Tech Stack:** Bash 3.2+, Node.js already required by the Next.js project, Node built-ins only, Git CLI, JSON Schema documents, Vitest, TypeScript only for test files.

**Spec:** `docs/adr/0003-codex-claude-project-handoff.md` and `docs/agent-handoff-contract.md`

## Global Constraints

- Implement no network calls, telemetry, model invocation, hooks, background service, or MCP server.
- Never run tests, builds, migrations, deployments, or arbitrary commands recorded in the ledger.
- Never mutate product files, Git branches, commits, index, worktrees, or remotes.
- Never infer production, deployment, billing, customer-data, messaging, deletion, or destructive authority from a handoff.
- Use Node built-ins only in the first version; add no runtime package dependency.
- Support macOS Bash 3.2 and current Linux Bash through a thin wrapper; keep application logic in ESM modules.
- Use RFC 3339 UTC timestamps, schema version `1`, 60-minute lock eligibility, and 90-day archive eligibility exactly as specified.
- Treat `.agents/locks/` as local-only and Git-ignored; all other ledger state is committed on the task branch.
- Redact secret matches; never echo matched values.
- All user-facing CLI text is concise English. Existing FranchiseTech product UI is out of scope.
- Every mutating command must support `--dry-run`, validate preconditions, and preserve the last valid ledger on failure.
- Follow TDD: add the failing test, run it, implement the minimum behavior, rerun, then commit.

## Review Focus

1. **Unexpected existing user files:** initialization and mutations must preserve unrelated dirty/untracked files and refuse ambiguous ownership; covered in Tasks 4 and 10.
2. **Crash between multi-file writes:** the old valid ledger must survive and temporary candidates must be reported; covered in Tasks 6 and 11.
3. **Stale lock with a live owner:** elapsed time alone must never permit takeover; covered in Task 7.
4. **Transcript or handoff mistaken for authority:** consequential transitions must require a human decision reference; covered in Tasks 5, 9, and 10.
5. **Secret/customer data in evidence:** findings must block commit-ready state while redacting the detected value; covered in Task 5.

---

## File map

### Runtime files to create

- `scripts/agent-handoff.sh` — Bash 3.2-compatible executable wrapper; finds Node and invokes the ESM CLI.
- `scripts/agent-handoff/cli.mjs` — argument parsing, command routing, text/JSON rendering, exit-code mapping.
- `scripts/agent-handoff/constants.mjs` — schema version, enums, exit codes, time thresholds, event types.
- `scripts/agent-handoff/fs.mjs` — safe reads, path containment, temporary candidate trees, atomic replacement.
- `scripts/agent-handoff/git.mjs` — read-only Git discovery, branch, HEAD, status, ignore, diff, and commit resolution.
- `scripts/agent-handoff/schema.mjs` — dependency-free structural schema checks for JSON objects.
- `scripts/agent-handoff/markdown.mjs` — required-heading and ledger-entry parsing.
- `scripts/agent-handoff/validate.mjs` — validation pipeline and deterministic findings.
- `scripts/agent-handoff/security.mjs` — redacted secret/sensitive-data heuristics.
- `scripts/agent-handoff/locks.mjs` — lock acquisition, heartbeat, inspection, release, and recovery eligibility.
- `scripts/agent-handoff/ledger.mjs` — registry/task/event reads and candidate mutations.
- `scripts/agent-handoff/transitions.mjs` — lifecycle transition rules and acceptance requirements.
- `scripts/agent-handoff/commands/*.mjs` — one focused command module per command family.

### Schemas and templates to create

- `.agents/schemas/registry.schema.json`
- `.agents/schemas/state.schema.json`
- `.agents/schemas/artifacts.schema.json`
- `.agents/schemas/event.schema.json`
- `.agents/schemas/lock.schema.json`
- `.agents/templates/PROJECT.md`
- `.agents/templates/brief.md`
- `.agents/templates/progress.md`
- `.agents/templates/decisions.md`
- `.agents/templates/verification.md`
- `.agents/templates/handoff.md`
- `.agents/README.md`

### Test files to create

- `scripts/agent-handoff/__tests__/helpers.ts`
- `scripts/agent-handoff/__tests__/schema.test.ts`
- `scripts/agent-handoff/__tests__/markdown.test.ts`
- `scripts/agent-handoff/__tests__/git.test.ts`
- `scripts/agent-handoff/__tests__/security.test.ts`
- `scripts/agent-handoff/__tests__/validate.test.ts`
- `scripts/agent-handoff/__tests__/locks.test.ts`
- `scripts/agent-handoff/__tests__/transitions.test.ts`
- `scripts/agent-handoff/__tests__/lifecycle-commands.test.ts`
- `scripts/agent-handoff/__tests__/record-commands.test.ts`
- `scripts/agent-handoff/__tests__/handoff-commands.test.ts`
- `scripts/agent-handoff/__tests__/completion-archive.test.ts`
- `scripts/agent-handoff/__tests__/atomicity.test.ts`
- `scripts/agent-handoff/__tests__/cli-contract.test.ts`
- `scripts/agent-handoff/__tests__/instruction-blocks.test.ts`
- `scripts/agent-handoff/__tests__/fixtures/` — isolated valid and invalid repository fixtures.

### Existing files to modify

- `.gitignore` — ignore `.agents/locks/*` while retaining a placeholder if needed.
- `package.json` — add `agent-handoff:test` and `agent-handoff:validate` scripts only.
- `AGENTS.md` — add the exact managed Codex block after the manual pilot proves it.
- `CLAUDE.md` — add the exact managed Claude block after the manual pilot proves it.
- `docs/agent-handoff-contract.md` — record implementation version and pilot findings only after acceptance.

---

### Task 1: Freeze schemas, constants, and valid fixture

**Files:**
- Create: `.agents/schemas/registry.schema.json`
- Create: `.agents/schemas/state.schema.json`
- Create: `.agents/schemas/artifacts.schema.json`
- Create: `.agents/schemas/event.schema.json`
- Create: `.agents/schemas/lock.schema.json`
- Create: `scripts/agent-handoff/constants.mjs`
- Create: `scripts/agent-handoff/schema.mjs`
- Create: `scripts/agent-handoff/__tests__/schema.test.ts`
- Create: `scripts/agent-handoff/__tests__/fixtures/valid-ledger/`

**Interfaces:**
- Produces: `EXIT_CODES`, `TASK_STATUSES`, `EVENT_TYPES`, `LOCK_EXPIRY_SECONDS`, `ARCHIVE_AFTER_DAYS`.
- Produces: `validateObject(schemaName: string, value: unknown): Finding[]`.
- Produces: one complete valid-ledger fixture reused by later tests.

- [ ] **Step 1: Write failing schema tests**

Add tests asserting:

- the valid registry/state/artifact/event/lock fixture returns no findings;
- missing required fields return `SCHEMA_REQUIRED_FIELD`;
- unsupported `schema_version` returns `SCHEMA_VERSION_UNSUPPORTED`;
- invalid task IDs, enums, SHA-256, RFC 3339 UTC timestamps, and lock expiry return stable finding codes;
- unknown fields warn normally and error under strict validation.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/schema.test.ts`  
Expected: FAIL because modules and schemas do not exist.

- [ ] **Step 3: Create exact schema documents and constants**

Encode contract fields and values without adding optional behavior. Set `LOCK_EXPIRY_SECONDS = 3600` and `ARCHIVE_AFTER_DAYS = 90`.

- [ ] **Step 4: Implement `validateObject`**

Use small field/type/enum/format validators rather than introducing a JSON Schema runtime dependency. Schema JSON files remain the portable public description; tests ensure runtime checks match them.

- [ ] **Step 5: Run tests**

Run: `npx vitest run scripts/agent-handoff/__tests__/schema.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .agents/schemas scripts/agent-handoff/constants.mjs scripts/agent-handoff/schema.mjs scripts/agent-handoff/__tests__/schema.test.ts scripts/agent-handoff/__tests__/fixtures/valid-ledger
git commit -m "test(handoff): define ledger schemas"
```

### Task 2: Markdown templates and parser

**Files:**
- Create: `.agents/templates/PROJECT.md`
- Create: `.agents/templates/brief.md`
- Create: `.agents/templates/progress.md`
- Create: `.agents/templates/decisions.md`
- Create: `.agents/templates/verification.md`
- Create: `.agents/templates/handoff.md`
- Create: `scripts/agent-handoff/markdown.mjs`
- Create: `scripts/agent-handoff/__tests__/markdown.test.ts`

**Interfaces:**
- Produces: `validateMarkdown(kind: MarkdownKind, text: string, options?: { strict?: boolean }): Finding[]`.
- Produces: `extractAcceptanceCriteria(text: string): AcceptanceCriterion[]`.
- Produces: `extractVerificationEntries(text: string): VerificationEntry[]`.
- Produces: `extractDecisionEntries(text: string): DecisionEntry[]`.

- [ ] **Step 1: Write failing parser tests**

Pin required headings, unique/monotonic `AC-*`, `VER-*`, and `DEC-*` identifiers, accepted-decision source requirements, handoff statuses, exact-next-action cardinality, and warnings for unsupported “done/passed/deployed/applied” claims.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/markdown.test.ts`  
Expected: FAIL because parser/templates do not exist.

- [ ] **Step 3: Create canonical templates**

Copy required headings and entry metadata from the contract. Templates contain placeholders, not FranchiseTech customer/task data.

- [ ] **Step 4: Implement Markdown parsing and validation**

Parse headings and structured bullet metadata deterministically. Do not implement a general Markdown parser.

- [ ] **Step 5: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/markdown.test.ts`  
Expected: PASS.

```bash
git add .agents/templates scripts/agent-handoff/markdown.mjs scripts/agent-handoff/__tests__/markdown.test.ts
git commit -m "feat(handoff): add ledger markdown contracts"
```

### Task 3: Read-only filesystem and Git reconciliation

**Files:**
- Create: `scripts/agent-handoff/fs.mjs`
- Create: `scripts/agent-handoff/git.mjs`
- Create: `scripts/agent-handoff/__tests__/helpers.ts`
- Create: `scripts/agent-handoff/__tests__/git.test.ts`

**Interfaces:**
- Produces: `discoverRepository(startPath: string): Promise<RepositorySnapshot>`.
- Produces: `readGitSnapshot(root: string): Promise<GitSnapshot>`.
- Produces: `resolveCommit(root: string, revision: string): Promise<boolean>`.
- Produces: `isIgnored(root: string, path: string): Promise<boolean>`.
- Produces: `assertContainedPath(root: string, candidate: string): string`.
- Produces test helpers `createFixtureRepo`, `runGit`, and `writeFixture` using temporary directories.

- [ ] **Step 1: Write failing Git tests**

Cover normal branch, detached HEAD, dirty tracked/untracked files, ignored locks, unresolved commit, path traversal, symlink escape, repository-root mismatch, and unrelated user dirty files preserved.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/git.test.ts`  
Expected: FAIL because helpers/modules do not exist.

- [ ] **Step 3: Implement read-only Git wrapper**

Use `spawn`/`execFile`, never shell interpolation. Accept explicit argument arrays. Normalize porcelain paths without modifying the repository.

- [ ] **Step 4: Implement containment-safe file reads**

Reject paths and resolved symlinks outside the Git root.

- [ ] **Step 5: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/git.test.ts`  
Expected: PASS.

```bash
git add scripts/agent-handoff/fs.mjs scripts/agent-handoff/git.mjs scripts/agent-handoff/__tests__/helpers.ts scripts/agent-handoff/__tests__/git.test.ts
git commit -m "feat(handoff): reconcile ledger with git"
```

### Task 4: Core validator pipeline and deterministic output

**Files:**
- Create: `scripts/agent-handoff/validate.mjs`
- Create: `scripts/agent-handoff/__tests__/validate.test.ts`
- Extend: `scripts/agent-handoff/__tests__/fixtures/`

**Interfaces:**
- Consumes: schema, Markdown, filesystem, and Git interfaces from Tasks 1–3.
- Produces: `validateLedger(input: ValidateInput): Promise<ValidationReport>`.
- Produces: `formatValidationText(report: ValidationReport): string`.

- [ ] **Step 1: Write failing validator tests**

Cover all ten contract phases, deterministic finding order, normal versus strict promotion, malformed core JSON with partial findings, registry/task mismatch, revision/event mismatch, unlisted task dirty file, unrelated dirty file warning, and valid-ledger success.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/validate.test.ts`  
Expected: FAIL because the pipeline does not exist.

- [ ] **Step 3: Implement the phased validator**

Each phase returns findings without mutating state. Catch phase-local errors and continue when dependent data remains safe to inspect.

- [ ] **Step 4: Implement stable report rendering**

Match contract JSON keys and sort by severity, task ID, path, line, and code.

- [ ] **Step 5: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/validate.test.ts`  
Expected: PASS.

```bash
git add scripts/agent-handoff/validate.mjs scripts/agent-handoff/__tests__/validate.test.ts scripts/agent-handoff/__tests__/fixtures
git commit -m "feat(handoff): validate complete task ledgers"
```

### Task 5: Sensitive-data scanner and authority checks

**Files:**
- Create: `scripts/agent-handoff/security.mjs`
- Create: `scripts/agent-handoff/__tests__/security.test.ts`
- Modify: `scripts/agent-handoff/validate.mjs`

**Interfaces:**
- Produces: `scanSensitiveContent(path: string, content: string): Finding[]`.
- Produces: `validateAuthority(task: TaskContext): Finding[]`.

- [ ] **Step 1: Write failing security tests**

Cover private keys, common API-token forms, JWTs, database URLs, `.env` assignments, customer email/phone rows, redaction, benign UUIDs/test fixtures, and raw transcript markers. Assert findings never contain the matched value.

Add authority tests proving:

- a handoff cannot satisfy deployment approval;
- an accepted production/customer-data/billing/deletion decision requires `maker: human` and a source;
- “approved” without scope is rejected;
- a human decision reference allows only its recorded scope.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/security.test.ts`  
Expected: FAIL because scanner/authority checks do not exist.

- [ ] **Step 3: Implement conservative redacted scanning**

Report path, line, code, and one-way fingerprint only. Avoid high-noise generic-number matching.

- [ ] **Step 4: Integrate safety phase into validator**

Strict mode blocks all high-confidence secret or customer-data findings.

- [ ] **Step 5: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/security.test.ts scripts/agent-handoff/__tests__/validate.test.ts`  
Expected: PASS.

```bash
git add scripts/agent-handoff/security.mjs scripts/agent-handoff/validate.mjs scripts/agent-handoff/__tests__/security.test.ts scripts/agent-handoff/__tests__/validate.test.ts
git commit -m "feat(handoff): block sensitive and unauthorized state"
```

### Task 6: Candidate-ledger atomic write engine

**Files:**
- Modify: `scripts/agent-handoff/fs.mjs`
- Create: `scripts/agent-handoff/ledger.mjs`
- Create: `scripts/agent-handoff/__tests__/atomicity.test.ts`

**Interfaces:**
- Produces: `readLedger(root: string, taskId?: string): Promise<Ledger>`.
- Produces: `mutateLedger(root: string, mutation: LedgerMutation, options: MutationOptions): Promise<MutationResult>`.
- Produces: `appendEvent(candidateRoot: string, event: LedgerEvent): Promise<void>`.
- `MutationOptions` includes `{ dryRun: boolean; expectedRevision?: number }`.

- [ ] **Step 1: Write failing atomicity tests**

Inject failures before candidate validation, during validation, before rename, and during final event append. Assert the original ledger stays byte-identical, product files remain untouched, and temporary candidates are reported.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/atomicity.test.ts`  
Expected: FAIL because mutation engine does not exist.

- [ ] **Step 3: Implement candidate-tree mutation and mutex**

Use an exclusive local mutation directory, copy only ledger files into the candidate, apply pure mutation, validate the candidate, and atomically replace individual files. Detect stale expected revisions.

- [ ] **Step 4: Implement dry-run**

Return proposed file changes and validation without replacing files or appending events.

- [ ] **Step 5: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/atomicity.test.ts`  
Expected: PASS.

```bash
git add scripts/agent-handoff/fs.mjs scripts/agent-handoff/ledger.mjs scripts/agent-handoff/__tests__/atomicity.test.ts
git commit -m "feat(handoff): add atomic ledger mutations"
```

### Task 7: Locks, heartbeats, and recovery eligibility

**Files:**
- Create: `scripts/agent-handoff/locks.mjs`
- Create: `scripts/agent-handoff/__tests__/locks.test.ts`
- Modify: `scripts/agent-handoff/validate.mjs`

**Interfaces:**
- Produces: `inspectLock(root: string, taskId: string, now: Date): Promise<LockInspection>`.
- Produces: `acquireLock(input: AcquireLockInput): Promise<LockRecord>`.
- Produces: `heartbeatLock(input: HeartbeatInput): Promise<LockRecord>`.
- Produces: `releaseLock(input: ReleaseInput): Promise<void>`.
- Produces: `assessRecovery(input: RecoveryInput): Promise<RecoveryAssessment>`.

- [ ] **Step 1: Write failing lock tests**

Cover atomic double-claim race, actor/session mismatch, heartbeat refresh, 59-minute valid lock, 61-minute `stale_candidate`, stale lock with live PID rejected, inactive PID eligible, unverifiable session requiring force plus human decision, multiple locks, and tracked-lock error.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/locks.test.ts`  
Expected: FAIL because lock module does not exist.

- [ ] **Step 3: Implement exclusive lock lifecycle**

Create lock via exclusive file open. Do not steal or overwrite. Process checks are platform-bounded and never terminate processes.

- [ ] **Step 4: Integrate lock findings into validator**

Active task without matching lock is an error; non-active task with lock is an error.

- [ ] **Step 5: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/locks.test.ts scripts/agent-handoff/__tests__/validate.test.ts`  
Expected: PASS.

```bash
git add scripts/agent-handoff/locks.mjs scripts/agent-handoff/validate.mjs scripts/agent-handoff/__tests__/locks.test.ts scripts/agent-handoff/__tests__/validate.test.ts
git commit -m "feat(handoff): enforce exclusive task ownership"
```

### Task 8: Lifecycle transition engine and acceptance evidence

**Files:**
- Create: `scripts/agent-handoff/transitions.mjs`
- Create: `scripts/agent-handoff/__tests__/transitions.test.ts`

**Interfaces:**
- Produces: `canTransition(from: TaskStatus, to: TaskStatus, context: TransitionContext): TransitionDecision`.
- Produces: `evaluateAcceptance(task: TaskContext): AcceptanceReport`.
- Produces: `computeVerificationFreshness(entry: VerificationEntry, git: GitSnapshot): Freshness`.

- [ ] **Step 1: Write failing transition tests**

Pin every allowed table transition and reject all others. Cover blocked-without-resolution, active-to-complete prohibition, stale path/repository/migration evidence, reported-only evidence, judgment criteria without human acceptance, and fully verified review-to-complete.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/transitions.test.ts`  
Expected: FAIL because transition engine does not exist.

- [ ] **Step 3: Implement pure transition and freshness functions**

Keep these functions free of filesystem writes so commands and validator share identical rules.

- [ ] **Step 4: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/transitions.test.ts`  
Expected: PASS.

```bash
git add scripts/agent-handoff/transitions.mjs scripts/agent-handoff/__tests__/transitions.test.ts
git commit -m "feat(handoff): enforce task lifecycle evidence"
```

### Task 9: Initialization and task lifecycle commands

**Files:**
- Create: `scripts/agent-handoff/commands/project.mjs`
- Create: `scripts/agent-handoff/commands/task.mjs`
- Create: `scripts/agent-handoff/__tests__/lifecycle-commands.test.ts`
- Create: `.agents/README.md`
- Modify: `.gitignore`

**Interfaces:**
- Produces handlers `initCommand`, `newCommand`, `readyCommand`, `claimCommand`, `heartbeatCommand`, `releaseCommand`.
- All handlers accept `CommandContext` and return `CommandResult`; they do not print directly.

- [ ] **Step 1: Write failing lifecycle command tests**

Cover clean init, existing-ledger refusal, adopt validation, no instruction-file mutation, task creation, duplicate task refusal, ready requirements, claim atomics, heartbeat, release reason/checkpoint, dry-run no writes, and preservation of unrelated dirty/untracked user files.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/lifecycle-commands.test.ts`  
Expected: FAIL because handlers do not exist.

- [ ] **Step 3: Implement project initialization**

Create only ledger skeleton, schemas/templates, README, and lock ignore entry. Refuse duplicate managed entries.

- [ ] **Step 4: Implement task lifecycle handlers**

Use the shared mutation and transition engines. Emit exact contract events.

- [ ] **Step 5: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/lifecycle-commands.test.ts`  
Expected: PASS.

```bash
git add scripts/agent-handoff/commands/project.mjs scripts/agent-handoff/commands/task.mjs scripts/agent-handoff/__tests__/lifecycle-commands.test.ts .agents/README.md .gitignore
git commit -m "feat(handoff): add project and task lifecycle commands"
```

### Task 10: Checkpoint, verification, and decision commands

**Files:**
- Create: `scripts/agent-handoff/commands/records.mjs`
- Create: `scripts/agent-handoff/__tests__/record-commands.test.ts`

**Interfaces:**
- Produces handlers `checkpointCommand`, `verifyRecordCommand`, `decideCommand`.

- [ ] **Step 1: Write failing record-command tests**

Cover lock requirement, Git mismatch refusal, exact dirty-path snapshot, no fabricated verification, artifact hashing, sensitive result-file rejection, scoped human decision acceptance, non-human consequential decision rejection, revision increment, and dry-run.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/record-commands.test.ts`  
Expected: FAIL because handlers do not exist.

- [ ] **Step 3: Implement record handlers**

Record supplied evidence only. `verify-record` never executes `--command`; assert this through a test command that would create a sentinel file if mistakenly run.

- [ ] **Step 4: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/record-commands.test.ts`  
Expected: PASS and sentinel absent.

```bash
git add scripts/agent-handoff/commands/records.mjs scripts/agent-handoff/__tests__/record-commands.test.ts
git commit -m "feat(handoff): record checkpoints and evidence"
```

### Task 11: Handoff, acceptance, and recovery commands

**Files:**
- Create: `scripts/agent-handoff/commands/handoff.mjs`
- Create: `scripts/agent-handoff/__tests__/handoff-commands.test.ts`

**Interfaces:**
- Produces handlers `handoffCommand`, `acceptCommand`, `recoverCommand`.

- [ ] **Step 1: Write failing handoff tests**

Cover sender ownership, strict validation, one next action, unrecorded dirty-file refusal, recorded running command, receiver prompt exact content, lock removal last, accept repository validation, receiver lock creation, unmatched acceptance rejection, 60-minute recovery rules, live-owner rejection, force recovery with human approval, and injected crash before lock release preserving sender ownership.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/handoff-commands.test.ts`  
Expected: FAIL because handlers do not exist.

- [ ] **Step 3: Implement handoff and accept handlers**

Generate handoff from validated ledger/Git facts, not free-form model claims. Release sender lock only after all durable writes validate.

- [ ] **Step 4: Implement recovery handler**

Recovery records evidence and prior owner; it never kills processes, deletes files, or silently overwrites a lock.

- [ ] **Step 5: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/handoff-commands.test.ts scripts/agent-handoff/__tests__/atomicity.test.ts`  
Expected: PASS.

```bash
git add scripts/agent-handoff/commands/handoff.mjs scripts/agent-handoff/__tests__/handoff-commands.test.ts
git commit -m "feat(handoff): transfer and recover task ownership"
```

### Task 12: Completion and archival

**Files:**
- Create: `scripts/agent-handoff/commands/completion.mjs`
- Create: `scripts/agent-handoff/__tests__/completion-archive.test.ts`

**Interfaces:**
- Produces handlers `completeCommand`, `archiveCommand`.

- [ ] **Step 1: Write failing completion tests**

Cover incomplete criteria, stale evidence, remaining blockers, dirty task files, missing human judgment, active lock, valid completion, 89-day archive rejection, 90-day archive success, registry path update, and history preservation.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/completion-archive.test.ts`  
Expected: FAIL because handlers do not exist.

- [ ] **Step 3: Implement completion and archive handlers**

Archive moves the directory and updates registry/events; it never deletes audit history.

- [ ] **Step 4: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/completion-archive.test.ts`  
Expected: PASS.

```bash
git add scripts/agent-handoff/commands/completion.mjs scripts/agent-handoff/__tests__/completion-archive.test.ts
git commit -m "feat(handoff): complete and archive verified tasks"
```

### Task 13: CLI wrapper, routing, exit codes, and package scripts

**Files:**
- Create: `scripts/agent-handoff.sh`
- Create: `scripts/agent-handoff/cli.mjs`
- Create: `scripts/agent-handoff/__tests__/cli-contract.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces the public CLI contract from `docs/agent-handoff-contract.md`.
- Produces package scripts `agent-handoff:test` and `agent-handoff:validate`.

- [ ] **Step 1: Write failing CLI contract tests**

Spawn the wrapper and assert every command/help option, unknown option code `2`, missing Git/ledger code `3`, all documented exit-code mappings, `--json` stability, `--quiet`, `--dry-run`, actor requirement for mutations, and no shell injection from task/title/path arguments.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/cli-contract.test.ts`  
Expected: FAIL because wrapper/router do not exist.

- [ ] **Step 3: Implement Bash wrapper**

Resolve its own directory portably, require Node, and `exec node .../cli.mjs "$@"`. No business logic in Bash.

- [ ] **Step 4: Implement CLI parsing, dispatch, and rendering**

Parse arguments without runtime dependencies. Commands return structured results; renderer owns stdout/stderr and exit codes.

- [ ] **Step 5: Add package scripts**

Use focused Vitest glob and read-only validation command. Do not add install hooks.

- [ ] **Step 6: Run tests and commit**

Run: `npm run agent-handoff:test`  
Expected: all handoff tests PASS.

```bash
git add scripts/agent-handoff.sh scripts/agent-handoff/cli.mjs scripts/agent-handoff/__tests__/cli-contract.test.ts package.json
git commit -m "feat(handoff): expose safe project continuity CLI"
```

### Task 14: Manual pilot before instruction installation

**Files:**
- Create during pilot: `.agents/tasks/<pilot-task-id>/...`
- Modify after pilot: `docs/agent-handoff-contract.md`
- Test evidence: task `verification.md` and `events.jsonl`

**Interfaces:**
- Consumes the complete CLI.
- Produces a pilot findings section and go/no-go decision for instruction installation.

- [ ] **Step 1: Choose a low-risk documentation-only task**

It must not involve production, database, billing, deployment, external messaging, customer data, or existing dirty files.

- [ ] **Step 2: Initialize and create the pilot task**

Run CLI in `--dry-run` first, then real mode. Validate strict success.

- [ ] **Step 3: Perform Codex → Claude handoff**

Codex makes one bounded documentation change, checkpoints, and hands off. Record orientation time and whether Claude needed the full transcript.

- [ ] **Step 4: Perform Claude → Codex handoff**

Claude verifies the change and hands back. Record repeated discovery, mismatch findings, and authority interpretation.

- [ ] **Step 5: Evaluate pilot criteria**

Require under-five-minute receiver orientation, exact branch/HEAD/dirty state, no repeated completed work, no broadened authority, and no unexplained ledger inconsistency.

- [ ] **Step 6: Record findings and commit**

If any safety criterion fails, stop rollout and return to the responsible task. Do not install instruction blocks.

```bash
git add .agents docs/agent-handoff-contract.md
git commit -m "test(handoff): complete cross-agent pilot"
```

### Task 15: Install managed instruction blocks

**Files:**
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Create: `scripts/agent-handoff/__tests__/instruction-blocks.test.ts`

**Interfaces:**
- Produces exactly one managed block in each instruction file.

- [ ] **Step 1: Write failing instruction tests**

Assert both markers appear exactly once, blocks are semantically equivalent on required behaviors, existing project instructions remain byte-preserved outside markers, rerun is idempotent, and modified managed blocks require a displayed diff rather than silent replacement.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npx vitest run scripts/agent-handoff/__tests__/instruction-blocks.test.ts`  
Expected: FAIL because blocks are absent.

- [ ] **Step 3: Add exact approved blocks from the contract**

Do not reorganize or rewrite unrelated instructions.

- [ ] **Step 4: Run tests and commit**

Run: `npx vitest run scripts/agent-handoff/__tests__/instruction-blocks.test.ts`  
Expected: PASS.

```bash
git add AGENTS.md CLAUDE.md scripts/agent-handoff/__tests__/instruction-blocks.test.ts
git commit -m "docs(handoff): require shared task continuity"
```

### Task 16: Full verification and release-readiness review

**Files:**
- Modify only if results require correction: handoff runtime/tests/docs.
- Record: `.agents/tasks/<implementation-task>/verification.md`

**Interfaces:**
- Produces final evidence for the implementation task; does not deploy or install globally.

- [ ] **Step 1: Run focused test suite**

Run: `npm run agent-handoff:test`  
Expected: all handoff tests PASS with no skipped safety tests.

- [ ] **Step 2: Run the project test suite**

Run: `npm test`  
Expected: PASS.

- [ ] **Step 3: Run typecheck and lint**

Run: `npm run typecheck && npm run lint`  
Expected: exit 0; no new lint errors.

- [ ] **Step 4: Run production build**

Run: `npm run build`  
Expected: PASS with the normal project environment available.

- [ ] **Step 5: Run deployment guard**

Run: `bash scripts/predeploy-guard.sh`  
Expected: PASS. This verifies repository safety only and does not authorize deployment.

- [ ] **Step 6: Run strict ledger validation**

Run: `bash scripts/agent-handoff.sh validate --strict`  
Expected: exit 0, zero errors, no secret/customer-data findings, no tracked locks.

- [ ] **Step 7: Run adversarial test matrix**

Use temporary fixture repositories to exercise simultaneous claim, killed mutation, stale-live lock, symlink escape, path traversal, shell-metacharacter inputs, malicious handoff authority text, dirty unrelated file, unsupported schema version, and artifact hash mismatch.

Expected: every case fails with its documented nonzero exit code and leaves the original repository unchanged.

- [ ] **Step 8: Review repository diff**

Confirm no runtime dependency, hook, service, MCP configuration, deployment change, secret, customer data, transcript, or product behavior entered the branch.

- [ ] **Step 9: Record evidence and commit**

```bash
git add .agents docs scripts/agent-handoff.sh scripts/agent-handoff package.json AGENTS.md CLAUDE.md .gitignore
git commit -m "test(handoff): verify cross-agent continuity system"
```

---

## Test strategy

### Test pyramid

| Layer | Purpose | Approximate share | Runtime target |
|---|---|---:|---:|
| Pure unit tests | Schemas, parsing, transitions, freshness, security, formatting | 60% | <5 seconds |
| Filesystem/Git integration | Real temporary repos, locks, atomic writes, dirty state | 30% | <20 seconds |
| CLI workflow tests | Spawn wrapper through full lifecycle and handoffs | 8% | <20 seconds |
| Manual cross-agent pilot | Human-observed Codex↔Claude continuity | 2% | <20 minutes |

### Coverage targets

- 100% of documented lifecycle transitions tested as allowed or rejected.
- 100% of public commands tested for success, dry-run, usage failure, ownership conflict, and repository mismatch where applicable.
- 100% of documented exit codes produced by at least one test.
- 100% of mutating commands covered by an injected-failure atomicity test.
- 100% of consequential authority categories tested against handoff-only and human-decision evidence.
- Every validator finding code used in implementation asserted by at least one fixture.
- No line-percentage target; behavioral contract coverage is the release gate.

### Fixture matrix

Maintain minimal fixtures for:

- valid active, ready, waiting, blocked, review, complete, and archived tasks;
- malformed JSON, duplicate JSON key, unsupported schema, missing Markdown heading;
- branch/HEAD mismatch, detached HEAD, missing commit, unrelated dirty files;
- current, stale, environment-specific, reported-only, and unknown verification;
- active/fresh lock, stale candidate, live stale owner, unverifiable owner, dual lock;
- clean handoff, unmatched acceptance, crash-interrupted handoff, malicious authority text;
- secret, customer row, benign UUID, fake/test token, and redaction cases;
- artifact present/hash-valid, missing, changed, outside root, symlink escape;
- 89-day and 90-day completed tasks.

### Mutation/property tests

Without adding a property-testing dependency, use deterministic table-driven mutation tests:

- delete each required field from every valid schema object;
- replace each enum with an invalid value;
- change every timestamp to local time, missing `Z`, invalid date, and decreasing order;
- change every referenced ID/path/revision to a missing or conflicting value;
- inject failure at every atomic mutation boundary;
- repeat each idempotent command twice and compare ledger bytes/events.

### Concurrency tests

- Spawn two `claim` processes against the same ready task; exactly one succeeds.
- Race heartbeat with handoff; one consistent final state is allowed, never lost ownership.
- Race accept with another accept; exactly one obtains the lock.
- Crash the writer after candidate validation but before replacement; old state remains valid.
- Crash after state replacement but before event append; mutation engine must either complete recovery deterministically or reject the ledger with an actionable error.

### Security tests

- Shell metacharacters in IDs/titles/paths never execute commands.
- Paths containing `..`, absolute external paths, and escaping symlinks fail.
- Secret values never appear in stdout, stderr, JSON, debug logs, or snapshots.
- Ledger content cannot cause the CLI to execute a recorded command.
- Handoff text claiming approval cannot satisfy authority validation.
- Fixture repositories confirm product files, Git index, branches, and remotes remain unchanged.

### Compatibility tests

- macOS Bash 3.2 wrapper execution.
- Current Linux Bash execution in CI if available.
- Supported Node LTS version from the repository.
- Paths containing spaces and non-ASCII characters.
- Repositories with worktrees and detached read-only inspection.

### Regression gate

A change to schemas, event types, commands, exit codes, state transitions, authority rules, or managed instruction blocks requires:

1. schema-version compatibility decision;
2. fixture updates for old and new versions;
3. CLI JSON snapshot review;
4. manual confirmation that existing ledgers remain readable or receive an explicit migration plan.

### Explicitly excluded tests

- Model quality or private reasoning.
- Automatic detection of vendor usage limits.
- Automatic launch/resume of Codex or Claude.
- Network, MCP, cloud database, or telemetry behavior.
- Production deployments or database mutations.
- Complete prevention of all possible secret formats; scanner complements, not replaces, repository secret scanning.

## Phase gates

### Gate A — Contracts executable

Tasks 1–5 complete. Valid/invalid ledgers receive stable deterministic findings. No mutation commands exist yet.

### Gate B — Safe local state engine

Tasks 6–8 complete. Atomicity, locking, transitions, and evidence freshness pass adversarial integration tests.

### Gate C — Complete CLI

Tasks 9–13 complete. All public commands and exit codes match the contract; no instruction files changed yet.

### Gate D — Human workflow proven

Task 14 manual pilot passes every success criterion. Failure returns work to the owning prior task.

### Gate E — Project adoption

Task 15 installs managed instructions only after Gate D approval.

### Gate F — Release ready

Task 16 passes focused, full-project, build, guard, strict-ledger, adversarial, and diff-review checks. “Release ready” means ready for review/merge only; it does not authorize deployment.

## Rollback strategy

- Before Gate E, rollback is removal of unadopted ledger/runtime files from the feature branch through normal reviewed Git changes; never delete user task data automatically.
- After Gate E, disable behavior by removing only the bounded managed instruction blocks through a reviewed commit.
- Existing `.agents/tasks/` history remains readable even if the CLI is removed.
- Schema changes require forward-readable compatibility or an explicit migration; never silently rewrite historical events.
- No rollback step uses `git reset --hard`, removes unrelated dirty files, or alters production.

## Self-review result

- **Spec coverage:** validator, instructions, all CLI commands, lifecycle, locks, recovery, authority, sensitive data, pilot, and acceptance are assigned to tasks.
- **Step granularity:** every implementation task begins with failing tests and ends with a focused passing command and commit.
- **Type consistency:** shared interfaces are introduced before consuming commands; command handlers consistently use `CommandContext → CommandResult`.
- **Review focus:** all five high-risk conditions have named tests in their owning tasks.
- **Proportion:** repeated schema details remain in the specification; this plan contains file boundaries, signatures, tests, commands, and gates needed by an unfamiliar implementer.
