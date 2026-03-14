/**
 * ServiceServicesSection — секция «Блок услуг» на странице услуги
 *
 * Логика (аналогично doctors_section и exact_price_block):
 * - showBlock: service ?? global ?? true
 * - title: service ?? global ?? "Другие услуги"
 * - services: service.blockServices ?? global.selectedServices ?? getServicesForServicePageSlider
 *
 * PERFORMANCE: Server Component
 */

import {
  getServicesForServicePageSlider,
  type Service,
  type ServiceSliderItem,
} from "@/lib/wordpress/api";
import { Section } from "@/components/design-system";
import { ServicesSliderSectionClient } from "@/components/sections/services-slider-section-client";
import type { ServicePagesSettings } from "@/types/services";

const DEFAULT_TITLE = "Другие услуги";

interface ServiceServicesSectionProps {
  service: Service;
  servicePagesSettings?: ServicePagesSettings | null;
}

function toSliderItem(s: { id: string; title: string; slug: string; icon?: string | null; iconSvg?: string | null }): ServiceSliderItem {
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    icon: s.icon ?? null,
    iconSvg: s.iconSvg ?? null,
  };
}

/**
 * Секция «Блок услуг» на странице услуги с приоритетом service → global → getServicesForServicePageSlider
 */
export async function ServiceServicesSection({
  service,
  servicePagesSettings,
}: ServiceServicesSectionProps) {
  const showBlock =
    service.servicePageBlocks?.servicesBlockShow ??
    servicePagesSettings?.servicesBlockShow ??
    true;

  if (!showBlock) {
    return null;
  }

  const title =
    service.servicePageBlocks?.servicesBlockTitle?.trim() ||
    servicePagesSettings?.servicesBlockTitle?.trim() ||
    DEFAULT_TITLE;

  const serviceBlockServices = service.servicePageBlocks?.blockServices;
  const globalSelectedServices = servicePagesSettings?.selectedServices;
  const currentSlug = service.slug;

  let services: ServiceSliderItem[] = [];

  if (serviceBlockServices && serviceBlockServices.length > 0) {
    services = serviceBlockServices
      .filter((s) => s.slug !== currentSlug)
      .map(toSliderItem);
  } else if (globalSelectedServices && globalSelectedServices.length > 0) {
    services = globalSelectedServices
      .filter((s) => s.slug !== currentSlug)
      .map(toSliderItem);
  } else {
    // blockServices и selectedServices пусты — всегда показываем все услуги
    services = await getServicesForServicePageSlider(currentSlug, undefined, 12);
  }

  return (
    <Section variant="default" spacing="lg" className="pt-16 pb-16">
      <ServicesSliderSectionClient services={services} title={title} />
    </Section>
  );
}
