/**
 * SearchResultCard — карточка результата поиска
 *
 * Универсальная карточка для врачей, услуг, клиник, акций, постов, страниц
 */

import Image from "next/image";
import Link from "next/link";
import { Heading, Text } from "@/components/design-system";
import { Icon } from "@iconify/react";
import type { SearchResultItem } from "@/lib/wordpress/search";

interface SearchResultCardProps {
  item: SearchResultItem;
  className?: string;
}

export function SearchResultCard({ item, className = "" }: SearchResultCardProps) {
  return (
    <Link
      href={item.uri}
      className={`group flex gap-4 rounded-[15px] border border-unident-borderGray bg-white p-4 transition-shadow hover:shadow-md ${className}`}
    >
      {item.featuredImage?.sourceUrl ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-unident-bgElements">
          <Image
            src={item.featuredImage.sourceUrl}
            alt={item.featuredImage.altText || item.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-unident-bgElements">
          <Icon
            icon="mynaui:search"
            className="h-8 w-8 text-unident-textGray"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <Heading
          level={3}
          variant="card-title"
          className="mb-1 line-clamp-2 group-hover:text-unident-primary"
        >
          {item.title}
        </Heading>
        {item.excerpt && (
          <Text variant="small" className="line-clamp-2 text-unident-textGray">
            {item.excerpt.replace(/<[^>]*>/g, "").slice(0, 120)}
            {item.excerpt.length > 120 ? "…" : ""}
          </Text>
        )}
      </div>
      <Icon
        icon="mynaui:arrow-right"
        className="h-5 w-5 shrink-0 self-center text-unident-textGray group-hover:translate-x-1 group-hover:text-unident-primary"
      />
    </Link>
  );
}
