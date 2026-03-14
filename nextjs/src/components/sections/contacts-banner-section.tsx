/**
 * ContactsBannerSection - баннер на странице контактов
 *
 * Промо-баннер "Ваша улыбка — наша забота".
 * Данные из WordPress ContactsBannerData, с fallback на статичные значения.
 *
 * Структура:
 * - Левая часть: логотип, заголовок, описание, кнопка
 * - Правая часть: декоративное изображение
 *
 * PERFORMANCE: Server Component (без 'use client')
 */

import Image from "next/image";
import Link from "next/link";
import { Section, Container, Heading, Text, Button } from "@/components/design-system";
import type { ContactsBannerData } from "@/types/contacts";

interface ContactsBannerSectionProps {
  banner?: ContactsBannerData | null;
  className?: string;
}

/** Figma cta (414:3874): "Наша забота - ваша улыбка", кнопка fills '3' (#526AC2), borderRadius 15px */
const fallback = {
  heading: "Наша забота - ваша улыбка",
  description:
    "Современное оборудование, опытные врачи и индивидуальный подход к каждому пациенту. Запишитесь на консультацию — первый шаг к красивой улыбке.",
  buttonText: "Подробнее о нас",
  buttonUrl: "/about",
};

export function ContactsBannerSection({
  banner,
  className = "",
}: ContactsBannerSectionProps) {
  const heading = banner?.heading || fallback.heading;
  const description = banner?.description || fallback.description;
  const buttonText = banner?.buttonText || fallback.buttonText;
  const buttonUrl = banner?.buttonUrl || fallback.buttonUrl;

  const logoUrl = banner?.logo?.url;
  // Figma: 75×75px (не использовать размер из WP — может быть 152×152)
  const logoSize = 75;

  const imageUrl = banner?.image?.url;
  const imageWidth = banner?.image?.width || 600;
  const imageHeight = banner?.image?.height || 500;

  return (
    <Section
      variant="default"
      spacing="none"
      className={`pt-[70px] pb-16 ${className}`}
    >
      <Container size="xl">
        <div className="relative w-full rounded-[25px] overflow-hidden bg-gradient-to-br from-[#2E365D] to-[#46559D] min-h-[400px]">
          <div className="relative z-10 flex flex-col lg:flex-row items-stretch">

            {/* Левая часть: контент */}
            <div className="flex flex-col justify-center gap-6 w-full lg:w-[55%] lg:max-w-[660px] p-8 md:p-12 lg:pl-16 lg:py-16">
              {/* Логотип — Figma 75×75px */}
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt="Логотип УниДент"
                  width={logoSize}
                  height={logoSize}
                  className="object-contain flex-shrink-0"
                />
              )}

              {/* Заголовок — Figma hero: 50px SemiBold, line-height 1.193 */}
              <Heading
                level={2}
                variant="reviews-cta-heading"
                className="text-white font-gilroy"
              >
                {heading}
              </Heading>

              {/* Описание — Figma hero: 19px Regular, line-height 1.25 */}
              <Text
                variant="large"
                className="text-white/80 text-[19px] font-normal leading-[1.25]"
              >
                {description}
              </Text>

              {/* Кнопка — Figma (414:3930): fills '3' #526AC2, 16px SemiBold, borderRadius 15px */}
              {buttonText && (
                <div className="mt-2">
                  <Button
                    unidentVariant="primary"
                    asChild
                    className="text-[16px] font-semibold"
                  >
                    <Link href={buttonUrl}>{buttonText}</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Правая часть: изображение — 109px от правого края, без оверлея */}
            {imageUrl ? (
              <div className="relative w-full lg:flex-1 lg:min-h-[400px] min-h-[260px] lg:pr-[109px]">
                <Image
                  src={imageUrl}
                  alt="Стоматологическая клиника УниДент"
                  width={imageWidth}
                  height={imageHeight}
                  className="absolute inset-0 w-full h-full object-contain object-right-bottom"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              /* Декоративный placeholder если изображения нет */
              <div className="hidden lg:flex flex-1 items-center justify-center p-16 opacity-20">
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  className="w-48 h-48 text-white"
                  aria-hidden
                >
                  <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="4" />
                  <path
                    d="M65 80 Q100 60 135 80 Q145 100 135 120 Q100 140 65 120 Q55 100 65 80Z"
                    fill="currentColor"
                    opacity="0.6"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
