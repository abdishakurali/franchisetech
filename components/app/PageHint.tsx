"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function PageHint({ id, children }: { id: string; children: React.ReactNode }) {
  const key = `kitchenops_hint_${id}`;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(key) === "dismissed") {
      window.setTimeout(() => setVisible(false), 0);
    }
  }, [key]);

  if (!visible) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-brass/25 bg-accent p-4 text-sm text-foreground">
      <div>{children}</div>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(key, "dismissed");
          setVisible(false);
        }}
        className="rounded-md p-1 text-brass hover:bg-accent hover:text-brass"
        aria-label="Dismiss tip"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
