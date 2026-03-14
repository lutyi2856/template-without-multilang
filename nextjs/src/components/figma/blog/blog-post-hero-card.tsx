import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Text, Heading, Button } from "@/components/design-system";
import { cn } from "@/lib/utils";
import type { BlogPostCardProps } from "./types";

/**
 * BlogPostHeroCard — горизонтальная hero-карточка для слайдера страницы блога
 *
 * Layout: слева — категории, заголовок, excerpt, дата, кнопка «Читать полностью»; справа — изображение.
 * Figma: 1383×487px, borderRadius 25px
 */
export function BlogPostHeroCard({ post, className = "" }: BlogPostCardProps) {
  const imageUrl = post.featuredImage?.node?.sourceUrl;
  const imageAlt = post.featuredImage?.node?.altText || post.title;
  const categories = post.categories?.nodes ?? [];
  const postHref = `/blog/${post.slug}`;

  const formattedDate = new Date(post.date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const excerptText =
    typeof post.excerpt === "string"
      ? post.excerpt.replace(/<[^>]*>/g, "").trim().slice(0, 200)
      : "";

  return (
    <article
      className={cn(
        "@container flex w-full min-h-[400px] md:min-h-[487px] rounded-[25px] overflow-hidden bg-unident-bgElements flex-col @min-[600px]:flex-row",
        className
      )}
    >
      {/* Левая колонка — контент */}
      <div className="flex flex-1 flex-col justify-start pt-[15px] pl-4 pr-6 pb-6 md:pr-10 md:pb-10 gap-4">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) =>
              cat.slug ? (
                <Link
                  key={cat.slug}
                  href={`/blog/category/${cat.slug}`}
                  className="inline-flex items-center justify-center py-2 px-4 rounded-[10px] bg-white text-unident-dark text-[14px] font-medium leading-[1.4] hover:bg-unident-bgElements border border-unident-borderGray"
                  aria-label={`Перейти к категории ${cat.name}`}
                >
                  {cat.name}
                </Link>
              ) : (
                <span
                  key={cat.name}
                  className="inline-flex items-center justify-center py-2 px-4 rounded-[10px] bg-white text-unident-dark text-[14px] font-medium"
                >
                  {cat.name}
                </span>
              )
            )}
          </div>
        )}

        <Link href={postHref} className="group block">
          <Heading
            level={2}
            variant="section-title"
            className="text-unident-dark line-clamp-2 group-hover:text-unident-primary transition-colors"
          >
            {post.title}
          </Heading>
        </Link>

        {excerptText && (
          <Text
            variant="default"
            className="text-unident-textGray line-clamp-3"
            as="p"
          >
            {excerptText}
          </Text>
        )}

        <Text
          variant="small"
          className="text-unident-textGray"
          as="span"
        >
          {formattedDate}
        </Text>

        <Button
          asChild
          unidentVariant="primary"
          className="self-start rounded-[15px]"
        >
          <Link href={postHref}>Читать полностью</Link>
        </Button>
      </div>

      {/* Правая колонка — изображение */}
      {imageUrl && (
        <div className="relative w-full @min-[600px]:w-[50%] aspect-[3/2] @min-[600px]:aspect-[1383/487] flex-shrink-0 min-h-[200px]">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 732px"
          />
        </div>
      )}
    </article>
  );
}
