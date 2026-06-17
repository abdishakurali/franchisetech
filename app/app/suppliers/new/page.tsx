import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { addSupplier } from "@/app/actions/kitchenops";

export default async function SuppliersNewPage() {
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
            <div><Label>Name *</Label><Input name="name" required placeholder="Fresh Foods Supplier" autoFocus /></div>
            <div><Label>Contact name</Label><Input name="contact_name" placeholder="John Smith" /></div>
            <div><Label>Email</Label><Input name="email" type="email" placeholder="orders@supplier.ie" /></div>
            <div><Label>Phone</Label><Input name="phone" placeholder="+353 1 234 5678" /></div>
            <div><Label>Address</Label><Input name="address" placeholder="123 Main St, Dublin" /></div>
            <div><Label>Notes</Label><Input name="notes" placeholder="Weekly produce and ingredients" /></div>
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
