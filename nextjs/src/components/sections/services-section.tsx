/**
 * ServicesSection - секция с проблематикой на главной странице
 *
 * Компонент отображает карточки терминов таксономии problematics.
 * Данные загружаются динамически из WordPress через GraphQL.
 *
 * Дизайн из Figma: node 93:697 (services_block)
 * - Фон секции: #EEF3F9 (bg-unident-bgElements)
 * - Заголовок H2: "Мы рядом, чтобы помочь"
 * - Сетка: 3 колонки на desktop
 * - Кнопка: "Все услуги" → /service-category
 *
 * PERFORMANCE:
 * - Server Component (без 'use client')
 * - ISR: revalidate каждый час
 * - Fetch данных на сервере с кэшированием
 *
 * @example
 * <ServicesSection />
 */

import { getAllProblematics } from "@/lib/wordpress/api";
import {
  Section,
  Heading,
  Button,
  Container,
} from "@/components/design-system";
import { ServiceCard } from "@/components/figma/service-card";
import Link from "next/link";

interface ServicesSectionProps {
  /** CSS класс для кастомизации */
  className?: string;
}

/**
 * Секция с проблематикой
 *
 * Расположение: после AdvantagesSection на главной странице
 * Отступ сверху: 70px (pt-[70px])
 */
export async function ServicesSection({
  className = "",
}: ServicesSectionProps) {
  // Fetch данных из WordPress — термины таксономии problematics
  const problematics = await getAllProblematics();

  // Если проблематик нет, не рендерим секцию
  if (!problematics || problematics.length === 0) {
    return null;
  }

  return (
    <Section
      variant="default"
      spacing="none"
      className={`pt-[70px] pb-16 ${className}`}
    >
      {/* Контейнер с фоном - ограниченная ширина 1440px */}
      <Container size="xl">
        <div className="bg-white rounded-[25px] p-[15px] md:px-12 md:py-12">
          {/* Header: Заголовок + Кнопка */}
          <div className="flex flex-col flex-wrap md:flex-row md:items-start md:justify-between mb-[clamp(1.875rem,1.48rem+1.69vw,3rem)] gap-6">
            {/* Заголовок */}
            <Heading
              level={2}
              variant="section-title"
              className="text-unident-dark"
            >
              Мы рядом, чтобы помочь
            </Heading>

            {/* Кнопка "Все услуги" - архив таксономии категорий услуг */}
            <Link href="/service-category" className="flex-shrink-0">
              <Button
                unidentVariant="primary"
                className="w-full md:w-auto min-w-[209px]"
              >
                Все услуги
              </Button>
            </Link>
          </div>

          {/* Сетка карточек: 3 колонки на desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problematics.map((item) => (
              <ServiceCard
                key={item.id}
                name={item.name}
                slug={item.slug}
                iconSlug={item.icon}
                variant="white"
                basePath="/problematics"
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ISR: Revalidate каждый час
export const revalidate = 3600;
