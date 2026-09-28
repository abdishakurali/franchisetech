"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppI18n } from "@/lib/app-i18n-context";

export default function PageError() {
  const { t } = useAppI18n();
  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <p className="text-foreground font-semibold mb-2">{t.errors.title}</p>
      <p className="text-muted-foreground text-sm mb-4">{t.errors.safeDataShort}</p>
      <Link href="/app"><Button className="bg-primary hover:bg-primary/90 text-primary-foreground">{t.errors.backToDashboard}</Button></Link>
    </div>
  );
}
