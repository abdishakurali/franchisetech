"use client";

import Link from "next/link";
import { useAppI18n } from "@/lib/app-i18n-context";

export default function Error() {
  const { t } = useAppI18n();
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-slate-900">{t.errors.loadPage}</h2>
      <p className="mt-2 text-sm text-slate-500">{t.errors.safeData}</p>
      <Link href="/app" className="mt-4 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        {t.errors.backToDashboard}
      </Link>
    </div>
  );
}
