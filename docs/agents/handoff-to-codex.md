# Predarea unei sarcini de la Claude la Codex

Acest flux pentru proiectul FranchiseTech urmează
[ADR-0003](../adr/0003-codex-claude-project-handoff.md) și
[contractul de handoff](../agent-handoff-contract.md). Predarea transferă contextul,
niciodată autoritatea.

## Înainte de predare

Claude consemnează obiectivul, criteriile de acceptare, deciziile, fișierele
modificate, comenzile și testele rulate, blocajele și următoarea acțiune exactă.
Informațiile sunt păstrate într-un comentariu al epicului DevChain și în registrul
`.agents/` definit de ADR-0003.

## Înainte ca Codex să lucreze

Codex citește întregul epic și confirmă preluarea. Apoi verifică rădăcina Git,
branch-ul curent și un baseline curat. Implementarea se face exclusiv într-un
worktree dedicat, niciodată în checkout-ul principal.

Codex începe implementarea numai dacă este consemnat `HUMAN_APPROVED_BUILD`.
Pentru deployment este obligatorie o aprobare separată,
`HUMAN_APPROVED_DEPLOY`. Dacă lipsește tokenul necesar acțiunii, Codex se oprește
și cere aprobarea omului.

La final, Codex înregistrează schimbările și dovezile de verificare, apoi predă
sarcina pentru review fără a extinde permisiunile primite.
