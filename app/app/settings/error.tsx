"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppI18n } from "@/lib/app-i18n-context";

export default function PageError() {
  const { t } = useAppI18n();
  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <p className="text-slate-900 font-semibold mb-2">{t.errors.title}</p>
      <p className="text-slate-500 text-sm mb-4">{t.errors.safeDataShort}</p>
      <Link href="/app"><Button className="bg-blue-600 hover:bg-blue-700 text-white">{t.errors.backToDashboard}</Button></Link>
    </div>
  );
}
