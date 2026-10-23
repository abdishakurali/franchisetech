# Codex–Claude Handoff: Validator, Instructions, and CLI Contract

**Status:** Design approved by ADR-0003; implementation not authorized  
**Date:** 2026-10-23  
**Authority:** [ADR-0003](adr/0003-codex-claude-project-handoff.md)

## 1. Purpose

This document specifies the first implementation boundary for the Git-backed Codex–Claude handoff system. It defines:

- what a schema validator must inspect and report;
- the exact instruction blocks that will later be added to `AGENTS.md` and `CLAUDE.md`;
- the public contract for a future `agent-handoff` shell CLI;
- state transitions, exit codes, concurrency behavior, and safety constraints.

It deliberately contains no executable script, hook, MCP server, or instruction-file modification.

## 2. Design principles

1. Repository evidence outranks agent prose.
2. A handoff transfers context, never authority.
3. Exactly one writer may own a task.
4. Validation is read-only unless a specific repair command is invoked.
5. Commands fail closed on ambiguity, schema errors, lock conflicts, or repository mismatch.
6. Human-readable Markdown and machine-readable JSON must agree.
7. Secrets, customer data, raw database exports, and hidden reasoning are forbidden.
8. Every mutating CLI action is atomic or leaves the previous valid state unchanged.

## 3. Validator contract

### 3.1 Invocation model

The validator is exposed through:

```text
agent-handoff validate [--task <task-id>] [--strict] [--json]
```

Default behavior validates the project ledger and every active task. `--task` limits validation to project files plus one task. `--strict` upgrades warnings that make handoff unsafe into errors. `--json` emits the output schema in section 3.7.

Validation must not create, modify, normalize, or delete files.

### 3.2 Validation phases

The validator runs in this order:

1. **Repository discovery** — find Git root and `.agents/`.
2. **Structural validation** — required paths, filenames, and uniqueness.
3. **Syntax validation** — JSON/JSONL parsing and Markdown headings.
4. **Schema validation** — field types, enums, formats, and required content.
5. **Referential validation** — task IDs, paths, revisions, event references, artifact pointers.
6. **Repository validation** — branch, HEAD, dirty paths, and commit resolution.
7. **Lifecycle validation** — permitted state transition and owner/status consistency.
8. **Lock validation** — lock shape, heartbeat, owner, process/session evidence.
9. **Verification freshness** — whether evidence still applies to current HEAD/files.
10. **Safety validation** — secrets/sensitive-pattern checks and approval boundaries.

Later phases still run when practical so one invocation returns all useful findings. A malformed core JSON file may prevent dependent checks.

### 3.3 Severity levels

```text
error    Handoff or mutation is unsafe; command must fail.
warning  State is usable but incomplete, stale, or likely misleading.
notice   Non-blocking maintenance or quality recommendation.
```

`--strict` promotes designated `handoff_warning` findings to errors. Notices never affect exit status.

### 3.4 Structural rules

Project requirements:

- `.agents/PROJECT.md`, `registry.json`, and `events.jsonl` exist.
- `.agents/tasks/`, `.agents/archive/`, and `.agents/locks/` exist.
- `.agents/locks/` is ignored by Git.
- No tracked lock file exists.
- Every registry task path exists in `tasks/` or `archive/`.
- Every active task directory appears exactly once in the registry.
- Archived task IDs do not also exist under `tasks/`.

Task requirements:

- `brief.md`, `state.json`, `progress.md`, `decisions.md`, `verification.md`, `handoff.md`, and `artifacts.json` exist.
- Directory name equals `state.json.task_id` and registry ID.
- Task IDs match `^[0-9]{8}-[a-z0-9]+(?:-[a-z0-9]+)*$`.
- No symlink may redirect a ledger file outside the Git root.

### 3.5 JSON and JSONL rules

All JSON:

- UTF-8, no duplicate keys, no comments, no trailing commas.
- `schema_version` is a supported positive integer.
- Timestamps are RFC 3339 UTC and end in `Z`.
- Paths are repository-relative except `repository.root`.
- Unknown fields are warnings in normal mode and errors in strict mode until schema evolution defines them.

`registry.json`:

- `project_id` is stable and non-empty.
- Task IDs are unique.
- Status, branch, owner, path, and update time agree with task state.
- Registry `updated_at` is not older than its newest task state.

`state.json`:

- `revision >= 1` and never decreases across event history.
- Status is one of `draft`, `ready`, `active`, `waiting`, `blocked`, `review`, `complete`, `abandoned`.
- `active` requires a non-null owner and valid lock.
- `ready`, `review`, `complete`, and `abandoned` must not have an active lock.
- `waiting` may retain ownership only when a recorded command/process is still active.
- `blocked` has at least one blocker.
- `complete` has no blocker and every required acceptance criterion has current evidence or an explicit human acceptance decision.
- `repository.head` resolves locally.
- `dirty` equals whether task-relevant dirty paths exist.
- Every listed dirty path has state, owner/disposition, and exists in Git status.
- `next_action` contains one bounded action, preconditions, and expected result.
- Approval entries describe scope; bare `approved` is invalid.

`artifacts.json`:

- Artifact IDs are unique.
- Local paths remain inside the repository.
- Referenced files exist.
- SHA-256 is 64 lowercase hexadecimal characters and matches the file.
- `contains_sensitive_data: true` is an error for a committed artifact.

`events.jsonl`:

- One valid JSON object per non-empty line.
- Event IDs are unique and lexically sortable.
- Timestamps never move backward for the same task.
- Task IDs resolve to active or archived tasks.
- Event type is defined by ADR-0003.
- State-related event revision matches an observed task revision.
- A `handoff_accepted` references an earlier unmatched `handoff_created`.
- `lock_recovered` includes evidence and the previous lock owner.
- A correction appends an event referencing the corrected event; existing lines never change.

### 3.6 Markdown rules

`PROJECT.md` requires the headings defined in ADR-0003.

`brief.md`:

- Original request is non-empty or points to a durable, accessible attachment.
- Objective, scope, exclusions, acceptance criteria, constraints, approvals, dependencies, clarifications, and sources are present.
- Each acceptance criterion has a stable identifier such as `AC-001`.
- Deployment or production mutation criteria explicitly name the required approver.

`progress.md`:

- Every entry has timestamp, agent, and phase.
- Completed, partial, unverified, changed files, and remaining sections exist.
- Commits mentioned as evidence resolve locally.
- “Done,” “passed,” “deployed,” or “applied” without a verification/decision reference is a warning.

`decisions.md`:

- Decision IDs are unique and monotonic.
- Accepted production, billing, customer-data, deployment, or destructive decisions identify a human decision maker and source.
- Superseded decisions point to valid decision IDs.
- Two active accepted decisions may not contradict within the same scope.

`verification.md`:

- Verification IDs are unique.
- Each entry has time, agent, HEAD, environment, command/check, result, limitations, and freshness.
- The recorded HEAD resolves.
- Evidence at another HEAD is stale unless its scope is explicitly proven unaffected.
- Production checks state `read-only`, `rolled-back`, or `persistent`.
- “Reported” evidence never satisfies a required acceptance criterion in strict mode.

`handoff.md`:

- All headings from ADR-0003 exist.
- Sender differs from receiver.
- Status is `draft`, `ready-for-takeover`, `accepted`, or `superseded`.
- A ready handoff has no active sender lock.
- Repository branch/HEAD/dirty files match observation.
- Exact next action contains one action and does not embed unauthorized production/deployment work.
- Receiver checklist requires validation before editing.

### 3.7 Repository reconciliation

The validator reads, without changing:

```text
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --porcelain=v1
git check-ignore .agents/locks/<probe>
```

Rules:

- Git root must equal `state.repository.root` after path normalization.
- Current branch and HEAD must match state for an active task.
- A mismatch is an error for `claim`, `checkpoint`, `handoff`, and `accept`.
- Unlisted task-related dirty files are errors.
- Listed unrelated dirty files generate warnings and must never be modified automatically.
- A detached HEAD is allowed only when the task state explicitly records it and mutation is disabled.

### 3.8 Verification freshness model

Each verification entry declares one or more scopes:

```text
repository
paths:<glob-list>
database-migration:<filename>
external-system:<name>
manual-ui:<flow-name>
```

Freshness states:

```text
current
stale-after-code-change
stale-after-schema-change
environment-specific
reported-only
unknown
```

Rules:

- Repository-wide verification is stale when HEAD changes.
- Path-scoped verification is stale when Git diff from recorded HEAD touches its path set or a declared dependency.
- Migration verification is stale if the migration file changes or its production application cannot be confirmed.
- Manual UI evidence never proves database or external fiscal correctness unless separately scoped.
- `complete` requires all required scopes to be `current` or human-accepted with limitations.

### 3.9 Lock validation

- Lock JSON matches the ADR schema.
- Lock task, branch, owner, and phase match state.
- Heartbeat age under 60 minutes is valid.
- Heartbeat age over 60 minutes is `stale_candidate`, not automatically stale.
- If PID belongs to a live local process, recovery is forbidden.
- If session/process state cannot be checked, recovery requires `--force-recover` plus an explicit human approval reference.
- Multiple locks for one task are errors.
- Lock files are never committed.

### 3.10 Safety and sensitive-data rules

The validator scans ledger text and committed artifacts for likely:

- API tokens, private keys, passwords, connection strings, JWTs, and `.env` values;
- email/phone/address lists, customer records, payment data, or database rows;
- absolute paths outside allowed project/session metadata fields;
- raw chat transcripts rather than curated summaries;
- language that incorrectly treats a handoff as deployment or production permission.

High-confidence secret patterns are errors. Possible personal/customer data is an error requiring manual removal or an explicitly non-committed artifact location. The validator reports only file, line, rule, and redacted fingerprint—never the detected value.

### 3.11 Validator output schema

```json
{
  "schema_version": 1,
  "valid": false,
  "strict": true,
  "repository_root": "/path/to/project",
  "task_id": "20261023-critical-pos-release",
  "summary": {
    "errors": 1,
    "warnings": 2,
    "notices": 0
  },
  "findings": [
    {
      "code": "STATE_HEAD_MISMATCH",
      "severity": "error",
      "path": ".agents/tasks/20261023-critical-pos-release/state.json",
      "line": 18,
      "message": "Recorded HEAD does not match the current repository HEAD.",
      "expected": "9602736",
      "actual": "abcdef0",
      "remediation": "Inspect Git history and create a recovery checkpoint."
    }
  ]
}
```

Text output groups findings by task and severity. Output ordering is deterministic: severity, task ID, path, line, code.

## 4. Instruction-file snippets

The future implementation adds short, equivalent policy blocks. They reference the ADR and contract rather than copying schemas.

### 4.1 Proposed `AGENTS.md` block

```markdown
<!-- AGENT-HANDOFF:BEGIN — governed by docs/adr/0003-codex-claude-project-handoff.md -->
## Codex–Claude task continuity

For substantial work, use the shared `.agents/` ledger.

Before modifying files:
1. Read `.agents/PROJECT.md` and `.agents/registry.json`.
2. Identify the applicable task and read every file in its task directory.
3. Run the handoff validator and reconcile branch, HEAD, dirty files, and verification freshness.
4. Acquire the task lock. Never write when another valid owner holds it.

During work, checkpoint commits, user decisions, verification, blockers, and material scope changes. Git and observed evidence outrank agent summaries. Mark transcript-only claims as unverified.

Before stopping, nearing limits, or transferring work, write a complete handoff, record exactly one next action, append the audit event, and release the lock.

A handoff transfers context only. It never grants permission to deploy, mutate production, change billing/customer data, send messages, delete data, or perform another consequential action.

Never store secrets, customer data, raw database output, or hidden reasoning in `.agents/`.
<!-- AGENT-HANDOFF:END -->
```

### 4.2 Proposed `CLAUDE.md` block

```markdown
<!-- AGENT-HANDOFF:BEGIN — governed by docs/adr/0003-codex-claude-project-handoff.md -->
## Claude–Codex task continuity

Use `.agents/` as the cross-agent source of task continuity for substantial work.

Before editing:
1. Read `.agents/PROJECT.md`, `.agents/registry.json`, and all files for the active task.
2. Validate the ledger against Git: repository root, branch, HEAD, dirty paths, locks, and evidence freshness.
3. Claim the task only when no valid writer owns it.

Checkpoint material progress, commits, decisions, verification, blockers, and user corrections while working. Treat Git/files/tool results as stronger evidence than prior model prose. Label transcript-derived claims as unverified until reconciled.

When usage/context is low, before stopping, or when asked to transfer: stop starting work, finish or record running commands, create the handoff with one exact next action, append the event, and release ownership.

Context transfer does not transfer authority. Existing approval and production-safety rules still apply. Never write secrets, customer data, raw production records, or private reasoning to the ledger.
<!-- AGENT-HANDOFF:END -->
```

### 4.3 Instruction behavior requirements

- Blocks must remain semantically equivalent.
- Each block is inserted once and bounded by managed comments.
- The future installer must refuse to replace a manually modified block without showing a diff.
- Repository-specific constraints remain outside the managed block and retain precedence.
- Nested directories may add stricter requirements but cannot weaken the handoff safety rules.
- Missing `.agents/` means the protocol is unavailable; agents must not invent state and should request initialization.

## 5. Shell CLI contract

### 5.1 Command name and portability

```text
agent-handoff
```

The first implementation targets macOS/Linux POSIX environments and may require Bash 3.2+ plus standard Git. JSON handling may use a bundled, documented dependency, but the user-facing contract must not depend on an always-running service.

Global syntax:

```text
agent-handoff [global-options] <command> [command-options]
```

Global options:

```text
--repo <path>       Repository root; defaults to Git discovery from CWD.
--task <task-id>    Explicit task; otherwise resolve one unambiguous active task.
--actor <name>      codex | claude | human; no implicit fallback for mutations.
--session <id>      Optional native session reference.
--json              Machine-readable output.
--quiet             Emit only errors and the requested payload.
--dry-run           Validate and show planned mutations without writing.
--help              Usage.
--version           Contract/schema version.
```

### 5.2 Commands

#### `init`

```text
agent-handoff init --project-id <id>
```

Purpose: prepare the project ledger skeleton after explicit implementation approval.

Preconditions:

- Inside a Git repository.
- `.agents/` does not exist, or `--adopt` is provided for a validated partial structure.
- Working tree inspection succeeds.

Writes:

- Project directories and schema-versioned empty files.
- Git-ignore entry for `.agents/locks/`.
- No instruction-file changes unless a future separate `install-instructions` command is explicitly invoked.

#### `new`

```text
agent-handoff new --id <task-id> --title <title> --priority <level> --brief <file>
```

Purpose: create a `draft` task from a prepared brief.

Rules:

- Does not claim or start implementation.
- Refuses duplicate IDs.
- Copies/normalizes no sensitive attachment content automatically.
- Appends `task_created`.

#### `ready`

```text
agent-handoff ready --task <id>
```

Purpose: transition `draft → ready` after brief validation.

Requires objective, scope, acceptance criteria, constraints, and approval requirements.

#### `claim`

```text
agent-handoff claim --task <id> --actor codex|claude --session <id> [--phase <name>]
```

Purpose: acquire exclusive ownership and transition `ready|waiting|blocked → active` when allowed.

Preconditions:

- Strict validation passes.
- No valid lock exists.
- Repository branch/HEAD matches state.
- Blocked tasks require blocker resolution evidence.

Writes atomically:

- Lock file.
- State owner/status/revision.
- Registry owner/status/update time.
- `lock_acquired` event.

#### `heartbeat`

```text
agent-handoff heartbeat --task <id> --actor <owner>
```

Purpose: refresh an owned lock before/after long operations.

It refuses actor/session mismatch and never changes task progress.

#### `checkpoint`

```text
agent-handoff checkpoint --task <id> --summary <text> [--verification <id>] [--next <text>]
```

Purpose: record durable progress while retaining ownership.

Preconditions:

- Caller holds valid lock.
- Repository reconciliation passes.
- Required Markdown changes are already prepared or supplied through explicit files.

Writes:

- State revision and repository snapshot.
- Registry update.
- `checkpoint_created` event.
- It does not generate claims such as “tests passed” without verification data.

#### `verify-record`

```text
agent-handoff verify-record --task <id> --id <VER-id> --command <text> --exit-code <n> --scope <scope> --result-file <path>
```

Purpose: record verification already executed by the agent/user.

The CLI does not execute the supplied command. It records the command, observed exit code, current HEAD/environment, artifact hash, limitations, and freshness.

#### `decide`

```text
agent-handoff decide --task <id> --id <DEC-id> --status <status> --maker <maker> --source <source> --file <decision-body>
```

Purpose: append a decision. Consequential accepted decisions require `--maker human` and a durable source reference.

#### `handoff`

```text
agent-handoff handoff --task <id> --to codex|claude --reason <reason> --next <text>
```

Purpose: create a receiver-ready transfer and release ownership.

Preconditions:

- Caller owns lock.
- Strict validation passes except explicitly acknowledged warnings.
- No unrecorded task-related dirty files.
- Running commands are absent or recorded.
- Exactly one next action is supplied.

Writes atomically:

- `handoff.md` with repository snapshot and receiver prompt.
- State status `ready`, owner null, revision increment.
- Registry update.
- `handoff_created`, then `lock_released` events.
- Removes the lock last.

Output includes the copyable receiver prompt.

#### `accept`

```text
agent-handoff accept --task <id> --actor codex|claude --session <id>
```

Purpose: validate and accept a ready handoff.

Behavior:

- Runs strict validation and repository reconciliation first.
- Creates lock and owner state atomically.
- Marks handoff accepted.
- Appends `handoff_accepted` and `lock_acquired`.
- Outputs the exact next action and preconditions.

#### `release`

```text
agent-handoff release --task <id> --status ready|waiting|blocked|review
```

Purpose: relinquish ownership without transferring to a named receiver.

Requires an updated checkpoint and reason. It never marks a task complete.

#### `status`

```text
agent-handoff status [--task <id>] [--json]
```

Purpose: read-only summary of task status, owner, lock health, branch/HEAD match, dirty paths, verification freshness, blockers, and next action.

#### `recover`

```text
agent-handoff recover --task <id> --actor <actor> --evidence <file> [--force-recover --approval <DEC-id>]
```

Purpose: recover from an abandoned/stale lock or missing handoff.

Rules:

- Lock heartbeat must exceed 60 minutes.
- Normal recovery requires evidence that process/session is inactive.
- Unverifiable ownership requires `--force-recover` plus a human decision reference.
- Never deletes dirty files or terminates processes.
- Writes recovery handoff/state and `lock_recovered` before claim.

#### `complete`

```text
agent-handoff complete --task <id> [--human-acceptance <DEC-id>]
```

Purpose: transition `review → complete`.

Requires:

- No blockers or dirty task files.
- Current evidence for every required acceptance criterion.
- Human acceptance decision when any criterion is judgment-based or consequential.
- No active lock after completion.

#### `archive`

```text
agent-handoff archive --task <id>
```

Purpose: move a completed task older than 90 days into `.agents/archive/` and update registry paths. It never deletes history.

#### `validate`

Defined in section 3. Read-only in all modes.

### 5.3 State-transition matrix

| Command | From | To |
|---|---|---|
| `new` | absent | `draft` |
| `ready` | `draft` | `ready` |
| `claim` | `ready`, resolved `blocked`, resumable `waiting` | `active` |
| `release` | `active` | `ready`, `waiting`, `blocked`, `review` |
| `handoff` | `active` | `ready` |
| `accept` | `ready` with handoff | `active` |
| `complete` | `review` | `complete` |
| `archive` | `complete` older than 90 days | `complete` archived |

No command transitions directly from `active` to `complete`.

### 5.4 Atomicity

Mutating commands use this conceptual transaction:

1. Acquire a short-lived ledger mutation mutex distinct from the task ownership lock.
2. Revalidate preconditions.
3. Write proposed files into a temporary directory inside `.agents/`.
4. Validate the proposed complete ledger.
5. Rename files atomically where supported.
6. Append the final event.
7. Release the mutation mutex.

If any step fails, previous valid files remain and temporary files are reported for safe cleanup. Product code is never rolled back or reset by the CLI.

### 5.5 Exit codes

```text
0   Success; validation has no errors.
2   CLI usage or unknown option.
3   Not inside a supported Git project / ledger missing.
4   Schema or structural validation failure.
5   Repository branch, HEAD, or dirty-state mismatch.
6   Lock conflict or ownership mismatch.
7   Invalid lifecycle transition.
8   Approval or authority missing.
9   Sensitive data or secret detected.
10  Verification stale or acceptance evidence incomplete.
11  Atomic write failed; previous state preserved.
12  Unsupported schema version.
13  Recovery evidence insufficient.
20  Unexpected internal failure.
```

Warnings return 0 unless `--strict` promotes them. JSON output always includes the numeric code and findings.

### 5.6 Output and logging

- Human output begins with outcome, then evidence and next command.
- JSON output is stable and versioned.
- Mutations print changed ledger paths and new revision.
- Secret findings are redacted.
- No telemetry or network calls in the first implementation.
- Debug logging is opt-in and must not include file contents by default.

### 5.7 Explicit prohibitions

The CLI must never:

- run tests, builds, deployments, migrations, or arbitrary recorded commands;
- invoke Codex or Claude automatically;
- terminate agent processes;
- push, pull, reset, checkout, merge, commit, or alter product files;
- infer human approval from a handoff;
- delete task history or untracked files;
- upload the ledger or transcripts;
- store authentication tokens or model credentials.

## 6. Manual pilot contract

Before implementing the CLI, conduct one low-risk manual pilot using these same files and transitions:

1. Create a task and acceptance criteria.
2. Codex claims it and performs one bounded change.
3. Codex checkpoints and hands to Claude.
4. Claude validates Git manually, accepts, and performs verification.
5. Claude hands back to Codex.
6. Codex validates, reviews evidence, and moves the task to review.
7. Record every ambiguity or redundant step.

Pilot success requires:

- neither agent rereads the full prior transcript;
- both detect the exact branch, HEAD, and dirty files;
- no completed work is repeated;
- no authority is broadened;
- receiver orientation takes under five minutes;
- all ledger inconsistencies are identifiable by the proposed validator rules.

## 7. Design acceptance checklist

- [x] Validator phases and severities defined.
- [x] Structural, schema, referential, Git, lifecycle, lock, freshness, and safety rules defined.
- [x] Stable validator JSON output defined.
- [x] Equivalent Codex and Claude instruction blocks drafted.
- [x] CLI commands, preconditions, writes, state transitions, atomicity, and exit codes defined.
- [x] CLI prohibited behaviors defined.
- [x] Manual pilot and success criteria defined.
- [ ] Human authorizes implementation.

## 8. Next design artifact

After explicit implementation approval, the next artifact should be a task plan that separates:

1. ledger skeleton and examples;
2. schema fixtures and validator tests;
3. instruction-file installation;
4. manual pilot;
5. shell CLI implementation;
6. three-handoff evaluation before considering hooks or MCP.
