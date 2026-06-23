"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { lookupAnafCompany } from "@/app/actions/partner-lookup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SupplierFormValue = {
  name?: string | null;
  tax_id?: string | null;
  vat_registered?: boolean | null;
  registration_code?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
};

export function SupplierFormFields({ supplier }: { supplier?: SupplierFormValue }) {
  const [pending, startTransition] = useTransition();
  const [cui, setCui] = useState(supplier?.tax_id ?? "");
  const [name, setName] = useState(supplier?.name ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [vatRegistered, setVatRegistered] = useState(Boolean(supplier?.vat_registered));
  const [registrationCode, setRegistrationCode] = useState(supplier?.registration_code ?? "");

  function lookup() {
    if (!cui.trim()) return toast.error("Introdu CUI-ul.");
    startTransition(async () => {
      const result = await lookupAnafCompany(cui);
      if (!result) {
        toast.error("Firma nu a fost găsită în ANAF.");
        return;
      }
      setCui(result.cui);
      setName(result.name);
      setAddress(result.address);
      setVatRegistered(result.vatRegistered);
      setRegistrationCode(result.registrationCode);
      toast.success("Date preluate din ANAF.");
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>CUI</Label>
        <div className="mt-1 flex gap-2">
          <Input name="tax_id" value={cui} onChange={(e) => setCui(e.target.value)} placeholder="ex: 12345678" />
          <Button type="button" variant="outline" onClick={lookup} disabled={pending}>
            <Search className="mr-1.5 h-4 w-4" /> ANAF
          </Button>
        </div>
      </div>
      <div><Label>Name *</Label><Input name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Fresh Foods Supplier" /></div>
      <input type="hidden" name="registration_code" value={registrationCode} />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="vat_registered" checked={vatRegistered} onChange={(e) => setVatRegistered(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
        Plătitor de TVA
      </label>
      <div><Label>Contact name</Label><Input name="contact_name" defaultValue={supplier?.contact_name ?? ""} placeholder="John Smith" /></div>
      <div><Label>Email</Label><Input name="email" type="email" defaultValue={supplier?.email ?? ""} placeholder="orders@supplier.ie" /></div>
      <div><Label>Phone</Label><Input name="phone" defaultValue={supplier?.phone ?? ""} placeholder="+40 700 000 000" /></div>
      <div><Label>Address</Label><Input name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresă sediu" /></div>
      <div><Label>Notes</Label><Input name="notes" defaultValue={supplier?.notes ?? ""} placeholder="Weekly produce and ingredients" /></div>
    </div>
  );
}
