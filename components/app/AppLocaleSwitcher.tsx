"use client";

import type { PosLocale } from "@/lib/pos-i18n";
import { PlatformLocaleSwitcher } from "@/components/shared/PlatformLocaleSwitcher";

type Props = {
  orgIsRO?: boolean;
  className?: string;
};

export function AppLocaleSwitcher({ orgIsRO = false, className }: Props) {
  return <PlatformLocaleSwitcher scope="app" orgIsRO={orgIsRO} className={className} />;
}

export type { PosLocale };
