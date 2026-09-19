# Dolce Nera removal map

Production read-only audit (2026-09-17) is the deletion authority. Dolce Nera
uses POS, purchases/NIR, stock movements, and recipes. These remain.

| Module | Dolce Nera rows | Action |
| --- | ---: | --- |
| HACCP, assets, sensors, calibration | 0 | Remove app/API surface |
| Reminders and audit export | 0 | Remove app/API surface |
| Delivery integrations | 0 | Remove app/API surface |
| Tables, kitchen display | 0 | Remove app/API surface |
| Loyalty | 0 | Remove app/API surface |
| Recipes | 115 | Keep |
| POS | 3,872 | Keep |
| Purchases/NIR | 67 | Keep |
| Stock movements | 9,894 | Keep |

Deletion order: remove navigation and entry points; replace public legacy URLs
with redirects; remove server actions/API routes; remove components and tests;
only then consider an additive database retirement migration after isolated E2E
passes. Never delete or change Dolce Nera data.
