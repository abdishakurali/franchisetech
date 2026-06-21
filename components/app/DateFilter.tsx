"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppI18n } from "@/lib/app-i18n-context";

export function DateFilter({ current }: { current: string }) {
  const { t } = useAppI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("period") ?? current;

  const PERIODS = [
    { value: "today", label: t.period.today },
    { value: "week", label: t.period.week },
    { value: "month", label: t.period.month },
  ];

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
