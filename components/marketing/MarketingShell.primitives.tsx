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
  tone?: "white" | "slate" | "blue" | "navy";
  id?: string;
}) {
  const bg =
    tone === "slate"
      ? "bg-[#F3F0E8]"
      : tone === "blue"
        ? "bg-[#165DFC]/[0.04]"
        : tone === "navy"
          ? "bg-[#0D0F0E]"
          : "bg-white";
  return (
    <section id={id} className={`${bg} px-4 ${marketingSectionY} sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function Faq({
  items,
  layout = "list",
}: {
  items: ReadonlyArray<{ question: string; answer: string }>;
  /** "list" (default, used sitewide) or "grid-2" — a 2-column ledger grid, homepage only. */
  layout?: "list" | "grid-2";
}) {
  if (layout === "grid-2") {
    const columns: Array<Array<{ question: string; answer: string }>> = [[], []];
    items.forEach((item, index) => columns[index % 2].push(item));
    return (
      <div className="grid gap-x-14 gap-y-0 sm:grid-cols-2">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="border-t border-[#0D0F0E]">
            {column.map((item) => (
              <div key={item.question} className="border-b border-[#DFDCD2] py-5">
                <h3 className="font-semibold text-[#0D0F0E]">{item.question}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#78786F]">{item.answer}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="divide-y divide-[#EDEAE1] rounded-2xl border border-[#DFDCD2] bg-white">
      {items.map((item) => (
        <div key={item.question} className="px-6 py-5 sm:px-8 sm:py-6">
          <h3 className="font-medium text-[#0D0F0E]">{item.question}</h3>
          <p className="mt-2 text-sm leading-7 text-[#78786F]">{item.answer}</p>
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
            <h3 className="font-medium text-[#0D0F0E]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#78786F]">{item.text}</p>
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
