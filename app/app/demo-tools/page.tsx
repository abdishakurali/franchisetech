import { redirect } from "next/navigation";
import { DemoToolsButton } from "@/components/app/DemoToolsButton";

export default function DemoToolsPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_TOOLS !== "true") redirect("/app");
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Founder demo tools</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Hidden from normal customers. Use this only to prepare a founder demo workspace.</p>
      <DemoToolsButton />
    </div>
  );
}
