import { BillingPanel } from "@/components/billing/BillingPanel";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <BillingPanel searchParams={{ reason: params.reason, checkout: params.checkout }} />
    </div>
  );
}
