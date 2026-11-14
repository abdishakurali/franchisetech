import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Next's redirect/notFound throw in real use; model that so the test proves
// a refused user never reaches code after the gate.
const redirect = vi.fn((to: string) => { throw new Error(`REDIRECT:${to}`); });
const notFound = vi.fn(() => { throw new Error("NOT_FOUND"); });
vi.mock("next/navigation", () => ({ redirect: (to: string) => redirect(to), notFound: () => notFound() }));

let currentUser: unknown = null;
vi.mock("@/lib/supabase/server", () => ({
  getAuthUser: async () => ({ data: { user: currentUser } }),
}));

import { adminAccessFor, requirePlatformAdmin } from "@/lib/admin/access";

const confirmed = "2026-01-01T00:00:00Z";

describe("adminAccessFor", () => {
  beforeEach(() => { process.env.LEAD_ADMIN_EMAILS = "boss@franchisetech.ro, second@example.com"; });
  afterEach(() => { delete process.env.LEAD_ADMIN_EMAILS; });

  it("sends anonymous visitors to login", () => {
    expect(adminAccessFor(null)).toBe("login");
    expect(adminAccessFor(undefined)).toBe("login");
  });

  it("allows a confirmed allow-listed email, case-insensitively", () => {
    expect(adminAccessFor({ email: "Boss@FranchiseTech.ro", email_confirmed_at: confirmed })).toBe("allow");
    expect(adminAccessFor({ email: "second@example.com", email_confirmed_at: confirmed })).toBe("allow");
  });

  it("refuses an allow-listed email that is not confirmed", () => {
    expect(adminAccessFor({ email: "boss@franchisetech.ro", email_confirmed_at: undefined })).toBe("deny");
  });

  it("refuses café owners, managers and cashiers (org role is irrelevant)", () => {
    for (const email of ["owner@dolcenera.ro", "manager@cafe.ro", "cashier@cafe.ro"]) {
      expect(adminAccessFor({ email, email_confirmed_at: confirmed })).toBe("deny");
    }
  });

  it("refuses look-alike emails", () => {
    expect(adminAccessFor({ email: "boss@franchisetech.ro.evil.com", email_confirmed_at: confirmed })).toBe("deny");
    expect(adminAccessFor({ email: "xboss@franchisetech.ro", email_confirmed_at: confirmed })).toBe("deny");
  });

  it("falls back to the company inbox only when the env var is unset", () => {
    delete process.env.LEAD_ADMIN_EMAILS;
    expect(adminAccessFor({ email: "info@franchisetech.ro", email_confirmed_at: confirmed })).toBe("allow");
    expect(adminAccessFor({ email: "boss@franchisetech.ro", email_confirmed_at: confirmed })).toBe("deny");
  });
});

describe("requirePlatformAdmin", () => {
  beforeEach(() => {
    process.env.LEAD_ADMIN_EMAILS = "boss@franchisetech.ro";
    redirect.mockClear();
    notFound.mockClear();
  });

  it("redirects anonymous users to /login", async () => {
    currentUser = null;
    await expect(requirePlatformAdmin()).rejects.toThrow("REDIRECT:/login");
    expect(notFound).not.toHaveBeenCalled();
  });

  it("returns 404 for a signed-in non-admin", async () => {
    currentUser = { id: "u1", email: "owner@cafe.ro", email_confirmed_at: confirmed };
    await expect(requirePlatformAdmin()).rejects.toThrow("NOT_FOUND");
  });

  it("returns the user for an admin", async () => {
    currentUser = { id: "u2", email: "boss@franchisetech.ro", email_confirmed_at: confirmed };
    await expect(requirePlatformAdmin()).resolves.toMatchObject({ id: "u2" });
    expect(redirect).not.toHaveBeenCalled();
    expect(notFound).not.toHaveBeenCalled();
  });
});

describe("every /admin page calls the gate before reading data", () => {
  it("each page.tsx and the layout call requirePlatformAdmin, and the gate precedes createServiceClient", async () => {
    const { readFileSync, readdirSync, statSync } = await import("node:fs");
    const { join } = await import("node:path");
    const root = join(process.cwd(), "app/admin");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (name === "page.tsx" || name === "layout.tsx" || name === "route.ts") files.push(p);
      }
    };
    walk(root);
    expect(files.length).toBeGreaterThanOrEqual(6);
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      const gate = src.indexOf("await requirePlatformAdmin()");
      expect(gate, `${file} must call requirePlatformAdmin`).toBeGreaterThan(-1);
      const service = src.indexOf("createServiceClient()");
      if (service > -1) expect(service, `${file}: gate must come before the service client`).toBeGreaterThan(gate);
      expect(src.includes('"use client"'), `${file} must stay a server component`).toBe(false);
    }
  });
});
