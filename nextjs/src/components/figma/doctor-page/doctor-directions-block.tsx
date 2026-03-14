/**
 * DoctorDirectionsBlock — блок «Ключевые направления» страницы врача (Figma node 403:2388)
 *
 * Направления из taxonomy service_categories врача. Layout: row gap 60px (2 колонки),
 * в колонке gap 20px, маркер: круг 7×7 unident-primary.
 *
 * PERFORMANCE: Server Component.
 */

import Link from "next/link";
import { Heading, Text } from "@/components/design-system";
import type { DoctorDirectionsBlockProps } from "./types";

function ListMarker() {
  return (
    <svg
      width={7}
      height={7}
      viewBox="0 0 7 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <circle cx="3.5" cy="3.5" r="3.15" fill="currentColor" />
    </svg>
  );
}

function CategoryLink({
  href,
  name,
}: {
  href: string;
  name: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-5 min-h-[20px] text-unident-dark transition-colors duration-200 hover:text-unident-primary"
      aria-label={`Перейти к направлению ${name}`}
    >
      <span className="shrink-0 w-[7px] h-[7px] flex items-center justify-center text-unident-primary">
        <ListMarker />
      </span>
      <Text
        as="span"
        className="text-[18px] font-normal leading-[1.3] tracking-[-0.01em] text-inherit"
      >
        {name}
      </Text>
    </Link>
  );
}

export function DoctorDirectionsBlock({
  categories,
}: DoctorDirectionsBlockProps) {
  if (!categories?.length) {
    return null;
  }

  const left = categories.filter((_, i) => i % 2 === 0);
  const right = categories.filter((_, i) => i % 2 === 1);

  return (
    <section aria-label="Ключевые направления">
      <Heading
        level={2}
        variant="doctor-hero-title"
        className="text-unident-dark mb-10"
      >
        Ключевые направления
      </Heading>
      <div className="flex flex-row gap-[60px]">
        <div className="flex flex-col gap-5">
          {left.map((item) => (
            <CategoryLink
              key={item.id}
              href={`/service-category/${item.slug}`}
              name={item.name}
            />
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {right.map((item) => (
            <CategoryLink
              key={item.id}
              href={`/service-category/${item.slug}`}
              name={item.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
