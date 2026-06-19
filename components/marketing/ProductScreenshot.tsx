import Image from "next/image";

type ProductScreenshotProps = {
  src: string;
  alt: string;
  /** Browser chrome path — must match what the screenshot shows */
  path: string;
  caption?: string;
  priority?: boolean;
};

/** App screenshot with matching URL bar so text and image stay aligned for owners. */
export function ProductScreenshot({ src, alt, path, caption, priority }: ProductScreenshotProps) {
  return (
    <figure className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <div className="mx-2 min-w-0 flex-1 truncate rounded-md bg-white px-2.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200/80">
            franchisetech.ro{path}
          </div>
        </div>
        <div className="bg-slate-50">
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={900}
            className="w-full object-contain object-top"
            priority={priority}
            unoptimized
          />
        </div>
      </div>
      {caption && <figcaption className="text-center text-xs text-slate-400">{caption}</figcaption>}
    </figure>
  );
}
