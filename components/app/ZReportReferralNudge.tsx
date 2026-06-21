"use client";

import { useEffect, useState } from "react";
import { CopyReferralButton } from "@/components/app/CopyReferralButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppI18n } from "@/lib/app-i18n-context";

const storageKey = (orgId: string) => `franchisetech_z_referral_dismissed_${orgId}`;

type Props = {
  orgId: string;
  referralLink: string;
  show: boolean;
};

/** After first Z-report day with sales — one-time referral nudge (RO copy via i18n). */
export function ZReportReferralNudge({ orgId, referralLink, show }: Props) {
  const { t } = useAppI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show || !referralLink) return;
    try {
      if (localStorage.getItem(storageKey(orgId)) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, [show, referralLink, orgId]);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(storageKey(orgId), "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50/80 print:hidden">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-emerald-950">{t.shell.zReportReferralTitle}</p>
          <p className="mt-1 text-sm text-emerald-900/90">{t.shell.zReportReferralDesc}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <CopyReferralButton link={referralLink} />
          <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
            {t.shell.zReportReferralDismiss}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
