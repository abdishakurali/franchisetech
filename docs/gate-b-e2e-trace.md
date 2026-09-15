# Gate B — fiscal receipt checkout path, old vs. new (written trace)

No till or FiscalNet printer exists in this environment, so this is a written
diff of the actual code paths, not a physical test — cite-and-verify, not
click-and-watch. Every line number below was re-checked against the current
tree at commit `8787754`, and the "old" side is quoted verbatim from
`a35b248` (the last commit before any Gate B work started), via
`git show a35b248:<path>`.

**Bottom line up front:** the function that builds the FiscalNet payload and
calls the agent — `fiscalBrowserReceipt`, `buildFiscalNetReceiptLines`,
`callApi`, `downloadLines`, all of `lib/fiscalnet/browser.ts` — has a byte-for-byte
empty diff between `a35b248` and `HEAD`:

```
$ git diff a35b248 HEAD -- lib/fiscalnet/browser.ts
(no output)
```

Gate B added a wrapper around that function. It did not touch what the
wrapper wraps.

---

## 1. The agent call itself — unchanged

`fiscalBrowserReceipt` (`lib/fiscalnet/browser.ts:229-244`):

```ts
export async function fiscalBrowserReceipt(
  config: BrowserFiscalConfig,
  items: BrowserFiscalItem[],
  total: number,
  paymentType: string
): Promise<BrowserFiscalResult> {
  if (!config.enabled) return { ok: true, message: "FiscalNet dezactivat." };

  const lines = buildFiscalNetReceiptLines(items, paymentType, config, total);

  if (config.connectionMode === "file") {
    return downloadLines(lines, "BON");
  }
  if (config.mockMode) return { ok: true, message: "Mock — bon simulat (nu s-a trimis la casă)." };
  return callApi(config.apiHost, lines);
}
```

This is identical in both commits — same signature, same line-building call
(`buildFiscalNetReceiptLines`, unchanged, `browser.ts:143-225`), same
branching on `connectionMode`/`mockMode`, same `callApi(config.apiHost, lines)`
for the real API path (`browser.ts:106-139`, unchanged — same
`fetch(...api/Receipt, {method:"POST", body: JSON.stringify(lines)})`, same
15s `AbortController` timeout, same `BONOK`/`ERRCODE` response parsing), same
`downloadLines` for file mode (`browser.ts:93-102`, unchanged — same Blob/
download-link construction). No new argument, no reordered argument, no
changed default. A real till talking to a real FiscalNet agent sends and
receives exactly the same bytes it did before Gate B.

---

## 2. Call site A — the direct sale-complete path

**Old** (`a35b248:components/app/PosRegister.tsx:1102-1116`):

```ts
      setCheckoutStep("complete");
      if (res.fiscalApiPending && fiscalActive && fiscalNet?.enabled) {
        void fiscalBrowserReceipt(fiscalNet, res.items, res.total, res.paymentType).then((fnRes) => {
          if (fiscalActive && fnRes.filename && fnRes.content) {
            setLastFiscalTxt({ filename: fnRes.filename, content: fnRes.content });
          }
          console.info("[FiscalNet] receipt browser result", {
            ok: fnRes.ok,
            message: fnRes.message,
            mode: fiscalNet.connectionMode,
          });
          if (fnRes.ok) {
            captureClientEvent("receipt_issued", { transaction_id: res.transactionId, source: "fiscalnet" });
          }
        });
      }
```

**New** (`HEAD:components/app/PosRegister.tsx:1169-1187`):

```ts
      setCheckoutStep("complete");
      if (res.fiscalApiPending && fiscalActive && fiscalNet?.enabled) {
        void fiscalBrowserReceiptAndLog(fiscalNet, res.items, res.total, res.paymentType, {
          transactionId: res.transactionId,
          recordAttempt: recordFiscalAttempt,
        }).then((fnRes) => {
          if (fiscalActive && fnRes.filename && fnRes.content) {
            setLastFiscalTxt({ filename: fnRes.filename, content: fnRes.content });
          }
          console.info("[FiscalNet] receipt browser result", {
            ok: fnRes.ok,
            message: fnRes.message,
            mode: fiscalNet.connectionMode,
          });
          if (fnRes.ok) {
            captureClientEvent("receipt_issued", { transaction_id: res.transactionId, source: "fiscalnet" });
          }
        });
      }
```

Diff: the gate condition (`res.fiscalApiPending && fiscalActive && fiscalNet?.enabled`)
is character-for-character identical. The arguments passed through to the
agent call — `fiscalNet, res.items, res.total, res.paymentType` — are
identical, same order, same source. The entire `.then()` body — UI state
update, console log, analytics event — is identical. The **only** change is
the function name (`fiscalBrowserReceipt` → `fiscalBrowserReceiptAndLog`) and
one new argument (the `{transactionId, recordAttempt}` context object), which
the new function consumes internally for logging and does not alter the
agent-call arguments derived from it.

Crucially: `setCheckoutStep("complete")` runs **before** this block, in both
versions, on the same line relative to it. The sale is already marked
complete in the UI before the fiscal call — old or new — even starts. This
call is `void`-fired-and-forgotten either way; nothing here was ever awaited
by the checkout flow, and Gate B didn't change that.

---

## 3. Call site B — the offline-queue sync path

**Old** (`a35b248:components/app/PosRegister.tsx:1319-1333`):

```ts
      let fiscalDone = !res.fiscalApiPending;
      if (res.fiscalApiPending && fiscalActive && fiscalNet?.enabled) {
        try {
          const fnRes = await fiscalBrowserReceipt(fiscalNet, res.items, res.total, res.paymentType);
          if (fiscalActive && fnRes.filename && fnRes.content) {
            setLastFiscalTxt({ filename: fnRes.filename, content: fnRes.content });
          }
          fiscalDone = fnRes.ok;
          if (fnRes.ok) {
            captureClientEvent("receipt_issued", { transaction_id: res.transactionId, source: "fiscalnet_offline_sync" });
          }
        } catch {
          fiscalDone = false;
        }
      }
```

**New** (`HEAD:components/app/PosRegister.tsx:1395-1412`):

```ts
      let fiscalDone = !res.fiscalApiPending;
      if (res.fiscalApiPending && fiscalActive && fiscalNet?.enabled) {
        try {
          const fnRes = await fiscalBrowserReceiptAndLog(fiscalNet, res.items, res.total, res.paymentType, {
            transactionId: res.transactionId,
            recordAttempt: recordFiscalAttempt,
          });
          if (fiscalActive && fnRes.filename && fnRes.content) {
            setLastFiscalTxt({ filename: fnRes.filename, content: fnRes.content });
          }
          fiscalDone = fnRes.ok;
          if (fnRes.ok) {
            captureClientEvent("receipt_issued", { transaction_id: res.transactionId, source: "fiscalnet_offline_sync" });
          }
        } catch {
          fiscalDone = false;
        }
      }
```

Same shape of diff: identical gate, identical arguments, identical
`fiscalDone`/`removeOfflineSale`/`markOfflineSaleSynced` handling below this
block (`PosRegister.tsx:1413-1417`, unchanged). The pre-existing
`try { } catch { fiscalDone = false; }` wrapper is untouched — it wrapped
`fiscalBrowserReceipt` before, it wraps `fiscalBrowserReceiptAndLog` now, same
fallback behaviour if either throws.

**One real behavioural difference here, found while writing this trace and
already fixed** (commit `8787754`): this call site `await`s the whole
function, so before the fix, the added logging step had no timeout of its
own — only the agent call did (`callApi`'s 15s `AbortController`). A hung
Supabase/network call for logging alone could have stalled this loop
indefinitely, one queued entry at a time. Fixed with a 10s bound
(`lib/fiscalnet/log-attempt.ts:22-42`, `recordAttemptWithTimeout`), proven
with a fake-timer test that a `recordAttempt` which never resolves still
returns the agent's own result within the window
(`lib/fiscalnet/log-attempt.test.ts`, the "does not hang forever" case). No
other timing difference was found at either call site — see §4 below for the
full success/failure matrix.

---

## 4. What's inside `fiscalBrowserReceiptAndLog` — the actual new logic

`lib/fiscalnet/log-attempt.ts:63-92`:

```ts
export async function fiscalBrowserReceiptAndLog(
  config, items, total, paymentType, ctx
): Promise<BrowserFiscalResult> {
  const result = await fiscalBrowserReceipt(config, items, total, paymentType);

  if (!config.enabled) return result;

  const status = config.mockMode ? "mock_success" : result.ok ? "success" : "failed";

  const logResult = await recordAttemptWithTimeout(ctx.recordAttempt, {
    transactionId: ctx.transactionId,
    attemptNumber: ctx.attemptNumber ?? 1,
    status,
    mockMode: config.mockMode,
    responseContent: result.content ?? result.message ?? null,
    receiptNumber: result.receiptNumber ?? null,
    errorCode: result.ok ? null : "CLIENT_ERROR",
    errorInfo: result.ok ? null : result.message,
  }).catch((e) => ({ ok: false, error: e instanceof Error ? e.message : String(e) }));

  if (!logResult.ok) {
    console.error("[FiscalNet] failed to record receipt attempt", logResult.error);
  }

  return result;
}
```

The load-bearing fact: `result` (line 1, the agent's actual outcome) is
captured **before** the logging step runs, and `return result` (the last
line) returns that same captured value **unconditionally** — nothing about
the logging step's outcome can change what this function hands back to its
caller.

### The four cases, traced

**Agent succeeds, log succeeds.** `result.ok = true`. `recordAttempt` returns
`{ok: true}`. `logResult.ok` is true, no console.error. Caller receives
`result` with `ok: true`, `receiptNumber` set — identical to old behaviour,
plus `fiscal_receipt_attempts` now has a row and `pos_transactions.fiscal_receipt_status`
is `'success'` (previously stuck at `'api_pending'` forever — this is the bug
this whole fix exists for).

**Agent succeeds, log fails** (network drop reaching Supabase, RPC error,
or the 10s timeout). `result.ok = true`, unchanged. `recordAttemptWithTimeout`'s
`.catch()` (line ~90) absorbs the rejection or the timeout race resolves
`{ok: false}` — either way `logResult.ok` is false, one `console.error`, no
throw. Caller still receives `result` with `ok: true` — **the receipt that
actually printed is reported as printed**, exactly as before. The only
consequence is `fiscal_receipt_status` stays at whatever it already was
(`'api_pending'`, set server-side at `completeSaleReturn` time,
`app/actions/kitchenops.ts:2405-2408`, unchanged by this fix) instead of
advancing to `'success'` — a status that reads as "still pending," never a
status that falsely claims failure or falsely claims a different success.
Degrades to exactly the old blind-spot for that one attempt; never worse
than old behaviour, never silently wrong in the other direction.

**Agent fails, log succeeds.** `result.ok = false`. `recordAttempt` correctly
logs `status: "failed"`, `errorCode: "CLIENT_ERROR"`, `errorInfo: result.message`.
Caller receives `result` with `ok: false` — same UI/retry handling as
before at both call sites (`fiscalDone = fnRes.ok` at call site B; the
`.then()` body's `if (fnRes.ok)` guard simply doesn't fire at call site A).
**This is strictly better than before**: the old code had this exact
failure path and simply never told the database about it.

**Agent fails, log fails.** `result.ok = false`, same as old behaviour for
that half. Logging failure is a `console.error`, no throw, no new record.
Identical net effect to the pre-Gate-B blind spot for this one instance —
not improved, not regressed.

**FiscalNet disabled** (`config.enabled === false`). Line "if (!config.enabled)
return result" short-circuits before `recordAttempt` is ever called —
nothing was actually attempted, so nothing is logged. Proven directly:
`lib/fiscalnet/log-attempt.test.ts`, "never calls recordAttempt when
FiscalNet is disabled."

All five cases above are exercised by `lib/fiscalnet/log-attempt.test.ts`
(7 cases total, `npx vitest run lib/fiscalnet/log-attempt.test.ts` — all
passing as of this trace) against a mocked `fiscalBrowserReceipt`, not
inferred from reading the code alone.

---

## 5. Does anything block checkout on a logging failure? No — traced structurally, not just by inspection

Both call sites reach the fiscal step only **after** the sale is already
durably recorded:

- Call site A: `completeSaleReturn` (`app/actions/kitchenops.ts:2187`) has
  already returned `{ok: true, transactionId, ...}` by the time execution
  reaches line 1169's `setCheckoutStep("complete")` — the sale row exists in
  `pos_transactions`, written atomically by the `post_pos_document` RPC
  (`kitchenops.ts:2326`) before any of this fiscal code runs. The fiscal call
  that follows is `void`-fired — its promise is never awaited by anything
  that gates the UI or the sale record.
- Call site B: `syncQueuedEntry` (`PosRegister.tsx:1378` onward) calls
  `completeSaleReturn` first (line 1380) and only reaches the fiscal block
  (line 1395) after confirming `res.ok && res.transactionId` (line 1385-1394
  returns early otherwise) — same ordering, sale-first. The fiscal call here
  *is* awaited, but only to decide whether to call `removeOfflineSale` or
  `markOfflineSaleSynced` on the **local queue entry** — a bookkeeping
  decision about whether this device still needs to retry the fiscal step
  later, not a gate on whether the sale itself is considered recorded (it
  already is, per the `res.ok` check three lines above).

So structurally: nothing downstream of "the sale is recorded" can be
undone or blocked by the fiscal step, in either version, and Gate B didn't
change that ordering — it only changed what happens to the fiscal step's
own outcome once it runs.

**One low-confidence edge case, flagged rather than asserted:**
`recordFiscalReceiptAttempt` (`app/actions/fiscalnet.ts:445`) calls
`getActiveOrg()` (`app/actions/kitchenops.ts` — not shown here), which
internally calls Next's `redirect("/login")` if the session is gone. If that
happens inside this specific background call (session expiring in the
seconds between a sale completing and this fire-and-forget log call firing),
Next.js server-action machinery may intercept that redirect signal at the
client/server RPC boundary before my `.catch()` ever sees it as a normal
rejection — I don't have enough confidence in that specific framework
internal to assert which happens first. Either way, the practical impact is
bounded to this one background logging call not completing for that one
attempt; it does not touch the sale record, the receipt outcome, or any
other part of the checkout flow. Not something I could resolve further
without live testing against an actual session-expiry scenario, which needs
a browser, not something this written trace can settle definitively.

---

## 6. Verification run for this trace

```
tsc --noEmit         clean
eslint (touched)     clean, 946-error repo baseline unchanged
next build            succeeds
vitest run             428/430 (same 2 pre-existing, unrelated failures)
```

Nothing in this trace required touching `lib/fiscalnet/browser.ts`,
`app/actions/kitchenops.ts`'s sale-completion logic, or either call site's
gate condition — all confirmed via the diffs quoted above, not paraphrased.
