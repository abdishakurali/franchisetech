"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseAccountantActivation } from "@/lib/auth/accountant-activation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Stage = "checking" | "set-password" | "saving" | "error";

export default function ActivateAccountantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>("checking");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function activate() {
      const supabase = createClient();
      const session = parseAccountantActivation(window.location.hash);
      const code = searchParams.get("code");
      const result = session
        ? await supabase.auth.setSession({ access_token: session.accessToken, refresh_token: session.refreshToken })
        : code
          ? await supabase.auth.exchangeCodeForSession(code)
          : { error: new Error("Linkul de activare este incomplet sau a expirat.") };
      if (result.error) {
        setError("Linkul de activare este invalid sau a expirat. Cere clientului o invitație nouă.");
        setStage("error");
        return;
      }
      // The invite link only ever proves identity once. Without a password
      // set here, the accountant's only way back in later is asking the
      // owner to re-invite them — a normal email + password login never
      // becomes possible otherwise.
      setStage("set-password");
    }
    void activate();
  }, [searchParams]);

  async function savePassword() {
    setFormError("");
    if (password.length < 8) { setFormError("Parola trebuie să aibă minimum 8 caractere."); return; }
    if (password !== confirm) { setFormError("Parolele nu coincid."); return; }
    setStage("saving");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setFormError("Parola nu a putut fi salvată. Poți încerca din nou sau continua fără parolă.");
      setStage("set-password");
      return;
    }
    router.replace("/accountant");
    router.refresh();
  }

  function skip() {
    router.replace("/accountant");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">Franchisetech</p>
        <h1 className="mt-3 text-2xl font-bold">Activare acces contabil</h1>

        {stage === "checking" && (
          <p className="mt-3 text-sm text-muted-foreground">Verificăm invitația și pregătim portalul contabil…</p>
        )}

        {stage === "error" && (
          <p className="mt-3 text-sm text-muted-foreground">{error}</p>
        )}

        {(stage === "set-password" || stage === "saving") && (
          <div className="mt-5 space-y-4 text-left">
            <p className="text-sm text-muted-foreground">
              Ești conectat/ă. Alege o parolă ca să te poți autentifica direct data viitoare, fără link nou de invitație.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="accountant-new-password">Parolă nouă</Label>
              <Input
                id="accountant-new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={stage === "saving"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountant-confirm-password">Confirmă parola</Label>
              <Input
                id="accountant-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={stage === "saving"}
              />
            </div>
            {formError && <p className="text-sm text-attention">{formError}</p>}
            <Button type="button" className="w-full" disabled={stage === "saving"} onClick={() => void savePassword()}>
              {stage === "saving" ? "Se salvează…" : "Salvează și continuă"}
            </Button>
            <button
              type="button"
              onClick={skip}
              disabled={stage === "saving"}
              className="w-full text-center text-xs text-muted-foreground hover:underline"
            >
              Sar peste — intru direct în portal
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
