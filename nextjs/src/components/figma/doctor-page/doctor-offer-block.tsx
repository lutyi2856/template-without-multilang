/**
 * DoctorOfferBlock — sticky блок «Запись» на странице врача (Figma node 402:2392)
 *
 * Упрощённая версия: фото, должности, специализации, кнопка «Записаться на прием».
 * Без consultationServices / relatedPrices (не в схеме).
 *
 * PERFORMANCE: Server Component.
 */

import Image from "next/image";
import Link from "next/link";
import { Text, Heading, Button } from "@/components/design-system";
import type { DoctorOfferBlockProps } from "./types";

export function DoctorOfferBlock({ doctor, slug }: DoctorOfferBlockProps) {
  const imageUrl = doctor.featuredImage?.node?.sourceUrl;
  const imageAlt = doctor.featuredImage?.node?.altText || doctor.title;
  const positionLabels = doctor.doctorPositions?.nodes?.map((p) => p.name) ?? [];
  const specializations = doctor.doctorSpecializations?.nodes ?? [];

  return (
    <div className="lg:sticky lg:top-6 flex flex-col gap-4">
      <div className="rounded-[25px] bg-[#EEF3F9] p-6 flex flex-col gap-6">
        {(positionLabels.length > 0 || specializations.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {positionLabels.map((label) => (
              <span
                key={`pos-${label}`}
                className="inline-flex items-center justify-center h-12 px-4 rounded-[15px] bg-white font-medium text-base leading-[1.177] tracking-[-0.01em] text-unident-dark border border-unident-borderGray/30"
              >
                {label}
              </span>
            ))}
            {specializations.map((spec) => (
              <span
                key={spec.id}
                className="inline-flex items-center justify-center h-12 px-4 rounded-[15px] bg-white font-medium text-base leading-[1.177] tracking-[-0.01em] text-unident-dark border border-unident-borderGray/30"
              >
                {spec.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-full bg-unident-bgElements">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-unident-textGray text-sm">
                <Text variant="xs" as="span">
                  Нет фото
                </Text>
              </div>
            )}
          </div>
          <Heading
            level={3}
            variant="card-title"
            className="text-unident-dark"
          >
            {doctor.title}
          </Heading>
        </div>
      </div>

      <Button
        unidentVariant="primary"
        asChild
        className="w-full min-h-[44px] py-4 rounded-[15px] text-base font-semibold leading-[1.19] tracking-[-0.01em]"
      >
        <Link href={`/doctors/${slug}#zapis`}>
          Записаться на прием
        </Link>
      </Button>
    </div>
  );
}
