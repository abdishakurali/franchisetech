import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoonReport({ title }: { title: string }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="rounded-lg border border-slate-100 bg-white p-8 text-center">
        <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3" />
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 text-sm mt-2">Coming soon. This report is not linked to a complete customer-facing workflow yet.</p>
        <Link href="/app/reports"><Button variant="outline" className="mt-5">Back to reports</Button></Link>
      </div>
    </div>
  );
}
