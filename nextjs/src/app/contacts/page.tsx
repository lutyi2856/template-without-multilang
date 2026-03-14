import { Metadata } from "next";
import { Breadcrumbs, Container, Heading, Section } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import { getContactsSettings, getClinicsForMap } from "@/lib/wordpress/api";
import { ContactsHeroSection } from "@/components/sections/contacts-hero-section";
import { ClinicsGridSection } from "@/components/sections/clinics-grid-section";
import { CtaSection } from "@/components/sections/cta-section";
import { AdvantagesSection } from "@/components/sections/advantages-section";
import { ContactsBannerSection } from "@/components/sections/contacts-banner-section";

export const metadata: Metadata = {
  title: "Контакты - УниДент",
  description:
    "Контактная информация стоматологической клиники УниДент: телефон, адреса клиник на карте, email и социальные сети.",
};

export const revalidate = 3600;

const BREADCRUMB_ITEMS = [
  { label: "Главная", href: "/" },
  { label: "Контакты" },
];

export default async function ContactsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";

  const structuredItems = [
    { name: "Главная", url: baseUrl + "/" },
    { name: "Контакты", url: baseUrl + "/contacts" },
  ];

  const [contacts, clinics] = await Promise.all([
    getContactsSettings(),
    getClinicsForMap(),
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* ── Breadcrumbs + H1 ── */}
      <Container size="xl">
        <div className="pt-6">
          <Breadcrumbs items={BREADCRUMB_ITEMS} />
          <BreadcrumbStructuredData items={structuredItems} />
        </div>
      </Container>

      <section className="bg-white pt-6 pb-2">
        <Container size="xl">
          <Heading level={1} variant="page-title" className="text-unident-dark">
            Контакты
          </Heading>
        </Container>
      </section>

      {/* ── 1. Две колонки: контакт-данные | карта ── */}
      <Section variant="default" spacing="none" className="pt-6 pb-8">
        <Container size="xl">
          <ContactsHeroSection contacts={contacts} clinics={clinics} />
        </Container>
      </Section>

      {/* ── 2. Карточки клиник в сетке ── */}
      <ClinicsGridSection clinics={clinics} />

      {/* ── 3. CTA — «Записаться на приём» ── */}
      <CtaSection />

      {/* ── 4. Преимущества (динамические из WordPress) ── */}
      <AdvantagesSection
        title={contacts?.advTitle}
        description={contacts?.advDescription}
        items={contacts?.advItems}
      />

      {/* ── 5. Баннер ── */}
      <ContactsBannerSection banner={contacts?.banner} />
    </main>
  );
}
