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
    <div className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition hover:border-slate-300/80">
      <div className="border-b border-slate-100 bg-slate-50/90 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="min-w-0 flex-1 truncate rounded bg-white px-2 py-0.5 text-[9px] text-slate-500 ring-1 ring-slate-200/80">
            franchisetech.ro{path}
          </span>
        </div>
      </div>
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
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
        <h3 className="font-medium text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
          {learnMore}
        </span>
      </div>
    </div>
  );
}
