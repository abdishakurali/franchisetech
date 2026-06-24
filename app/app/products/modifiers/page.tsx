import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ModifiersPage() {
  const { supabase, orgId, membership } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText();

  const canManage = ["owner", "manager"].includes(membership.role ?? "");
  if (!canManage) redirect("/app/products");

  const { data: groups } = await supabase
    .from("modifier_groups")
    .select("id,name,required,multiple,min_selections,max_selections,sort_order,active,modifier_options(id,name,price_delta,active)")
    .eq("organisation_id", orgId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const activeGroups = (groups ?? []).filter((g) => g.active !== false);
  const allGroups = groups ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/products" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-950">
            {t.products?.modifiers?.title ?? "Product modifiers"}
          </h1>
          <p className="text-sm text-slate-500">
            {t.products?.modifiers?.desc ?? "Add-ons, variants, and options that customers choose at the time of sale."}
          </p>
        </div>
        <Link href="/app/products/modifiers/new">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            {t.products?.modifiers?.addGroup ?? "New modifier group"}
          </Button>
        </Link>
      </div>

      {allGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-slate-500 text-sm">
              {t.products?.modifiers?.emptyState ?? "No modifier groups yet. Create your first to add options like \"Extra shot\" or \"Milk type\" to products."}
            </p>
            <Link href="/app/products/modifiers/new">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t.products?.modifiers?.addGroup ?? "New modifier group"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allGroups.map((group) => {
            const options = (group.modifier_options ?? []) as { id: string; name: string; price_delta: number; active: boolean }[];
            const activeOptions = options.filter((o) => o.active !== false);
            return (
              <Card key={group.id} className={group.active === false ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {group.required ? (t.products?.modifiers?.required ?? "Required") : (t.products?.modifiers?.optional ?? "Optional")}
                        {group.multiple ? ` · ${t.products?.modifiers?.multiSelect ?? "Multi-select"}` : ""}
                        {group.max_selections ? ` · max ${group.max_selections}` : ""}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {group.active === false && (
                        <Badge variant="outline" className="text-slate-400">Inactive</Badge>
                      )}
                      <Link href={`/app/products/modifiers/${group.id}/edit`}>
                        <Button variant="outline" size="sm">{t.common.edit}</Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeOptions.length === 0 ? (
                    <p className="text-xs text-slate-400">{t.products?.modifiers?.noOptions ?? "No options yet."}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {activeOptions.map((opt) => (
                        <span key={opt.id} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                          {opt.name}
                          {Number(opt.price_delta) !== 0 && (
                            <span className="text-blue-600 font-medium">
                              {Number(opt.price_delta) > 0 ? `+${Number(opt.price_delta).toFixed(2)}` : Number(opt.price_delta).toFixed(2)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-400">
        {activeGroups.length} {t.products?.modifiers?.activeGroups ?? "active group(s)"}
        {" · "}
        <Link href="/app/products" className="text-blue-600 hover:underline">
          {t.products?.modifiers?.assignToProducts ?? "Assign to products from the product edit page"}
        </Link>
      </p>
    </div>
  );
}
