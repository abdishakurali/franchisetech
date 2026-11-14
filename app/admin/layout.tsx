import type { Metadata } from "next";
import { adminAccessFor, requirePlatformAdmin } from "@/lib/admin/access";
import { getAuthUser } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * The admin title only for admins: everyone else gets the site's default
 * 404 title, so the <title> of the 404 page doesn't reveal the panel exists.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { data: { user } } = await getAuthUser();
  const robots = { index: false, follow: false };
  return adminAccessFor(user) === "allow" ? { title: "Admin franchisetech", robots } : { robots };
}
export const dynamic = "force-dynamic";

/**
 * Internal operations panel (founder only). Read-only. The gate runs here AND
 * in every page: the layout keeps the chrome from rendering for anyone else,
 * the per-page call is what protects the data.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePlatformAdmin();
  return (
    <div lang="ro" className="app-shell min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:gap-8 md:py-8">
        <aside className="md:w-52 md:shrink-0">
          <div className="mb-4 flex items-center gap-2">
            <img src="/marketing/franchise-tech-logo.png" alt="franchisetech" className="h-7 w-auto" />
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">admin</span>
          </div>
          <AdminNav />
          <p className="mt-6 hidden break-all text-xs text-muted-foreground md:block">{user.email}</p>
          <p className="mt-1 hidden text-xs text-muted-foreground md:block">Doar citire · date live</p>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
