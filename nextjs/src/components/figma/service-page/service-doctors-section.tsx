/**
 * ServiceDoctorsSection — секция врачей на странице услуги
 *
 * Логика (аналогично блоку «Узнать точную стоимость»):
 * - showBlock: service перекрывает, default true
 * - title/description: service ?? global ?? default
 * - doctors: service.relatedDoctors ?? global.selectedDoctors ?? getFeaturedDoctors
 *
 * PERFORMANCE: Server Component
 */

import {
  getFeaturedDoctors,
  Doctor,
  type Service,
} from "@/lib/wordpress/api";
import { DoctorsSectionClient } from "@/components/sections/doctors-section-client";
import { Text } from "@/components/design-system";
import type { ServicePagesSettings } from "@/types/services";

const DEFAULT_TITLE = "Команда, которая помогает вам";
const DEFAULT_DESCRIPTION =
  "Каждый наш доктор — это профессионал, который регулярно повышает свою квалификацию с помощью образовательных программ в России и зарубежом.";

interface ServiceDoctorsSectionProps {
  service: Service;
  servicePagesSettings?: ServicePagesSettings | null;
}

/**
 * Секция врачей на странице услуги с приоритетом service → global → all doctors
 */
export async function ServiceDoctorsSection({
  service,
  servicePagesSettings,
}: ServiceDoctorsSectionProps) {
  const showBlock = service.servicePageBlocks?.doctorsSectionShow ?? true;

  if (!showBlock) {
    return null;
  }

  const title =
    service.servicePageBlocks?.doctorsSectionTitle?.trim() ||
    servicePagesSettings?.doctorsSectionTitle?.trim() ||
    DEFAULT_TITLE;

  const description =
    service.servicePageBlocks?.doctorsSectionDescription?.trim() ||
    servicePagesSettings?.doctorsSectionDescription?.trim() ||
    DEFAULT_DESCRIPTION;

  let doctors: Doctor[] = [];

  const serviceDoctors = service.servicePageBlocks?.relatedDoctors;
  const globalDoctors = servicePagesSettings?.selectedDoctors;

  if (serviceDoctors && serviceDoctors.length > 0) {
    doctors = serviceDoctors;
  } else if (globalDoctors && globalDoctors.length > 0) {
    doctors = globalDoctors;
  } else {
    try {
      doctors = await getFeaturedDoctors(12) ?? [];
    } catch (error) {
      console.error("[ServiceDoctorsSection] Error fetching doctors:", error);
      return (
        <section className="py-16 bg-white">
          <div className="text-center text-unident-textGray">
            <Text variant="default">Данные о врачах не загружены</Text>
          </div>
        </section>
      );
    }
  }

  return (
    <section className="py-16 bg-white">
      <DoctorsSectionClient
        doctors={doctors}
        title={title}
        description={description}
      />
    </section>
  );
}
