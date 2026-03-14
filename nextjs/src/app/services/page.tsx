import { Metadata } from "next";
import { Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = {
  title: "Услуги - УниДент",
  description: "Стоматологические услуги клиники УниДент",
};

const BREADCRUMB_ITEMS = [{ label: "Главная", href: "/" }, { label: "Услуги" }];

export default function ServicesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const structuredItems = [
    { name: "Главная", url: baseUrl + "/" },
    { name: "Услуги", url: baseUrl + "/services" },
  ];

  return (
    <main id="main-content" className="container mx-auto px-4 py-16">
      <Breadcrumbs items={BREADCRUMB_ITEMS} />
      <BreadcrumbStructuredData items={structuredItems} />
      <h1 className="mb-4 font-gilroy text-4xl font-bold text-unident-dark">
        Наши услуги
      </h1>
      <p className="font-gilroy text-lg text-gray-600">
        Архив услуг. Страница в разработке.
      </p>
    </main>
  );
}
