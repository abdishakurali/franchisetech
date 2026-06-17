"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateKitchenOrderStatus } from "@/app/actions/kitchenops";
import { Package } from "lucide-react";

type KitchenOrderItem = {
  id: string;
  name: string;
  quantity: number;
  note: string | null;
  unit_price: number | string | null;
  line_total: number | string | null;
  image_url: string | null;
  modifiers: Record<string, unknown> | null;
  kitchen_station: string | null;
};

type KitchenOrder = {
  id: string;
  order_number: string | null;
  status: "sent" | "preparing" | "ready" | "completed";
  created_at: string;
  order_type: string | null;
  table_label: string | null;
  note: string | null;
  kitchen_order_items: KitchenOrderItem[];
};

const COLUMNS: Array<{
  status: KitchenOrder["status"];
  title: string;
  next?: KitchenOrder["status"];
  action?: string;
  headerCls: string;
  borderCls: string;
  btnCls: string;
}> = [
  { status: "sent",      title: "🔵 NEW",       next: "preparing", action: "Start preparing", headerCls: "text-blue-700",  borderCls: "border-blue-200  bg-blue-50/60",  btnCls: "bg-blue-600 hover:bg-blue-700 text-white" },
  { status: "preparing", title: "🟡 PREPARING", next: "ready",     action: "Mark ready",      headerCls: "text-amber-700", borderCls: "border-amber-200 bg-amber-50/60", btnCls: "bg-amber-500 hover:bg-amber-600 text-white" },
  { status: "ready",     title: "🟢 READY",     next: "completed", action: "Complete",        headerCls: "text-green-700", borderCls: "border-green-200 bg-green-50/60", btnCls: "bg-green-600 hover:bg-green-700 text-white" },
  { status: "completed", title: "✓ DONE",                                                     headerCls: "text-slate-500", borderCls: "border-slate-200 bg-slate-50/40", btnCls: "" },
];

export const KITCHEN_STATION_LABELS: Record<string, string> = {
  bar:         "Bar",
  starters:    "Starters",
  mains:       "Mains",
  vegetables:  "Vegetables",
  desserts:    "Desserts",
  cold_prep:   "Cold Prep",
  hot_kitchen: "Hot Kitchen",
};

function elapsed(createdAt: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  if (minutes < 1) return { label: "Just now", urgent: false };
  if (minutes < 60) return { label: `${minutes}m`, urgent: minutes >= 15 };
  return { label: `${Math.floor(minutes / 60)}h ${minutes % 60}m`, urgent: true };
}

function ItemImage({ src, name }: { src: string | null; name: string }) {
  if (!src) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-300">
        <Package className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name} className="h-full w-full object-cover" />
    </div>
  );
}

/** Filter items to those belonging to the active station (null station = show everywhere). */
function filterItemsByStation(items: KitchenOrderItem[], station: string | null) {
  if (!station) return items; // "All" view — show everything
  return items.filter((item) => item.kitchen_station === station || item.kitchen_station === null);
}

export function KitchenDisplayClient({
  orders,
  canUpdate,
  currency = "EUR",
  stationsEnabled = false,
  activeStations = [],
}: {
  orders: KitchenOrder[];
  canUpdate: boolean;
  currency?: string;
  stationsEnabled?: boolean;
  activeStations?: string[];  // station keys that have at least one product
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeStation = searchParams.get("station") ?? null;

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 8000);
    return () => window.clearInterval(timer);
  }, [router]);

  // Build per-station view: filter orders to those that have matching items
  const visibleOrders = orders.map((order) => {
    const visibleItems = filterItemsByStation(order.kitchen_order_items, activeStation);
    return { ...order, kitchen_order_items: visibleItems };
  }).filter((order) => order.kitchen_order_items.length > 0);

  // Tabs for station navigation
  const stationTabs = stationsEnabled && activeStations.length > 0 ? (
    <div className="mb-4 flex flex-wrap gap-2">
      <Link
        href={pathname}
        className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
          !activeStation
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
        }`}
      >
        All stations
      </Link>
      {activeStations.map((station) => (
        <Link
          key={station}
          href={`${pathname}?station=${station}`}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
            activeStation === station
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
          }`}
        >
          {KITCHEN_STATION_LABELS[station] ?? station}
        </Link>
      ))}
    </div>
  ) : null;

  return (
    <div>
      {stationTabs}
      {activeStation && (
        <p className="mb-3 text-sm text-slate-500">
          Showing items for <strong>{KITCHEN_STATION_LABELS[activeStation] ?? activeStation}</strong> station.
          Items with no station assigned also appear here.
        </p>
      )}
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        <div className="grid min-w-[1100px] grid-cols-4 gap-3">
          {COLUMNS.map((column) => {
            const columnOrders = visibleOrders.filter((order) => order.status === column.status);
            return (
              <section
                key={column.status}
                className={`flex max-h-[calc(100vh-12rem)] flex-col rounded-xl border p-3 ${column.borderCls}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className={`text-sm font-bold uppercase tracking-wide ${column.headerCls}`}>{column.title}</h2>
                  <Badge variant="secondary" className="tabular-nums">{columnOrders.length}</Badge>
                </div>
                {columnOrders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs text-slate-400">
                    No orders
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                    {columnOrders.map((order) => {
                      const { label: elapsedLabel, urgent } = elapsed(order.created_at);
                      return (
                        <Card key={order.id} className="border-white bg-white shadow-sm">
                          <CardHeader className="space-y-1.5 pb-2 pt-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base leading-tight">{order.order_number ?? "Order"}</CardTitle>
                              <div className={`rounded-md px-1.5 py-0.5 text-right text-[10px] font-semibold tabular-nums leading-tight ${urgent ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}>
                                <p>{new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                <p className="font-bold">{elapsedLabel}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {order.order_type && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{order.order_type}</Badge>
                              )}
                              {order.table_label && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">Table {order.table_label}</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 pb-3">
                            <div className="space-y-1.5">
                              {order.kitchen_order_items.map((item) => (
                                <div key={item.id} className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-2 py-1.5">
                                  <ItemImage src={item.image_url} name={item.name} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-semibold text-slate-900 leading-tight line-clamp-2">{item.name}</span>
                                      <span className="shrink-0 rounded-md bg-slate-900 px-2 py-0.5 text-xs font-bold text-white tabular-nums">×{Number(item.quantity)}</span>
                                    </div>
                                    {item.kitchen_station && !activeStation && (
                                      <span className="mt-0.5 inline-block rounded bg-blue-50 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide text-blue-600">
                                        {KITCHEN_STATION_LABELS[item.kitchen_station] ?? item.kitchen_station}
                                      </span>
                                    )}
                                    {item.note && (
                                      <p className="mt-1 rounded bg-yellow-50 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800">📌 {item.note}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {order.note && (
                              <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">🗒 {order.note}</p>
                            )}
                            {canUpdate && column.next && (
                              <form action={updateKitchenOrderStatus as unknown as (fd: FormData) => Promise<void>}>
                                <input type="hidden" name="kitchen_order_id" value={order.id} />
                                <input type="hidden" name="status" value={column.next} />
                                <Button type="submit" size="sm" className={`w-full text-xs ${column.btnCls}`}>{column.action}</Button>
                              </form>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
