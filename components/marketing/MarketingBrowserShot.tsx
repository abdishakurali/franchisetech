import Image from "next/image";
import { BrowserFrame } from "@/components/marketing/DeviceFrames";

type MarketingBrowserShotProps = {
  src: string;
  alt: string;
  path: string;
  priority?: boolean;
  className?: string;
  /** When true, shows minimal browser chrome (URL bar). */
  chrome?: boolean;
};

export function MarketingBrowserShot({
  src,
  alt,
  path,
  priority,
  className = "",
  chrome = false,
}: MarketingBrowserShotProps) {
  if (chrome) {
    return (
      <BrowserFrame
        src={src}
        alt={alt}
        path={path}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={1400}
        height={900}
        className="w-full object-cover object-top"
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  );
}
