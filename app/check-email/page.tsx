"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const COOLDOWN_SECONDS = 60;

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<CheckEmailFrame />}>
      <CheckEmailContent />
    </Suspense>
  );
}

function CheckEmailFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center mb-8">
          <Image src="/franchise-tech-logo.png" alt="franchisetech" width={220} height={40} className="h-10 w-auto" priority />
        </div>
        {children}
      </div>
    </div>
  );
}

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0 || loading) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Emailul de confirmare a fost retrimis.");
      setCooldown(COOLDOWN_SECONDS);
    }
  };

  return (
    <CheckEmailFrame>
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">Verifică emailul</h1>
        {email ? (
          <p className="text-slate-500 mb-2">
            Am trimis linkul de confirmare la <span className="font-medium text-slate-700">{email}</span>.
          </p>
        ) : (
          <p className="text-slate-500 mb-2">
            Am trimis linkul de confirmare pe adresa dumneavoastră de email.
          </p>
        )}
        <p className="text-slate-500 mb-8">
          Apăsați linkul pentru confirmarea contului, apoi autentificați-vă ca să terminați configurarea.
        </p>

        <div className="space-y-3">
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Mergi la autentificare
            </Button>
          </Link>

          {email && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleResend}
              disabled={loading || cooldown > 0}
            >
              <RotateCcw className="h-4 w-4" />
              {cooldown > 0
                ? `Poți retrimite în ${cooldown}s`
                : loading
                ? "Se trimite..."
                : "Retrimite emailul de confirmare"}
            </Button>
          )}

          <Link href="/signup">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Înapoi la înscriere
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Nu ați primit emailul? Verificați folderul spam sau{" "}
          {email ? "folosește butonul de retrimitere" : "încearcă înscrierea din nou"}.
        </p>
    </CheckEmailFrame>
  );
}
