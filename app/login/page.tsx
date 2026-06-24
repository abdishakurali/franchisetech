"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPageFrame } from "@/components/auth/AuthPageFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleIcon } from "@/components/ui/google-icon";
import { createClient } from "@/lib/supabase/client";
import { useAppI18n } from "@/lib/app-i18n-context";
import { toast } from "sonner";

const googleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t } = useAppI18n();
  const a = t.auth.login;
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
      toast.success(a.success);
      router.push("/app");
      router.refresh();
    }
  };

  return (
    <AuthPageFrame>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{a.title}</CardTitle>
          <CardDescription>{a.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {authError === "google_not_configured" || authError === "oauth_callback_failed"
                ? a.errors.googleNotConfigured
                : a.errors.authFailed}
            </div>
          )}
          {googleAuthEnabled && (
            <>
              <Link href="/auth/google">
                <Button type="button" variant="outline" className="w-full mb-4 gap-2">
                  <GoogleIcon />
                  {a.google}
                </Button>
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs text-slate-400">{a.or}</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
            </>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{a.email}</Label>
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
              <Label htmlFor="password">{a.password}</Label>
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
              {loading ? a.submitting : a.submit}
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            {a.noAccount}{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              {a.signUpLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthPageFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
