import { Metadata } from "next";
import { Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = {
  title: "Пациентам - УниДент",
  description:
    "Полезная информация для пациентов стоматологической клиники УниДент",
};

const BREADCRUMB_ITEMS = [
  { label: "Главная", href: "/" },
  { label: "Пациентам" },
];

export default function PatientsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const structuredItems = [
    { name: "Главная", url: baseUrl + "/" },
    { name: "Пациентам", url: baseUrl + "/patients" },
  ];

  return (
    <main id="main-content" className="container mx-auto px-4 py-16">
      <Breadcrumbs items={BREADCRUMB_ITEMS} />
      <BreadcrumbStructuredData items={structuredItems} />
      <h1 className="mb-4 font-gilroy text-4xl font-bold text-unident-dark">
        Пациентам
      </h1>
      <p className="font-gilroy text-lg text-gray-600">
        Страница в разработке. Содержимое будет добавлено позже.
      </p>
    </main>
  );
}
