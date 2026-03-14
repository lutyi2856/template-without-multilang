/**
 * PriceArchiveAdvantages - карточки преимуществ для страницы /prices
 *
 * Дизайн из Figma: price/ 1440 (405:3155), Frame 2131328778 (440:4369).
 * Карточки "service": fills '8' (#F5F7F9), borderRadius 25px, row layout,
 * иконка (круглая, белая) + заголовок. layout_Y4Q4SG: row, gap 20px.
 * layout_W50KZ1: карточка 386×107px.
 * style_DWJW3M: 20px SemiBold, line-height 1.19, letter-spacing -1%.
 */

import Image from "next/image";
import { Icon } from "@iconify/react";
import { Text } from "@/components/design-system";
import { cn } from "@/lib/utils";
import type { PriceArchiveAdvantage } from "@/types/price-archive";

interface PriceArchiveAdvantagesProps {
  advantages: PriceArchiveAdvantage[] | null | undefined;
  className?: string;
}

const DEFAULT_ICON = "arcticons:dms-telemedicine";

export function PriceArchiveAdvantages({
  advantages,
  className = "",
}: PriceArchiveAdvantagesProps) {
  if (!advantages || advantages.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row gap-5",
        className
      )}
    >
      {advantages.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex flex-row items-center gap-7 min-h-[107px] px-6 py-6",
            "md:flex-col md:items-start md:gap-4",
            "lg:flex-row lg:items-center lg:gap-7",
            "bg-unident-bgElements rounded-[25px]",
            "w-full md:w-[386px] md:flex-1 md:min-w-0 md:max-w-[386px]"
          )}
        >
          {/* Иконка: круглый белый контейнер (Figma: fills '9', borderRadius 105px) */}
          <div
            className={cn(
              "flex shrink-0 items-center justify-center",
              "w-[70px] h-[70px] rounded-full bg-unident-white",
              "overflow-hidden"
            )}
          >
            {item.image?.url ? (
              <Image
                src={item.image.url}
                alt={item.image.alt || item.headline || ""}
                width={44}
                height={44}
                className="object-contain"
              />
            ) : (
              <Icon
                icon={DEFAULT_ICON}
                className="text-unident-primary"
                width={40}
                height={40}
                aria-hidden
              />
            )}
          </div>

          {/* Заголовок: style_DWJW3M — 20px SemiBold, -1% tracking */}
          {item.headline && (
            <Text
              variant="price-advantage-headline"
              as="h3"
              className="text-unident-dark shrink min-w-0"
            >
              {item.headline}
            </Text>
          )}
        </div>
      ))}
    </div>
  );
}
