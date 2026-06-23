import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { updateSupplier, deleteSupplier } from "@/app/actions/kitchenops";
import { SupplierFormFields } from "@/components/app/SupplierForm";

export default async function SupplierEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, orgId } = await getKitchenOpsContext();

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (!supplier) return <div className="p-6 text-slate-500">Supplier not found.</div>;

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/suppliers" className="text-sm text-slate-500 hover:text-slate-700">← Suppliers</Link>
        <h1 className="text-2xl font-semibold text-slate-950">Edit supplier</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Edit: {supplier.name}</CardTitle></CardHeader>
        <CardContent>
          <form action={updateSupplier as unknown as (fd: FormData) => Promise<void>} className="space-y-3">
            <input type="hidden" name="id" value={id} />
            <SupplierFormFields supplier={supplier} />
            <div className="flex gap-3 pt-2">
              <Link href="/app/suppliers"><Button variant="outline" type="button">Cancel</Button></Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader><CardTitle className="text-red-700">Remove supplier</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-3">Hides this supplier from the list. Existing purchases are preserved.</p>
          <form action={deleteSupplier as unknown as (fd: FormData) => Promise<void>}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">Remove supplier</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
