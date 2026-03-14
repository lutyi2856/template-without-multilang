/**
 * DoctorCertificatesBlock — блок «Сертификаты» страницы врача (Figma node 404:2522)
 *
 * Макет: 4 в ряд, 194×276px, gap 19px.
 * Если >4 — Embla carousel (loop: false).
 * Данные из ACF gallery certificates.
 *
 * PERFORMANCE: Server Component; Client wrapper для слайдера при >4 сертификатов.
 */

import Image from "next/image";
import { Heading } from "@/components/design-system";
import { DoctorCertificatesBlockClient } from "./doctor-certificates-block-client";
import type { CertificateItem, DoctorCertificatesBlockProps } from "./types";

const CERT_WIDTH = 194;
const CERT_HEIGHT = 276;
const CERTS_PER_SLIDE = 4;

export function DoctorCertificatesBlock({
  certificates,
}: DoctorCertificatesBlockProps) {
  const list = certificates ?? [];
  if (!list.length) {
    return null;
  }

  const showSlider = list.length > CERTS_PER_SLIDE;

  return (
    <section
      aria-label="Сертификаты"
      className="flex flex-col gap-10"
    >
      {showSlider ? (
        <DoctorCertificatesBlockClient certificates={list} />
      ) : (
        <>
          <Heading
            level={2}
            variant="doctor-hero-title"
            className="text-unident-dark"
          >
            Сертификаты
          </Heading>
          <CertificatesInline certificates={list} />
        </>
      )}
    </section>
  );
}

function CertificatesInline({
  certificates,
}: {
  certificates: CertificateItem[];
}) {
  return (
    <div className="flex flex-wrap gap-[19px]">
      {certificates.map((item, index) => (
        <CertificateImage key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}

function CertificateImage({
  item,
  index,
}: {
  item: CertificateItem;
  index: number;
}) {
  const alt = item.altText?.trim() || `Сертификат ${index + 1}`;
  return (
    <div
      className="relative w-[140px] aspect-[140/200] md:w-[194px] md:aspect-[194/276] shrink-0 overflow-hidden rounded-[10px] bg-unident-bgElements"
      aria-label={alt}
    >
      <Image
        src={item.sourceUrl}
        alt={alt}
        width={item.mediaDetails?.width ?? CERT_WIDTH}
        height={item.mediaDetails?.height ?? CERT_HEIGHT}
        className="object-cover w-full h-full"
        sizes="194px"
      />
    </div>
  );
}
