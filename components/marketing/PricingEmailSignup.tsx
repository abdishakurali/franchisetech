"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PricingEmailSignup({
  title,
  placeholder,
  getStarted,
}: {
  title: string;
  placeholder: string;
  getStarted: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("email", trimmed);
    if (plan) params.set("plan", plan);
    const qs = params.toString();
    router.push(qs ? `/signup?${qs}` : "/signup");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-white"
          autoComplete="email"
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shrink-0">
          {getStarted} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
