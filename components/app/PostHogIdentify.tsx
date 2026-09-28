"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { deriveAccountType } from "@/lib/analytics/account-type";

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
    const accountType = deriveAccountType(email, orgName);
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
