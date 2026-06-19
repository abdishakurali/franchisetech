"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthBrand } from "@/components/marketing/AuthBrand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleIcon } from "@/components/ui/google-icon";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const googleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else if (data.session) {
      // Email confirmation is off — user is immediately signed in
      toast.success("Account created! Let's set up your organisation.");
      router.push("/onboarding");
      router.refresh();
    } else {
      // Email confirmation is on — show waiting state
      toast.success("Account created! Check your email to confirm.");
      router.push("/check-email");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthBrand />

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Start your free account</CardTitle>
            <CardDescription>Built for cafes, restaurants, and food businesses. No credit card needed.</CardDescription>
          </CardHeader>
          <CardContent>
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
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Aoife Murphy"
                />
              </div>
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
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
            <p className="text-center text-xs text-slate-400 mt-4">
              By signing up you agree that franchisetech supports your records — it does not replace your legal obligations as a food business operator.
            </p>
            <p className="text-center text-sm text-slate-500 mt-3">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
