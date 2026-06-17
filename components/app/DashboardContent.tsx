"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Plus,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { statusBg, statusLabel, formatTemp, assetTypeLabel } from "@/lib/temperature";

function Box({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

interface DashboardContentProps {
  stats: {
    checksToday: number;
    checksMissed: number;
    outOfRange: number;
    openCorrectiveActions: number;
    actionsNeeded?: number;
    assetsAtRisk: number;
    pendingVerifications: number;
  };
  recentReadings: Array<{
    id: string;
    value_c: number;
    status: string;
    taken_at: string;
    source: string;
    assets?: { name: string; asset_type: string } | null;
    sites?: { name: string } | null;
    profiles?: { full_name: string | null } | null;
  }>;
  openCA: Array<{
    id: string;
    action_type: string;
    description: string;
    completed_at: string;
    assets?: { name: string } | null;
    sites?: { name: string } | null;
  }>;
  assets: Array<{ id: string; name: string; asset_type: string; qr_code: string | null }>;
  orgId: string;
  userId: string;
}

export function DashboardContent({ stats, recentReadings, openCA, assets }: DashboardContentProps) {
  const isFirstRun = recentReadings.length === 0 && assets.length === 0;
  const hasReadings = recentReadings.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {format(new Date(), "EEEE, d MMMM yyyy")}
          </p>
        </div>
        <Link href="/app/checks/new">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            Log temperature check
          </Button>
        </Link>
      </div>

      {/* First-run guidance */}
      {isFirstRun && (
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Welcome to franchisetech</h2>
          <p className="text-sm text-slate-600 mb-4">
            Log your first fridge or freezer temperature check to get started. It takes about 60 seconds.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app/checks/new?tour=first-check">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Thermometer className="h-4 w-4" />
                Log first check
              </Button>
            </Link>
            <Link href="/app/how-it-works">
              <Button variant="outline" className="gap-2">
                How it works
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Next step when readings exist but no report yet */}
      {hasReadings && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Next step</p>
            <p className="text-xs text-slate-500 mt-0.5">Review today&apos;s checks and follow-ups from the dashboard.</p>
          </div>
          <Link href="/app/checks">
            <Button size="sm" variant="outline" className="gap-2 flex-shrink-0">
              <FileText className="h-4 w-4" />
              View checks
            </Button>
          </Link>
        </div>
      )}

      {/* Stat cards */}
      {hasReadings && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Checks today",
              value: stats.checksToday,
              icon: CheckCircle2,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Out-of-range today",
              value: stats.outOfRange,
              icon: Thermometer,
              color: stats.outOfRange > 0 ? "text-red-600" : "text-slate-400",
              bg: stats.outOfRange > 0 ? "bg-red-50" : "bg-slate-50",
            },
            {
              label: "Actions needed",
              value: stats.actionsNeeded ?? 0,
              icon: AlertTriangle,
              color: (stats.actionsNeeded ?? 0) > 0 ? "text-red-600" : "text-slate-400",
              bg: (stats.actionsNeeded ?? 0) > 0 ? "bg-red-50" : "bg-slate-50",
            },
            {
              label: "Fridges monitored",
              value: assets.length,
              icon: Box,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
          ].map((card) => (
            <Card key={card.label} className="border-slate-100">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Needs review alert */}
      {(stats.actionsNeeded ?? 0) > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-800">
              {stats.actionsNeeded} failed check{(stats.actionsNeeded ?? 0) > 1 ? "s" : ""} still need{(stats.actionsNeeded ?? 0) === 1 ? "s" : ""} an action recorded
            </p>
            <p className="text-sm text-red-700 mt-0.5">
              Every failed reading should have an action taken before the check is complete.{" "}
              <Link href="/app/corrective-actions" className="underline font-medium">Record actions</Link>
            </p>
          </div>
        </div>
      )}

      {/* Out of range today */}
      {stats.outOfRange > 0 && (stats.actionsNeeded ?? 0) === 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">
              {stats.outOfRange} out-of-range reading{stats.outOfRange > 1 ? "s" : ""} today
            </p>
            <p className="text-sm text-amber-700">
              Temperatures outside the safe range were recorded.{" "}
              <Link href="/app/corrective-actions" className="underline font-medium">Review actions taken</Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent readings */}
        <div className="lg:col-span-2">
          <Card className="border-slate-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Temperature Checks</CardTitle>
                <Link href="/app/checks" className="text-xs text-blue-600 hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentReadings.length === 0 ? (
                <div className="text-center py-8">
                  <Thermometer className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No checks logged yet.</p>
                  <Link href="/app/checks/new?tour=first-check">
                    <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                      Log first check
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentReadings.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`text-lg font-bold w-16 flex-shrink-0 ${
                            r.status === "pass"
                              ? "text-blue-600"
                              : r.status === "warning"
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatTemp(r.value_c)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {r.assets?.name ?? "Unknown unit"}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {r.sites?.name} · {format(new Date(r.taken_at), "HH:mm, d MMM")}
                            {r.profiles?.full_name ? ` · ${r.profiles.full_name}` : ""}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 ml-2 ${statusBg(r.status as "pass" | "warning" | "fail")}`}
                      >
                        {statusLabel(r.status as "pass" | "warning" | "fail")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick actions */}
          <Card className="border-slate-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/app/checks/new">
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                  <Thermometer className="h-4 w-4 text-blue-600" />
                  Log fridge check
                </Button>
              </Link>
              <Link href="/app/corrective-actions">
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  View actions taken
                </Button>
              </Link>
              <Link href="/app/checks">
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                  <FileText className="h-4 w-4 text-slate-600" />
                  View checks
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Open follow-ups */}
          {openCA.length > 0 && (
            <Card className="border-slate-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Follow-ups needed</CardTitle>
                  <Link href="/app/corrective-actions" className="text-xs text-blue-600 hover:underline">View all</Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {openCA.slice(0, 3).map((ca) => (
                    <div key={ca.id} className="text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <p className="font-medium text-slate-900 truncate">{ca.assets?.name}</p>
                      <p className="text-slate-500 text-xs truncate">{ca.description}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {format(new Date(ca.completed_at), "d MMM, HH:mm")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Equipment list */}
          {assets.length > 0 && (
            <Card className="border-slate-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Your equipment</CardTitle>
                  <Link href="/app/assets" className="text-xs text-blue-600 hover:underline">Manage</Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assets.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Thermometer className="h-3 w-3 text-blue-400 flex-shrink-0" />
                        <span className="truncate text-slate-700">{a.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                        {assetTypeLabel(a.asset_type as Parameters<typeof assetTypeLabel>[0])}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-8 text-center">
        franchisetech keeps daily sales, products, stock, and cash control in one simple workspace.
      </p>
    </div>
  );
}
