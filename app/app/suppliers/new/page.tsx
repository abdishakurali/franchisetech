import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { addSupplier } from "@/app/actions/kitchenops";
import { requireBusinessModule } from "@/lib/module-guard";
import { SupplierFormFields } from "@/components/app/SupplierForm";

export default async function SuppliersNewPage() {
  await requireBusinessModule("inventory");
  await getKitchenOpsContext();
  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/suppliers" className="text-sm text-slate-500 hover:text-slate-700">← Suppliers</Link>
        <h1 className="text-2xl font-semibold text-slate-950">Add supplier</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Supplier details</CardTitle></CardHeader>
        <CardContent>
          <form action={addSupplier as unknown as (fd: FormData) => Promise<void>} className="space-y-3">
            <SupplierFormFields />
            <div className="flex gap-3 pt-2">
              <Link href="/app/suppliers"><Button variant="outline" type="button">Cancel</Button></Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Add supplier</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
