/**
 * DoctorAboutBlock — блок «О враче» страницы врача (Figma node 403:2387)
 *
 * Заголовок 45px SemiBold -3%, контент 18px Regular line-height 1.3.
 * Контент из WordPress (content).
 *
 * PERFORMANCE: Server Component.
 */

import { Heading, Text } from "@/components/design-system";
import type { DoctorAboutBlockProps } from "./types";

export function DoctorAboutBlock({ content }: DoctorAboutBlockProps) {
  return (
    <section aria-label="О враче">
      <Heading
        level={2}
        variant="doctor-hero-title"
        className="text-unident-dark mb-6"
      >
        О враче
      </Heading>
      {content ? (
        <div
          className="font-gilroy text-unident-dark text-base md:text-[18px] font-normal leading-[1.3] tracking-[-0.01em] prose prose-p:mb-4 last:prose-p:mb-0 max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <Text variant="default" as="p" className="text-unident-textGray">
          Информация о враче пока не добавлена.
        </Text>
      )}
    </section>
  );
}
