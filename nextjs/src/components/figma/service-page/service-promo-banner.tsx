/**
 * ServicePromoBanner — Промо-баннер страницы услуги (Figma 886:4523)
 *
 * Server Component: получает акции, передаёт в Client слайдер.
 * Блок «Горячее предложение» с badge, заголовком, текстом скидки, excerpt и изображением.
 * Layout-числа из Framelink (service-page-838-4147-framelink.yaml).
 *
 * PERFORMANCE: Server Component (данные), Client — только слайдер.
 */

import { ServicePromoBannerClient } from "./service-promo-banner-client";
import type { Promotion } from "@/types/promotion";

interface ServicePromoBannerProps {
  promotions: Promotion[];
}

export function ServicePromoBanner({ promotions }: ServicePromoBannerProps) {
  if (!promotions || promotions.length === 0) return null;

  return <ServicePromoBannerClient promotions={promotions} />;
}
