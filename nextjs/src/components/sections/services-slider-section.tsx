/**
 * ServicesSliderSection - слайдер услуг внизу страницы услуги
 *
 * Server Component. Загружает услуги из той же категории (или все),
 * исключая текущую. Рендерит ServicesSliderSectionClient.
 */

import { getServicesForServicePageSlider } from '@/lib/wordpress/api';
import { Section } from '@/components/design-system';
import { ServicesSliderSectionClient } from './services-slider-section-client';

interface ServicesSliderSectionProps {
  currentService: {
    slug: string;
    serviceCategories?: {
      nodes?: Array<{ slug: string }>;
    } | null;
  };
  title?: string;
}

export async function ServicesSliderSection({
  currentService,
  title = 'Другие услуги',
}: ServicesSliderSectionProps) {
  const categorySlugs =
    currentService.serviceCategories?.nodes?.map((n) => n.slug).filter(Boolean) ?? undefined;

  const services = await getServicesForServicePageSlider(
    currentService.slug,
    categorySlugs,
    12
  );

  if (services.length === 0) {
    return null;
  }

  return (
    <Section variant="default" spacing="lg" className="pt-16 pb-16">
      <ServicesSliderSectionClient services={services} title={title} />
    </Section>
  );
}
