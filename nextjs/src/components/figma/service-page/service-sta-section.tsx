/**
 * ServiceStaSection — STA (CTA) блок на странице услуги
 *
 * Логика (аналогично exact_price_block и doctors_section):
 * - Данные: service ?? global ?? default
 * - Рендер CtaSection с ctaData из STA полей
 *
 * PERFORMANCE: Server Component
 */

import { CtaSection } from "@/components/sections/cta-section";
import type { Service } from "@/lib/wordpress/api";
import type { ServicePagesSettings } from "@/types/services";

const DEFAULT_TITLE = "Консультация, снимок и план лечения бесплатно";
const DEFAULT_DESCRIPTION =
  "Оставьте свой номер, мы свяжемся и подберём для вас удобное время приёма. Или позвоните нам сами — +7 499 643-44-05";
const DEFAULT_PRIVACY_TEXT =
  "Отправляя заявку, вы соглашаетесь с политикой конфиденциальности";

function extractPhoneFromText(text: string): string | null {
  const phonePattern = /\+?\d[\d\s\-()]{9,}\d/g;
  const match = text.match(phonePattern);
  return match ? match[0].replace(/\s/g, "").replace(/[()]/g, "-") : null;
}

interface ServiceStaSectionProps {
  service: Service;
  servicePagesSettings?: ServicePagesSettings | null;
}

/**
 * STA (CTA) блок на странице услуги с приоритетом service → global → default
 */
export function ServiceStaSection({
  service,
  servicePagesSettings,
}: ServiceStaSectionProps) {
  const title =
    service.servicePageBlocks?.staTitle?.trim() ||
    servicePagesSettings?.staTitle?.trim() ||
    DEFAULT_TITLE;

  const description =
    service.servicePageBlocks?.staDescription?.trim() ||
    servicePagesSettings?.staDescription?.trim() ||
    DEFAULT_DESCRIPTION;

  const phone =
    service.servicePageBlocks?.staPhone?.trim() ||
    servicePagesSettings?.staPhone?.trim() ||
    extractPhoneFromText(description) ||
    "";

  const privacyText =
    service.servicePageBlocks?.staPrivacyText?.trim() ||
    servicePagesSettings?.staPrivacyText?.trim() ||
    DEFAULT_PRIVACY_TEXT;

  const privacyLink =
    service.servicePageBlocks?.staPrivacyLink ??
    servicePagesSettings?.staPrivacyLink ??
    null;

  const doctorImage =
    service.servicePageBlocks?.staDoctorImage ||
    servicePagesSettings?.staDoctorImage ||
    undefined;

  // Передаём ctaBackgroundImage только при наличии данных. При пустых — не передаём,
  // чтобы CtaSection использовал mainPageSettings (как на главной) и показывал градиент.
  const backgroundImage =
    service.servicePageBlocks?.staBackgroundImage ||
    servicePagesSettings?.staBackgroundImage ||
    undefined;

  const ctaData = {
    ctaTitle: title,
    ctaDescription: description,
    ctaPhone: phone,
    ctaPrivacyText: privacyText,
    ctaPrivacyLink: privacyLink,
    ctaDoctorImage: doctorImage,
    ctaBackgroundImage: backgroundImage,
  };

  return (
    <CtaSection ctaData={ctaData} useSecondDoctorImage imageLayout="option2" />
  );
}
