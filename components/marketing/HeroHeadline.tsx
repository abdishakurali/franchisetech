"use client";

type HeroHeadlineProps = {
  before: string;
  highlight: string;
  after?: string;
};

export function HeroHeadline({ before, highlight, after = "" }: HeroHeadlineProps) {
  return (
    <h1 className="marketing-hero-rise marketing-hero-delay-2 mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[2.75rem] lg:leading-[1.12] xl:text-[3.25rem] xl:leading-[1.08]">
      {before}
      <span className="relative inline-block text-blue-600">
        {highlight}
        <svg
          className="pointer-events-none absolute -bottom-1 left-0 w-full text-blue-400/70"
          viewBox="0 0 200 12"
          fill="none"
          aria-hidden
          preserveAspectRatio="none"
        >
          <path
            d="M2 8c28-6 52-2 78 1s58 4 88-2 30-8 30-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {after}
    </h1>
  );
}
