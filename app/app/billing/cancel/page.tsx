import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Checkout Cancelled — franchisetech" };

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <XCircle className="h-10 w-10 text-slate-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Checkout cancelled</h1>
          <p className="text-slate-500 text-base">
            No payment was taken. You can start a subscription whenever you&rsquo;re ready.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "bg-blue-600 hover:bg-blue-500 text-white")}
          >
            View plans
          </Link>
          <Link
            href="/app"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
