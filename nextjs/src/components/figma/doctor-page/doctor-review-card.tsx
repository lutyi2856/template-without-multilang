/**
 * DoctorReviewCard — карточка отзыва на странице врача (layout narrow)
 *
 * Figma node 404:2679 — часть 404:2587.
 * Padding: pl 31px, pt 36px, pr 47px, pb 36px. Gap 5px.
 *
 * PERFORMANCE: Server Component.
 */

import Image from "next/image";
import { Text } from "@/components/design-system";
import { ClinicAnswer } from "@/components/figma/review-card/clinic-answer";
import { DoctorsAndServices } from "@/components/figma/review-card/doctors-and-services";
import { StarRating } from "@/components/figma/review-card/star-rating";
import type { Review } from "@/lib/wordpress/types/review";

interface DoctorReviewCardProps {
  review: Review;
  clinicAvatarUrl?: string;
  clinicAvatarBackgroundColor?: string;
  className?: string;
}

export function DoctorReviewCard({
  review,
  clinicAvatarUrl,
  clinicAvatarBackgroundColor,
  className = "",
}: DoctorReviewCardProps) {
  const cleanContent = (review.content || "").replace(/<[^>]*>/g, "");
  const truncatedContent =
    cleanContent.length > 300
      ? cleanContent.substring(0, 300) + "..."
      : cleanContent;

  const doctors =
    review.relatedDoctors?.map((doctor) => {
      const specialtyStr = doctor.doctorSpecializations?.nodes?.length
        ? doctor.doctorSpecializations.nodes
            .map((t: { name: string }) => t.name)
            .join(", ")
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
        relatedServices: doctor.relatedServices || [],
      };
    }) || [];

  return (
    <div
      className={`bg-unident-bgElements rounded-[25px] pl-[31px] pr-[47px] pt-[36px] pb-[36px] flex flex-col gap-5 min-w-0 max-w-[838px] w-full ${className}`}
    >
      {/* Верх (полная ширина): заголовок, текст отзыва, ответ клиники */}
      <div className="flex flex-col gap-[5px] max-md:gap-[3px] w-full">
        <Text
          variant="review-title"
          as="h3"
          className="text-unident-dark"
        >
          {review.title}
        </Text>
        <Text variant="review-text" className="text-unident-dark" as="div">
          {truncatedContent}
        </Text>
        {review.answer && (
          <ClinicAnswer
            answer={review.answer}
            clinicAvatarUrl={clinicAvatarUrl}
            clinicAvatarBackgroundColor={clinicAvatarBackgroundColor}
          />
        )}
      </div>

      {/* Низ: лечащие врачи и услуги, рейтинг, логотип, мета — друг под другом */}
      <div className="flex flex-col gap-6">
        {doctors.length > 0 && (
          <div className="flex-1 min-w-0">
            <DoctorsAndServices doctors={doctors} />
          </div>
        )}
        <div className="flex flex-col items-start gap-2">
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
      </div>
    </div>
  );
}
