import { describe, expect, it } from "vitest";
import { appText } from "@/lib/app-i18n";
import {
  NIR_POST_ERROR_CODES,
  PURCHASE_ERROR_CODES,
  nirPostErrorRedirect,
  purchaseErrorMessage,
  purchaseErrorRedirect,
} from "./purchase";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every RPC code the SQL function can raise, plus unknown/undefined.
const RPC_CODES = ["ALREADY_POSTED", "PURCHASE_CANCELLED", "INVALID_STATUS", "PURCHASE_NOT_FOUND", "NO_ITEMS", "SOMETHING_ELSE", undefined];

function errorParam(url: string): string | null {
  return new URL(url, "http://x").searchParams.get("error");
}

describe("purchase error messages", () => {
  it("every code nirPostErrorRedirect can return is listed and has a message in en and ro", () => {
    for (const purchaseId of ["p1", null]) {
      for (const rpc of RPC_CODES) {
        const code = errorParam(nirPostErrorRedirect(purchaseId, rpc));
        expect(code).not.toBeNull();
        expect(NIR_POST_ERROR_CODES as readonly string[]).toContain(code);
        for (const locale of ["en", "ro"] as const) {
          const msg = purchaseErrorMessage(code, appText[locale]);
          expect(msg, `${locale}:${code}`).toBeTruthy();
        }
      }
    }
  });

  it("every purchase error code has its own non-empty message in en and ro (no fallback)", () => {
    for (const locale of ["en", "ro"] as const) {
      const messages = new Set<string>();
      for (const code of PURCHASE_ERROR_CODES) {
        const msg = purchaseErrorMessage(code, appText[locale]);
        expect(msg && msg.trim().length > 10, `${locale}:${code}`).toBe(true);
        messages.add(msg!);
      }
      // Distinct text per code: none silently shares the generic message.
      expect(messages.size).toBe(PURCHASE_ERROR_CODES.length);
    }
  });

  it("the codes the issue names are covered, including plan denial", () => {
    for (const code of ["post_failed", "no_items", "invalid_status", "cancelled", "entitlement_denied"]) {
      expect(PURCHASE_ERROR_CODES as readonly string[]).toContain(code);
    }
  });

  it("failure messages say stock was not updated (ro primary)", () => {
    for (const code of ["post_failed", "save_failed", "no_items"]) {
      expect(purchaseErrorMessage(code, appText.ro)!.toLowerCase()).toContain("stocul");
      expect(purchaseErrorMessage(code, appText.en)!.toLowerCase()).toContain("stock");
    }
  });

  it("no error param means no banner; an unknown code still shows a message", () => {
    expect(purchaseErrorMessage(undefined, appText.ro)).toBeNull();
    expect(purchaseErrorMessage("", appText.ro)).toBeNull();
    expect(purchaseErrorMessage("weird_new_code", appText.ro)).toBe(appText.ro.purchases.detail.errors.postFailed);
  });

  it("purchaseErrorRedirect targets the draft when it exists, else the new page", () => {
    expect(purchaseErrorRedirect("abc", "save_failed")).toBe("/app/purchases/abc?error=save_failed");
    expect(purchaseErrorRedirect(null, "entitlement_denied")).toBe("/app/purchases/new?error=entitlement_denied");
  });

  it("every literal ?error= code the purchase actions redirect with has a message", () => {
    const src = readFileSync(join(process.cwd(), "app/actions/kitchenops.ts"), "utf8");
    const literal = [...src.matchAll(/\/app\/purchases\/[^`"]*\?error=([a-z_]+)/g)].map((m) => m[1]);
    const helper = [...src.matchAll(/purchaseErrorRedirect\([^\n]*"([a-z_]+)"\)/g)].map((m) => m[1]);
    const failArgs = [...src.matchAll(/failPurchaseWrite\([^\n]*"([a-z_]+)"\)/g)].map((m) => m[1]);
    const used = new Set([...literal, ...helper, ...failArgs]);
    expect(used.size).toBeGreaterThan(5);
    for (const code of used) {
      expect(PURCHASE_ERROR_CODES as readonly string[], code).toContain(code);
    }
  });
});
