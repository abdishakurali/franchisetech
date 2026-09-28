"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * A real `youtube.com/embed/...` iframe always overlays its own title,
 * channel name, and logo on the paused thumbnail — YouTube deprecated the
 * embed parameters that used to suppress that (`showinfo`) years ago, so
 * there is no URL-param way to hide it. The only reliable fix is not
 * loading the iframe until the visitor clicks: show our own poster and
 * play button first, swap in the real player only on interaction.
 */
export function YouTubeFacade({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={title}
      className="group absolute inset-0 h-full w-full"
    >
      <img
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt=""
        aria-hidden
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 bg-ink/15 transition group-hover:bg-ink/25" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card/95 shadow-lg transition group-hover:scale-105">
          <Play className="ml-0.5 h-6 w-6 fill-[#1a3ab8] text-[#1a3ab8]" />
        </span>
      </span>
    </button>
  );
}
