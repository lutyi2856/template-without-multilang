import Image from "next/image";
import Link from "next/link";
import type { Clinic } from "@/lib/wordpress/api";
import {
  Heading,
  Text,
  Button,
  Card,
} from "@/components/design-system";
import {
  ClinicDotIcon,
  LocationIcon,
  PhoneIcon,
  ClockIcon,
} from "@/icons";

interface ClinicCardProps {
  clinic: Clinic;
  imageHeight?: number;
  /** Высота изображения на md (768px+). Если задан — используется responsive Tailwind вместо style. */
  imageHeightMd?: number;
  className?: string;
}

export function ClinicCard({
  clinic,
  imageHeight = 258,
  imageHeightMd,
  className = "",
}: ClinicCardProps) {
  const useResponsiveHeight = imageHeightMd != null;

  return (
    <Card
      variant="bordered"
      className={`rounded-[25px] overflow-hidden p-0 flex flex-col !shadow-none ${className}`}
    >
      <div
        className={`relative w-full bg-unident-bgElements shrink-0 ${useResponsiveHeight ? "h-[258px] md:h-[218px] xl:h-[258px]" : ""}`}
        style={!useResponsiveHeight ? { height: imageHeight } : undefined}
      >
        {clinic.featuredImage?.node?.sourceUrl ? (
          <Image
            src={clinic.featuredImage.node.sourceUrl}
            alt={
              clinic.featuredImage.node.altText ||
              clinic.title ||
              "Фото клиники"
            }
            width={clinic.featuredImage.node.mediaDetails?.width ?? 400}
            height={clinic.featuredImage.node.mediaDetails?.height ?? 300}
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, 380px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Text variant="small" className="text-unident-textGray">
              Нет фото
            </Text>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 pb-0 flex flex-col gap-[18px]">
        <div className="flex items-center gap-[6px]">
          <ClinicDotIcon
            className="h-[19px] w-[19px] flex-shrink-0 text-unident-primary"
            aria-hidden
          />
          <Heading level={3} variant="card-title" className="text-unident-dark">
            {clinic.title}
          </Heading>
        </div>

        {clinic.clinicFields?.address && (
          <div className="flex items-center gap-2">
            <LocationIcon
              className="h-4 w-4 flex-shrink-0 text-unident-primary"
              aria-hidden
            />
            <Text
              as="span"
              className="text-unident-dark font-medium text-base leading-[1.3] tracking-normal"
            >
              {clinic.clinicFields.address}
            </Text>
          </div>
        )}

        {clinic.clinicFields?.phone && (
          <div className="flex items-center gap-2">
            <PhoneIcon
              className="h-4 w-4 flex-shrink-0 text-unident-primary"
              aria-hidden
            />
            <a
              href={`tel:${clinic.clinicFields.phone.replace(/[\s\-\(\)]/g, "")}`}
              className="no-underline text-unident-dark hover:underline"
            >
              <Text
                as="span"
                className="text-unident-dark font-medium text-base leading-[1.3] tracking-normal"
              >
                {clinic.clinicFields.phone}
              </Text>
            </a>
          </div>
        )}

        {(clinic.clinicFields?.workingHours?.weekdays ||
          clinic.clinicFields?.workingHours?.weekend) && (
          <div className="flex items-start gap-2">
            <ClockIcon
              className="h-4 w-4 flex-shrink-0 text-unident-primary mt-0.5"
              aria-hidden
            />
            <div className="flex flex-col">
              {clinic.clinicFields.workingHours?.weekdays && (
                <Text
                  as="span"
                  className="text-unident-dark font-medium text-base leading-[1.3] tracking-normal"
                >
                  {clinic.clinicFields.workingHours.weekdays}
                </Text>
              )}
              {clinic.clinicFields.workingHours?.weekend && (
                <Text
                  as="span"
                  className="text-unident-dark font-medium text-base leading-[1.3] tracking-normal"
                >
                  {clinic.clinicFields.workingHours.weekend}
                </Text>
              )}
            </div>
          </div>
        )}

        <div className="pt-2 pb-4">
          <Button unidentVariant="outline" asChild className="w-full">
            <Link href={`/clinics/${clinic.slug}`}>
              Контакты и схема проезда
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
