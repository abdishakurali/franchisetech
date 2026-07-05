"use client";

import { Button } from "@/components/ui/button";

export function ChatRequestButton({ label }: { label: string }) {
  return (
    <Button
      size="sm"
      variant="default"
      className="h-7 text-xs"
      onClick={() =>
        (window as { $chatwoot?: { toggle: (s: string) => void } }).$chatwoot?.toggle("open")
      }
    >
      {label}
    </Button>
  );
}
