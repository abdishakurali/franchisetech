# ADR-0003: Git-backed Codex–Claude project handoff protocol

**Status:** Accepted  
**Date:** 2026-10-23  
**Decider:** FranchiseTech owner  
**Scope:** Local Codex and Claude Code sessions working in the same Git project

## Context

FranchiseTech work frequently spans longer than one model's usage or context window. Codex and Claude Code retain their own session histories, but neither can dependably inherit the other product's private conversation state. Existing handoffs require manually recovering prompts, sub-agent reports, commits, uncommitted files, approvals, test results, and unfinished work.

The system must allow either agent to continue safely when the other reaches a limit, crashes, is closed, or is intentionally replaced. It must work per project, preserve the user's exact objective and decisions, distinguish plans from verified facts, avoid two agents editing concurrently, and never turn a handoff into permission for deployment or another high-impact action.

Git and project files are visible to both agents and remain available across sessions. They are therefore the interoperability layer. Native session IDs are useful pointers for recovery, but not the source of truth.

## Decision

Adopt a vendor-neutral, Git-backed handoff ledger under `.agents/`. Every substantial task receives a stable task ID and a task directory. Both `AGENTS.md` and `CLAUDE.md` will instruct their agent to read the ledger before work, acquire task ownership, checkpoint material changes, and release ownership with a receiver-ready handoff.

The protocol separates four kinds of state:

1. **Stable project context** — architecture, constraints, commands, environments, and safety rules.
2. **Task intent** — the original prompt, clarified scope, acceptance criteria, exclusions, and required approvals.
3. **Observed execution state** — branch, commit, dirty files, completed work, evidence, blockers, and next action.
4. **Audit history** — append-only events describing ownership, decisions, verification, and handoffs.

Chat transcripts remain optional recovery inputs. An agent must reconcile transcript claims with Git, files, tests, and connected-system reads before treating them as facts.

## Goals

- Resume a task with either Codex or Claude in less than five minutes.
- Preserve the original request and every material user correction or approval.
- Make the exact next safe action obvious.
- Prevent concurrent writers from silently corrupting work.
- Keep evidence separate from unverified claims.
- Preserve existing Git and deployment safety rules.
- Support multiple projects and multiple tasks per project.
- Allow manual operation first and later automation without changing the data model.

## Non-goals

- Synchronizing private chain-of-thought or hidden model state.
- Recreating the complete chat UI in the repository.
- Automatically bypassing model usage limits.
- Automatically deploying, applying migrations, sending messages, or changing production.
- Replacing Git, code review, tests, monitoring, or human approval.
- Allowing Codex and Claude to edit the same task concurrently.

## Directory layout

```text
.agents/
├── README.md
├── PROJECT.md
├── registry.json
├── events.jsonl
├── locks/
│   └── <task-id>.json
├── archive/
│   └── <completed-task-id>/
└── tasks/
    └── <task-id>/
        ├── brief.md
        ├── state.json
        ├── progress.md
        ├── decisions.md
        ├── verification.md
        ├── handoff.md
        └── artifacts.json
```

All ledger files except locks are committed on the applicable task branch. This includes `state.json`, `registry.json`, and `events.jsonl`; their cross-session durability is more valuable than avoiding small, reviewable updates. Lock files are ephemeral, local-only, and ignored by Git. Completed task directories move to `.agents/archive/` after 90 days, while Git retains their full history.

## Authority hierarchy

When sources conflict, agents must use this precedence:

1. Current human instruction in the active session.
2. Repository safety instructions in `AGENTS.md` and `CLAUDE.md`.
3. Accepted entries in `decisions.md`.
4. `brief.md` acceptance criteria and scope.
5. Current Git/filesystem/database evidence.
6. `state.json`, `progress.md`, and `verification.md`.
7. Prior agent summaries and chat transcripts.
8. Plans, assumptions, or model recollection.

A lower-ranked source cannot grant permission that a higher-ranked source did not grant.

## Task identity

Task IDs use:

```text
YYYYMMDD-<short-kebab-slug>
```

Example:

```text
20261023-critical-pos-release
```

The ID is immutable. A changed title does not change the ID. A materially different objective receives a new task ID and may reference the predecessor.

## Lifecycle

Allowed task statuses:

```text
draft → ready → active → waiting | blocked | review → complete | abandoned
```

Definitions:

- `draft`: intent is being captured; implementation must not start.
- `ready`: scope and acceptance criteria are sufficient.
- `active`: exactly one agent owns execution.
- `waiting`: external work or a bounded wait is in progress.
- `blocked`: progress requires user input, authority, credentials, or external change.
- `review`: implementation is finished, but evidence or human review is pending.
- `complete`: all required acceptance criteria have verified evidence.
- `abandoned`: explicitly stopped; reason is recorded.

Only the user or an agent acting on explicit instructions may move `review` to `complete` when consequential acceptance criteria depend on human judgment.

## Ownership and locking

Before editing task-related files or code, an agent must acquire `.agents/locks/<task-id>.json` atomically. The lock records the agent, host/session identity, acquisition time, heartbeat time, branch, and intended phase.

Rules:

- One active writer per task.
- Read-only auditing does not require ownership, but must not modify task or product files.
- A valid lock cannot be overwritten automatically.
- A lock is stale only when both conditions hold:
  - its heartbeat exceeds the configured expiry; and
  - Git/process/session inspection provides no evidence that its owner is still working.
- Taking over a stale lock requires a `lock_recovered` audit event explaining the evidence.
- A usage-limit message alone is not proof that the prior process stopped modifying files; verify repository/process state.
- Deployment, production writes, messages, and other consequential actions require their own approval regardless of lock ownership.

The default lock expiry is 60 minutes without heartbeat. Expiry alone never authorizes takeover: the receiver must also verify that no owner process, session, or in-flight command remains active. Long commands must update the heartbeat before and after execution.

## Checkpoint policy

An agent must checkpoint when any of these occurs:

- A commit is created or merged.
- A migration is generated or applied.
- Tests, typecheck, lint, build, or a safety guard completes.
- The user changes scope or makes a decision.
- A blocker or unexpected dirty file appears.
- The next agent would otherwise need to repeat meaningful discovery.
- The agent has approximately 20% context/usage remaining, receives a limit warning, or expects to stop.

Checkpoint order:

1. Inspect `git status`, branch, and HEAD.
2. Update `progress.md` with facts and evidence.
3. Update `verification.md` with exact commands and results.
4. Update `decisions.md` for new user decisions/corrections.
5. Update `state.json`.
6. Append an event to `events.jsonl`.
7. Write `handoff.md` if ownership will change.
8. Release the lock only after files are durable.

## Handoff protocol

### Sender

The sender must:

1. Stop starting new work.
2. Let in-flight commands finish or record their process/session identifiers.
3. Reconcile the repository state.
4. Record completed, partial, unverified, and untouched scope separately.
5. Record dirty files and their ownership.
6. Record approvals already granted and approvals still required.
7. Record the exact next safe action and expected outcome.
8. Write a receiver prompt that names the task ID and requires validation before mutation.
9. Append `handoff_created` and release the lock.

### Receiver

The receiver must:

1. Read `AGENTS.md`, `CLAUDE.md`, `.agents/PROJECT.md`, the task brief, decisions, state, progress, verification, handoff, and relevant Git history.
2. Inspect `git status`, current branch, HEAD, and any running process referenced by the handoff.
3. Compare observed state with `state.json`.
4. Classify discrepancies; never silently rewrite history.
5. Acquire the lock.
6. Append `handoff_accepted`.
7. Continue from `next_action` only after its preconditions are true.

### Failed or unplanned handoff

If no valid handoff exists, the receiver performs recovery:

1. Treat the ledger as potentially stale.
2. Inspect Git, filesystem, active processes, and recent transcript/session metadata.
3. Create a recovery note in `handoff.md`.
4. Mark uncertain claims as unverified.
5. Acquire or recover the lock using the ownership rules.
6. Resume only from an evidence-backed safe point.

## File schemas

### `.agents/PROJECT.md`

Purpose: stable, project-wide context shared by every task.

Required headings:

```markdown
# Project Context

## Product
## Architecture
## Environments
## Source-of-truth systems
## Critical invariants
## Safety constraints
## Standard verification commands
## Deployment and rollback
## Context entry points
```

Rules:

- Keep stable facts here, not task progress.
- Reference authoritative files instead of duplicating them.
- Never store secrets, credentials, private customer data, or raw production exports.
- Every environment must state what it is allowed to do.

### `.agents/registry.json`

Purpose: discover tasks without scanning every directory.

Schema:

```json
{
  "schema_version": 1,
  "project_id": "franchisetech",
  "updated_at": "2026-10-23T12:00:00Z",
  "tasks": [
    {
      "id": "20261023-critical-pos-release",
      "title": "Complete critical POS and invoicing release",
      "status": "active",
      "priority": "critical",
      "path": ".agents/tasks/20261023-critical-pos-release",
      "branch": "codex/pos-idempotency-perf",
      "owner": "codex",
      "updated_at": "2026-10-23T12:00:00Z"
    }
  ]
}
```

Constraints:

- `schema_version`: integer, required.
- `project_id`: stable lowercase identifier.
- `tasks[].id`: unique and equal to the task directory name.
- `status`: lifecycle enum.
- `owner`: `codex`, `claude`, `human`, or `null`.
- Timestamps: RFC 3339 UTC.

### `tasks/<task-id>/brief.md`

Purpose: immutable intent plus explicitly versioned clarifications.

Required headings:

```markdown
# <Task title>

## Original user request
<verbatim request or lossless attachment reference>

## Objective
## In scope
## Out of scope
## Acceptance criteria
## Constraints and invariants
## Required approvals
## Dependencies
## Clarifications
## Source references
```

Rules:

- Preserve the original request verbatim when practical.
- Append clarifications with date, author, and source; do not rewrite history.
- Acceptance criteria must be testable or explicitly marked as human judgment.
- “Deploy,” “send,” “delete,” and production mutation permissions must be explicit.

### `tasks/<task-id>/state.json`

Purpose: machine-readable current state.

Schema:

```json
{
  "schema_version": 1,
  "task_id": "20261023-critical-pos-release",
  "revision": 12,
  "status": "active",
  "phase": "verification",
  "owner": {
    "agent": "codex",
    "session_id": "optional-native-session-id",
    "host": "local",
    "acquired_at": "2026-10-23T11:40:00Z"
  },
  "repository": {
    "root": "/Users/abdishakuurally/projects/franchisetech",
    "branch": "codex/pos-idempotency-perf",
    "head": "9602736",
    "base": "main",
    "dirty": true,
    "dirty_paths": [
      {
        "path": "docs/db-backups.md",
        "state": "untracked",
        "owner": "backup-workstream",
        "disposition": "review-and-commit-separately"
      }
    ]
  },
  "last_checkpoint_at": "2026-10-23T12:00:00Z",
  "next_action": {
    "description": "Review the backup script and runbook",
    "command": "git diff --no-index /dev/null scripts/backup/db-backup-nightly.sh",
    "preconditions": ["Task lock is held", "No backup install is attempted"],
    "expected_result": "Safety review findings recorded"
  },
  "blockers": [],
  "approvals": {
    "granted": ["Build backup script and perform one restore rehearsal"],
    "required": ["Deploy application", "Correct historical financial duplicates"]
  },
  "updated_at": "2026-10-23T12:00:00Z"
}
```

Constraints:

- `revision` increments on every state write.
- `head` must be a commit that resolves locally when recorded.
- `dirty_paths` must include all task-relevant dirty files; unrelated dirty files may be summarized but cannot be overwritten.
- `next_action` contains exactly one bounded action.
- Commands are evidence and convenience, never authority to bypass approvals.

### `tasks/<task-id>/progress.md`

Purpose: human-readable implementation history.

Required entry format:

```markdown
## 2026-10-23T12:00:00Z — <agent> — <phase>

### Completed
- <fact with commit/file/tool evidence>

### Partial
- <work begun but not accepted>

### Unverified claims
- <claim and its source>

### Files changed
- `<path>` — <purpose>

### Remaining
- <bounded remaining item>
```

Rules:

- Append entries; correct prior mistakes through a later correction entry.
- Never say “done” without linking acceptance evidence.
- Separate transcript reports from independently observed results.

### `tasks/<task-id>/decisions.md`

Purpose: retain user and architecture decisions that future agents must not rediscover or reverse casually.

Entry schema:

```markdown
## DEC-0001 — <Decision title>

- **Status:** proposed | accepted | rejected | superseded
- **Date:** 2026-10-23T12:00:00Z
- **Decision maker:** user | codex | claude | team
- **Source:** session ID, message reference, issue, or ADR
- **Scope:** <affected task/files/systems>
- **Decision:** <precise decision>
- **Rationale:** <why>
- **Consequences:** <trade-offs>
- **Supersedes:** <decision ID or none>
```

Only the human may be recorded as decision maker for product scope, irreversible actions, production mutations, billing, customer-data correction, and deployment approval unless repository policy explicitly delegates it.

### `tasks/<task-id>/verification.md`

Purpose: evidence ledger for tests and operational checks.

Entry schema:

```markdown
## VER-0001 — Full local gate

- **Run at:** 2026-10-23T12:00:00Z
- **Agent:** claude
- **Repository HEAD:** `9602736`
- **Environment:** local macOS; no production writes
- **Command:** `npx vitest run`
- **Exit code:** 0
- **Result:** 516 tests passed
- **Artifacts:** `.agents/tasks/<id>/artifacts.json#...`
- **Limitations:** UI and FiscalNet were not exercised
- **Freshness:** current | stale-after-code-change | environment-specific
```

Rules:

- Record the exact command, exit code, HEAD, environment, and limitations.
- Any code change affecting the verified surface makes the entry stale.
- A transcript statement without command/output is marked `reported`, not `current`.
- Production checks must state whether they were read-only, rolled back, or persistent.

### `tasks/<task-id>/handoff.md`

Purpose: single receiver-facing transfer packet. This file is replaced on each handoff; prior versions remain reconstructable through Git and events.

Schema:

```markdown
# Handoff: <task-id>

- **From:** claude
- **To:** codex
- **Created:** 2026-10-23T12:00:00Z
- **Reason:** usage limit | context limit | user request | specialization | interruption
- **Status:** ready-for-takeover

## Objective
## Current phase
## Completed with evidence
## Partial work
## Unverified claims
## Repository state
## Running processes or external operations
## Decisions and approvals
## Blockers and risks
## Exact next action
## Expected result
## Do not do
## Receiver validation checklist
## Receiver prompt
```

The receiver prompt must use this pattern:

```text
Continue task <task-id> in <repository>. Read both agent instruction files and
all files in .agents/tasks/<task-id>. Validate branch, HEAD, dirty files, lock,
and verification freshness before editing. Do not repeat completed work. Perform
only the recorded next action, then checkpoint the ledger.
```

### `tasks/<task-id>/artifacts.json`

Purpose: pointers and integrity metadata for evidence too large or unsuitable for Markdown.

Schema:

```json
{
  "schema_version": 1,
  "task_id": "20261023-critical-pos-release",
  "artifacts": [
    {
      "id": "artifact-0001",
      "type": "test-log",
      "path": ".agents/artifacts/20261023-critical-pos-release/vitest.log",
      "sha256": "<hex-digest>",
      "created_at": "2026-10-23T12:00:00Z",
      "created_by": "codex",
      "contains_sensitive_data": false,
      "retention": "until-task-complete"
    }
  ]
}
```

Rules:

- Prefer references to existing repository files or CI URLs.
- Do not commit secrets, raw customer data, database dumps, `.env` files, or private transcripts.
- Hash locally stored evidence so later agents can detect changes.

### `.agents/events.jsonl`

Purpose: append-only machine-readable audit history.

Each line is one JSON object:

```json
{"schema_version":1,"event_id":"01J...","task_id":"20261023-critical-pos-release","timestamp":"2026-10-23T12:00:00Z","actor":"claude","type":"handoff_created","revision":12,"repository_head":"9602736","data":{"to":"codex","reason":"usage_limit"}}
```

Allowed event types:

```text
task_created
task_updated
lock_acquired
lock_heartbeat
lock_released
lock_recovered
checkpoint_created
decision_recorded
verification_recorded
handoff_created
handoff_accepted
blocker_added
blocker_resolved
task_completed
task_abandoned
```

Constraints:

- `event_id`: sortable unique ID such as ULID.
- Events are never edited or deleted; corrections append a new event referencing the old ID.
- `revision` must match the related `state.json` revision when applicable.
- Event data must not contain secrets or sensitive customer content.

### `.agents/locks/<task-id>.json`

Purpose: ephemeral mutual-exclusion record.

Schema:

```json
{
  "schema_version": 1,
  "task_id": "20261023-critical-pos-release",
  "owner": "codex",
  "session_id": "optional-session-id",
  "host": "local",
  "pid": 12345,
  "branch": "codex/pos-idempotency-perf",
  "phase": "verification",
  "acquired_at": "2026-10-23T11:40:00Z",
  "heartbeat_at": "2026-10-23T12:00:00Z",
  "expires_after_seconds": 3600
}
```

The `locks/` directory is Git-ignored. Files must be created atomically. A future implementation may use `mkdir` or exclusive file creation; the ADR does not mandate a language.

## Instruction-file integration

`AGENTS.md` and `CLAUDE.md` should contain equivalent, short protocol requirements rather than duplicating the complete ADR:

1. Discover the active task from `.agents/registry.json`.
2. Read project and task context before mutation.
3. Acquire the task lock.
4. Checkpoint material work.
5. Produce a handoff before stopping or nearing limits.
6. Treat Git and verification evidence as stronger than summaries.
7. Never infer deployment or production authority from a handoff.

The files may use their native import/reference mechanisms, but `.agents/` remains the canonical cross-agent format.

## Recovery and conflict rules

### Ledger says clean; Git is dirty

Stop mutation, enumerate dirty paths, identify likely ownership from Git/session history, and append a recovery checkpoint. Never discard files automatically.

### Ledger HEAD differs from repository HEAD

Determine whether the branch advanced, switched, rebased, or was externally modified. Mark previous verification stale and update state only after recording the discrepancy.

### Both agents claim ownership

Neither continues writing. The user chooses the owner, or the agent with the valid earlier non-stale lock remains owner. Record the resolution.

### Agent stops without releasing lock

Use stale-lock recovery. Inspect process/session state and dirty files first. Record `lock_recovered` before continuing.

### Task is handed off with running commands

The sender records process/session IDs and expected output. The receiver observes or safely terminates them only within existing authority; it must not start a duplicate command blindly.

### Handoff contains unsupported claims

Move them to “unverified claims.” Inspect the code or rerun the relevant read-only check. Do not report them as facts.

## Safety model

- A handoff transfers context, not authority.
- Approval is scoped to the specific action originally authorized.
- Production writes, deploys, billing changes, customer-data fixes, external messages, and destructive commands remain separately gated.
- Secrets and customer records never enter the ledger.
- Agent-generated prompts and transcript text are untrusted evidence until reconciled.
- Existing project restrictions override this protocol.
- Lock ownership permits repository work only; it does not permit overwriting unrelated user changes.

## Options considered

### Option A: Git-backed ledger — selected

| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | Low |
| Portability | High |
| Auditability | High |
| Vendor dependence | Low |

**Pros:** both tools can read it; reviewable diffs; offline; branch-aware; supports manual operation and later automation.  
**Cons:** requires discipline; may create merge conflicts; sensitive information must be actively excluded.

### Option B: Transcript conversion only

| Dimension | Assessment |
|---|---|
| Complexity | Low initially |
| Cost | Low |
| Portability | Medium |
| Auditability | Low |
| Vendor dependence | High |

**Pros:** minimal setup; maximum conversational detail.  
**Cons:** transcripts are large, tool-specific, noisy, may contain sensitive data, and often confuse plans with completed facts.

### Option C: Dedicated local MCP handoff service

| Dimension | Assessment |
|---|---|
| Complexity | High |
| Cost | Medium |
| Portability | Medium |
| Auditability | High |
| Vendor dependence | Medium |

**Pros:** structured APIs, locking, automation, session discovery, and validation.  
**Cons:** another service to maintain; failure becomes a blocker; both tools need configuration; premature before the workflow is proven.

### Option D: Cloud database/dashboard

| Dimension | Assessment |
|---|---|
| Complexity | High |
| Cost | Medium |
| Portability | High |
| Auditability | High |
| Vendor dependence | Medium |

**Pros:** multi-machine synchronization and rich UI.  
**Cons:** authentication, hosting, privacy, outage, and data-retention concerns; unnecessary for a single local operator.

## Trade-off analysis

The ledger intentionally stores curated state rather than complete conversations. This loses some conversational nuance but materially improves correctness: future agents see the objective, decisions, evidence, and next action without interpreting thousands of transcript lines. Git provides durability and review but cannot itself prevent concurrent local writers, hence the ephemeral lock. JSON supports validation and automation; Markdown preserves human readability. Both are necessary.

Automatic failover is deferred. Usage-limit detection differs by product and may occur while tools or child sessions are still running. A controlled handoff with explicit ownership is safer than immediately launching the other agent.

## Consequences

### Positive

- Either agent can resume from the same project state.
- Context loss becomes recoverable and visible.
- Decisions and approvals survive product boundaries.
- Test claims become traceable to commits and environments.
- Later automation can validate the same stable schemas.

### Negative

- Agents must spend time maintaining the ledger.
- Poorly curated files can become stale or verbose.
- Concurrent branches may conflict in shared state files.
- Lock recovery requires judgment after crashes.
- Native session-only context will still be unavailable unless summarized.

### Risks

- Agents may mechanically trust stale state.
- Sensitive data may be copied into committed files.
- A handoff could be mistaken for production approval.
- Two agents may work concurrently if locking is ignored.

Mitigations are schema validation, authority precedence, explicit approval fields, Git reconciliation, secret scanning, and instruction-file enforcement.

## Rollout plan

Acceptance of this design does not itself authorize implementation. When implementation is separately requested, proceed in phases:

1. Approve the ADR and naming/location decisions.
2. Add the directory skeleton and examples without hooks.
3. Add matching `AGENTS.md` and `CLAUDE.md` protocol instructions.
4. Pilot manually on one non-production task.
5. Add schema validation and status commands.
6. Add safe handoff helpers.
7. Consider native hooks or a local MCP service only after the manual workflow proves stable.

## Acceptance criteria for a future implementation

- Codex can hand a task to Claude using only repository state and one receiver prompt.
- Claude can hand the same task back without losing the original request or decisions.
- A receiver detects branch, HEAD, or dirty-tree mismatches before editing.
- Two active writers are prevented or produce a visible conflict.
- Verification entries become stale after relevant code changes.
- A usage-limit interruption can be recovered without reading the full transcript.
- No secrets or customer data appear in committed ledger files.
- No handoff grants deployment or production-write permission.

## Resolved design decisions

### DEC-0001 — Commit machine-readable state and events

**Decision:** Commit `state.json`, `registry.json`, and `events.jsonl` with the other ledger files.  
**Reason:** The primary failure mode is context loss between products and machines. Local-only state would recreate that failure. Small append-only updates remain reviewable, and sensitive data is prohibited by schema.

### DEC-0002 — Keep ledger updates on task branches

**Decision:** Update the ledger on the branch that owns the task. Stable project context changes use their own normal reviewed branch. Do not introduce a continuously shared “ledger branch.”  
**Reason:** A separate shared branch creates synchronization and merge-order problems. Task state should travel with the code and evidence it describes.

### DEC-0003 — Use a 60-minute evidence-backed stale-lock threshold

**Decision:** A lock becomes eligible for recovery after 60 minutes without heartbeat, but takeover still requires process/session/in-flight-command checks.  
**Reason:** Thirty minutes is too short for builds, test suites, migrations, and agent tool calls. Time alone is insufficient evidence that a writer has stopped.

### DEC-0004 — Archive completed tasks after 90 days

**Decision:** Keep completed task directories active for 90 days, then move them to `.agents/archive/<task-id>/`. Never delete audit history automatically.  
**Reason:** Recent tasks remain easy to discover while the active registry stays small. Git preserves the full record indefinitely.

### DEC-0005 — Start with a shell CLI

**Decision:** The first automation is a dependency-light shell CLI exposing `init`, `claim`, `checkpoint`, `handoff`, `accept`, `status`, `recover`, and `validate`. A local service or MCP server may follow only after the manual protocol and CLI prove stable.  
**Reason:** Both agents can run shell commands immediately. A service adds lifecycle and failure modes; MCP adds configuration and permission complexity before the workflow is validated.

## Final implementation sequence

1. [ ] Create a minimal schema-validation specification.
2. [ ] Draft matching Codex and Claude instruction snippets.
3. [ ] Specify the shell CLI commands and exit codes.
4. [ ] Add the ledger skeleton, examples, and Git-ignore rule for locks.
5. [ ] Pilot manually on one low-risk, non-production task.
6. [ ] Implement the shell CLI only after the pilot confirms the schemas.
7. [ ] Review whether hooks or MCP materially improve reliability after three completed handoffs.
