import { Metadata } from "next";
import { Breadcrumbs, Heading } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import {
  getDoctorsConnection,
  getDoctorsFilterOptions,
} from "@/lib/wordpress/api";
import { DoctorsArchiveSectionClient } from "@/components/sections/doctors-archive-section-client";
export const metadata: Metadata = {
  title: "Врачи - УниДент",
  description: "Специалисты стоматологической клиники УниДент",
};

export const dynamic = "force-dynamic";

const PAGE_TITLE = "Врачи";

const BREADCRUMB_ITEMS = [
  { label: "Главная", href: "/" },
  { label: PAGE_TITLE },
];

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const structuredItems = [
    { name: "Главная", url: baseUrl + "/" },
    { name: PAGE_TITLE, url: baseUrl + "/doctors" },
  ];

  const resolved = await searchParams;
  const rawCategory = resolved?.category;
  const rawClinic = resolved?.clinic;
  const categorySlug =
    typeof rawCategory === "string"
      ? rawCategory.trim()
      : Array.isArray(rawCategory)
        ? rawCategory[0]?.trim()
        : undefined;
  const clinicSlug =
    typeof rawClinic === "string"
      ? rawClinic.trim()
      : Array.isArray(rawClinic)
        ? rawClinic[0]?.trim()
        : undefined;
  const filters = {
    categorySlug:
      categorySlug && categorySlug.length > 0 ? categorySlug : undefined,
    clinicSlug:
      clinicSlug && clinicSlug.length > 0 ? clinicSlug : undefined,
  };

  const [doctorsResult, filterOptions] = await Promise.all([
    getDoctorsConnection(12, undefined, filters),
    getDoctorsFilterOptions(),
  ]);

  const { doctors, pageInfo } = doctorsResult;
  const { categories, clinics } = filterOptions;

  return (
    <main id="main-content" className="container mx-auto px-4 py-16">
      <Breadcrumbs items={BREADCRUMB_ITEMS} />
      <BreadcrumbStructuredData items={structuredItems} />

      <Heading
        level={2}
        variant="section-title"
        className="mb-8 lg:mb-10 text-unident-dark"
      >
        {PAGE_TITLE}
      </Heading>

      <DoctorsArchiveSectionClient
        initialDoctors={doctors}
        initialPageInfo={pageInfo}
        initialFilters={filters}
        categories={categories.filter(
          (c) => (c.slug?.trim() ?? "") !== "" && (c.name?.trim() ?? "") !== ""
        )}
        clinics={clinics}
      />
    </main>
  );
}
