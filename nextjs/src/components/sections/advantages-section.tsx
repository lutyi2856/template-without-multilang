/**
 * AdvantagesSection - секция с преимуществами клиники
 *
 * Поддерживает три режима:
 * - Главная: title, descriptionHtml, items (MainPageTrustedItem), columns из mainPageSettings
 * - Контакты: title, description, items (ContactsAdvantageItem с иконками)
 * - Fallback: без props — статичные данные
 *
 * PERFORMANCE: Server Component (без 'use client')
 */

import {
  Section,
  Heading,
  Text,
  Badge,
  Container,
} from "@/components/design-system";
import { ArrowUpRightIcon } from "@/icons";
import { DynamicIcon } from "@/components/dynamic-icon";
import { cn } from "@/lib/utils";
import type { ContactsAdvantageItem } from "@/types/contacts";
import type { MainPageTrustedItem } from "@/types/main-page";

/** Grid columns: md (tablet) 2 колонки, xl (desktop 1280px+) по columns prop */
const GRID_COLS_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2 xl:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export interface AdvantageItem {
  number?: string;
  icon?: string | null;
  iconSvg?: string | null;
  title: string;
  description: string;
}

export interface AdvantagesSectionProps {
  /** Заголовок блока */
  title?: string | null;
  /** Описание (plain text) */
  description?: string | null;
  /** Описание (HTML из WYSIWYG). При наличии используется вместо description */
  descriptionHtml?: string | null;
  /** Карточки: MainPageTrustedItem[] (главная) или ContactsAdvantageItem[] (контакты) */
  items?: (MainPageTrustedItem | ContactsAdvantageItem)[] | null;
  /** Колонок на десктопе (1–4), default 3 */
  columns?: number | null;
}

const staticAdvantages: AdvantageItem[] = [
  {
    number: "01",
    title: "Честные цены, без хитрых уловок",
    description:
      "Фиксируем цены в плане лечения и не меняем их без согласования. Никаких скрытых доплат.",
  },
  {
    number: "02",
    title: "Общаемся по-человечески",
    description:
      "Легко и просто: на звонки отвечает человек, а не автоответчик. Записываем к нужному врачу без очередей.",
  },
  {
    number: "03",
    title: "Слушаем, объясняем, лечим с умом",
    description:
      "Не давим, не пугаем и не лечим «на глаз». Подбираем варианты лечения под запросы пациента.",
  },
];

const staticTitle = "Нам доверили уже 1 204 пациента";
const staticDescription =
  "Унидент — многопрофильная научная стоматология с сертификатом качества Росздравнадзора. Мы стремимся сделать высококачественную стоматологическую помощь доступной.";

/** Ширина центрированной карточки: tablet = 2-col, desktop сбрасываем */
const CENTERED_CARD_WIDTH = "md:w-[calc((100%-1.25rem)/2)] xl:w-full";

/** xl:col-start для последней карточки в ряду из 2 (5, 8, 11... карточек) */
const COL_START_CLASS: Record<number, string> = {
  2: "xl:col-start-2",
  3: "xl:col-start-3",
  4: "xl:col-start-4",
};

/** Первые 2 слова — стандартный цвет, остальное — text-unident-primary (#526AC2) */
function renderTitleWithAccent(title: string) {
  const words = title.trim().split(/\s+/);
  const firstTwo = words.slice(0, 2).join(" ");
  const rest = words.slice(2).join(" ");
  return (
    <>
      {firstTwo}
      {rest ? (
        <>
          {" "}
          <span className="text-unident-primary">{rest}</span>
        </>
      ) : null}
    </>
  );
}

function mapToAdvantageItem(
  item: MainPageTrustedItem | ContactsAdvantageItem
): AdvantageItem {
  const contactItem = item as ContactsAdvantageItem;
  const trustedItem = item as MainPageTrustedItem;
  return {
    number: trustedItem.number ?? undefined,
    icon: contactItem.icon,
    iconSvg: contactItem.iconSvg,
    title: (contactItem.title ?? trustedItem.title) ?? "",
    description: (contactItem.description ?? trustedItem.description) ?? "",
  };
}

export function AdvantagesSection({
  title,
  description,
  descriptionHtml,
  items,
  columns = 3,
}: AdvantagesSectionProps = {}) {
  const columnsVal = columns && columns >= 1 && columns <= 4 ? columns : 3;
  const gridColsClass = GRID_COLS_CLASS[columnsVal] ?? GRID_COLS_CLASS[3];

  const hasItemsFromProps = items && items.length > 0;
  const resolvedItems: AdvantageItem[] = hasItemsFromProps
    ? items!.map(mapToAdvantageItem)
    : staticAdvantages;

  const hasItems = resolvedItems.length > 0;

  const resolvedTitle = title ?? staticTitle;
  const resolvedDescription = description ?? staticDescription;
  const useDescriptionHtml = descriptionHtml?.trim();

  /** На странице контактов: если нет данных из option page — секцию не показываем */
  const useOptionPageOnly = items !== undefined;
  if (useOptionPageOnly && !hasItemsFromProps && !title && !description && !useDescriptionHtml) {
    return null;
  }

  return (
    <Section variant="default" spacing="none">
      <Container size="xl">
        <div className="bg-unident-bgTopbar rounded-[25px] p-[15px] md:px-12 md:py-16">
          {/* Верхняя часть — заголовок, описание */}
          <div className="mb-[40px] flex flex-col gap-5">
            <Heading level={2} variant="advantages-heading">
              {renderTitleWithAccent(resolvedTitle)}
            </Heading>
            {useDescriptionHtml ? (
              <div
                className="font-gilroy text-[18px] font-normal leading-[1.25] text-unident-dark [&>p]:mb-3 [&>p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: useDescriptionHtml }}
              />
            ) : (
              <Text variant="advantages-description">{resolvedDescription}</Text>
            )}
          </div>

          {/* Карточки преимуществ: grid, tablet 2 колонки, desktop по columns; последняя при нечётном — по центру */}
          {hasItems && (
            <div
              className={cn(
                "grid gap-5",
                gridColsClass
              )}
            >
              {resolvedItems.map((advantage, index) => {
                const hasIcon = !!advantage.icon;
                const isLastAndOdd =
                  index === resolvedItems.length - 1 &&
                  resolvedItems.length % 2 === 1;
                const isLastInRowOfTwo =
                  index === resolvedItems.length - 1 &&
                  resolvedItems.length % columnsVal === 2 &&
                  resolvedItems.length > columnsVal;
                const wrapperClass = cn(
                  isLastAndOdd &&
                    "md:col-span-2 md:flex md:justify-center xl:col-span-1 xl:h-full",
                  isLastInRowOfTwo && (COL_START_CLASS[columnsVal] ?? "")
                );
                const innerClass = isLastAndOdd
                  ? `block ${CENTERED_CARD_WIDTH} xl:h-full`
                  : "block h-full";

                const card = (
                  <div
                    className={cn(
                      "group relative flex min-h-0 flex-col rounded-[25px] border-2 border-unident-borderGray bg-unident-bgElements p-[15px] md:p-8 transition-all duration-300 hover:border-unident-primary hover:shadow-xl",
                      isLastAndOdd ? "xl:h-full" : "h-full"
                    )}
                  >
                    {hasIcon && (
                      <div className="absolute top-8 right-8">
                        <ArrowUpRightIcon className="h-[18px] w-[18px] text-unident-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    )}
                    {hasIcon ? (
                      <DynamicIcon
                        name={advantage.icon}
                        svgMarkup={advantage.iconSvg}
                        className="mb-6 h-[60px] w-[60px] flex-shrink-0"
                      />
                    ) : advantage.number ? (
                      <Badge variant="number" className="mb-6 shrink-0">
                        {advantage.number}
                      </Badge>
                    ) : null}
                    <Heading
                      level={3}
                      variant="advantages-card-title"
                      className="mb-4 shrink-0"
                    >
                      {advantage.title}
                    </Heading>
                    <Text variant="advantages-card-text">
                      {advantage.description}
                    </Text>
                  </div>
                );

                return (
                  <div key={index} className={wrapperClass}>
                    <div className={innerClass}>{card}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
