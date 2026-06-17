"use client";

import Link from "next/link";
import { Wifi } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  devices: unknown[];
  recentReadings: unknown[];
  assets: unknown[];
  sites: unknown[];
  orgId: string;
  userId: string;
  canManage: boolean;
}

export function SensorsPage(_props: Props) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Connected Devices</h1>
        <p className="text-slate-500 text-sm mt-1">Coming soon</p>
      </div>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Wifi className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Manual checks work today. Bluetooth probes and fridge sensors are planned.
        </AlertDescription>
      </Alert>

      <Card className="border-slate-100">
        <CardHeader><CardTitle className="text-base">Why connected devices matter</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Paper and manual logs show scheduled checks. Connected devices can catch overnight failures and continuous temperature drift.
          </p>
          <Link href="/app/checks/new">
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Log manual check</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
