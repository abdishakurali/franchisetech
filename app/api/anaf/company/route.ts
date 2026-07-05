export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { lookupRomanianCompanyByCui } from "@/lib/anaf/company-lookup";

export async function GET(req: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const raw = new URL(req.url).searchParams.get("cui") ?? "";
  const cui = raw.replace(/[^0-9]/g, "");
  if (cui.length < 6 || cui.length > 10) {
    return NextResponse.json({ success: false, error: "CUI invalid" }, { status: 400 });
  }

  try {
    const company = await lookupRomanianCompanyByCui(cui);
    if (!company) {
      return NextResponse.json({ success: false, error: "Firma nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      denumire: company.name,
      adresa: company.address,
      vatRegistered: company.vatRegistered,
      caenCode: "",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Eroare de conexiune — încearcă din nou" },
      { status: 502 }
    );
  }
}
