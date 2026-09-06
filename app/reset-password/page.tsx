"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPageFrame } from "@/components/auth/AuthPageFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAppI18n } from "@/lib/app-i18n-context";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useAppI18n();
  const a = t.auth.resetPassword;
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // The recovery link's code exchange (via /api/auth/callback) already ran
    // before landing here — this only confirms it produced a real session,
    // since a stale/reused link lands here with none.
    supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(a.tooShort);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(a.mismatch);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(a.success);
    router.push("/app");
    router.refresh();
  };

  return (
    <AuthPageFrame>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{a.title}</CardTitle>
          <CardDescription>{a.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {hasSession === false ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {a.invalidLink}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">{a.password}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={a.passwordPlaceholder}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">{a.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={a.passwordPlaceholder}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || hasSession === null}>
                {loading ? a.submitting : a.submit}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthPageFrame>
  );
}
