/**
 * DoctorHeroBlock — Hero-блок страницы врача (Figma node 401:2848)
 *
 * Layout по Framelink: фото 472×629, бейджи experience/rating 107×107 слева от фото (overlap),
 * справа — имя H2, бейджи специализации (gap 15px), направления, клиники, кнопка 258×60.
 *
 * PERFORMANCE: Server Component.
 */

import Image from "next/image";
import Link from "next/link";
import {
  Text,
  Heading,
  Button,
} from "@/components/design-system";
import type { DoctorHeroBlockProps } from "./types";

function getExperienceYears(experienceIso?: string): number {
  if (!experienceIso) return 0;
  try {
    const year = new Date(experienceIso).getFullYear();
    return Math.max(0, new Date().getFullYear() - year);
  } catch {
    return 0;
  }
}

function capitalizeWords(str: string): string {
  return str
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function DoctorHeroBlock({ doctor, slug }: DoctorHeroBlockProps) {
  const experienceYears = getExperienceYears(doctor.doctorFields?.experience);
  const rating = doctor.doctorFields?.rating ?? 0;
  const ratingSource = doctor.doctorFields?.ratingSource ?? "Рейтинг";
  const imageUrl = doctor.featuredImage?.node?.sourceUrl;
  const imageAlt = doctor.featuredImage?.node?.altText || doctor.title;
  const imageWidth = doctor.featuredImage?.node?.mediaDetails?.width ?? 472;
  const imageHeight = doctor.featuredImage?.node?.mediaDetails?.height ?? 629;

  const clinics = Array.isArray(doctor.clinic)
    ? doctor.clinic
    : doctor.clinic
      ? [doctor.clinic]
      : [];

  const typeLabels = doctor.doctorTypes?.nodes?.map((t) => t.name) ?? [];
  const positionLabels = doctor.doctorPositions?.nodes?.map((p) => p.name) ?? [];
  const specializations = doctor.doctorSpecializations?.nodes ?? [];
  const hasKidsLabel = [...typeLabels, ...positionLabels, ...specializations.map((s) => s.name)].some(
    (l) => String(l).toLowerCase().includes("детск")
  );

  const serviceCategories = doctor.serviceCategories?.nodes ?? [];

  return (
    <section
      className="pt-6 pb-0"
      aria-labelledby="doctor-hero-name"
    >
      <div className="flex flex-col flex-wrap gap-8 lg:flex-row lg:items-start lg:gap-[130px]">
        {/* Левая колонка: бейджи (overlap) + фото (Figma 471.81×629.09, x:139). Ширина 36.9% (509/1380) по fluid-layout. */}
        <div className="relative w-full min-w-0 max-w-[min(100%,509px)] max-lg:self-center lg:w-[36.9%] lg:max-w-[509px] lg:shrink-0 lg:self-end">
          {/* Фото врача: 472×629, rounded-[25px] */}
          <div className="relative ml-0 lg:ml-[38px] w-full aspect-[472/629] max-w-[min(100%,472px)] max-h-[629px] overflow-hidden rounded-[25px]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={imageWidth}
                height={imageHeight}
                className="object-cover object-center w-full h-full"
                sizes="(max-width: 768px) 100vw, 472px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-unident-textGray">
                <Text variant="default" as="span">
                  Нет фото
                </Text>
              </div>
            )}
          </div>
          {/* Experience badge: 106.86×106.86, rounded-b-[97px], white (Figma x:101.69, y:54.87) */}
          <div className="absolute left-0 top-[42px] w-[107px] min-w-[107px] flex flex-col items-center justify-center gap-[9.71px] px-[23px] py-[31px] bg-white rounded-b-[97px]">
            <div className="flex items-baseline gap-[1.94px]">
              <Text
                variant="doctor-hero-experience-number"
                as="span"
                className="text-unident-dark"
              >
                {experienceYears}
              </Text>
              <Text
                variant="doctor-hero-experience-years"
                as="span"
                className="text-unident-dark"
              >
                лет
              </Text>
            </div>
            <Text
              variant="doctor-hero-experience-label"
              as="span"
              className="text-unident-dark text-center"
            >
              стаж
            </Text>
          </div>
          {/* Rating badge: 106.86×106.86, rounded-tl-[97px] (Figma x:101.69, y:191.76) */}
          <div className="absolute left-0 top-[179px] w-[107px] h-[107px] flex flex-col items-center justify-center gap-[9.71px] px-[14.5px] py-[31px] bg-unident-bgLightBlue rounded-tl-[97px] rounded-tr-none rounded-bl-[97px] rounded-br-[97px]">
            <div className="flex flex-col items-center gap-[3.89px]">
              <div className="flex items-center gap-[3.89px]">
                <Text
                  variant="doctor-hero-rating-number"
                  as="span"
                  className="text-unident-dark"
                >
                  {rating}
                </Text>
                <img
                  src="/images/figma/star-hero.svg"
                  alt=""
                  className="w-[13.6px] h-[15.54px] flex-shrink-0"
                  width={14}
                  height={16}
                />
              </div>
              <Text
                variant="doctor-hero-rating-source"
                as="span"
                className="text-unident-dark text-center"
              >
                {ratingSource}
              </Text>
            </div>
          </div>
        </div>

        {/* Правая колонка: имя, бейджи, направления, клиники, кнопка */}
        <div className="flex flex-col gap-[30px] min-w-0 flex-1">
          <Heading
            level={2}
            id="doctor-hero-name"
            variant="doctor-hero-title"
            className="text-unident-dark max-lg:order-1"
          >
            {doctor.title}
          </Heading>

          {/* Бейджи: тип и должность — span; специализации — ссылки на /specialization/[slug], hover без underline */}
          {(typeLabels.length > 0 || positionLabels.length > 0 || specializations.length > 0) && (
            <div className="flex flex-wrap items-center gap-[15px] max-lg:order-3">
              {typeLabels.map((label) => (
                <span
                  key={`type-${label}`}
                  className="inline-flex items-center justify-center gap-[5px] h-12 px-4 rounded-[15px] bg-white font-medium text-base leading-[1.177] tracking-[-0.01em] text-unident-dark border border-unident-borderGray/30"
                  style={{
                    minWidth:
                      label.toLowerCase().includes("детск")
                        ? 147
                        : label.length > 12
                          ? 127
                          : 112,
                  }}
                >
                  {hasKidsLabel && label.toLowerCase().includes("детск") && (
                    <img
                      src="/images/figma/kids-room-icon.svg"
                      alt=""
                      className="w-5 h-5 flex-shrink-0"
                      width={20}
                      height={20}
                    />
                  )}
                  {label}
                </span>
              ))}
              {positionLabels.map((label) => (
                <span
                  key={`pos-${label}`}
                  className="inline-flex items-center justify-center gap-[5px] h-12 px-4 rounded-[15px] bg-white font-medium text-base leading-[1.177] tracking-[-0.01em] text-unident-dark border border-unident-borderGray/30"
                  style={{
                    minWidth: label.length > 12 ? 127 : 112,
                  }}
                >
                  {label}
                </span>
              ))}
              {specializations.map((spec) => {
                const label = spec.name;
                return (
                  <Link
                    key={spec.id}
                    href={`/specialization/${spec.slug}`}
                    className="inline-flex items-center justify-center gap-[5px] h-12 px-4 rounded-[15px] bg-white font-medium text-base leading-[1.177] tracking-[-0.01em] text-unident-dark border border-unident-borderGray/30 hover:text-unident-primary hover:border-unident-primary hover:bg-unident-bgElements transition-colors"
                    style={{
                      minWidth:
                        label.toLowerCase().includes("детск")
                          ? 147
                          : label.length > 12
                            ? 127
                            : 112,
                    }}
                  >
                    {hasKidsLabel && label.toLowerCase().includes("детск") && (
                      <img
                        src="/images/figma/kids-room-icon.svg"
                        alt=""
                        className="w-5 h-5 flex-shrink-0"
                        width={20}
                        height={20}
                      />
                    )}
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Направления в работе: gap 7px, label #717171 16px, контент 18px — ссылки на категории */}
          {serviceCategories.length > 0 && (
            <div className="flex flex-col gap-[7px]">
              <Text
                as="span"
                variant="default"
                className="font-medium text-[#717171]"
              >
                Направления в работе:
              </Text>
              <span className="font-gilroy tracking-[-0.01em] text-unident-dark text-[18px] font-medium leading-[1.25]">
                {serviceCategories.map((cat, i) => (
                  <span key={cat.id}>
                    {i > 0 && ", "}
                    <Link
                      href={`/service-category/${cat.slug}`}
                      className="hover:text-unident-primary hover:underline transition-colors"
                    >
                      {capitalizeWords(cat.name)}
                    </Link>
                  </span>
                ))}
              </span>
            </div>
          )}

          {/* Принимает по адресу: gap 7px, кнопка клиники 185×48 */}
          {clinics.length > 0 && (
            <div className="flex flex-col gap-[7px] max-lg:order-5">
              <Text
                as="span"
                variant="default"
                className="font-medium text-[#717171]"
              >
                Принимает по адресу:
              </Text>
              <div className="flex flex-wrap gap-2">
                {clinics.map((clinic) => (
                  <Link
                    key={clinic.id}
                    href={`/clinics/${clinic.slug}`}
                    className="inline-flex items-center justify-center min-w-[185px] h-12 px-4 rounded-[15px] bg-white font-medium text-base leading-[1.177] tracking-[-0.01em] text-unident-dark border border-unident-borderGray/30 hover:bg-unident-bgElements transition-colors"
                  >
                    {clinic.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Кнопка «Записаться на прием»: 258×60, rounded-[15px] */}
          <div className="max-lg:order-2">
            <Button
              unidentVariant="primary"
              asChild
              className="min-w-[258px] min-h-[44px] py-4 rounded-[15px] text-base font-semibold leading-[1.19] tracking-[-0.01em]"
            >
              <Link href={`/doctors/${slug}#zapis`}>
                Записаться на прием
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

