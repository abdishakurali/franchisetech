"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PageHelp({ title, purpose, first, good }: { title: string; purpose: string; first: string; good: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Need help?
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/30 p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-lg bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <button type="button" className="text-muted-foreground hover:text-mid" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-mid">
              <p><strong className="text-foreground">What this page is for:</strong> {purpose}</p>
              <p><strong className="text-foreground">What to click first:</strong> {first}</p>
              <p><strong className="text-foreground">What good looks like:</strong> {good}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
