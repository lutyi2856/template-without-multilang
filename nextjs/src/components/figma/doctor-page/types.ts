/**
 * Типы для компонентов страницы врача (Doctor Page)
 *
 * @see doctor-hero-block.tsx
 * @see doctor-about-block.tsx
 * @see doctor-offer-block.tsx
 */

import type { Doctor } from "@/lib/wordpress/api";

export interface DoctorHeroBlockProps {
  /** Данные врача из GraphQL */
  doctor: Doctor;
  /** Slug врача для ссылок (doctors/[slug]) */
  slug: string;
}

export interface DoctorAboutBlockProps {
  /** HTML-контент о враче из WordPress */
  content?: string | null;
}

export interface DoctorDirectionsBlockProps {
  /** Категории из taxonomy service_categories врача */
  categories: Array<{ id: string; name: string; slug: string }>;
}

export interface DoctorEducationBlockProps {
  /** Элементы образования из ACF repeater (year, place, educationType) */
  education:
    | Array<{
        year?: string | null;
        place?: string | null;
        educationType?: string | null;
      }>
    | null
    | undefined;
}

/** Элемент сертификата (MediaItem из GraphQL) */
export interface CertificateItem {
  id: string;
  sourceUrl: string;
  altText?: string | null;
  mediaDetails?: { width: number; height: number };
}

export interface DoctorCertificatesBlockProps {
  /** Сертификаты врача из ACF gallery */
  certificates: CertificateItem[] | null | undefined;
}

export interface DoctorOfferBlockProps {
  doctor: Doctor;
  slug: string;
}
