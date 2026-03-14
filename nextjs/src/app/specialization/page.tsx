/**
 * Архив таксономии «Специализации врачей» (doctor_specializations)
 *
 * Роут: /specialization
 * Список всех специализаций со ссылками на страницы терминов.
 */

import { Metadata } from "next";
import Link from "next/link";
import { getDoctorSpecializations } from "@/lib/wordpress";
import {
  Container,
  Heading,
  Text,
  Breadcrumbs,
} from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = {
  title: "Специализации врачей - УниДент",
  description:
    "Специализации врачей стоматологической клиники УниДент: терапия, хирургия, имплантация, ортодонтия и другие",
};

export const revalidate = 3600;

export default async function SpecializationArchivePage() {
  let specializations: Awaited<ReturnType<typeof getDoctorSpecializations>> =
    [];

  try {
    specializations = await getDoctorSpecializations();
  } catch (error) {
    console.error("[SpecializationArchivePage] Error:", error);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Специализации врачей" },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Специализации врачей", url: `${baseUrl}/specialization` },
  ];

  return (
    <main id="main-content">
      <Container size="xl" className="py-16">
      <Breadcrumbs items={breadcrumbItems} />
      <BreadcrumbStructuredData items={structuredItems} />
      <div className="mb-12">
        <Heading level={1} variant="page-title" className="text-unident-dark">
          Специализации врачей
        </Heading>
        <Text variant="large" className="text-unident-textGray max-w-3xl mt-4">
          Выберите специализацию, чтобы увидеть врачей: терапия, хирургия,
          имплантация, ортодонтия и другие.
        </Text>
      </div>

      {!specializations?.length ? (
        <div className="text-center py-12">
          <Text variant="large" className="text-unident-textGray">
            Специализации не найдены.
          </Text>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specializations.map((spec) => (
            <li key={spec.id}>
              <Link
                href={`/specialization/${spec.slug}`}
                className="block p-4 rounded-[15px] border-2 border-unident-borderGray hover:border-unident-primary hover:bg-unident-bgElements transition-colors"
              >
                <Text
                  variant="card-title"
                  as="span"
                  className="text-unident-dark font-semibold"
                >
                  {spec.name}
                </Text>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </Container>
    </main>
  );
}
