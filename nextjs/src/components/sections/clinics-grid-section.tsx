import type { Clinic } from "@/lib/wordpress/api";
import { Container, Heading, Section } from "@/components/design-system";
import { ClinicCard } from "./clinic-card";

interface ClinicsGridSectionProps {
  clinics: Clinic[];
  title?: string;
  className?: string;
}

export function ClinicsGridSection({
  clinics,
  title = "Клиники и схемы проезда",
  className = "",
}: ClinicsGridSectionProps) {
  if (!clinics.length) return null;

  return (
    <Section variant="default" spacing="none" className={`pt-12 pb-12 ${className}`}>
      <Container size="xl">
        <Heading
          level={2}
          variant="section-title"
          className="text-unident-dark mb-8"
        >
          {title}
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
