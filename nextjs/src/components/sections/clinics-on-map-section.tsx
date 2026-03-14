/**
 * ClinicsOnMapSection - секция «Наши клиники на карте Москвы»
 *
 * Server Component: загружает клиники с координатами через getClinicsForMap().
 * Рендерит клиентскую обёртку со слайдером карточек и Яндекс.Картой.
 *
 * PERFORMANCE:
 * - Данные только на сервере
 * - ISR: revalidate каждый час
 */

import { getClinicsForMap } from "@/lib/wordpress/api";
import { Section } from "@/components/design-system";
import { ClinicsOnMapSectionClient } from "./clinics-on-map-section-client";

interface ClinicsOnMapSectionProps {
  className?: string;
  /** Заголовок секции. По умолчанию «Наши клиники на карте Москвы» */
  title?: string | null;
}

export async function ClinicsOnMapSection({
  className = "",
  title,
}: ClinicsOnMapSectionProps) {
  const clinics = await getClinicsForMap();

  if (!clinics.length) {
    return null;
  }

  return (
    <Section
      variant="default"
      spacing="md"
      className={`pt-16 pb-16 ${className}`}
    >
      <ClinicsOnMapSectionClient
        clinics={clinics}
        title={title ?? "Наши клиники на карте Москвы"}
      />
    </Section>
  );
}

export const revalidate = 3600;
