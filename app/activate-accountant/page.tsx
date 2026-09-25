"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseAccountantActivation } from "@/lib/auth/accountant-activation";

export default function ActivateAccountantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

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
        return;
      }
      router.replace("/accountant");
      router.refresh();
    }
    void activate();
  }, [router, searchParams]);

  return <main className="flex min-h-screen items-center justify-center bg-background p-6"><section className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">Franchisetech</p><h1 className="mt-3 text-2xl font-bold">Activare acces contabil</h1><p className="mt-3 text-sm text-muted-foreground">{error || "Verificăm invitația și pregătim portalul contabil…"}</p></section></main>;
}
