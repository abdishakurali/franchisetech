"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ActionsError() {
  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <p className="text-slate-900 font-semibold mb-2">Something went wrong</p>
      <p className="text-slate-500 text-sm mb-4">Your data is safe. Go back to the dashboard and try again.</p>
      <Link href="/app">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to dashboard</Button>
      </Link>
    </div>
  );
}
