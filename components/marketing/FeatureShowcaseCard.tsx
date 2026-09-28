import Image from "next/image";

type FeatureShowcaseCardProps = {
  src: string;
  alt: string;
  path: string;
  title: string;
  text: string;
  learnMore: string;
};

/** Feature grid card with URL bar matching the screenshot screen. */
export function FeatureShowcaseCard({ src, alt, path, title, text, learnMore }: FeatureShowcaseCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:border-border/80">
      <div className="border-b border-border bg-secondary/90 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="min-w-0 flex-1 truncate rounded bg-card px-2 py-0.5 text-[9px] text-muted-foreground ring-1 ring-border">
            franchisetech.ro{path}
          </span>
        </div>
      </div>
      <div className="aspect-[16/10] overflow-hidden bg-secondary">
        <Image
          src={src}
          alt={alt}
          width={640}
          height={400}
          className="h-full w-full object-contain object-top transition duration-300 group-hover:scale-[1.01]"
          unoptimized
        />
      </div>
      <div className="p-5">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brass">
          {learnMore}
        </span>
      </div>
    </div>
  );
}
