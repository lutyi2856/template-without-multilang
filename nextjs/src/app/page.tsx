/**
 * Главная страница приложения
 *
 * PERFORMANCE:
 * - Server Component (без 'use client')
 * - ISR: revalidate каждый час
 * - Async fetch данных на сервере
 */
import { getMainPageSettings } from "@/lib/wordpress/api";
import { DoctorsSection } from "@/components/sections/doctors-section";
import { HeroSection } from "@/components/sections/hero-section";
import { AdvantagesSection } from "@/components/sections/advantages-section";
import { ServicesSection } from "@/components/sections/services-section";
import { FeaturedReviewsSection } from "@/components/sections/featured-reviews-section";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { OurWorksSection } from "@/components/sections/our-works-section";
import { PromotionsSection } from "@/components/sections/promotions-section";
import { PriceSection } from "@/components/sections/price-section";
import { CtaSection } from "@/components/sections/cta-section";
import { QuoteSection } from "@/components/sections/quote-section";
import { StatsBlock } from "@/components/stats-block";
import { BlogSection } from "@/components/sections/blog-section";
import { ClinicsOnMapSection } from "@/components/sections/clinics-on-map-section";
import { LicensesSection } from "@/components/sections/licenses-section";

// ISR: Revalidate каждый час
export const revalidate = 3600;

export default async function HomePage() {
  const mainPageSettings = await getMainPageSettings();

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header уже подключен в layout.tsx */}

      {/* Hero секция с динамическими счетчиками и Action Card */}
      <HeroSection />

      {/* Статистический блок - финансовые возможности (Преимущества) */}
      <StatsBlock items={mainPageSettings?.preferencesItems} />

      {/* Преимущества (Нам доверили) — данные из Main Page Option Page */}
      <AdvantagesSection
        title={mainPageSettings?.trustedTitle}
        descriptionHtml={mainPageSettings?.trustedDescription}
        items={mainPageSettings?.trustedItems}
        columns={mainPageSettings?.trustedColumns}
      />

      {/* Секция с категориями услуг */}
      <ServicesSection />

      {/* Секция с постами отзывов (CPT reviews), якорь #reviews — сразу после услуг */}
      <FeaturedReviewsSection />

      {/* Секция с работами "До/После" */}
      <OurWorksSection />

      {/* Секция с ценами */}
      <PriceSection />

      {/* Секция с врачами */}
      <DoctorsSection />

      {/* CTA секция */}
      <CtaSection />

      {/* Секция с цитатой главного врача */}
      <QuoteSection />

      {/* Секция с акциями — внизу страницы, перед футером */}
      <PromotionsSection />

      {/* Секция «отзовики» — рейтинги с агрегаторов (Яндекс, 2GIS и т.д.) */}
      <ReviewsSection />

      {/* Самое интересное в блоге */}
      <BlogSection />

      {/* Второй CTA блок внизу страницы — фото из «The doctor's image for the second STA», вариант до правого края без обрезки слева */}
      <CtaSection useSecondDoctorImage imageLayout="option2" />

      {/* Секция «Наши лицензии» */}
      <LicensesSection />

      {/* Клиники на карте Москвы — последняя секция перед футером: карта во весь блок, одна карточка поверх */}
      <ClinicsOnMapSection title={mainPageSettings?.clinicsMapTitle} />
    </main>
  );
}
