/**
 * Динамическая страница врача
 *
 * Роут: /doctors/[slug]
 * Пример: /doctors/lebedev-sergey-nikolaevich
 *
 * PERFORMANCE:
 * - Static Site Generation (SSG) с generateStaticParams
 * - ISR: revalidate каждый час
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getDoctorBySlug,
  getAllDoctorsSlugs,
  getReviewsPlatformLogos,
  getReviewsArchiveSettings,
} from "@/lib/wordpress/api";
import {
  Breadcrumbs,
  Container,
  Section,
} from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import {
  DoctorHeroBlock,
  DoctorAboutBlock,
  DoctorDirectionsBlock,
  DoctorEducationBlock,
  DoctorCertificatesBlock,
  DoctorOfferBlock,
  DoctorReviewsBlock,
} from "@/components/figma/doctor-page";
import { DoctorRelatedDoctorsSection } from "@/components/sections/doctor-related-doctors-section";
import { CtaSection } from "@/components/sections/cta-section";

interface DoctorPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Генерация статических параметров для SSG
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllDoctorsSlugs();
    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error("[generateStaticParams] Error:", error);
    return [];
  }
}

/**
 * Генерация метаданных для SEO
 */
export async function generateMetadata({
  params,
}: DoctorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    return {
      title: "Врач не найден - УниДент",
    };
  }

  return {
    title: `${doctor.title} - Врачи - УниДент`,
    description:
      doctor.doctorFields?.description ||
      `Врач ${doctor.title} в стоматологической клинике УниДент`,
  };
}

/**
 * Страница врача
 */
export default async function DoctorPage({ params }: DoctorPageProps) {
  const { slug } = await params;

  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  // Обогащаем relatedReviews platformLogo отдельным запросом (GraphQL иногда не возвращает platformLogo для вложенных relatedReviews)
  const reviewIds = doctor.relatedReviews?.map((r) => r.id) ?? [];
  const [logosMap, reviewsArchiveSettings] = await Promise.all([
    getReviewsPlatformLogos(reviewIds),
    getReviewsArchiveSettings(),
  ]);
  const clinicLogoUrl = reviewsArchiveSettings?.clinicLogoReviewCard?.url ?? undefined;
  const clinicAvatarBackgroundColor =
    reviewsArchiveSettings?.clinicLogoReviewCardBackgroundColor ?? undefined;
  const enrichedRelatedReviews =
    doctor.relatedReviews?.map((rev) => {
      const logo = logosMap.get(rev.id);
      if (logo && !rev.platformLogo) {
        return { ...rev, platformLogo: logo };
      }
      return rev;
    }) ?? [];

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Врачи", href: "/doctors" },
    { label: doctor.title },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Врачи", url: `${baseUrl}/doctors` },
    { name: doctor.title, url: `${baseUrl}/doctors/${slug}` },
  ];

  const serviceCategories = doctor.serviceCategories?.nodes ?? [];
  const certificates = doctor.certificates ?? null;

  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Section
        as="section"
        variant="none"
        spacing="none"
        className="min-h-[580px] bg-[linear-gradient(1.02deg,#EEF3F9_5.92%,#FDFDFD_102.18%)]"
        aria-label="Карточка врача"
      >
        <Container size="xl" className="pt-6 pb-0">
          <Breadcrumbs items={breadcrumbItems} />
          <BreadcrumbStructuredData items={structuredItems} />
          <DoctorHeroBlock doctor={doctor} slug={slug} />
        </Container>
      </Section>

      <Section
        as="section"
        spacing="none"
        className="bg-white pt-12 pb-16 md:pt-12 md:pb-16"
        aria-label="О враче и направления"
      >
        <Container size="xl" className="px-5 md:px-[10px]">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="flex-1 min-w-0 space-y-12">
              <DoctorAboutBlock content={doctor.content} />
              <DoctorDirectionsBlock categories={serviceCategories} />
              <DoctorEducationBlock education={doctor.education} />
              <DoctorCertificatesBlock certificates={certificates} />
              <DoctorReviewsBlock
                relatedReviews={enrichedRelatedReviews}
                clinicLogoUrl={clinicLogoUrl}
                clinicAvatarBackgroundColor={clinicAvatarBackgroundColor}
              />
            </div>
            <aside
              className="lg:w-[380px] lg:shrink-0"
              aria-label="Запись на прием"
            >
              <DoctorOfferBlock doctor={doctor} slug={slug} />
            </aside>
          </div>
        </Container>
      </Section>

      <Section
        as="section"
        spacing="lg"
        className="bg-white py-16"
        aria-label="Другие специалисты"
      >
        <DoctorRelatedDoctorsSection doctor={doctor} />
      </Section>

      <CtaSection useSecondDoctorImage imageLayout="option2" backgroundWhite />
    </main>
  );
}

export const revalidate = 3600;
