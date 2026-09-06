import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm font-semibold text-[#165DFC]">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#0D0F0E]">Pagina nu a fost găsită</h1>
        <p className="mt-4 text-[#78786F]">Adresa nu mai există sau a fost mutată.</p>
        <Link href="/" className="mt-7 inline-flex rounded-md bg-[#165DFC] px-5 py-3 text-sm font-semibold text-white hover:bg-[#165DFC]">
          Înapoi la pagina principală
        </Link>
      </div>
    </main>
  );
}
