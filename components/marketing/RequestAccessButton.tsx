import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RequestAccessButton({
  size = "default",
  label,
  className,
}: {
  size?: "default" | "sm";
  label?: string;
  className?: string;
}) {
  if (className) {
    return (
      <Link href="/signup?plan=free" className={className}>
        {label ?? "Începe trialul"}
      </Link>
    );
  }

  if (size === "sm") {
    return (
      <Link
        href="/signup?plan=free"
        className="rounded-lg bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-brass/90 transition-colors"
      >
        {label ?? "Începe trialul"}
      </Link>
    );
  }

  return (
    <Link
      href="/signup?plan=free"
      className="inline-flex items-center gap-2 rounded-lg bg-brass px-6 py-3 text-base font-semibold text-ink hover:bg-brass/90 transition-colors"
    >
      {label ?? "Începe trialul"} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
