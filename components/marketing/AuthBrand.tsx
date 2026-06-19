import Link from "next/link";

export function AuthBrand() {
  return (
    <Link href="/" className="mb-8 flex items-center justify-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/franchise-tech-logo.png" alt="franchisetech" className="h-9 w-auto max-w-[200px] object-contain" />
    </Link>
  );
}
