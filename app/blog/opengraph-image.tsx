import { blogOgContentType, blogOgSize, renderBlogOgImage } from "@/lib/marketing/og/blog-og";

export const alt = "franchisetech blog";
export const size = blogOgSize;
export const contentType = blogOgContentType;

export default async function Image() {
  return renderBlogOgImage({
    title: "Ghiduri practice pentru cafenele și restaurante din România",
    tagLabel: "blog",
    badgeLabel: "FT",
  });
}
