/**
 * Карточка врача из Figma (блок 123:909)
 * Создано на основе дизайна через MCP Figma
 *
 * REFACTORED: Использует Design System компоненты
 * - Text/Heading вместо хардкод типографики
 * - bg-unident-* вместо хардкод цветов
 * - Design Tokens подход
 *
 * PERFORMANCE: Server Component (статичный контент)
 * Client Components: VideoModal, BookingButton (интерактивность)
 *
 * Источник: https://www.figma.com/design/JPVOauS3F3bEIy1msJXPeR/?node-id=123-909
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Text, Heading } from "@/components/design-system";
import { StarIcon, ClinicDotIcon } from "@/icons";
import { getYearsWord } from "@/lib/utils/experience-years-plural";
import { DoctorCardProps } from "./types";
import { VideoModal } from "./video-modal";
import { BookingButton } from "./booking-button";

export function DoctorCard({
  name = "Любимов Павел Олегович",
  slug,
  description = "Сертифицированный пластический хирург, профессор, доктор медицинских наук, действительный член РОПРЕХ",
  specialty,
  clinic = "Клиника на Чайковского",
  clinicSlugs,
  experience = 36,
  rating = 4.7,
  ratingSource = "Doctu.ru",
  imageUrl = "https://i.pravatar.cc/500?img=12",
  videoUrl,
}: Omit<DoctorCardProps, "onBookAppointment">) {
  return (
    <div className="relative w-full min-w-0 max-w-[330px] mx-auto lg:mx-0 h-full bg-unident-white border border-unident-borderGray rounded-[25px] overflow-hidden flex flex-col">
      {/* Изображение врача */}
      <div className="relative w-full aspect-square max-w-[280px] mx-auto mt-0 overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 280px"
        />
        {/* Градиент поверх изображения снизу */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-white" />
      </div>

      {/* Бейджи с рейтингом и стажем */}
      <div className="absolute top-[17px] left-[19.37px] right-[19.37px] max-w-[291.26px] flex justify-between items-start">
        {experience > 0 ? (
          /* Стаж */
          <div className="w-[75.07px] min-w-[75.07px] bg-unident-bgLightGray rounded-b-[68px] flex flex-col items-center justify-center px-4 py-5">
            <div className="flex items-baseline gap-[2px]">
              <Text
                variant="experience-number"
                as="span"
                className="leading-none"
              >
                {experience}
              </Text>
              <Text
                variant="experience-label"
                as="span"
                className="leading-[1.3] tracking-[0.02em]"
              >
                {getYearsWord(experience)}
              </Text>
            </div>
            <span className="text-[9.5px] font-medium text-unident-dark leading-none mt-[2.7px]">
              стаж
            </span>
          </div>
        ) : (
          <div className="w-[75.07px] min-w-[75.07px]" aria-hidden />
        )}

        {/* Рейтинг */}
        <div className="w-[67.26px] min-w-[67.26px] bg-unident-bgLightBlue rounded-tl-[61px] rounded-tr-none rounded-bl-[61px] rounded-br-[61px] flex flex-col items-center justify-center px-2 py-5">
          <div className="flex items-center gap-[3px]">
            <Text variant="rating-number" as="span" className="leading-none">
              {rating}
            </Text>
            <StarIcon className="h-[9.78px] w-[8.56px] flex-shrink-0 text-unident-dark" />
          </div>
          <Text
            variant="rating-source"
            as="span"
            className="leading-none mt-[2.4px] text-center w-[48.92px]"
          >
            {ratingSource}
          </Text>
        </div>
      </div>

      {/* Кнопка видео (если есть videoUrl) - Client Component */}
      {videoUrl && <VideoModal videoUrl={videoUrl} doctorName={name} />}

      {/* Информация о враче */}
      <div className="px-[24.5px] pt-[27.6px] pb-6 flex flex-col gap-5 flex-1">
        {/* Имя и описание — рендерим блоки только при наличии контента, чтобы не создавать лишний gap */}
        <div className="flex flex-col gap-[15px]">
          {slug ? (
            <Link href={`/doctors/${slug}`}>
              <Heading
                level={3}
                variant="card-title"
                className="w-full hover:text-unident-primary transition-colors cursor-pointer"
              >
                {name}
              </Heading>
            </Link>
          ) : (
            <Heading level={3} variant="card-title" className="w-full">
              {name}
            </Heading>
          )}

          {(specialty || (description && description.trim())) && (
            <div className="flex flex-col gap-[15px]">
              {specialty && (
                <Text variant="doctor-description" className="w-full text-unident-textGray">
                  {specialty}
                </Text>
              )}
              {description && description.trim() && (
                <Text variant="doctor-description" className="w-full">
                  {description}
                </Text>
              )}
            </div>
          )}
        </div>

        {/* Клиника(и) */}
        {clinic && clinic.trim() && (
          <div className="flex flex-col gap-2">
            {clinic.split(", ").map((clinicName, idx) => {
              const clinicSlug = clinicSlugs?.[idx];
              return (
                <div key={idx} className="flex items-center gap-[6px] w-full">
                  <ClinicDotIcon className="h-[19px] w-[19px] flex-shrink-0 text-unident-primary" />
                  {clinicSlug ? (
                    <Link href={`/clinics/${clinicSlug}`}>
                      <Text
                        variant="clinic-name"
                        as="span"
                        className="hover:text-unident-primary transition-colors cursor-pointer"
                      >
                        {clinicName}
                      </Text>
                    </Link>
                  ) : (
                    <Text variant="clinic-name" as="span">
                      {clinicName}
                    </Text>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Spacer для прижатия кнопки к низу карточки */}
        <div className="flex-1" />

        {/* Кнопка записи - Link или Client Component */}
        {slug ? (
          <Link href={`/doctors/${slug}`} className="w-full">
            <button className="w-full min-h-[44px] py-4.5 bg-unident-primary text-white text-[16px] font-semibold leading-[1.1] rounded-[15px] hover:bg-unident-primaryLight transition-colors">
              Записаться
            </button>
          </Link>
        ) : (
          <BookingButton doctorName={name} />
        )}
      </div>
    </div>
  );
}
