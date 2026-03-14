/**
 * ReviewsSectionClient - presentational блок секции отзовиков
 *
 * Отображает заголовок, контент, блок среднего рейтинга и сетку карточек источников.
 * Данные приходят из Option Page (передаются из ReviewsSection Server Component).
 * Макет Figma: заголовок + текст + блок рейтинга в одну строку; в карточках — рейтинг + звезда + лого в одну строку.
 */

import Image from "next/image";
import { Heading, Text, Container } from "@/components/design-system";
import { formatReviewsCount } from "@/lib/wordpress/utils/review-plural";
import type { MainPageReviewsSectionItem } from "@/types/main-page";
import type { CtaImage } from "@/types/main-page";

/** Иконка звезды после рейтинга (Figma, fill #526AC2) */
function RatingStarIcon({ className }: { className?: string }) {
  return (
    <svg
      width={22}
      height={19}
      viewBox="0 0 34 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M15.9824 0.455267C16.1966 -0.152166 17.0557 -0.152166 17.2699 0.455266L20.7593 10.35C20.8556 10.623 21.1136 10.8056 21.4031 10.8056H32.5684C33.2431 10.8056 33.5088 11.6801 32.9482 12.0554L24.014 18.036C23.7549 18.2094 23.6463 18.5362 23.7499 18.8302L27.1847 28.5699C27.4031 29.189 26.7069 29.7293 26.1613 29.3641L17.0058 23.2355C16.7761 23.0817 16.4762 23.0817 16.2464 23.2355L7.09101 29.3641C6.54541 29.7293 5.84921 29.189 6.06756 28.5699L9.50233 18.8302C9.60601 18.5362 9.49735 18.2094 9.23831 18.036L0.304127 12.0554C-0.256547 11.6801 0.00913429 10.8056 0.683831 10.8056H11.8492C12.1387 10.8056 12.3967 10.623 12.4929 10.35L15.9824 0.455267Z"
        fill="#526AC2"
      />
    </svg>
  );
}

export interface ReviewsSectionClientProps {
  title?: string;
  content?: string;
  /** Уровень заголовка: 1 для H1 (архив отзывов), 2 для H2 (главная, секция) */
  headingLevel?: 1 | 2;
  sectionImage?: CtaImage | null;
  mediumRatingSuffix?: string;
  basis?: string;
  averageRating: number | null;
  totalReviews: number;
  items?: MainPageReviewsSectionItem[] | null;
}

export function ReviewsSectionClient({
  title,
  content,
  headingLevel = 2,
  sectionImage,
  mediumRatingSuffix = "/5.0",
  basis,
  averageRating,
  totalReviews,
  items = [],
}: ReviewsSectionClientProps) {
  const hasRatingBlock =
    sectionImage?.url ||
    averageRating != null ||
    (basis && totalReviews > 0);
  const hasItems = items && items.length > 0;

  return (
    <Container size="xl">
      {/* Одна строка: слева заголовок + текст, справа блок рейтинга (по Figma) */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-10">
        {/* Левая колонка: заголовок и контент */}
        <div className="flex-1 min-w-0">
          {title && (
            <Heading
              level={headingLevel}
              variant="section-title"
              className="text-unident-dark mb-4 font-gilroy text-[32px] font-bold leading-tight tracking-[-0.02em]"
            >
              {title}
            </Heading>
          )}
          {content && (
            <Text
              variant="default"
              className="text-unident-dark max-w-3xl font-gilroy text-base font-normal leading-normal tracking-[-0.01em]"
              as="p"
            >
              {content}
            </Text>
          )}
        </div>

        {/* Правая колонка: блок среднего рейтинга (медаль + число + основание) */}
        {hasRatingBlock && (
          <div className="flex flex-shrink-0 flex-row items-center gap-4 lg:gap-5">
            {sectionImage?.url && (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                <Image
                  src={sectionImage.url}
                  alt={sectionImage.alt ?? "Рейтинг"}
                  width={sectionImage.width ?? 80}
                  height={sectionImage.height ?? 80}
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {averageRating != null && (
                <div className="flex items-baseline gap-0.5">
                  <span className="font-gilroy text-[28px] font-bold leading-tight tracking-[-0.02em] text-unident-primary">
                    {averageRating}
                  </span>
                  <span className="font-gilroy text-lg font-normal leading-relaxed tracking-[-0.01em] text-unident-textGray">
                    {mediumRatingSuffix}
                  </span>
                </div>
              )}
              <span className="font-gilroy text-[19.51px] font-semibold leading-[1] tracking-normal text-unident-dark">
                Средний рейтинг
              </span>
              {basis && totalReviews > 0 && (
                <Text
                  variant="small"
                  className="font-gilroy text-sm font-normal text-unident-textGray"
                  as="span"
                >
                  {basis} {formatReviewsCount(totalReviews)}
                </Text>
              )}
            </div>
          </div>
        )}
      </div>

      {hasItems && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <ReviewsSourceCard key={index} item={item} />
          ))}
        </div>
      )}
    </Container>
  );
}

/** Убирает дублирование слова «отзыв/отзыва/отзывов» в начале text (из ACF может прийти «отзыва из Яндекса») */
function stripPluralPrefix(text: string): string {
  return text.replace(/^(отзыв(а|ов)?)\s+/i, "").trim();
}

function ReviewsSourceCard({
  item,
}: {
  item: MainPageReviewsSectionItem;
}) {
  const rating = item.rating != null ? Number(item.rating) : null;
  const count = Number(item.reviewsCount) || 0;
  const rawText = item.text?.trim() ?? "";
  const textSuffix = stripPluralPrefix(rawText);
  const line =
    count > 0
      ? textSuffix
        ? `${formatReviewsCount(count)} ${textSuffix}`
        : formatReviewsCount(count)
      : rawText;

  const cardClassName =
    "rounded-[15px] bg-unident-bgElements p-[34px] flex flex-col gap-3 block";

  const cardContent = (
    <>
      {/* Одна строка: рейтинг + иконка звезды + логотип (все по центру по вертикали) */}
      <div className="flex flex-row items-center gap-2 flex-wrap">
        {rating != null && !Number.isNaN(rating) && (
          <span className="font-gilroy text-lg font-semibold leading-relaxed tracking-[-0.01em] text-unident-dark">
            {rating}
          </span>
        )}
        <RatingStarIcon className="flex-shrink-0 w-[22px] h-[19px]" />
        {item.image?.url && (
          <div className="relative h-8 min-w-[80px] max-w-[120px] flex-shrink-0 flex items-center justify-start">
            <Image
              src={item.image.url}
              alt={item.image.alt ?? ""}
              width={item.image.width ?? 100}
              height={item.image.height ?? 32}
              className="object-contain object-left max-h-full w-auto"
            />
          </div>
        )}
      </div>
      {line && (
        <Text
          variant="small"
          className="font-gilroy text-sm text-unident-textGray"
          as="span"
        >
          {line}
        </Text>
      )}
    </>
  );

  const linkUrl =
    typeof item.link === "string" ? item.link.trim() : "";
  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardClassName} hover:opacity-90 transition-opacity cursor-pointer`}
        aria-label={`Перейти к отзывам: ${rawText || "источник отзывов"}`}
      >
        {cardContent}
      </a>
    );
  }

  return <div className={cardClassName}>{cardContent}</div>;
}
