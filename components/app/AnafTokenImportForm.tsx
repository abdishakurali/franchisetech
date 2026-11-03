"use client";

import { useActionState } from "react";
import { importAccountantAnafToken, type ImportTokenResult } from "@/app/actions/platform-efactura";

export function AnafTokenImportForm() {
  const [state, action, pending] = useActionState<ImportTokenResult | null, FormData>(importAccountantAnafToken, null);
  return (
    <form action={action} className="mt-4 space-y-2">
      <label htmlFor="anaf-token" className="block font-medium text-foreground">Token primit de la contabil</label>
      <p className="text-muted-foreground">
        Lipiți tokenul (access token) generat de contabil cu certificatul ei. Îl verificăm la ANAF înainte să-l salvăm. Nu-l trimiteți pe email sau chat.
      </p>
      <textarea
        id="anaf-token"
        name="token"
        required
        autoComplete="off"
        spellCheck={false}
        className="h-24 w-full rounded-md border border-border bg-background p-2 font-mono text-xs"
      />
      <button type="submit" disabled={pending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {pending ? "Se verifică la ANAF…" : "Verifică și salvează"}
      </button>
      {state && (
        <p role="status" className={state.ok ? "text-reconciled" : "text-attention"}>
          {state.ok ? `Token valid, salvat. Expiră la ${state.expiresOn}.` : state.error}
        </p>
      )}
    </form>
  );
}
