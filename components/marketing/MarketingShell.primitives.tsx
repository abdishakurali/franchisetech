import Link from "next/link";
import type { ReactNode } from "react";
import { marketingCard, marketingEyebrow, marketingSectionY } from "@/lib/marketing/tokens";

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className={marketingEyebrow}>{children}</p>;
}

export function Section({
  children,
  tone = "white",
  id,
}: {
  children: ReactNode;
  tone?: "white" | "slate" | "blue";
  id?: string;
}) {
  const bg =
    tone === "slate"
      ? "bg-slate-50"
      : tone === "blue"
        ? "bg-blue-50/30"
        : "bg-white";
  return (
    <section id={id} className={`${bg} px-4 ${marketingSectionY} sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function Faq({ items }: { items: ReadonlyArray<{ question: string; answer: string }> }) {
  return (
    <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200/70 bg-white">
      {items.map((item) => (
        <div key={item.question} className="px-6 py-5 sm:px-8 sm:py-6">
          <h3 className="font-medium text-slate-900">{item.question}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

export function CardGrid({ items }: { items: Array<{ title: string; text: string; href?: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const body = (
          <div className={`h-full p-6 ${marketingCard}`}>
            <h3 className="font-medium text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
          </div>
        );
        return item.href ? (
          <Link key={item.title} href={item.href} className="block">
            {body}
          </Link>
        ) : (
          <div key={item.title}>{body}</div>
        );
      })}
    </div>
  );
}
