/**
 * FeaturedServiceCard - карточка продвигаемой услуги (правая часть dropdown)
 *
 * Дизайн из Figma (node 110:399): карточка с изображением, заголовком,
 * списком преимуществ, ценой и кнопкой.
 *
 * @example
 * <FeaturedServiceCard
 *   image="/images/implant.png"
 *   title="Имплант OSSTEM с установкой"
 *   features={[
 *     "высокая биосовместимость с костной тканью",
 *     "индивидуальный подбор модели импланта",
 *     "надежный южнокорейский бренд"
 *   ]}
 *   price="17 900Р"
 *   buttonText="Подробнее"
 *   href="/services/implant-osstem"
 * />
 */

import { Text, Button } from "@/components/design-system";
import Image from "next/image";

export interface FeaturedServiceCardProps {
  image: string;
  title: string;
  features: string[];
  price: string;
  buttonText?: string;
  href: string;
}

export function FeaturedServiceCard({
  image,
  title,
  features,
  price,
  buttonText = "Подробнее",
  href,
}: FeaturedServiceCardProps) {
  return (
    <div className="flex h-[449px] w-full min-w-[326px] max-w-[326px] flex-col overflow-hidden rounded-[18.46px] bg-unident-bgLightGray px-[19.34px] pt-[25px] pb-0 @min-[320px]:h-auto @min-[320px]:max-w-full @min-[320px]:flex-row @min-[320px]:items-center @min-[320px]:gap-4 @min-[320px]:min-h-0">
      {/* Left block: Title, Price, Button — row при контейнере ≥320px */}
      <div className="flex flex-col gap-[14.77px] @min-[320px]:flex-1 @min-[320px]:flex @min-[320px]:flex-col @min-[320px]:justify-center @min-[320px]:gap-3 @min-[320px]:min-w-0">
        {/* Title */}
        <Text
          variant="featured-service-title"
          className="max-w-[193.6px] @min-[320px]:max-w-none text-unident-primary"
        >
          {title}
        </Text>

        {/* Features List — скрыт на планшете */}
        {features && features.length > 0 && (
          <div className="flex flex-col gap-[11.07px] @min-[320px]:hidden">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-[7.38px]">
                {/* Point Icon - inline SVG из Figma (110:417) */}
                <div className="h-[14.77px] w-[14.77px] flex-shrink-0">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="7.49996" cy="7.5" r="6.75" fill="#191E35" />
                    <path
                      d="M4.11659 7.33414L6.79239 10.0099L10.8834 4.9901"
                      stroke="white"
                      strokeWidth="0.738255"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <Text
                  variant="featured-service-feature"
                  className="flex-1 text-unident-primary"
                >
                  {feature}
                </Text>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <Text
          variant="featured-service-price"
          className="mt-2 text-unident-dark @min-[320px]:mt-0"
        >
          {price}
        </Text>

        {/* Button */}
        <a href={href}>
          <Button className="min-h-[44px] py-4.5 w-full rounded-[11.07px] bg-unident-primary text-white hover:bg-unident-primary/90 @min-[320px]:w-auto">
            <Text variant="featured-service-button" className="text-white">
              {buttonText}
            </Text>
          </Button>
        </a>
      </div>

      {/* Right block: Image — на планшете справа, прижато к нижнему краю */}
      <div className="relative mt-auto flex min-h-[120px] w-full flex-1 items-end justify-center @min-[320px]:mt-0 @min-[320px]:shrink-0 @min-[320px]:min-h-[100px] @min-[320px]:w-[140px] @min-[320px]:self-end">
        <div className="relative h-full w-[183.71px] @min-[320px]:w-full @min-[320px]:h-full">
          <Image src={image} alt={title} fill className="object-contain object-bottom" />
        </div>
      </div>
    </div>
  );
}
