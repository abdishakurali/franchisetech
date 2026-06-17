import Link from "next/link";
import { Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalDisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Thermometer className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-slate-900 text-lg">FridgeProof</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Legal Disclaimer</h1>
        <p className="text-slate-500 mb-10">Last updated: June 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Operational support, not legal advice</h2>
            <p className="text-slate-600">
              FridgeProof is a software tool designed to support food safety record keeping and operational controls.
              It does not constitute legal advice, food safety certification, or regulatory approval of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Operator responsibility</h2>
            <p className="text-slate-600">
              Food business operators remain fully responsible for compliance with all applicable food law and guidance,
              including EU Regulation (EC) No 852/2004 on the hygiene of foodstuffs, Irish food hygiene regulations,
              and guidance issued by the Food Safety Authority of Ireland (FSAI).
              FridgeProof does not transfer, reduce, or replace this responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">HACCP plans</h2>
            <p className="text-slate-600">
              FridgeProof is designed to support the implementation of HACCP-based procedures as required by EU food hygiene law.
              However, it is the responsibility of the food business operator to develop, implement, and maintain a suitable HACCP plan
              for their specific business. FridgeProof records are not a substitute for a complete HACCP plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Not endorsed by FSAI</h2>
            <p className="text-slate-600">
              FridgeProof is not approved, endorsed, or certified by the Food Safety Authority of Ireland (FSAI)
              or any other regulatory body. The product is designed to be compatible with FSAI-style record-keeping practices
              but makes no claim of regulatory approval.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Paper records</h2>
            <p className="text-slate-600">
              Paper-based food safety records are a legally acceptable method of documenting HACCP compliance.
              FridgeProof is not intended to suggest that paper records are non-compliant. FridgeProof provides
              an alternative digital approach that may support more consistent record keeping, earlier detection of issues,
              and easier report generation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Accuracy of records</h2>
            <p className="text-slate-600">
              FridgeProof records depend on the accuracy of information entered by users. The system calculates
              temperature status based on configured thresholds but cannot verify the accuracy of manually entered readings
              or the calibration status of equipment unless calibration records are maintained within the system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Limitation of liability</h2>
            <p className="text-slate-600">
              To the fullest extent permitted by applicable law, FridgeProof and its operators accept no liability
              for any loss, damage, or regulatory consequence arising from reliance on FridgeProof records or the
              failure of the system to detect or alert on food safety issues.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100">
          <Link href="/">
            <Button variant="outline">Back to homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
