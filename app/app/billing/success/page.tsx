import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Subscription Confirmed — franchisetech" };

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  void (await searchParams); // session_id available for future confirmation details
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">You&rsquo;re all set!</h1>
          <p className="text-slate-500 text-base">
            Your franchisetech subscription is now active. You can continue using the workspace.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-800">
          A confirmation receipt has been sent to your email.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/app"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "bg-blue-600 hover:bg-blue-500 text-white")}
          >
            Go to dashboard
          </Link>
          <Link
            href="/app/billing"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Manage billing
          </Link>
        </div>
      </div>
    </div>
  );
}
