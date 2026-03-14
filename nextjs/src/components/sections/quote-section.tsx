/**
 * QuoteSection - секция с цитатой главного врача
 *
 * Компонент отображает блок цитаты с данными из WordPress Option Page (вкладка "Руководство").
 * Данные берутся динамически через GraphQL, с fallback на данные из Figma.
 *
 * Дизайн из Figma: node 95:1468
 * Структура: два блока рядом - левый (изображение 679x593px), правый (форма с текстом)
 *
 * PERFORMANCE:
 * - Server Component (без 'use client')
 * - Fetch данных на сервере
 * - Fallback на статические данные из Figma
 *
 * @example
 * <QuoteSection />
 */

import Image from "next/image";
import { Text, Container } from "@/components/design-system";
import { getMainPageSettings } from "@/lib/wordpress/api";

// Fallback данные из Figma (из кэша quote.json)
const figmaFallbackData = {
  quoteText:
    "«Меня зовут [Имя Фамилия], я главный врач стоматологии УниДент в Санкт-Петербурге.\n\nМы создали клинику, чтобы у вас был доступ к честной, современной и действительно качественной стоматологии. Здесь не лечат «на глаз» и не навязывают лишнего — всё по науке и с уважением к людям.\n\nЕсли у вас есть вопросы или идеи, как сделать клинику ещё лучше — я всегда на связи.»",
  authorName: "Фамилия\nИмя Отчество",
  authorPosition: "Генеральный директор сети клиник «Унидент»",
};

interface QuoteSectionProps {
  /** CSS класс для кастомизации */
  className?: string;
}

/**
 * Секция Quote
 *
 * Отображает блок цитаты главного врача с возможностью редактирования через WordPress Option Page.
 * Если поля не заполнены, использует данные из Figma.
 *
 * Структура по Figma:
 * - Два блока рядом (flex row)
 * - Левый блок: изображение клиники (679px ширина, 593px высота)
 * - Отступ между блоками: 22px
 * - Правый блок: форма с текстом, горизонтальной линией, фото в строке, именем, должностью, подписью
 */
export async function QuoteSection({ className = "" }: QuoteSectionProps) {
  // Fallback данные из Figma
  const figmaData = figmaFallbackData;

  // Получаем данные из WordPress через единую функцию API
  const mainPageSettings = await getMainPageSettings();

  // Определяем значения с fallback логикой
  // WYSIWYG поля (guidanceContent, guidanceSubscribe) всегда возвращают HTML из WordPress
  // Fallback данные из Figma - обычный текст
  const quoteTextRaw =
    mainPageSettings?.guidanceContent?.trim() || figmaData.quoteText;
  const authorNameRaw =
    mainPageSettings?.guidanceSubscribe?.trim() || figmaData.authorName;
  const authorPosition =
    mainPageSettings?.guidancePositions?.trim() || figmaData.authorPosition;

  // Если данные из WordPress - используем как HTML, если fallback - конвертируем переносы в <br>
  const quoteText = mainPageSettings?.guidanceContent
    ? quoteTextRaw
    : quoteTextRaw.replace(/\n/g, "<br />");
  const authorName = mainPageSettings?.guidanceSubscribe
    ? authorNameRaw
    : authorNameRaw.replace(/\n/g, "<br />");

  // Изображения по маппингу из WordPress:
  // guidanceImage -> левое изображение клиники (679x593)
  // guidanceManagerImage -> аватар врача (круглый, в правом блоке)
  // guidanceMediaImage -> изображение подписи (в конце строки)
  const leftImage = mainPageSettings?.guidanceImage; // Левое изображение клиники
  const authorAvatar = mainPageSettings?.guidanceManagerImage; // Аватар врача (круглый, в правом блоке)
  const signatureImage = mainPageSettings?.guidanceMediaImage; // Изображение подписи (в конце строки)

  // Если все поля пустые (даже после fallback), не показываем блок
  if (
    !quoteText &&
    !authorName &&
    !authorPosition &&
    !leftImage?.url &&
    !authorAvatar?.url &&
    !signatureImage?.url
  ) {
    return null;
  }

  return (
    <section className={`py-20 ${className}`}>
      <Container size="xl">
        {/* Контейнер для двух блоков: высота 593px по Figma */}
        <div className="flex flex-col lg:flex-row lg:flex-nowrap gap-4 lg:gap-[22px] items-start">
          {/* Левый блок: изображение — full-bleed на планшете, 679px на desktop */}
          {leftImage?.url && (
            <div className="relative w-[calc(100%+40px)] -mx-5 md:w-[calc(100%+20px)] md:-mx-[10px] lg:w-[49.2%] lg:max-w-[679px] lg:mx-0 lg:min-w-0 aspect-[4/3] lg:aspect-[679/593] min-h-[300px] flex-shrink-0 overflow-hidden rounded-[25px]">
              <Image
                src={leftImage.url}
                alt={leftImage.alt || "Клиника УниДент"}
                width={679}
                height={593}
                className="object-contain object-top w-full h-auto rounded-[25px]"
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 679px"
              />
            </div>
          )}

          {/* Правый блок: форма с контентом */}
          <div className="flex-1 bg-unident-bgElements rounded-[25px] pt-[15px] pr-[15px] pl-[15px] pb-[15px] md:pt-8 md:pr-8 md:pl-8 md:pb-0 lg:pt-12 lg:pl-12 lg:pr-12 lg:pb-12 flex flex-col">
            {/* Текст цитаты сверху */}
            {quoteText && quoteText.trim() && (
              <Text
                as="div"
                variant="quote-text"
                className="text-unident-dark mb-[57px] [&>p]:mb-4 [&>p:last-child]:mb-0 [&>p]:block"
                dangerouslySetInnerHTML={{ __html: quoteText }}
              />
            )}

            {/* Горизонтальная пунктирная линия разделитель */}
            {(authorAvatar || authorName || authorPosition || signatureImage) && (
              <div className="w-full h-px border-t-2 border-dashed border-[#607BD4] mb-8" />
            )}

            {/* Нижняя часть: фото, имя, должность, подпись */}
            {(authorAvatar || authorName || authorPosition || signatureImage) && (
              <>
                {/* Mobile layout (<768px): фото сверху, имя+подпись, должность */}
                <div className="flex flex-col gap-4 md:hidden">
                  {authorAvatar?.url && (
                    <div className="flex justify-start">
                      <div
                        className="relative flex-shrink-0 flex items-center justify-center rounded-full pt-2 px-2 pb-0 w-24 h-24"
                        style={{
                          background:
                            "linear-gradient(180deg, #2E365D 0%, #46559D 100%)",
                        }}
                      >
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <Image
                            src={authorAvatar.url}
                            alt={authorAvatar.alt || "Аватар врача"}
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                            loading="lazy"
                            sizes="96px"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {authorName && authorName.trim() && (
                      <Text
                        as="div"
                        variant="quote-author-name"
                        className="text-unident-dark"
                        dangerouslySetInnerHTML={{ __html: authorName }}
                      />
                    )}
                    {signatureImage?.url && (
                      <div className="relative w-32 h-16 flex-shrink-0 opacity-80">
                        <Image
                          src={signatureImage.url}
                          alt="Подпись"
                          width={128}
                          height={64}
                          className="object-contain"
                          loading="lazy"
                          sizes="128px"
                        />
                      </div>
                    )}
                  </div>
                  {authorPosition && (
                    <Text
                      variant="quote-author-position"
                      className="text-unident-textGray"
                    >
                      {authorPosition}
                    </Text>
                  )}
                </div>

                {/* Desktop/Tablet layout (≥768px): фото, имя+должность, подпись в строке */}
                <div className="hidden md:flex items-center gap-4">
                  {authorAvatar?.url && (
                    <div
                      className="relative flex-shrink-0 flex items-center justify-center rounded-full pt-2 px-2 pb-0 w-24 h-24 lg:w-[110px] lg:h-[110px]"
                      style={{
                        background:
                          "linear-gradient(180deg, #2E365D 0%, #46559D 100%)",
                      }}
                    >
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={authorAvatar.url}
                          alt={authorAvatar.alt || "Аватар врача"}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                          loading="lazy"
                          sizes="110px"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 flex-1">
                    {authorName && authorName.trim() && (
                      <Text
                        as="div"
                        variant="quote-author-name"
                        className="text-unident-dark"
                        dangerouslySetInnerHTML={{ __html: authorName }}
                      />
                    )}
                    {authorPosition && (
                      <Text
                        variant="quote-author-position"
                        className="text-unident-textGray"
                      >
                        {authorPosition}
                      </Text>
                    )}
                  </div>
                  {signatureImage?.url && (
                    <div className="relative w-32 h-16 flex-shrink-0 opacity-80">
                      <Image
                        src={signatureImage.url}
                        alt="Подпись"
                        width={128}
                        height={64}
                        className="object-contain"
                        loading="lazy"
                        sizes="128px"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
