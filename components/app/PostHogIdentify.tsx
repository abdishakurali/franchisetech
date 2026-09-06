"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

type Props = {
  userId: string;
  email?: string | null;
  orgId?: string | null;
  orgName?: string | null;
};

/** Links authenticated app users to PostHog persons (client-side). */
export function PostHogIdentify({ userId, email, orgId, orgName }: Props) {
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    const normalizedEmail = email?.toLowerCase() ?? "";
    const normalizedOrg = orgName?.toLowerCase() ?? "";
    const accountType = normalizedEmail.endsWith("@franchisetech.ro")
      ? "internal"
      : normalizedOrg.includes("test")
        ? "test"
        : normalizedOrg.includes("demo")
          ? "demo"
          : "real_customer";
    posthog.identify(userId, {
      email: email ?? undefined,
      org_id: orgId ?? undefined,
      org_name: orgName ?? undefined,
      account_type: accountType,
    });
    if (orgId) {
      posthog.group("organisation", orgId, { name: orgName ?? undefined, account_type: accountType });
    }
  }, [userId, email, orgId, orgName]);

  return null;
}
