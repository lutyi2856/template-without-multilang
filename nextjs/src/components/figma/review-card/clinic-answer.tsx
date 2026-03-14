import React from "react";
import Image from "next/image";
import { Text } from "@/components/design-system";
import { ClinicAnswerProps } from "./types";

/**
 * Блок ответа клиники на отзыв
 *
 * DESIGN:
 * - Фон: white (#FFFFFF)
 * - Border radius: 25px
 * - Padding: 24px
 * - Аватар клиники: круглый, синий фон
 *
 * TYPOGRAPHY: review-answer (18px, medium)
 */
export function ClinicAnswer({
  answer,
  clinicAvatarUrl,
  clinicAvatarBackgroundColor,
}: ClinicAnswerProps) {
  return (
    <div className="bg-unident-white rounded-[25px] p-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:p-[clamp(1rem,1.74vw,1.5rem)]">
      {/* Аватар клиники: 50×50 на mobile/tablet, 60×60 на desktop */}
      <div
        className="flex-shrink-0 w-full max-w-[50px] h-[50px] p-2 rounded-full overflow-hidden self-start xl:w-[60px] xl:h-[60px] xl:max-w-[60px] xl:aspect-square xl:p-2.5"
        style={{
          backgroundColor:
            clinicAvatarBackgroundColor?.trim() || "#F5F7F9",
        }}
      >
        {clinicAvatarUrl ? (
          <Image
            src={clinicAvatarUrl}
            alt="Клиника УниДент"
            width={90}
            height={90}
            className="object-contain w-full h-full"
          />
        ) : (
          <svg
            width="50"
            height="50"
            viewBox="0 0 75 75"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <rect width="75" height="75" rx="37.5" fill="#526AC2" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M21.5463 22.4615C21.3196 22.6052 21.253 23.2554 21.3041 24.8198L21.3746 26.9795L23.3513 27.0495C24.5323 27.0914 25.4204 27.2378 25.5575 27.4129C25.6835 27.5742 25.9173 28.4149 26.0769 29.2809C26.7855 33.1276 28.4774 37.094 30.8408 40.4496C33.8502 44.7222 37.0109 47.4228 41.7236 49.7477C45.1651 51.4456 47.3259 52.1225 50.733 52.5702C53.7328 52.9643 53.7696 52.9307 53.695 49.888C53.6637 48.6135 53.5331 47.4347 53.4048 47.268C53.2764 47.1016 52.8127 46.9652 52.3745 46.9652C49.6191 46.9652 44.6202 45.2084 41.5129 43.1478C38.3367 41.0417 35.2686 37.4792 33.4304 33.7625C32.6014 32.0864 31.317 27.7184 31.5447 27.3499C31.6438 27.1895 33.9387 27.1006 37.983 27.1006C43.8014 27.1006 44.2683 27.0691 44.2806 26.6767C44.3431 24.7043 44.2825 22.7183 44.1532 22.5093C43.9635 22.2023 22.0277 22.1561 21.5463 22.4615Z"
              fill="white"
            />
          </svg>
        )}
      </div>

      {/* Текст ответа: smaller на mobile */}
      <div className="flex-1 min-w-0">
        <Text
          variant="clinic-answer-text"
          className="text-unident-dark"
        >
          {answer}
        </Text>
      </div>
    </div>
  );
}
