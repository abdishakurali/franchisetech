import type { Metadata } from "next";

// page.tsx is a client component, so its metadata lives here. Without it the
// page inherited the homepage title, description and canonical.
export const metadata: Metadata = {
  title: "Program de parteneri pentru contabili",
  description:
    "Recomandați clienții HoReCa: acces gratuit, doar pentru citire, la portalul contabil și 15 € pe lună pentru fiecare client recomandat care devine abonat plătitor.",
  alternates: { canonical: "/accountant-partners" },
};

export default function AccountantPartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
