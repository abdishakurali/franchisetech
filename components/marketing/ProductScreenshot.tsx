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
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-1.5 border-b border-border bg-secondary/80 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <div className="mx-2 min-w-0 flex-1 truncate rounded-md bg-card px-2.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border">
            franchisetech.ro{path}
          </div>
        </div>
        <div className="bg-secondary">
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
      {caption && <figcaption className="text-center text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
