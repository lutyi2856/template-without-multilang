import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, Heading, Text } from "@/components/design-system";
import { SearchResultCard } from "@/components/search/search-result-card";
import { searchAllContentTypes } from "@/lib/wordpress/search";

const TYPE_LABELS: Record<
  "doctor" | "post" | "service" | "clinic" | "promotion" | "page",
  string
> = {
  doctor: "Врачи",
  post: "Блог",
  service: "Услуги",
  clinic: "Клиники",
  promotion: "Акции",
  page: "Страницы",
};

const MIN_QUERY_LENGTH = 3;

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const q =
    typeof resolved?.q === "string"
      ? resolved.q.trim()
      : Array.isArray(resolved?.q)
        ? resolved.q[0]?.trim()
        : "";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";

  if (!q || q.length < MIN_QUERY_LENGTH) {
    return {
      title: "Поиск | УниДент",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `Результаты поиска: ${q} | УниДент`,
    description: `Поиск по сайту УниДент: врачи, услуги, клиники, акции, статьи`,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${baseUrl}/search?q=${encodeURIComponent(q)}`,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const q =
    typeof resolved?.q === "string"
      ? resolved.q.trim()
      : Array.isArray(resolved?.q)
        ? resolved.q[0]?.trim()
        : "";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const BREADCRUMB_ITEMS = [
    { label: "Главная", href: "/" },
    { label: "Поиск" },
  ];

  if (!q || q.length < MIN_QUERY_LENGTH) {
    return (
      <main id="main-content" className="container mx-auto px-4 py-16">
        <Breadcrumbs items={BREADCRUMB_ITEMS} />
        <Heading
          level={1}
          variant="page-title"
          className="mb-6 text-unident-dark"
        >
          Поиск по сайту
        </Heading>
        <Text variant="large" className="text-unident-textGray">
          Введите минимум {MIN_QUERY_LENGTH} символа в поле поиска в шапке
          сайта.
        </Text>
        <Link
          href="/"
          className="mt-6 inline-block font-medium text-unident-primary hover:underline"
        >
          Вернуться на главную
        </Link>
      </main>
    );
  }

  const results = await searchAllContentTypes(q, 10);

  const totalCount =
    results.doctors.length +
    results.posts.length +
    results.services.length +
    results.clinics.length +
    results.promotions.length +
    results.pages.length;

  const groups = [
    { type: "doctor" as const, items: results.doctors, label: TYPE_LABELS.doctor },
    { type: "service" as const, items: results.services, label: TYPE_LABELS.service },
    { type: "clinic" as const, items: results.clinics, label: TYPE_LABELS.clinic },
    { type: "promotion" as const, items: results.promotions, label: TYPE_LABELS.promotion },
    { type: "post" as const, items: results.posts, label: TYPE_LABELS.post },
    { type: "page" as const, items: results.pages, label: TYPE_LABELS.page },
  ];

  return (
    <main id="main-content" className="container mx-auto px-4 py-16">
      <Breadcrumbs items={BREADCRUMB_ITEMS} />
      <Heading
        level={1}
        variant="page-title"
        className="mb-2 text-unident-dark"
      >
        Результаты поиска
      </Heading>
      <Text variant="large" className="mb-10 text-unident-textGray">
        По запросу «{q}» найдено {totalCount}{" "}
        {totalCount === 1 ? "результат" : totalCount < 5 ? "результата" : "результатов"}
      </Text>

      {totalCount === 0 ? (
        <Text variant="large" className="text-unident-textGray">
          Ничего не найдено. Попробуйте изменить запрос.
        </Text>
      ) : (
        <div className="space-y-12">
          {groups.map(
            (group) =>
              group.items.length > 0 && (
                <section key={group.type} aria-labelledby={`search-${group.type}`}>
                  <Heading
                    level={2}
                    id={`search-${group.type}`}
                    variant="subsection"
                    className="mb-6 text-unident-dark"
                  >
                    {group.label}
                  </Heading>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => (
                      <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
                    ))}
                  </div>
                </section>
              )
          )}
        </div>
      )}
    </main>
  );
}
