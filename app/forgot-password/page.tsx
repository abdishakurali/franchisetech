"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthPageFrame } from "@/components/auth/AuthPageFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAppI18n } from "@/lib/app-i18n-context";
import { mapSupabaseAuthError } from "@/lib/auth-error-messages";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const { t, locale } = useAppI18n();
  const a = t.auth.forgotPassword;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) {
      // Don't reveal whether the email exists — same success message either way.
      toast.error(mapSupabaseAuthError(error.message, locale));
      return;
    }
    setSent(true);
  };

  return (
    <AuthPageFrame>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{a.title}</CardTitle>
          <CardDescription>{a.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {a.success}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{a.email}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nume@cafeneaua.ro"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? a.submitting : a.submit}
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-slate-500 mt-4">
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              {a.backToLogin}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthPageFrame>
  );
}
