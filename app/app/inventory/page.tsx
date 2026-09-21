import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { requireBusinessModule } from "@/lib/module-guard";
import { startInventoryCount } from "@/app/actions/kitchenops";

export default async function InventoryCountsPage() {
  await requireBusinessModule("inventory");
  const { supabase, orgId } = await getKitchenOpsContext();

  const { data: counts } = await supabase
    .from("inventory_counts")
    .select("id,status,started_at,completed_at")
    .eq("organisation_id", orgId)
    .order("started_at", { ascending: false })
    .limit(50);

  const draft = (counts ?? []).find((c) => c.status === "draft");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inventar</h1>
          <p className="text-sm text-muted-foreground">
            Numărătoare fizică de stoc — comparați cantitatea numărată cu cea din sistem și aplicați diferențele dintr-o dată.
          </p>
        </div>
        {draft ? (
          <Link href={`/app/inventory/${draft.id}`}>
            <Button>Continuă numărătoarea în curs</Button>
          </Link>
        ) : (
          <form action={startInventoryCount}>
            <Button type="submit">Începe o numărătoare nouă</Button>
          </form>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Istoric numărători</CardTitle>
        </CardHeader>
        <CardContent>
          {!counts?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nicio numărătoare de inventar încă.
            </p>
          ) : (
            <div className="divide-y">
              {counts.map((c) => (
                <Link
                  key={c.id}
                  href={`/app/inventory/${c.id}`}
                  className="flex items-center justify-between py-3 hover:bg-secondary -mx-2 px-2 rounded"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(c.started_at).toLocaleString("ro-RO")}
                    </p>
                    {c.completed_at ? (
                      <p className="text-xs text-muted-foreground">
                        Finalizat {new Date(c.completed_at).toLocaleString("ro-RO")}
                      </p>
                    ) : null}
                  </div>
                  <Badge
                    variant="secondary"
                    className={c.status === "completed" ? "bg-reconciled/10 text-reconciled" : "bg-amber-100 text-amber-700"}
                  >
                    {c.status === "completed" ? "Finalizată" : "În curs"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
