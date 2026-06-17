"use client";
import { ArrowRight } from "lucide-react";

function openChat() {
  if (typeof window !== "undefined" && window.$chatwoot) {
    window.$chatwoot.toggle("open");
  } else {
    window.location.href = "/login";
  }
}

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
      <button onClick={openChat} className={className}>
        {label ?? "Request access"}
      </button>
    );
  }

  if (size === "sm") {
    return (
      <button
        onClick={openChat}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        {label ?? "Request access"}
      </button>
    );
  }

  return (
    <button
      onClick={openChat}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
    >
      {label ?? "Request access"} <ArrowRight className="h-4 w-4" />
    </button>
  );
}
