"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserLocale } from "@/app/actions/locale";
import { APP_LOCALE_CHANGE_EVENT, type PosLocale } from "@/lib/pos-i18n";

const localeOptions = [
  { value: "en" as const, label: "English", flag: "🌐" },
  { value: "ro" as const, label: "Română", flag: "🇷🇴" },
];

type Props = {
  initialLocale: PosLocale;
  className?: string;
};

export function AppLocaleSwitcher({ initialLocale, className }: Props) {
  const router = useRouter();
  const [locale, setLocale] = useState<PosLocale>(initialLocale);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.lang = locale === "ro" ? "ro" : "en";
  }, [locale]);

  function onChange(value: string) {
    const next = value as PosLocale;
    if (next !== "en" && next !== "ro" || next === locale) return;

    setLocale(next);
    startTransition(async () => {
      const result = await updateUserLocale(next);
      if (!result.ok) {
        setLocale(initialLocale);
        toast.error("Could not save language preference.");
        return;
      }
      window.dispatchEvent(new Event(APP_LOCALE_CHANGE_EVENT));
      router.refresh();
    });
  }

  const current = localeOptions.find((o) => o.value === locale) ?? localeOptions[0];

  return (
    <Select value={locale} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className={className ?? "w-full max-w-xs"} aria-label="Language">
        <SelectValue placeholder="Language">
          {`${current.flag} ${current.label}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {localeOptions.map(({ value, label, flag }) => (
          <SelectItem key={value} value={value}>
            {`${flag} ${label}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export type { PosLocale };
