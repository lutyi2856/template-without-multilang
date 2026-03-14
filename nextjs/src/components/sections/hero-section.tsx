import React from "react";
import Image from "next/image";
import { Container, Section, Text } from "@/components/design-system";
import { getApolloClient } from "@/lib/wordpress/client";
import { GET_HERO_DATA } from "@/lib/wordpress/queries/hero";
import { ActionCard } from "@/components/figma/action-card/action-card";
import type { ActionCardData } from "@/components/figma/action-card/types";

/**
 * HeroSection - Hero блок на главной странице (согласно Figma node 95-1356)
 *
 * Структура (pixel-perfect из Figma):
 * - Info Block (Frame 75): 912x608px с градиентом
 * - Action Card (Frame 76): 447x608px
 * - Gap: 20px
 * - Абсолютное позиционирование элементов внутри блоков
 *
 * PERFORMANCE: Server Component с ISR
 */
interface HeroSectionProps {
  /** Заголовок блока */
  heading?: string;
  /** Описание под заголовком */
  description?: string;
  /** Текст кнопки */
  buttonText?: string;
  /** Путь к изображению врача */
  doctorImage?: string;
}

export async function HeroSection({
  heading = "На 32% доступнее других стоматологий",
  description = "Итоговые планы лечения пациентов в нашей клинике получаются ниже средних цен на рынке стоматологических услуг Москвы и Подмосковья.",
  buttonText = "Получить консультацию",
  doctorImage = "/images/doctors/hero-doctor.png",
}: HeroSectionProps) {
  const client = getApolloClient();

  try {
    const { data } = await client.query({
      query: GET_HERO_DATA,
      fetchPolicy: "network-only", // Всегда свежие данные для настроек
    });

    // Данные из настроек главной страницы
    const mainPageSettings = data?.mainPageSettings;

    // Hero Image: только из настроек — если пусто, не рендерить (без fallback)
    const heroImage = mainPageSettings?.heroImage;
    const heroImageUrl = heroImage?.url ?? null;
    const heroImageWidth = heroImage?.width ?? 376;
    const heroImageHeight = heroImage?.height ?? 564;
    const heroImageAlt = heroImage?.alt ?? "Врач стоматолог";

    // Hero Vector: только из настроек — если пусто, не рендерить
    const heroVectorImage = mainPageSettings?.heroVectorImage;

    // Hero Title: если заполнено в настройках — используем, иначе props/default
    const heroTitle = mainPageSettings?.heroTitle || heading;

    // Hero Subtitle (description): если заполнено в настройках - используем, иначе props/default
    const heroSubtitle = mainPageSettings?.heroSubtitle || description;

    // Action Card: из настроек (featuredAction) или fallback на последнюю акцию
    const actionCardData: ActionCardData | null =
      mainPageSettings?.featuredAction || data.promotions?.nodes?.[0] || null;

    // Hero Badges: из repeater настроек — только заполненные
    const heroBadges = mainPageSettings?.heroBadges ?? [];

    return (
      <Section variant="default" spacing="none" className="py-6">
        {/* Full-width container для Hero блока (912px + 447px + 20px gap = 1379px минимум) */}
        {/* Убираем padding для точных размеров из Figma */}
        <div className="w-full">
          {/* Desktop: row, Mobile: column - ТОЧНЫЕ РАЗМЕРЫ ИЗ FIGMA */}
          <Container size="xl" className="flex flex-col flex-wrap gap-10 lg:flex-row lg:flex-wrap lg:justify-start lg:items-start lg:gap-5">
            {/* Info Block (Frame 75) - 912px, min-h 656px чтобы вместить фото врача (top 92 + height 564) */}
            <div
              className="relative w-full min-w-0 lg:w-[clamp(400px,63.33vw,912px)] lg:min-h-[656px] lg:flex-shrink-0 rounded-[25px] overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(46, 54, 93, 1) 0%, rgba(70, 85, 157, 1) 100%)",
              }}
            >
              {/* Декоративный Vector — только если добавлен в настройках */}
              {heroVectorImage?.url && (
                <Image
                  src={heroVectorImage.url}
                  alt={heroVectorImage.alt ?? ""}
                  width={heroVectorImage.width ?? 442}
                  height={heroVectorImage.height ?? 416}
                  className="absolute left-[506px] top-[48px] opacity-30 hidden lg:block pointer-events-none z-0"
                  aria-hidden="true"
                />
              )}

              {/* Mobile: flex layout */}
              <div className="lg:hidden relative z-10 p-[15px] flex flex-col gap-6 min-h-[500px]">
                <div className="flex flex-col gap-5">
                  <Text
                    as="h1"
                    variant="hero-title"
                    className="text-white"
                  >
                    {heroTitle}
                  </Text>
                  <Text
                    as="p"
                    variant="hero-subtitle"
                    className="text-white"
                  >
                    {heroSubtitle}
                  </Text>
                  <button className="w-fit px-8 py-4 rounded-[15px] border border-white bg-transparent font-gilroy text-[16px] font-semibold leading-[1.193] tracking-[-0.01em] text-white hover:bg-white/10 transition-colors">
                    {buttonText}
                  </button>
                </div>

                {/* Mobile (< 768px): badges only */}
                {heroBadges.length > 0 && (
                  <div className="flex md:hidden flex-wrap items-center gap-[5px] mt-auto">
                    {heroBadges.map((badge: { text: string }, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center gap-[10px] px-[10px] py-[10px] rounded-[41px] bg-[#607BD4]"
                      >
                        <Text
                          variant="counter-badge"
                          className="text-white whitespace-nowrap"
                        >
                          {badge.text}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tablet (768px–1023px): badges only, max-width чтобы не перекрывать фото */}
                {heroBadges.length > 0 && (
                  <div className="hidden md:flex md:flex-row items-end justify-between w-full mt-auto gap-4">
                    <div className="flex flex-wrap items-center gap-[5px] max-w-[calc(100%-200px)]">
                      {heroBadges.map((badge: { text: string }, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-center gap-[10px] px-[10px] py-[10px] rounded-[41px] bg-[#607BD4]"
                        >
                          <Text
                            variant="counter-badge"
                            className="text-white whitespace-nowrap"
                          >
                            {badge.text}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tablet: photo — absolute относительно родителя lg:hidden, прижато к низу */}
                {heroImageUrl && (
                  <Image
                    src={heroImageUrl}
                    alt={heroImageAlt}
                    width={heroImageWidth}
                    height={heroImageHeight}
                    className="hidden md:block absolute right-0 bottom-0 w-[280px] md:w-[320px] max-h-[303px] object-contain object-bottom z-10"
                    priority
                  />
                )}
              </div>

              {/* Desktop: flex layout — min-h 656px чтобы фото врача не выходило за границы */}
              <div className="hidden lg:flex relative w-full min-h-[656px] p-[51px] flex-col gap-5 z-20">
                {/* Content: heading, description, button */}
                <div className="flex flex-col gap-5 w-[clamp(300px,37.7vw,543px)]">
                  <Text
                    as="h1"
                    variant="hero-title"
                    className="text-white"
                  >
                    {heroTitle}
                  </Text>
                  <Text
                    as="p"
                    variant="hero-subtitle"
                    className="text-white"
                  >
                    {heroSubtitle}
                  </Text>
                  <button className="w-[252px] min-h-[44px] py-4 rounded-[15px] border border-white bg-transparent hover:bg-white/10 transition-colors flex items-center justify-center shrink-0">
                    <span className="font-gilroy text-[16px] font-semibold leading-[1.193] tracking-[-0.01em] text-white">
                      {buttonText}
                    </span>
                  </button>
                </div>

                {/* Badges — mt-auto прижимает к низу, на всю ширину контейнера */}
                {heroBadges.length > 0 && (
                  <div className="mt-auto flex flex-wrap items-center gap-[5px] w-full">
                    {heroBadges.map((badge: { text: string }, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center gap-[10px] px-[10px] py-[10px] rounded-[41px] bg-[#607BD4]"
                      >
                        <Text
                          variant="counter-badge"
                          className="text-white whitespace-nowrap"
                        >
                          {badge.text}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Image — привязан к низу контейнера */}
              {heroImageUrl && (
                <Image
                  src={heroImageUrl}
                  alt={heroImageAlt}
                  width={heroImageWidth}
                  height={heroImageHeight}
                  className="absolute left-[510.31px] bottom-0 w-[375.72px] aspect-[375.72/563.71] max-h-[563.71px] object-cover object-bottom z-10 hidden lg:block"
                  priority
                />
              )}
            </div>

            {/* Action Card (Frame 76) - 447x608px - ТОЧНЫЙ РАЗМЕР ИЗ FIGMA */}
            {actionCardData && (
              <div className="w-full lg:w-[clamp(300px,31vw,447px)] lg:min-h-[608px] lg:flex-shrink-0">
                <ActionCard data={actionCardData} />
              </div>
            )}
          </Container>
        </div>
      </Section>
    );
  } catch (error) {
    console.error("Error fetching hero data:", error);

    // Fallback UI при ошибке
    return (
      <Section variant="default" spacing="none" className="py-6">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div
            className="relative min-h-[500px] lg:min-h-[608px] rounded-[25px] overflow-hidden p-8 lg:p-[51px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(46, 54, 93, 1) 0%, rgba(70, 85, 157, 1) 100%)",
            }}
          >
            <div className="flex flex-col gap-5">
              <Text
                as="h1"
                variant="hero-title"
                className="text-white"
              >
                {heading}
              </Text>
              <Text
                as="p"
                variant="hero-subtitle"
                className="text-white max-w-[450px]"
              >
                {description}
              </Text>
              <button className="w-fit mt-4 px-8 py-4 rounded-[15px] border border-white bg-transparent font-gilroy text-[16px] font-semibold leading-[1.193] tracking-[-0.01em] text-white">
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </Section>
    );
  }
}
