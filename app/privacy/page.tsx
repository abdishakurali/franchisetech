import Link from "next/link";

const updated = "3 June 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm text-blue-600 hover:underline">Back to FridgeProof</Link>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
        <section><h2 className="font-semibold text-slate-900">1. Who we are</h2><p>FridgeProof is an early-stage software product for food-safety records and operational checks.</p></section>
        <section><h2 className="font-semibold text-slate-900">2. What data we collect</h2><p>We may collect account information such as name, email, and role; business information such as business name and business type; operational records such as kitchen/unit names, temperature checks, actions taken, and delivery/cleaning/process records if used; technical information such as IP address, browser/device information, logs, cookies and session data; and support communications if users contact us.</p></section>
        <section><h2 className="font-semibold text-slate-900">3. How we use data</h2><p>We use data to create and manage accounts, provide the FridgeProof service, store and display food-safety records, improve reliability and user experience, troubleshoot and secure the service, and communicate service-related updates.</p></section>
        <section><h2 className="font-semibold text-slate-900">4. Legal basis</h2><p>Where GDPR applies, our legal bases may include contract or service provision, legitimate interests in securing and improving the service, legal obligations where applicable, and consent where required.</p></section>
        <section><h2 className="font-semibold text-slate-900">5. Who we share data with</h2><p>We may share data with hosting, database, and authentication providers such as Supabase; infrastructure providers such as hosting, CDN, or server providers; analytics or support providers if added later; and authorities if legally required. We do not claim zero sharing.</p></section>
        <section><h2 className="font-semibold text-slate-900">6. How long we keep data</h2><p>We keep account and operational records while the account is active or as needed to provide the service, unless deletion is requested or legal or operational retention applies.</p></section>
        <section><h2 className="font-semibold text-slate-900">7. Your rights</h2><p>You may have rights to access, correction, deletion, restriction, objection, portability, withdrawal of consent where applicable, and to complain to the Irish Data Protection Commission.</p></section>
        <section><h2 className="font-semibold text-slate-900">8. Security</h2><p>We use reasonable security measures to protect the service and data. No internet service can guarantee perfect security.</p></section>
        <section><h2 className="font-semibold text-slate-900">9. International transfers</h2><p>Cloud providers may process data outside Ireland or the EU. Safeguards may be used where required.</p></section>
        <section><h2 className="font-semibold text-slate-900">10. Contact</h2><p>Contact us at <a className="text-blue-600 hover:underline" href="mailto:roobleahmedd@gmail.com">roobleahmedd@gmail.com</a>.</p></section>
        <section><h2 className="font-semibold text-slate-900">11. Changes</h2><p>We may update this policy and change the last updated date.</p></section>
      </div>

      <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        This policy is a practical starting point and should be reviewed by a qualified legal professional before paid customer use.
      </p>
    </main>
  );
}
