import { badgeLabelFromTag, blogOgContentType, blogOgSize, renderBlogOgImage } from "@/lib/marketing/og/blog-og";
import { blogPosts } from "@/lib/marketing/blog";

export const alt = "franchisetech blog";
export const size = blogOgSize;
export const contentType = blogOgContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) {
    return renderBlogOgImage({ title: "franchisetech — blog", badgeLabel: "FT" });
  }
  return renderBlogOgImage({
    title: post.title,
    tagLabel: post.tags[0]?.replace(/-/g, " "),
    badgeLabel: badgeLabelFromTag(post.tags[0]),
  });
}
