/**
 * LicensesSection - секция «Наши лицензии»
 *
 * Данные из Option Page «Главная страница» → вкладка «Лицензии».
 * Заголовок секции и repeater licensee (изображение, название, text-licenzia).
 *
 * PERFORMANCE:
 * - Server Component, fetch через getMainPageSettings()
 * - ISR: revalidate каждый час (как главная)
 */

import { getMainPageSettings } from "@/lib/wordpress/api";
import { Section } from "@/components/design-system";
import { LicensesSectionClient } from "./licenses-section-client";

interface LicensesSectionProps {
  className?: string;
}

export async function LicensesSection({ className = "" }: LicensesSectionProps) {
  const mainPageSettings = await getMainPageSettings();

  const title = mainPageSettings?.licensesSectionTitle?.trim();
  const items = mainPageSettings?.licensee;

  const hasContent = title || (items && items.length > 0);
  if (!hasContent) {
    return null;
  }

  return (
    <Section
      variant="default"
      spacing="none"
      className={`pt-16 pb-16 ${className}`}
    >
      <LicensesSectionClient
        title={title ?? undefined}
        items={items ?? undefined}
      />
    </Section>
  );
}

export const revalidate = 3600;
