/**
 * StatsBlock - статистический блок с финансовыми возможностями (Преимущества)
 *
 * Отображает карточки с информацией о финансовых возможностях клиники:
 * - ОМС лечение со скидками
 * - Возврат налога через налоговый вычет
 * - Беспроцентная рассрочка на лечение
 *
 * Данные из WordPress ACF Option Page (Main Page → Преимущества) или статический fallback.
 *
 * @example
 * <StatsBlock items={mainPageSettings?.preferencesItems} />
 */

import Link from "next/link";
import { Container, Section } from "@/components/design-system";
import { DynamicIcon } from "@/components/dynamic-icon";
import { ArrowUpRightIcon } from "@/icons";
import type { MainPagePreferenceItem } from "@/types/main-page";

interface StatsBlockProps {
  /** Карточки из WordPress (Main Page → Преимущества). Fallback на статичные при пустоте. */
  items?: MainPagePreferenceItem[] | null;
}

const STATIC_FALLBACK: MainPagePreferenceItem[] = [
  {
    icon: "percent",
    title: "Лечение по ОМС/ ДМС",
    description: "качественное лечение по страховому полису",
    href: "/oms-treatment",
  },
  {
    icon: "ruble",
    title: "Налоговый вычет",
    description: "качественное лечение по страховому полису",
    href: "/tax-return",
  },
  {
    icon: "installment",
    title: "Лечение в рассрочку",
    description: "качественное лечение по страховому полису",
    href: "/installment-treatment",
  },
];

export function StatsBlock({ items }: StatsBlockProps) {
  const displayItems = items?.length ? items : STATIC_FALLBACK;

  return (
    <Section
      variant="default"
      spacing="none"
      className="bg-white pt-[70px] pb-16"
    >
      <Container size="xl">
        {/* Карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayItems.map((item, index) => {
            const hasLink = Boolean(item.href?.trim());
            const isLastAndOdd =
              index === displayItems.length - 1 && displayItems.length % 2 === 1;
            const wrapperClass = isLastAndOdd
              ? "md:col-span-2 md:flex md:justify-center xl:col-span-1 xl:justify-end xl:h-full"
              : "";
            const innerClass = isLastAndOdd
              ? "block md:w-[calc((100%-1.25rem)/2)] xl:w-full xl:h-full"
              : "block h-full";

            const content = (
              <div
                className={`relative rounded-[25px] border-2 border-unident-borderGray bg-unident-bgElements p-8 transition-all duration-300 hover:border-unident-primary hover:shadow-xl ${isLastAndOdd ? "xl:h-full" : "h-full"}`}
              >
                {hasLink && (
                  <div className="absolute top-8 right-8">
                    <ArrowUpRightIcon className="h-[18px] w-[18px] text-unident-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                )}

                {item.icon && (
                  <DynamicIcon
                    name={item.icon}
                    svgMarkup={item.iconSvg}
                    className="mb-6 h-[60px] w-[60px] flex-shrink-0"
                  />
                )}

                <h3 className="mb-4 font-gilroy text-[28px] font-semibold leading-tight tracking-[-0.01em] text-unident-dark">
                  {item.title}
                </h3>

                <p className="mb-6 font-gilroy text-[16px] font-normal leading-relaxed text-unident-dark">
                  {item.description}
                </p>
              </div>
            );

            return (
              <div key={index} className={wrapperClass}>
                {hasLink ? (
                  <Link href={item.href!} className={`group ${innerClass}`}>
                    {content}
                  </Link>
                ) : (
                  <div className={innerClass}>{content}</div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
