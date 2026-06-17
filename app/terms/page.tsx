import Link from "next/link";

const updated = "3 June 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm text-blue-600 hover:underline">Back to FridgeProof</Link>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
        <section><h2 className="font-semibold text-slate-900">1. About FridgeProof</h2><p>FridgeProof helps food businesses manage food-safety checks, actions taken, manager review, and reports.</p></section>
        <section><h2 className="font-semibold text-slate-900">2. Early-stage service</h2><p>FridgeProof is currently an early-stage product/MVP and may change. Features may be added, changed, paused, or removed as the product develops.</p></section>
        <section><h2 className="font-semibold text-slate-900">3. Not legal or regulatory advice</h2><p>FridgeProof supports record-keeping and operational controls. It does not guarantee compliance, does not replace official guidance, and does not replace the food business operator&apos;s responsibility.</p></section>
        <section><h2 className="font-semibold text-slate-900">4. Accounts</h2><p>Users must provide accurate account information and keep login details secure. You are responsible for activity under your account.</p></section>
        <section><h2 className="font-semibold text-slate-900">5. Customer responsibilities</h2><p>Customers are responsible for verifying records, ensuring staff use the system correctly, complying with food law and official guidance, maintaining suitable food-safety procedures, checking device and thermometer accuracy, and deciding what action to take when food-safety issues occur.</p></section>
        <section><h2 className="font-semibold text-slate-900">6. Acceptable use</h2><p>You must not misuse the service, use it for illegal activity, attempt to access other accounts, disrupt the service, upload malicious content, or violate others&apos; rights.</p></section>
        <section><h2 className="font-semibold text-slate-900">7. Availability and changes</h2><p>We aim to keep the service available, but we do not guarantee uninterrupted access. We may update, suspend, or change the service as needed.</p></section>
        <section><h2 className="font-semibold text-slate-900">8. Data and records</h2><p>FridgeProof stores records entered by users. Customers remain responsible for checking that records are accurate, complete, and suitable for their own operational and legal needs.</p></section>
        <section><h2 className="font-semibold text-slate-900">9. Liability</h2><p>To the fullest extent permitted by law, FridgeProof is not liable for indirect losses, missed checks, inaccurate user-entered data, food-safety decisions, or regulatory outcomes.</p></section>
        <section><h2 className="font-semibold text-slate-900">10. Contact</h2><p>Contact us at <a className="text-blue-600 hover:underline" href="mailto:roobleahmedd@gmail.com">roobleahmedd@gmail.com</a>.</p></section>
        <section><h2 className="font-semibold text-slate-900">11. Changes</h2><p>We may update these terms and change the last updated date.</p></section>
      </div>

      <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        These terms are a practical starting point and should be reviewed by a qualified legal professional before paid customer use.
      </p>
    </main>
  );
}
