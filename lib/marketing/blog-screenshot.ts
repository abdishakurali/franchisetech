import type { BlogPost } from "@/lib/marketing/blog";

// One real app screen per article, so a reader sees the product next to the
// advice. The screens in public/marketing/live/ were re-captured on
// 2026-11-11 from a Romanian demo cafe (Romanian menu, lei, test sales), which
// replaces the stale English demo data that made BlogTopicHeader drop
// screenshots earlier. The caption always says it is demo data.

export type BlogScreenshot = { src: string; alt: string };

const SCREENS: Record<string, BlogScreenshot> = {
  pos: { src: "/marketing/live/pos.png", alt: "Ecranul de vânzare (POS) din franchisetech" },
  stock: { src: "/marketing/live/stock.png", alt: "Pagina de stoc din franchisetech" },
  recipes: { src: "/marketing/live/recipes.png", alt: "Rețetă cu cost și marjă în franchisetech" },
  reports: { src: "/marketing/live/reports.png", alt: "Raport de vânzări în franchisetech" },
  dashboard: { src: "/marketing/live/dashboard.png", alt: "Panoul proprietarului în franchisetech" },
};

// First matching tag wins; specific tags come before generic ones.
const TAG_SCREEN: Array<[RegExp, keyof typeof SCREENS]> = [
  [/stoc|nir|inventar|receptie|transfer|perisabil|materii/, "stock"],
  [/retet|marj|cost|pret|food/, "recipes"],
  [/raport|inchidere|numerar|casierie|kpi|contabil|saga|export|registru/, "reports"],
  [/bon|casa|pos|storno|fiscalnet|tva|bacsis|anulare|qr/, "pos"],
];

export function blogScreenshotFor(post: Pick<BlogPost, "image" | "tags">): BlogScreenshot {
  const fromImage = Object.values(SCREENS).find((s) => s.src === post.image);
  if (fromImage) return fromImage;
  for (const tag of post.tags) {
    const hit = TAG_SCREEN.find(([re]) => re.test(tag));
    if (hit) return SCREENS[hit[1]];
  }
  return SCREENS.dashboard;
}

export const BLOG_SCREENSHOT_CAPTION = "Captură din aplicația franchisetech, cafenea demo cu date de test.";
