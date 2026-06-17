"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

export function DateFilter({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("period") ?? current;

  return (
    <div className="flex gap-1.5 flex-wrap">
      {PERIODS.map(({ value, label }) => (
        <Button
          key={value}
          size="sm"
          variant={active === value ? "default" : "outline"}
          className={active === value ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-600"}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("period", value);
            router.push(`/app?${params.toString()}`);
          }}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
