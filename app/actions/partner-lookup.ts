"use server";

import { lookupRomanianCompanyByCui } from "@/lib/anaf/company-lookup";

export async function lookupAnafCompany(cui: string) {
  return lookupRomanianCompanyByCui(cui);
}
