"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleIcon } from "@/components/ui/google-icon";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const googleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const authError = searchParams.get("error");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully");
      router.push("/app");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Thermometer className="h-7 w-7 text-blue-600" />
          <span className="font-bold text-slate-900 text-xl">FridgeProof</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Enter your email and password to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {authError === "google_not_configured" || authError === "oauth_callback_failed"
                  ? "Google sign-in is not configured yet. Please use email login or configure Google OAuth in Supabase."
                  : "Authentication failed. Please try again."}
              </div>
            )}
            {googleAuthEnabled && (
              <>
                <Link href="/auth/google">
                  <Button type="button" variant="outline" className="w-full mb-4 gap-2">
                    <GoogleIcon />
                    Continue with Google
                  </Button>
                </Link>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-xs text-slate-400">or</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
              </>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@yourbistro.ie"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
              No account yet?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up free
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
