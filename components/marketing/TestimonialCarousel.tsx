import { createClient } from "@/lib/supabase/server";
import { Section, SectionLabel } from "@/components/marketing/MarketingShell.primitives";
import { TestimonialCarouselTrack } from "@/components/marketing/TestimonialCarouselTrack";

type TestimonialRow = {
  quote: string;
  rating: number | null;
  organisations: { company_legal_name: string | null; name: string } | { company_legal_name: string | null; name: string }[] | null;
  profiles: { full_name: string | null; role_title: string | null } | { full_name: string | null; role_title: string | null }[] | null;
};

function firstOf<T>(v: T | T[] | null): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v;
}

export async function TestimonialCarousel({ label }: { label: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("quote, rating, organisations(company_legal_name, name), profiles!submitted_by(full_name, role_title)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(12)
    .returns<TestimonialRow[]>();

  if (!data || data.length === 0) return null;

  const items = data.map((row) => {
    const org = firstOf(row.organisations);
    const profile = firstOf(row.profiles);
    return {
      quote: row.quote,
      rating: row.rating,
      companyName: org?.company_legal_name ?? org?.name ?? "",
      name: profile?.full_name ?? "",
      role: profile?.role_title ?? "",
    };
  });

  return (
    <Section tone="slate">
      <SectionLabel>{label}</SectionLabel>
      <TestimonialCarouselTrack items={items} />
    </Section>
  );
}
