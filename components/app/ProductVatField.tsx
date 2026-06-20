"use client";

import { useState } from "react";
import type { OrgVatRate } from "@/lib/vat-rates";
import { VatRateSelect } from "@/components/app/VatRateSelect";

type Props = {
  rates: OrgVatRate[];
  defaultRate: number;
  name?: string;
};

export function ProductVatField({ rates, defaultRate, name = "vat_rate" }: Props) {
  const [value, setValue] = useState(String(defaultRate));
  return <VatRateSelect rates={rates} value={value} onChange={setValue} name={name} />;
}
