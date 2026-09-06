"use client";

import type { ReactNode } from "react";
import { AuthBrand } from "@/components/marketing/AuthBrand";

export function AuthPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <AuthBrand />
        {children}
      </div>
    </div>
  );
}
