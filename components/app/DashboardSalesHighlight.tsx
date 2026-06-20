"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardSalesHighlight({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [highlight, setHighlight] = useState(searchParams.get("celebrate") === "1");

  useEffect(() => {
    if (!highlight) return;
    const timer = window.setTimeout(() => setHighlight(false), 4500);
    return () => window.clearTimeout(timer);
  }, [highlight]);

  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-500",
        highlight && "ring-2 ring-green-400 ring-offset-2 shadow-md shadow-green-100",
      )}
    >
      {children}
    </div>
  );
}
