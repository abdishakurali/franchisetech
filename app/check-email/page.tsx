"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const COOLDOWN_SECONDS = 60;

export default function CheckEmailPage() {
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
      toast.success("Confirmation email resent — check your inbox.");
      setCooldown(COOLDOWN_SECONDS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center mb-8">
          <img src="/franchise-tech-logo.png" alt="franchisetech" className="h-10 w-auto" />
        </div>

        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">Check your email</h1>
        {email ? (
          <p className="text-slate-500 mb-2">
            We sent a confirmation link to <span className="font-medium text-slate-700">{email}</span>.
          </p>
        ) : (
          <p className="text-slate-500 mb-2">
            We sent a confirmation link to your email address.
          </p>
        )}
        <p className="text-slate-500 mb-8">
          Click the link to confirm your account, then come back here to sign in and finish setup.
        </p>

        <div className="space-y-3">
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Go to sign in
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
                ? `Resend available in ${cooldown}s`
                : loading
                ? "Sending…"
                : "Resend confirmation email"}
            </Button>
          )}

          <Link href="/signup">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to sign up
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Didn&apos;t receive an email? Check your spam folder or{" "}
          {email ? "use the resend button above" : "try signing up again"}.
        </p>
      </div>
    </div>
  );
}
