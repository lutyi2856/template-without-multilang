/**
 * ReviewsArchiveCtaSection — CTA блок призыва оставить отзыв на странице /reviews
 *
 * Figma node 440:4263. Данные из Option Page «Архив отзывов».
 * Layout: фон #607BD4, rounded-[25px], левая колонка — иконка, заголовок, описание, кнопка;
 * правая часть — фото людей, декоративный подарок.
 */

import Image from "next/image";
import Link from "next/link";
import { Heading, Text, Button, Container } from "@/components/design-system";
import { getReviewsArchiveSettings } from "@/lib/wordpress";
import type { ReviewsArchiveSettings } from "@/types/reviews-archive";

const FIGMA_FALLBACK = {
  title:
    "Оставьте отзыв и получите бонус при следующем посещении",
  description:
    "Ваши замечания и пожелания помогают нам улучшать качество и сервис. Напишите нам, и мы сделаем всё возможное, чтобы стать ещё лучше!",
  buttonText: "Оставить отзыв",
};

/** Fallback: статичные assets в public/images/figma (скачаны из Figma). Если нет — только из Option Page. */
const FALLBACK_IMAGES = {
  people: "/images/figma/reviews-cta-people.png",
  gift: "/images/figma/reviews-cta-gift-482e00.png",
  icon: "/images/figma/reviews-cta-icon.svg",
  vector: "/images/figma/reviews-cta-vector.svg",
} as const;

function imageUrl(
  settingsImage: { url?: string | null } | null | undefined,
  fallback: string
): string | null {
  if (settingsImage?.url) return settingsImage.url;
  return fallback;
}

export async function ReviewsArchiveCtaSection() {
  const settings: ReviewsArchiveSettings | null =
    await getReviewsArchiveSettings();

  const title = settings?.ctaTitle?.trim() || FIGMA_FALLBACK.title;
  const description =
    settings?.ctaDescription?.trim() || FIGMA_FALLBACK.description;
  const buttonText =
    settings?.ctaButtonText?.trim() || FIGMA_FALLBACK.buttonText;

  const peopleSrc = imageUrl(settings?.ctaContentImage, FALLBACK_IMAGES.people);
  const giftSrc = imageUrl(settings?.ctaGiftImage, FALLBACK_IMAGES.gift);
  const iconSrc = imageUrl(settings?.ctaIcon, FALLBACK_IMAGES.icon);
  const vectorSrc = imageUrl(settings?.ctaBackground, FALLBACK_IMAGES.vector);

  return (
    <SectionWrapper peopleSrc={peopleSrc}>
      {/* Декоративный вектор (справа, полупрозрачный) */}
      {vectorSrc && (
        <div
          className="absolute right-0 top-0 w-[723px] h-[702px] -translate-y-11 pointer-events-none opacity-[0.04] hidden lg:block"
          aria-hidden
        >
          <Image
            src={vectorSrc}
            alt=""
            width={723}
            height={702}
            className="object-contain object-right-top w-full h-full"
            unoptimized={vectorSrc.endsWith(".svg")}
          />
        </div>
      )}

      {/* Контент: max-lg 80%, mobile 100%; pb +50px на mobile */}
      <div className="relative z-10 flex flex-col gap-8 max-w-[705px] max-lg:max-w-[80%] max-sm:max-w-full px-5 pt-10 pb-10 max-sm:pb-[194px] md:px-6 lg:px-0 lg:pr-0 lg:pl-[74px] lg:pt-[79px] lg:pb-16">
        {iconSrc && (
          <div className="relative w-[76px] h-[76px] flex-shrink-0">
            <Image
              src={iconSrc}
              alt="Иконка: оставить отзыв"
              width={76}
              height={76}
              className="object-contain"
              unoptimized={iconSrc.endsWith(".svg")}
            />
          </div>
        )}

        <div className="flex flex-col gap-5">
          <Heading
            level={2}
            id="reviews-archive-cta-heading"
            variant="reviews-cta-heading"
            className="text-white font-gilroy max-w-[702px]"
          >
            {title}
          </Heading>
          <Text
            variant="default"
            as="p"
            className="text-white font-gilroy text-lg font-normal leading-[1.16] tracking-[-0.03em] max-sm:max-w-full md:max-w-[408px] pr-4 md:pr-6"
          >
            {description}
          </Text>
        </div>

        <div className="flex flex-col gap-[11px] w-full max-w-[277px]">
          <Button
            asChild
            className="w-full h-14 rounded-[15px] font-gilroy text-base font-semibold leading-[1.193] tracking-[-0.01em] bg-unident-dark text-white hover:bg-unident-dark/90 border-0"
          >
            <Link href="/#cta">{buttonText}</Link>
          </Button>
        </div>
      </div>

      {/* Фото людей: max-lg — background родителя (см. SectionWrapper); lg — Image справа */}
      {peopleSrc && (
        <div
          className="absolute z-10 pointer-events-none hidden
            lg:right-0 lg:top-[24px] lg:block lg:w-[50%] lg:max-w-[645px] lg:h-[calc(100%-24px)] lg:min-h-[530px]"
        >
          <Image
            src={peopleSrc}
            alt="Пациенты оставляют отзыв"
            fill
            className="object-contain object-right-bottom object-scale-down"
            sizes="645px"
            unoptimized={peopleSrc.endsWith(".svg")}
          />
        </div>
      )}

      {/* Подарок (Figma 440:4276): 384×185, pos x:426 y:369 → left-[426px] bottom-0 */}
      {giftSrc && (
        <div
          className="absolute left-[426px] bottom-0 w-[384px] h-[185px] hidden xl:block pointer-events-none"
          aria-hidden
        >
          <Image
            src={giftSrc}
            alt=""
            width={384}
            height={185}
            className="object-contain object-bottom w-full h-full"
            unoptimized={giftSrc.endsWith(".svg")}
          />
        </div>
      )}
    </SectionWrapper>
  );
}

function SectionWrapper({
  children,
  peopleSrc,
}: {
  children: React.ReactNode;
  peopleSrc?: string | null;
}) {
  return (
    <section
      className="w-full py-10 lg:py-16"
      aria-labelledby="reviews-archive-cta-heading"
    >
      <Container size="xl">
        <div className="relative w-full max-w-[1380px] mx-auto">
          <div
            className="relative w-full rounded-[25px] overflow-hidden min-h-[400px] lg:min-h-[554px] bg-[#607BD4]"
            style={{ minHeight: 554 }}
          >
            {/* Фото людей как background на max-lg: справа внизу; kill screen — по центру внизу */}
            {peopleSrc && (
              <div
                className="absolute inset-0 z-0 pointer-events-none max-lg:block lg:hidden bg-no-repeat bg-[length:auto_50%] max-sm:bg-[length:auto_28%] bg-right-bottom max-xs:bg-bottom"
                style={{ backgroundImage: `url(${peopleSrc})` }}
                aria-hidden
              />
            )}
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}
