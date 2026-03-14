import { Metadata } from "next";
import Link from "next/link";
import { getClinics } from "@/lib/wordpress/api";
import { Heading, Text, Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = {
  title: "Клиники - УниДент",
  description: "Сеть стоматологических клиник УниДент в Москве",
};

export default async function ClinicsPage() {
  const clinics = await getClinics({ first: 100 });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Клиники" },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Клиники", url: `${baseUrl}/clinics` },
  ];

  return (
    <main id="main-content" className="container mx-auto px-4 py-16">
      <Breadcrumbs items={breadcrumbItems} />
      <BreadcrumbStructuredData items={structuredItems} />
      <Heading level={1} variant="page-title" className="mb-8">
        Наши клиники
      </Heading>

      {clinics.length === 0 ? (
        <Text variant="default">
          Клиники не найдены. Страница в разработке.
        </Text>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <Link
              key={clinic.id}
              href={`/clinics/${clinic.slug}`}
              className="block p-6 bg-white border border-unident-borderGray rounded-[25px] hover:border-unident-primary transition-colors"
            >
              <Heading level={3} variant="card-title" className="mb-2">
                {clinic.title}
              </Heading>
              {clinic.excerpt && (
                <Text variant="default" className="text-unident-textGray">
                  {clinic.excerpt}
                </Text>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export const revalidate = 3600;
