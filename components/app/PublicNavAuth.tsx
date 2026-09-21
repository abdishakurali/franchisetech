"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function PublicNavAuth({ email, name }: { email?: string | null; name?: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!email) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
        <Link href="/signup"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Începeți proba</Button></Link>
      </div>
    );
  }

  const displayName = name || email;

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm">
        <UserCircle className="h-4 w-4 text-brass" />
        <span className="hidden max-w-36 truncate sm:inline">{displayName}</span>
      </summary>
      <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card p-2 shadow-lg">
        <Link href="/app" className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">Dashboard</Link>
        <Link href="/app/profile" className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">Profile</Link>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-attention hover:bg-attention/10">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </details>
  );
}
