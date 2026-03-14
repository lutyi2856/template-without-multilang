/**
 * DoctorEducationBlock — блок «Образование» страницы врача (Figma node 404:2418)
 *
 * Timeline: год в бейдже (93×48px, #D9E4F7), короткая линия только между годами (не на весь блок).
 * Данные из ACF repeater education (year, place, educationType).
 *
 * PERFORMANCE: Server Component.
 */

import { Heading, Text } from "@/components/design-system";
import type { DoctorEducationBlockProps } from "./types";

function getStartYear(year: string | null | undefined): number {
  const y = year?.trim() || "";
  if (!y) return Infinity;
  const m = y.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : Infinity;
}

export function DoctorEducationBlock({
  education,
}: DoctorEducationBlockProps) {
  if (!education?.length) {
    return null;
  }

  const sorted = [...education].sort(
    (a, b) => getStartYear(a.year) - getStartYear(b.year),
  );

  return (
    <section aria-label="Образование">
      <Heading
        level={2}
        variant="doctor-hero-title"
        className="text-unident-dark mb-10"
      >
        Образование
      </Heading>

      <div className="flex flex-col">
        {sorted.map((item, index) => (
          <div key={index} className="flex flex-row gap-6 items-stretch">
            <div className="w-[93px] flex flex-col shrink-0 items-center">
              <div
                className="h-12 w-[93px] flex items-center justify-center rounded-[15px] bg-unident-bgLightBlue"
                aria-label={item.year ? `Год: ${item.year}` : undefined}
              >
                <Text
                  as="span"
                  className="text-[16px] font-medium leading-[1.177] tracking-[-0.01em] text-[#607BD4] text-center"
                >
                  {item.year || "—"}
                </Text>
              </div>
              {index < sorted.length - 1 && (
                <div
                  className="flex flex-1 min-h-[1px] w-[93px] justify-center pt-0"
                  aria-hidden
                >
                  <div className="w-2 bg-unident-bgLightBlue min-h-full" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-[13px] pb-12 min-w-0 flex-1">
              {item.place && (
                <Text
                  as="span"
                  className="text-[18px] font-normal leading-[1.3] text-unident-dark"
                >
                  {item.place}
                </Text>
              )}
              {item.educationType && (
                <Text
                  as="span"
                  className="text-[16px] font-normal leading-[1.3] text-unident-textGray"
                >
                  {item.educationType}
                </Text>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
