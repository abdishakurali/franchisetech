"use client";

import { Button } from "@/components/ui/button";
import { useAppI18n } from "@/lib/app-i18n-context";

export function PrintButton({ label }: { label?: string }) {
  const { t } = useAppI18n();
  return (
    <Button type="button" onClick={() => window.print()}>
      {label ?? t.common.print}
    </Button>
  );
}
