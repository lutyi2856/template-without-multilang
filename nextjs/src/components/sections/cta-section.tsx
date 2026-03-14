/**
 * CtaSection - секция Call To Action
 *
 * Компонент отображает блок CTA с заголовком, описанием, кнопками и изображениями.
 * Данные берутся из WordPress Option Page, с fallback на данные из Figma.
 *
 * Дизайн из Figma: node 93:336
 *
 * PERFORMANCE:
 * - Server Component (без 'use client')
 * - Fetch данных на сервере
 * - Fallback на статические данные из Figma
 *
 * @example
 * <CtaSection />
 */

import Image from "next/image";
import { Heading, Text, Container } from "@/components/design-system";
import { CallbackForm } from "@/components/forms/callback-form";
import { getMainPageSettings } from "@/lib/wordpress/api";

// Fallback данные из Figma
const figmaFallbackData = {
  heading: "Консультация, снимок и план лечения бесплатно",
  description:
    "Оставьте свой номер, мы свяжемся и подберём для вас удобное время приёма. Или позвоните нам сами — +7 499 643-44-05",
  phoneButton: "Телефон",
  appointmentButton: "Записаться",
  privacyText:
    "Отправляя заявку, вы соглашаетесь с политикой конфиденциальности",
};

/** Вариант расположения фото: option1 — текущая вёрстка; option2 — до правого края, не обрезать слева (Figma 186-1052) */
export type CtaImageLayout = "option1" | "option2";

export interface CtaDataOverride {
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPhone?: string;
  ctaPrivacyText?: string;
  ctaPrivacyLink?: string | null;
  ctaDoctorImage?: {
    url?: string;
    width?: number;
    height?: number;
    alt?: string;
  } | null;
  ctaBackgroundImage?: {
    url?: string;
    width?: number;
    height?: number;
    alt?: string;
  } | null;
}

interface CtaSectionProps {
  /** CSS класс для кастомизации */
  className?: string;
  /** Белый фон секции (область py-20 вокруг CTA-блока). По умолчанию прозрачный. */
  backgroundWhite?: boolean;
  /** Использовать фото врача для второго CTA (поле «The doctor's image for the second STA») */
  useSecondDoctorImage?: boolean;
  /** option1: фото в контейнере с отступами. option2: фото до правого края блока, левая часть не обрезается */
  imageLayout?: CtaImageLayout;
  /** Переопределение CTA-данных (например, из Option Page архива цен или акций). При наличии имеет приоритет над mainPageSettings */
  ctaData?: CtaDataOverride | null;
}

/**
 * Извлечь номер телефона из текста
 */
function extractPhoneFromText(text: string): string | null {
  // Паттерн для поиска телефона в формате +7 XXX XXX-XX-XX или +7 XXX XXX XX XX
  const phonePattern = /\+?\d[\d\s\-()]{9,}\d/g;
  const match = text.match(phonePattern);
  return match ? match[0].replace(/\s/g, "").replace(/[()]/g, "-") : null;
}

/**
 * Форматировать телефон для tel: ссылки (убираем пробелы, скобки, тире)
 */
function formatPhoneForTel(phoneNumber: string): string {
  return phoneNumber.replace(/[\s\-\(\)]/g, "");
}

/**
 * Секция CTA
 *
 * Отображает блок призыва к действию с возможностью редактирования через WordPress Option Page.
 * Если поля не заполнены, использует данные из Figma.
 */
export async function CtaSection({
  className = "",
  backgroundWhite = false,
  useSecondDoctorImage = false,
  imageLayout = "option1",
  ctaData,
}: CtaSectionProps) {
  // Fallback данные из Figma
  const figmaData = figmaFallbackData;

  // Получаем данные из WordPress (для фона, fallback; ctaData переопределяет CTA-поля)
  const mainPageSettings = await getMainPageSettings();

  // Источник данных: ctaData > mainPageSettings > figmaData
  // || вместо ?? — пустые строки из WP тоже триггерят fallback на figmaData
  const title =
    ctaData?.ctaTitle?.trim() ||
    mainPageSettings?.ctaTitle?.trim() ||
    figmaData.heading;

  const phoneFromCta = ctaData?.ctaPhone?.trim();
  const phoneFromSettings = mainPageSettings?.ctaPhone?.trim();
  const phoneFromFigma = extractPhoneFromText(figmaData.description);
  const phone =
    phoneFromCta || phoneFromSettings || phoneFromFigma || "";

  let baseDescription =
    ctaData?.ctaDescription?.trim() ||
    mainPageSettings?.ctaDescription?.trim() ||
    figmaData.description;

  // Убираем все телефоны из текста (если они там есть), чтобы не было дублирования
  const phonePattern = /\+?\d[\d\s\-()]{9,}\d/g;
  baseDescription = baseDescription.replace(phonePattern, "").trim();
  baseDescription = baseDescription.replace(/\s+/g, " ").trim();
  baseDescription = baseDescription.replace(/\s*—+\s*$/, "").trim();

  const parts = baseDescription.split("—");
  const descriptionBeforePhone = parts[0]?.trim() || "";
  const descriptionAfterPhone = parts.slice(1).join("—")?.trim() || "";

  const privacyText =
    ctaData?.ctaPrivacyText?.trim() ||
    mainPageSettings?.ctaPrivacyText?.trim() ||
    figmaData.privacyText;

  const privacyLink =
    ctaData?.ctaPrivacyLink ?? mainPageSettings?.ctaPrivacyLink ?? null;

  // Изображение врача: ctaData.ctaDoctorImage | первый CTA | второй CTA
  const doctorImageSource = ctaData?.ctaDoctorImage
    ? ctaData.ctaDoctorImage
    : useSecondDoctorImage
      ? mainPageSettings?.ctaDoctorImage2
      : mainPageSettings?.ctaDoctorImage;
  // Единый fallback для обоих CTA — пустая строка из WP не ломает отображение
  const doctorImageUrl = doctorImageSource?.url?.trim()
    ? doctorImageSource.url
    : "/images/cta/doctor.png";

  // Градиент по умолчанию — без fallback на /images/cta/background.png
  const backgroundImageUrl =
    ctaData?.ctaBackgroundImage?.url?.trim() ||
    mainPageSettings?.ctaBackgroundImage?.url?.trim() ||
    "";

  const doctorImageAlt = doctorImageSource?.alt || "Фото врача";
  const backgroundImageAlt =
    ctaData?.ctaBackgroundImage?.alt ||
    mainPageSettings?.ctaBackgroundImage?.alt ||
    "Фон блока CTA";

  // Мобильное изображение (только mainPageSettings; при ctaData — fallback на desktop)
  const mobileDoctorImageSource = ctaData?.ctaDoctorImage
    ? null
    : useSecondDoctorImage
      ? mainPageSettings?.ctaDoctorImage2Mobile
      : mainPageSettings?.ctaDoctorImageMobile;
  const mobileDoctorImageUrl =
    mobileDoctorImageSource?.url?.trim() || doctorImageUrl;
  const mobileDoctorImageAlt =
    mobileDoctorImageSource?.alt || doctorImageAlt;

  // Размеры изображения врача для desktop
  const doctorImageWidth = doctorImageSource?.width || 400;
  const doctorImageHeight = doctorImageSource?.height || 484;

  const hasDescription =
    descriptionBeforePhone?.trim() || phone || descriptionAfterPhone?.trim();

  const hasContent = Boolean(
    title?.trim() || hasDescription || doctorImageUrl
  );
  if (!hasContent) return null;

  return (
    <section
      className={`relative overflow-hidden py-20 ${backgroundWhite ? "bg-white" : ""} ${className}`}
    >
      <Container size="xl">
        {/* Блок CTA по Figma: 1380px, min-height 554px */}
          <div className="relative w-full max-w-[1380px] mx-auto rounded-[25px] overflow-hidden min-h-[400px] md:min-h-[554px]">
          {/* Фоновое изображение */}
          {backgroundImageUrl && (
            <div className="absolute inset-0 z-0">
              <Image
                src={backgroundImageUrl}
                alt={backgroundImageAlt}
                fill
                className="object-cover"
                priority={false}
              />
            </div>
          )}

          {/* Градиентный фон по умолчанию (когда нет фонового изображения) */}
          {!backgroundImageUrl && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#2E365D] to-[#46559D] z-0" />
          )}

          {/* Контент - grid two-column на desktop (52.17% / 1fr по Figma 720/1380) */}
          <div className="relative z-10 min-h-[400px] md:min-h-[554px] lg:min-h-[554px] grid grid-cols-1 lg:grid-cols-[52.17%_1fr] items-stretch p-8 lg:p-0">
            {/* Левая часть: текст и кнопки — grid задаёт 52.17%, max-w ограничивает контент */}
            <div className="text-white space-y-4 w-full min-w-0 lg:max-w-[720px] lg:pl-[68px] lg:pr-5 pt-0 pb-8 lg:pb-10 flex flex-col justify-center">
              {/* Мобильный/планшет: круглый аватар 80x80 сверху блока, белый фон */}
              {mobileDoctorImageUrl && (
                <div className="lg:hidden pb-4">
                  <div className="relative flex-shrink-0 w-20 h-20 rounded-full overflow-hidden bg-white p-1.5">
                    <Image
                      src={mobileDoctorImageUrl}
                      alt={mobileDoctorImageAlt}
                      fill
                      className="object-cover object-top"
                      sizes="80px"
                    />
                  </div>
                </div>
              )}

              {/* Заголовок */}
              <Heading level={2} variant="page-title" className="text-white leading-[1.193]">
                {title}
              </Heading>

              {/* Описание с кликабельным телефоном — только если есть контент */}
              {hasDescription && (
                <Text variant="large" className="text-white">
                  {descriptionBeforePhone}
                  {phone && (
                    <>
                      {" — "}
                      <a
                        href={`tel:${formatPhoneForTel(phone)}`}
                        className="no-underline hover:underline transition-all"
                      >
                        {phone}
                      </a>
                    </>
                  )}
                  {descriptionAfterPhone && ` ${descriptionAfterPhone}`}
                </Text>
              )}

              {/* Форма обратного звонка */}
              <CallbackForm
                variant="cta"
                privacyText={privacyText}
                privacyLink={privacyLink}
              />
            </div>

            {/* Правая часть: фото врача (только desktop). option1 — контейнер с отступами; option2 — до правого края */}
            {doctorImageUrl && (
              <div
                className={
                  imageLayout === "option2"
                    ? "hidden lg:flex flex-shrink-0 lg:flex-1 lg:min-w-0 lg:min-h-[554px] lg:h-full items-center justify-end"
                    : "hidden lg:flex flex-1 lg:min-w-0 lg:min-h-[554px] lg:h-full lg:pr-[68px] items-center justify-end"
                }
              >
                <div
                  className={
                    imageLayout === "option2"
                      ? "relative w-full min-h-[400px] lg:min-h-[554px] lg:h-full lg:w-full mx-auto lg:mx-0"
                      : "relative w-[300px] min-h-[400px] lg:w-full lg:max-w-[600px] lg:min-h-[554px] lg:h-full mx-auto"
                  }
                >
                  <Image
                    src={doctorImageUrl}
                    alt={doctorImageAlt}
                    fill
                    className={
                      imageLayout === "option2"
                        ? "object-cover object-[25%_50%] rounded-[15px] lg:rounded-l-[15px] lg:rounded-r-none"
                        : "object-cover rounded-[15px]"
                    }
                    sizes={
                      imageLayout === "option2"
                        ? "(max-width: 1024px) 100vw, 50vw"
                        : "(max-width: 1024px) 300px, 600px"
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
