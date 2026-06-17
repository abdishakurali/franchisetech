"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DemoToolsButton() {
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/seed-demo", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !data.success) return toast.error(data.error ?? "Could not load demo data");
    toast.success("Demo kitchen data loaded");
    setTimeout(() => window.location.href = "/app", 600);
  };
  return (
    <Button onClick={load} disabled={loading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      Load founder demo data
    </Button>
  );
}
