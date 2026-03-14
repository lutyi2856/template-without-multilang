/**
 * Страница термина таксономии «Специализации врачей»
 *
 * Роут: /specialization/[slug]
 * Заголовок + список врачей данной специализации.
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getSpecializationBySlug,
  getAllSpecializationsSlugs,
  getDoctorsConnection,
} from "@/lib/wordpress";
import { Container, Heading, Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import { DoctorCard } from "@/components/figma/doctor-card";

interface SpecializationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllSpecializationsSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: SpecializationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const specialization = await getSpecializationBySlug(slug);
  if (!specialization) {
    return { title: "Специализация не найдена - УниДент" };
  }
  return {
    title: `${specialization.name} - Специализации врачей - УниДент`,
    description: `Врачи специализации «${specialization.name}» в стоматологической клинике УниДент`,
  };
}

export default async function SpecializationPage({
  params,
}: SpecializationPageProps) {
  const { slug } = await params;
  const specialization = await getSpecializationBySlug(slug);

  if (!specialization) {
    notFound();
  }

  const { doctors } = await getDoctorsConnection(12, undefined, {
    specializationSlug: slug,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Специализации врачей", href: "/specialization" },
    { label: specialization.name },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Специализации врачей", url: `${baseUrl}/specialization` },
    {
      name: specialization.name,
      url: `${baseUrl}/specialization/${slug}`,
    },
  ];

  return (
    <main id="main-content">
      <Container size="xl" className="py-16">
      <Breadcrumbs items={breadcrumbItems} />
      <BreadcrumbStructuredData items={structuredItems} />
      <Heading level={1} variant="page-title" className="text-unident-dark mb-10">
        {specialization.name}
      </Heading>

      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="min-w-0 flex flex-col">
              <DoctorCard
                name={doctor.title}
                slug={doctor.slug}
                description={(doctor.excerpt ?? doctor.doctorFields?.description ?? "")
                  .replace(/<[^>]*>/g, "")
                  .trim()}
                specialty={
                  doctor.doctorSpecializations?.nodes?.length
                    ? doctor.doctorSpecializations.nodes.map((t) => t.name).join(", ")
                    : doctor.doctorFields?.specialization
                        ?.map((s) => s.specializationItem)
                        .filter(Boolean)
                        .join(", ") ?? ""
                }
                clinic={
                  doctor.clinic?.length
                    ? doctor.clinic.map((c) => c.title).join(", ")
                    : ""
                }
                clinicSlugs={
                  doctor.clinic?.length
                    ? doctor.clinic.map((c) => c.slug)
                    : undefined
                }
                experience={
                  doctor.doctorFields?.experience
                    ? new Date().getFullYear() -
                      new Date(doctor.doctorFields.experience).getFullYear()
                    : 0
                }
                rating={doctor.doctorFields?.rating ?? 0}
                ratingSource={doctor.doctorFields?.ratingSource ?? ""}
                imageUrl={doctor.featuredImage?.node?.sourceUrl ?? ""}
                videoUrl={doctor.doctorFields?.videoUrl}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-unident-textGray">Врачи по этой специализации не найдены.</p>
      )}
      </Container>
    </main>
  );
}

export const revalidate = 3600;
