import Link from "next/link";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/marketing/contact-info";

// Who wrote this and how to reach a human. Credibility for owners who land
// on an article from search or social: a named founder, a real phone, and
// an honest limit on what a general article can tell them.
export function BlogAuthorBox() {
  return (
    <aside className="mt-12 rounded-lg border border-slate-200 bg-white p-5 sm:p-6" aria-label="Despre autor">
      <p className="text-sm font-semibold text-slate-900">Scris de Abdishakur Ali, fondatorul franchisetech</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Construim programul de casă pentru cafenele mici din România și facem configurarea împreună cu fiecare client.
        Articolele pornesc din întrebările primite la configurări.
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Informațiile fiscale de aici sunt generale. Pentru situația dvs., verificați cu contabilul.{" "}
        <Link href="/legal-disclaimer" className="text-blue-600 underline hover:text-blue-700">
          Limitele informațiilor
        </Link>
      </p>
      <p className="mt-3 text-sm text-slate-700">
        Întrebări?{" "}
        <a href={SUPPORT_WHATSAPP_URL} className="font-semibold text-blue-600 hover:underline">
          WhatsApp {SUPPORT_PHONE_DISPLAY}
        </a>{" "}
        ·{" "}
        <a href="mailto:info@franchisetech.ro" className="font-semibold text-blue-600 hover:underline">
          info@franchisetech.ro
        </a>
      </p>
    </aside>
  );
}
