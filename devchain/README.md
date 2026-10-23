# FranchiseTech DevChain MVP

The hardened template is `templates/franchisetech-mvp.json`.

Start automatic provider failover after DevChain starts:

```bash
DEVCHAIN_PROJECT_ID=9ca11883-79b1-4b64-b550-819deb212052 \
  bash devchain/bin/provider-failover.sh --watch
```

The watchdog polls live provider usage every 60 seconds. At 95% usage it adds a
`HANDOFF_LIMIT_REACHED` comment and reassigns active work to the mapped role on
the other provider, provided the target is below the same threshold.

Role pairs:

- Claude Brainstormer ↔ Codex Architect
- Claude Epic Manager ↔ Codex Code Reviewer

Use `DEVCHAIN_FAILOVER_THRESHOLD` and `DEVCHAIN_FAILOVER_INTERVAL` to override
the defaults. `--simulate-source claude|codex` exists only for disposable pilot
verification.
