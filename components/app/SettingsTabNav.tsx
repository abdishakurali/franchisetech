"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface SettingsTab {
  id: string;
  label: string;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function SettingsTabNav({ tabs }: { tabs: SettingsTab[] }) {
  const searchParams = useSearchParams();
  const active = searchParams.get("tab") ?? "business";

  return (
    <div
      className="settings-tab-nav border-b border-slate-200 -mx-6 px-6 mb-6"
      style={{
        marginLeft: "-1.5rem",
        marginRight: "-1.5rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        marginBottom: "1.5rem",
        borderBottom: "1px solid #e2e8f0",
        overflowX: "auto",
      }}
    >
      <nav
        aria-label="Settings sections"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              href={`?tab=${tab.id}`}
              className={cn(
                "inline-flex items-center whitespace-nowrap border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t",
                isActive
                  ? "border-blue-600 text-blue-700 bg-blue-50/40"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              )}
              style={{
                display: "inline-flex",
                alignItems: "center",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                whiteSpace: "nowrap",
                flexShrink: 0,
                textDecoration: "none",
                color: isActive ? "#1d4ed8" : "#475569",
                borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
                marginRight: "0",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
