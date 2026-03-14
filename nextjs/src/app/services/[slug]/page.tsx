/**
 * Динамическая страница услуги (Service CPT)
 *
 * Роут: /services/[slug]
 * Паттерн: как страница врачей — один источник getServiceBySlug
 *
 * PERFORMANCE:
 * - Static Site Generation (SSG) с generateStaticParams
 * - ISR: revalidate каждый час
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getServiceBySlug,
  getAllServicesSlugs,
  getContactsSettings,
  getServicePagesSettings,
  getPromotionsForHomepage,
  getPromotionsByRelatedService,
} from "@/lib/wordpress/api";
import { Container, Section, Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import { ServiceHeroBlock } from "@/components/figma/service-page/service-hero-block";
import { ServicePromoBanner } from "@/components/figma/service-page/service-promo-banner";
import { ServiceSidebar } from "@/components/figma/service-page/service-sidebar";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { ServiceDoctorsSection } from "@/components/figma/service-page/service-doctors-section";
import { ServiceStaSection } from "@/components/figma/service-page/service-sta-section";
import { ServiceServicesSection } from "@/components/figma/service-page/service-services-section";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Генерация статических параметров для SSG (как у врачей)
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllServicesSlugs();
    return slugs.map((slug) => ({ slug }));
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
}: ServicePageProps): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    return {
      title: "Услуга не найдена - УниДент",
    };
  }

  const seoTitle = (service as { seo?: { title?: string } }).seo?.title;
  const seoDesc = (service as { seo?: { description?: string } }).seo?.description;

  return {
    title: seoTitle
      ? `${seoTitle} - УниДент`
      : `${service.title} - Услуги - УниДент`,
    description:
      seoDesc ||
      service.excerpt ||
      `Услуга ${service.title} в стоматологической клинике УниДент`,
  };
}

function getTelegramUrl(contacts: { socialContacts?: Array<{ name?: string | null; url: string }> | null } | null): string | null {
  const socials = contacts?.socialContacts ?? [];
  const telegram = socials.find(
    (s) =>
      s.name?.toLowerCase().includes("telegram") ||
      s.name?.toLowerCase().includes("телеграм")
  );
  return telegram?.url ?? null;
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;

  const [service, contacts, servicePagesSettings] = await Promise.all([
    getServiceBySlug(slug),
    getContactsSettings(),
    getServicePagesSettings(),
  ]);

  if (!service) {
    notFound();
  }

  // Двунаправленная связь: (1) Service → Promotion, (2) Promotion → Service, (3) fallback
  // Фильтруем null сразу — GraphQL может вернуть [null] при битой связи
  let promotions = (service.relatedPromotions ?? []).filter(
    (p): p is NonNullable<typeof p> => p != null && (p as { id?: string }).id != null
  );
  if (promotions.length === 0 && service.databaseId) {
    promotions = await getPromotionsByRelatedService(service.databaseId, 8);
  }
  if (promotions.length === 0) {
    promotions = await getPromotionsForHomepage(8);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Услуги", href: "/services" },
    { label: service.title },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Услуги", url: `${baseUrl}/services` },
    {
      name: service.title,
      url: `${baseUrl}/services/${slug}`,
    },
  ];

  const telegramUrl = getTelegramUrl(contacts);

  return (
    <>
      <BreadcrumbStructuredData items={structuredItems} />

      <main id="main-content" className="min-h-screen bg-white">
        <Section variant="default" spacing="lg" className="py-16">
          <Container size="xl">
            <Breadcrumbs items={breadcrumbItems} className="mb-3" />
            <ServiceHeroBlock
              service={service}
              telegramUrl={telegramUrl}
              servicePagesSettings={servicePagesSettings}
            />
            <div className="mt-6 max-md:mt-4">
              <ServicePromoBanner promotions={promotions} />
            </div>
          </Container>
        </Section>

        <Section as="section" variant="default" spacing="none" className="py-10 md:py-16">
          <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
            <div className="flex flex-col lg:flex-row lg:gap-10">
              <div className="flex-1 min-w-0 max-w-[800px] flex flex-col gap-8">
                {service.contentBlocks && service.contentBlocks.length > 0 ? (
                  <BlockRenderer blocks={service.contentBlocks} />
                ) : service.content ? (
                  <article
                    className="prose prose-lg max-w-none font-gilroy prose-headings:font-gilroy prose-headings:text-unident-dark prose-p:text-gray-700 prose-a:text-unident-primary prose-strong:text-unident-dark prose-ul:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: service.content }}
                  />
                ) : null}
              </div>
              <aside className="mt-10 lg:mt-0 lg:w-[418px] lg:flex-shrink-0">
                <ServiceSidebar />
              </aside>
            </div>
          </div>
        </Section>
      </main>

      {/* Секция врачей (Figma: doctors 897:4677) */}
      <ServiceDoctorsSection
        service={service}
        servicePagesSettings={servicePagesSettings}
      />

      {/* STA (CTA) блок — данные из service ?? global (service_pages_settings) ?? default */}
      <ServiceStaSection
        service={service}
        servicePagesSettings={servicePagesSettings}
      />

      {/* Блок услуг — service ?? global ?? getServicesForServicePageSlider */}
      <ServiceServicesSection
        service={service}
        servicePagesSettings={servicePagesSettings}
      />
    </>
  );
}

export const revalidate = 3600;
