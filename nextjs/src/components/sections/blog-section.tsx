/**
 * BlogSection - секция «Самое интересное в блоге»
 *
 * Карточки записей (Post) на главной. Данные из WordPress через GraphQL.
 * Слайдер в том же стиле, что акции / наши работы (Embla, multi-card).
 *
 * PERFORMANCE: Server Component для data fetch, Client для слайдера. ISR 1h.
 */

import { getPostsForBlogSection } from "@/lib/wordpress";
import { Section } from "@/components/design-system";
import { BlogSectionClient } from "./blog-section-client";

interface BlogSectionProps {
  className?: string;
}

export async function BlogSection({ className = "" }: BlogSectionProps) {
  let posts: Awaited<ReturnType<typeof getPostsForBlogSection>> = [];

  try {
    posts = await getPostsForBlogSection(50);
  } catch (error: unknown) {
    console.error("[BlogSection] Error fetching posts:", error);
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <Section
      variant="default"
      spacing="none"
      className={`pt-16 pb-16 ${className}`}
    >
      <BlogSectionClient posts={posts} />
    </Section>
  );
}

export const revalidate = 3600;
