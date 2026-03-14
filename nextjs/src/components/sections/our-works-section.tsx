/**
 * OurWorksSection - секция с работами "До/После"
 *
 * Компонент отображает карточки работ на главной странице.
 * Данные загружаются динамически из WordPress через GraphQL.
 *
 * Дизайн из Figma: node 123:416 (case)
 * - Заголовок H2: "Наши работы"
 * - EMBLA CAROUSEL слайдер карточек работ (Level 1)
 * - Кнопка: "Все работы" → /our-works
 *
 * PERFORMANCE:
 * - Server Component для data fetching
 * - Client Component обертка для слайдера
 * - ISR: revalidate каждые 30 минут
 *
 * @example
 * <OurWorksSection />
 */

import { getOurWorks } from "@/lib/wordpress";
import { Section, Heading, Container } from "@/components/design-system";
import { OurWorksSectionClient } from "./our-works-section-client";

interface OurWorksSectionProps {
  className?: string;
}

export async function OurWorksSection({
  className = "",
}: OurWorksSectionProps) {
  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "our-works-section.tsx:29",
      message: "OurWorksSection component rendering",
      data: {},
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "H1",
    }),
  }).catch(() => {});
  // #endregion

  // Fetch данных из WordPress (последние 10 работ для слайдера)
  let works: any[] = [];
  try {
    works = await getOurWorks(10);

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "our-works-section.tsx:41",
        message: "getOurWorks returned",
        data: {
          worksLength: works?.length,
          isArray: Array.isArray(works),
          firstWork: works?.[0]
            ? { id: works[0].id, title: works[0].title }
            : null,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion
  } catch (error: any) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "our-works-section.tsx:49",
        message: "Error fetching works",
        data: { errorMessage: error.message, errorStack: error.stack },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H2",
      }),
    }).catch(() => {});
    // #endregion

    console.error("[OurWorksSection] ❌ Error fetching works:", error);
  }

  // Детальное логирование
  console.log("[OurWorksSection] ✅ Received works:", {
    count: works?.length || 0,
    works: works?.map((w) => ({
      id: w.id,
      title: w.title,
      hasImages: !!(w.photoBefore || w.photoAfter || w.generalPhoto),
    })),
  });

  // ВРЕМЕННО: Всегда показываем секцию для проверки рендеринга
  // Если нет данных - показываем placeholder с красным фоном для видимости
  if (!works || works.length === 0) {
    console.error(
      "[OurWorksSection] ❌ No works found. Works count:",
      works?.length || 0
    );
    // ВРЕМЕННО: Показываем секцию с ярким фоном для проверки что она рендерится
    return (
      <Section
        variant="default"
        spacing="none"
        className={`pt-16 pb-16 ${className}`}
      >
        <Container size="xl">
          <div className="bg-unident-bgLightGray rounded-[25px] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12 gap-6">
              <Heading level={2} variant="doctors-heading" className="text-unident-dark">
                Наши работы
              </Heading>
            </div>
            <div className="text-center py-12 border-4 border-red-500 border-dashed rounded-[25px] bg-yellow-100">
              <p className="text-red-600 text-xl font-bold mb-4">
                ⚠️ DEBUG: Данные не найдены
              </p>
              <p className="text-unident-textGray text-sm mb-2">
                Works count: {works?.length || 0}
              </p>
              <p className="text-unident-textGray text-xs">
                Проверьте консоль сервера Next.js для деталей GraphQL запроса
              </p>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  // ВРЕМЕННО: Показываем все работы даже без изображений для отладки
  // TODO: Вернуть фильтрацию после исправления GraphQL запроса
  const worksWithImages = works; // Убрана фильтрация временно

  return (
    <Section
      variant="default"
      spacing="none"
      className={`pt-16 pb-16 ${className}`}
    >
      <OurWorksSectionClient works={worksWithImages} />
    </Section>
  );
}

// ISR: Revalidate каждые 30 минут
export const revalidate = 1800;
