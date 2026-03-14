import { Metadata } from "next";
import { Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = {
  title: "Гарантии - УниДент",
  description: "Гарантии на стоматологические услуги клиники УниДент",
};

const BREADCRUMB_ITEMS = [
  { label: "Главная", href: "/" },
  { label: "Пациентам", href: "/patients" },
  { label: "Гарантии" },
];

export default function GarantiiPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const structuredItems = [
    { name: "Главная", url: baseUrl + "/" },
    { name: "Пациентам", url: baseUrl + "/patients" },
    { name: "Гарантии", url: baseUrl + "/patients/garantii" },
  ];

  return (
    <main id="main-content" className="container mx-auto px-4 py-16">
      <Breadcrumbs items={BREADCRUMB_ITEMS} />
      <BreadcrumbStructuredData items={structuredItems} />
      <h1 className="mb-4 font-gilroy text-4xl font-bold text-unident-dark">
        Гарантии
      </h1>
      <p className="font-gilroy text-lg text-gray-600">
        Страница в разработке. Содержимое будет добавлено позже.
      </p>
    </main>
  );
}
