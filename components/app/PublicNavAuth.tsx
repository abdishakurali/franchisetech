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
        <Link href="/signup"><Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">Start free trial</Button></Link>
      </div>
    );
  }

  const displayName = name || email;

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
        <UserCircle className="h-4 w-4 text-blue-600" />
        <span className="hidden max-w-36 truncate sm:inline">{displayName}</span>
      </summary>
      <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-100 bg-white p-2 shadow-lg">
        <Link href="/app" className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Dashboard</Link>
        <Link href="/app/profile" className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</Link>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </details>
  );
}
