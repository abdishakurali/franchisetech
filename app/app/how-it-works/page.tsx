import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductStory } from "@/components/app/ProductStory";

export default function HowItWorksPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">How franchisetech works</h1>
        <p className="text-slate-500 text-sm mt-2">
          Paper records what was written. franchisetech helps show what happened.
        </p>
      </div>
      <div className="mb-8"><ProductStory /></div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 mb-6">
        <p className="font-medium text-slate-900 mb-1">The core promise</p>
        <p className="text-slate-600 text-sm italic">
          &ldquo;Paper records what was written. franchisetech helps show what happened.&rdquo;
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/app/checks/new?tour=first-check">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            Start first check
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/app">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>

      <p className="text-xs text-slate-400 mt-8">
        franchisetech supports food-safety records. It does not replace the food business
        operator&apos;s responsibility to comply with applicable food law and official guidance.
      </p>
    </div>
  );
}
