"use client";

import {
  CreditCard,
  FileText,
  Monitor,
  LayoutGrid,
  UserCircle,
} from "lucide-react";
import { marketingHeading } from "@/lib/marketing/tokens";
import { OwnerDashboardProof, OwnerZReportProof } from "@/components/marketing/OwnerProofScreens";

const ICONS = [CreditCard, FileText, Monitor, LayoutGrid, UserCircle];

interface WhyOwnersItem {
  title: string;
  text: string;
}

interface WhyOwnersChooseProps {
  heading: string;
  items: WhyOwnersItem[];
  screenshotCaption: string;
}

export function WhyOwnersChoose({
  heading,
  items,
  screenshotCaption,
}: WhyOwnersChooseProps) {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      {/* Left: heading + feature list */}
      <div>
        <h2 className={marketingHeading}>{heading}</h2>
        <ul className="mt-10 divide-y divide-border">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={i} className="flex gap-5 py-7 first:pt-0 last:pb-0">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-border">
                  <Icon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right: till-close proof screens */}
      <div className="flex flex-col gap-3">
        <OwnerDashboardProof />
        <OwnerZReportProof />
        <p className="text-center text-sm text-muted-foreground">{screenshotCaption}</p>
      </div>
    </div>
  );
}
