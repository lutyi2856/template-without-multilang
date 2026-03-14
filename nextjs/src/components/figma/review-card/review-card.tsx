import React from "react";
import Image from "next/image";
import { Text } from "@/components/design-system";
import { ReviewCardProps } from "./types";
import { ClinicAnswer } from "./clinic-answer";
import { DoctorsAndServices } from "./doctors-and-services";
import { StarRating } from "./star-rating";

/**
 * Карточка отзыва из Figma (node 122:537)
 *
 * DESIGN:
 * - Фон: #F5F7F9 (bgElements)
 * - Border radius: 25px
 * - Padding: 32px
 * - Min height: ~600px
 *
 * STRUCTURE:
 * 1. Заголовок отзыва
 * 2. Текст отзыва (укороченный)
 * 3. Ответ клиники (если есть)
 * 4. Информация об авторе
 * 5. Лечащие врачи (Level 2 slider)
 * 6. Оказанные услуги врачей (Level 3 slider)
 *
 * PERFORMANCE: Server Component
 */
export function ReviewCard({
  review,
  clinicAvatarUrl,
  clinicAvatarBackgroundColor,
  className = "",
}: ReviewCardProps) {
  // Убираем HTML теги и укорачиваем текст отзыва (первые 300 символов)
  const cleanContent = (review.content || "").replace(/<[^>]*>/g, "");
  const truncatedContent =
    cleanContent.length > 300
      ? cleanContent.substring(0, 300) + "..."
      : cleanContent;

  // Подготовка данных врачей с защитой от undefined/null
  const doctors =
    review.relatedDoctors?.map((doctor) => {
      const specialtyStr = doctor.doctorSpecializations?.nodes?.length
        ? doctor.doctorSpecializations.nodes.map((t: { name: string }) => t.name).join(", ")
        : doctor.doctorFields?.specialization
            ?.map((s: { specializationItem?: string }) => s.specializationItem)
            .filter(Boolean)
            .join(", ") ?? "";
      return {
        id: doctor.id,
        title: doctor.title,
        slug: doctor.slug,
        imageUrl: doctor.featuredImage?.node?.sourceUrl,
        specialization: specialtyStr,
        // КРИТИЧНО: Услуги врача для Level 3 slider (защита от undefined)
        relatedServices: doctor.relatedServices || [],
      };
    }) || [];

  return (
    <div
      className={`w-full bg-unident-bgElements rounded-[25px] py-6 px-4 md:py-8 md:px-6 flex flex-col min-w-0 xl:flex-row xl:gap-[clamp(1.5rem,5.22vw,4.5rem)] xl:py-[clamp(1rem,2.97vw,2.5625rem)] xl:px-[clamp(1rem,3.55vw,3.0625rem)] ${className}`}
    >
      {/* КОНТЕЙНЕР 1: Отзыв и ответ (Frame 2131328712) - Левая часть */}
      <div className="flex flex-col w-full gap-5 min-w-0 xl:flex-[0_1_63.41%]">
        {/* Заголовок и текст отзыва (Frame 2131328711) - gap fluid */}
        <div className="flex flex-col gap-[clamp(0.25rem,0.36vw,0.3125rem)]">
          {/* Заголовок отзыва */}
          <Text
            variant="review-title"
            as="h3"
            className="text-unident-dark"
          >
            {review.title}
          </Text>

          {/* Текст отзыва */}
          <Text variant="review-text" className="text-unident-dark" as="div">
            {truncatedContent}
          </Text>
        </div>

        {/* Ответ клиники - gap 20px от предыдущего блока */}
        {review.answer && (
          <ClinicAnswer
            answer={review.answer}
            clinicAvatarUrl={clinicAvatarUrl}
            clinicAvatarBackgroundColor={clinicAvatarBackgroundColor}
          />
        )}
      </div>

      {/* КОНТЕЙНЕР 2: Информация об отзыве (Frame 2131328713) - Правая часть */}
      <div className="flex flex-col gap-6 mt-6 min-w-0 xl:flex-[1_1_0] xl:mt-0 xl:gap-[clamp(1rem,1.74vw,1.5rem)] xl:justify-between">
        {/* Rating — сверху */}
        <div className="flex flex-col items-start gap-2 shrink-0">
          {review.rating && <StarRating rating={review.rating} />}

          {review.platformLogo?.sourceUrl && (
            <Image
              src={review.platformLogo.sourceUrl}
              alt={review.platformLogo.altText || "Логотип платформы"}
              width={119}
              height={24}
              className="object-contain object-left w-auto h-6 self-start"
            />
          )}

          <Text variant="review-meta" className="text-unident-textGray">
            {review.authorName || "Аноним"},{" "}
            {new Date(review.date).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
        </div>

        {/* Лечащие врачи + услуги — рядом на desktop */}
        {doctors && doctors.length > 0 && (
          <DoctorsAndServices doctors={doctors} align="start" />
        )}
      </div>
    </div>
  );
}
