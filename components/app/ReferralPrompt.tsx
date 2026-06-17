"use client";

import { useState } from "react";
import { CopyReferralButton } from "@/components/app/CopyReferralButton";
import { Button } from "@/components/ui/button";

export function ReferralPrompt({ link }: { link: string }) {
  const [show, setShow] = useState(() => typeof window !== "undefined" && localStorage.getItem("franchisetech-referral-prompt-dismissed") !== "1");
  if (!show) return null;
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p className="font-semibold text-slate-950">Know another café owner?</p>
      <p className="mt-1 text-sm text-slate-600">Share franchisetech with them. If they join, you get 1 free month.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyReferralButton link={link} />
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            localStorage.setItem("franchisetech-referral-prompt-dismissed", "1");
            setShow(false);
          }}
        >
          Maybe later
        </Button>
      </div>
    </div>
  );
}
