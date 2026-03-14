/**
 * ServiceHeroBlock — Hero-блок страницы услуги (Figma article_card 886:4479)
 *
 * Двухколоночный layout: левая — заголовок, цена, категории, описание, кнопки;
 * правая — featured image. Данные из focusPrices, excerpt, serviceCategories.
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
import { DynamicIcon } from "@/components/dynamic-icon";
import { getCurrencySymbol } from "@/lib/currency";
import type { Price } from "@/types/price";

/** Минимальная форма услуги для Hero (из GraphQL Service) */
interface ServiceHeroInput {
  title: string;
  excerpt?: string | null;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails?: { width?: number; height?: number };
    };
  } | null;
  focusPrices?: Price[] | null;
  relatedPrices?: Price[] | null;
  serviceCategories?: { nodes: Array<{ id: string; name: string; slug: string }> } | null;
  servicePageBlocks?: {
    showPriceBlock?: boolean | null;
    exactPriceBlockIcon?: string | null;
    exactPriceBlockText?: string | null;
    exactPriceBlockLink?: string | null;
  } | null;
}

interface ServiceHeroBlockProps {
  service: ServiceHeroInput;
  telegramUrl?: string | null;
  servicePagesSettings?: {
    showPriceBlock?: boolean | null;
    exactPriceBlockIcon?: string | null;
    exactPriceBlockText?: string | null;
    exactPriceBlockLink?: string | null;
  } | null;
}

function formatPrice(price?: number | null, currency?: string | null): string {
  if (!price) return "";
  const symbol = getCurrencySymbol(currency || "RUB");
  return `${price.toLocaleString("ru-RU")} ${symbol}`;
}

function PriceDisplay({ price }: { price: Price }) {
  const { regularPrice, promoPrice, currency } = price.priceFields ?? {};

  if (!regularPrice && !promoPrice) return null;

  if (promoPrice) {
    return (
      <div className="flex items-center gap-[15px]">
        <Text
          as="span"
          variant="service-hero-price-current"
          className="text-unident-dark"
        >
          от {formatPrice(promoPrice, currency)}
        </Text>
        {regularPrice && (
          <Text
            as="span"
            variant="service-hero-price-old"
            className="line-through text-unident-dark"
          >
            от {formatPrice(regularPrice, currency)}
          </Text>
        )}
      </div>
    );
  }

  return (
    <Text
      as="span"
      variant="service-hero-price-current"
      className="text-unident-dark"
    >
      от {formatPrice(regularPrice, currency)}
    </Text>
  );
}

export function ServiceHeroBlock({ service, telegramUrl, servicePagesSettings }: ServiceHeroBlockProps) {
  const price =
    (service.focusPrices && service.focusPrices.length > 0
      ? service.focusPrices[0]
      : null) ??
    (service.relatedPrices && service.relatedPrices.length > 0
      ? service.relatedPrices[0]
      : null);

  const categories = service.serviceCategories?.nodes ?? [];
  const excerpt = service.excerpt ?? "";
  const imageNode = service.featuredImage?.node;
  const imageUrl = imageNode?.sourceUrl;
  const imageAlt = imageNode?.altText || service.title;
  const imageWidth = imageNode?.mediaDetails?.width ?? 733;
  const imageHeight = imageNode?.mediaDetails?.height ?? 486;

  // Пустая строка = «не заполнено» → брать global
  const exactPriceLink =
    service.servicePageBlocks?.exactPriceBlockLink?.trim() ||
    servicePagesSettings?.exactPriceBlockLink?.trim() ||
    telegramUrl ||
    "https://t.me/unident";

  const exactPriceIcon =
    service.servicePageBlocks?.exactPriceBlockIcon ||
    servicePagesSettings?.exactPriceBlockIcon ||
    "telegram";

  const exactPriceText =
    service.servicePageBlocks?.exactPriceBlockText?.trim() ||
    servicePagesSettings?.exactPriceBlockText?.trim() ||
    "Узнать точную стоимость в Телеграм";

  const showExactPriceBlock =
    service.servicePageBlocks?.showPriceBlock ??
    servicePagesSettings?.showPriceBlock ??
    true;

  const hasImage = !!imageUrl;

  return (
    <section
      className="rounded-[25px] bg-unident-bgLightGray overflow-hidden"
      aria-labelledby="service-hero-title"
    >
      <div
        className={`flex flex-col max-md:flex-col gap-6 max-md:gap-4 ${hasImage ? "lg:flex-row" : ""}`}
      >
        {/* Левая колонка — контент */}
        <div
          className={`flex-1 min-w-0 flex flex-col gap-6 max-md:gap-4 p-6 max-md:p-4 ${hasImage ? "lg:flex-none lg:w-[47%] lg:p-8 lg:pr-2.5" : "lg:p-8 lg:pr-2.5 lg:max-w-none"}`}
        >
          <Heading
            level={1}
            id="service-hero-title"
            variant="page-title"
            className="text-unident-dark"
          >
            {service.title}
          </Heading>

          {price && <PriceDisplay price={price} />}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/service-category/${cat.slug}`}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-[15px] bg-white font-gilroy font-medium text-unident-dark border border-unident-borderGray/30 hover:bg-unident-bgElements transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {excerpt && (
            <Text
              variant="default"
              className="text-unident-dark whitespace-pre-line"
            >
              {excerpt.replace(/\\n/g, "\n")}
            </Text>
          )}

          <div className="flex flex-wrap gap-8 max-md:flex-col max-md:gap-4">
            <Button
              unidentVariant="primary"
              asChild
              className="h-[60px] min-w-[281px] shrink-0 rounded-[15px] max-md:min-h-[44px] max-md:min-w-0 max-md:w-full"
            >
              <Link href="/contacts#zapis">Записаться</Link>
            </Button>
            {showExactPriceBlock && (
              <Link
                href={exactPriceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-[10px] min-h-[60px] shrink-0 rounded-[15px] border-0 border-unident-primary [border-image:none] text-unident-dark font-gilroy font-semibold transition-colors px-0 max-md:min-h-[44px] max-md:min-w-0 max-md:w-full"
                aria-label={exactPriceText}
              >
                <span
                  className="relative w-[60px] h-[60px] shrink-0 flex items-center justify-center max-md:w-[44px] max-md:h-[44px]"
                  aria-hidden
                >
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="max-md:w-[44px] max-md:h-[44px]"
                  >
                    <circle
                      cx="30"
                      cy="30"
                      r="30"
                      className="fill-white group-hover:fill-[#526AC2] transition-colors"
                    />
                  </svg>
                  <DynamicIcon
                    name={exactPriceIcon}
                    className="absolute inset-0 m-auto w-8 h-8 text-unident-primary group-hover:text-white max-md:w-6 max-md:h-6"
                  />
                </span>
                <span className="max-w-[190px] text-left leading-[1.1]">
                  {exactPriceText}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Правая колонка — изображение (только если есть) */}
        {hasImage && (
          <div className="w-full lg:w-[53%] shrink-0 aspect-[733/486] max-lg:aspect-video relative overflow-hidden">
            <Image
              src={imageUrl!}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className="object-cover w-full h-full"
              sizes="(max-width: 1024px) 100vw, 53vw"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}
