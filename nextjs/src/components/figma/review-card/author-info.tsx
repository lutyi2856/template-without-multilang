import React from "react";
import Image from "next/image";
import { Text } from "@/components/design-system";
import { AuthorInfoProps } from "./types";

/**
 * Информация об авторе отзыва
 *
 * DESIGN:
 * - Логотип платформы
 * - Имя и дата (через запятую)
 *
 * TYPOGRAPHY: review-meta (14px, medium)
 * COLOR: #8F8F8F (textGray)
 */
export function AuthorInfo({
  authorName,
  date,
  platformLogoUrl,
}: AuthorInfoProps) {
  // Форматирование даты
  const formattedDate = new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-3">
      {/* Логотип платформы */}
      {platformLogoUrl && (
        <div className="flex-shrink-0">
          <Image
            src={platformLogoUrl}
            alt="Платформа отзывов"
            width={80}
            height={24}
            className="object-contain"
          />
        </div>
      )}

      {/* Имя и дата */}
      <Text variant="review-meta" className="text-unident-textGray">
        {authorName}, {formattedDate}
      </Text>
    </div>
  );
}
