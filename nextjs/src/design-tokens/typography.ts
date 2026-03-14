/**
 * Design Tokens - Типографика УниДент
 *
 * Source of Truth для всех типографических стилей.
 * Значения взяты из Figma макета "Шаблон сайта".
 *
 * @see nextjs/DESIGN_SYSTEM.md - Документация дизайн-системы
 * @see .cursor/rules/design-system-philosophy.mdc - Философия использования
 */

export const typography = {
  // Семантические варианты текста. Fluid: viewport 375–1440px, desktop = max
  body: {
    default:
      "text-[clamp(0.875rem,0.82rem+0.19vw,1rem)] font-normal leading-normal tracking-[-0.01em]",
    large:
      "text-[clamp(1rem,0.94rem+0.19vw,1.125rem)] font-normal leading-relaxed tracking-[-0.01em]",
    small:
      "text-[clamp(0.8125rem,0.77rem+0.09vw,0.875rem)] font-normal leading-normal tracking-[-0.01em]",
    xs: "text-[clamp(0.6875rem,0.64rem+0.09vw,0.75rem)] font-normal leading-normal",
  },

  // Заголовки (из Figma). Fluid clamp: min=mobile 375px, max=desktop 1440px
  heading: {
    "page-title":
      "text-[clamp(2.25rem,1.99rem+1.13vw,3rem)] font-bold leading-tight tracking-[-0.03em]",
    "section-title":
      "text-[clamp(1.75rem,1.62rem+0.38vw,2rem)] font-bold leading-tight tracking-[-0.02em]",
    "card-title":
      "text-[clamp(1.25rem,1.18rem+0.19vw,1.375rem)] font-semibold leading-[1.19] tracking-[-0.02em]",
    subsection:
      "text-[clamp(1.125rem,1.06rem+0.19vw,1.25rem)] font-semibold leading-normal tracking-[-0.02em]",
  },

  // Специфичные стили из Figma. Fluid clamp: viewport 375–1440px
  figma: {
    // Doctor Card компонент
    "doctor-name":
      "text-[clamp(1.25rem,1.18rem+0.19vw,1.375rem)] font-semibold leading-[1.19] tracking-[-0.02em]",
    // Doctor Page Hero (node 401:2213, H2)
    "doctor-hero-title":
      "text-[clamp(2.25rem,1.87rem+1.69vw,2.8125rem)] font-semibold leading-[1.19] tracking-[-0.01em]",
    "doctor-description":
      "text-[clamp(0.9375rem,0.915rem+0.094vw,1rem)] font-normal leading-[1.25]",
    "clinic-name":
      "text-[clamp(0.9375rem,0.915rem+0.094vw,1rem)] font-medium leading-[1.18]",

    // Experience Badge
    "experience-number":
      "text-[clamp(1.0625rem,1.018rem+0.19vw,1.1875rem)] font-medium tracking-[-0.04em]",
    "experience-label": "text-[12px] font-medium uppercase",

    // Rating Badge
    "rating-number":
      "text-[clamp(0.9375rem,0.893rem+0.19vw,1.0625rem)] font-medium tracking-[-0.04em]",
    "rating-source": "text-[12px] font-medium",

    // Doctor Page Hero badges (node 401:2848, Framelink)
    "doctor-hero-experience-number":
      "text-[clamp(1.5rem,1.43rem+0.28vw,1.6875rem)] font-medium leading-none tracking-[-0.04em]",
    "doctor-hero-experience-years":
      "text-[12px] font-medium uppercase tracking-[0.02em] leading-[1.3]",
    "doctor-hero-experience-label": "text-[14px] font-medium leading-none",
    "doctor-hero-rating-number":
      "text-[clamp(1.5rem,1.43rem+0.28vw,1.6875rem)] font-medium leading-none tracking-[-0.04em]",
    "doctor-hero-rating-source": "text-[14px] font-medium leading-none",

    // UI элементы
    "button-text": "text-[16px] font-semibold leading-[1.1]",
    "nav-link":
      "text-[clamp(0.875rem,0.787rem+0.38vw,1.125rem)] font-medium leading-normal tracking-[-0.01em]",
    label: "text-sm font-medium leading-tight",
    // Breadcrumbs (node 259:2439)
    "breadcrumb-link":
      "text-[14px] font-medium leading-[1.177] tracking-[-0.01em]",

    // Services Dropdown (node 109:394)
    "category-tab":
      "text-[clamp(1.125rem,1.06rem+0.19vw,1.25rem)] font-normal leading-[1.25]",
    "category-title":
      "text-[clamp(1.5rem,1.4rem+0.38vw,1.75rem)] font-semibold leading-[1.25]",
    "service-item": "text-[18px] font-normal leading-[1.25]",
    "featured-service-title":
      "text-[clamp(1.25rem,1.15rem+0.38vw,1.5rem)] font-semibold leading-[1.19] tracking-[-0.01em]",
    "featured-service-price": "text-[20px] font-semibold leading-[1.4]",
    "featured-service-feature": "text-[14px] font-normal leading-[1.25]",
    "featured-service-button":
      "text-[14px] font-semibold leading-[1.19] tracking-[-0.01em]",
    "close-text": "text-[18px] font-medium leading-[1.18] tracking-[-0.01em]",

    // Promotion card
    "promo-banner-excerpt":
      "font-normal text-[14px] leading-[1.25] text-unident-dark tracking-[-0.01em]",
    "promotion-badge": "text-[14px] font-medium leading-none",
    "promotion-category": "text-[16px] font-medium leading-none",
    "promotion-promo-price":
      "text-[clamp(1.5rem,1.4rem+0.38vw,1.75rem)] font-medium leading-[1.4]",
    "promotion-regular-price":
      "text-[clamp(1.5rem,1.4rem+0.38vw,1.75rem)] font-medium leading-[1.4]",

    // Services Block (node 93:697)
    "service-title":
      "text-[clamp(1.25rem,1.15rem+0.38vw,1.375rem)] font-medium leading-[1.25]",

    // Hero Block Counters (node 10:190)
    "counter-badge":
      "text-[15px] font-medium leading-[1.177] tracking-[-0.01em]",

    // Hero Section (main page) — fluid typography
    "hero-title":
      "text-[clamp(2.25rem,1.94rem+1.31vw,3.125rem)] font-semibold leading-[1.193] tracking-[-0.03em]",
    "hero-subtitle":
      "text-[clamp(1rem,0.934rem+0.28vw,1.1875rem)] font-normal leading-[1.25]",

    // Action Card (node 10:191)
    "action-card-title":
      "text-[clamp(1.75rem,1.62rem+0.38vw,2rem)] font-semibold leading-[1.193] tracking-[-0.01em]",
    "action-card-feature":
      "text-[clamp(1.125rem,1.06rem+0.19vw,1.25rem)] font-normal leading-[1.25]",
    "action-card-price":
      "text-[clamp(1.5rem,1.4rem+0.38vw,1.75rem)] font-semibold leading-[1.4]",
    "action-card-badge":
      "text-[14px] font-medium leading-[1.177] tracking-[-0.01em]",
    "action-card-countdown":
      "text-[14px] font-light leading-[1.19] tracking-[-0.01em]",

    // Advantages Section (node 93:307)
    "advantages-heading":
      "text-[clamp(2.25rem,1.87rem+1.69vw,2.8125rem)] font-semibold leading-[1.193] tracking-[-0.01em]",
    "advantages-description": "text-[18px] font-normal leading-[1.2]",
    "advantages-card-title":
      "text-[clamp(1.5rem,1.4rem+0.38vw,1.75rem)] font-medium leading-[1.177] tracking-[-0.01em]",
    "advantages-card-text": "text-[16px] font-normal leading-[1.25]",
    "advantages-badge-number":
      "text-[18px] font-medium leading-[1.177] tracking-[-0.03em]",

    // Rating/Reviews Section (node 143:1782)
    "reviews-heading":
      "text-[clamp(2.25rem,1.87rem+1.69vw,2.8125rem)] font-semibold leading-[1.193] tracking-[-0.03em]",
    "reviews-cta-heading":
      "text-[clamp(1.125rem,1rem+0.5vw,1.5rem)] md:text-[clamp(2.25rem,1.87rem+1.69vw,2.8125rem)] font-semibold leading-[1.193] tracking-[-0.03em]",
    "reviews-stats-heading":
      "text-[clamp(1.25rem,1.1rem+0.5vw,1.75rem)] lg:text-[clamp(2.25rem,1.87rem+1.69vw,2.8125rem)] font-semibold leading-[1.193] tracking-[-0.03em]",
    "reviews-button":
      "text-[16px] font-semibold leading-[1.193] tracking-[-0.01em]",
    "review-title":
      "text-[clamp(1.5rem,1.4rem+0.38vw,1.75rem)] font-medium leading-[1.3]",
    "review-text":
      "text-[clamp(0.875rem,0.787rem+0.38vw,1.125rem)] font-normal leading-[1.3]",
    "review-answer":
      "text-[clamp(0.875rem,0.787rem+0.38vw,1.125rem)] font-medium leading-[1.3]",
    "review-meta":
      "text-[clamp(0.75rem,0.706rem+0.19vw,0.875rem)] font-medium leading-[1.3]",
    "review-doctor-title":
      "text-[clamp(0.6875rem,0.64rem+0.19vw,0.75rem)] font-medium leading-[1.3]",
    "review-service-badge":
      "text-[clamp(0.875rem,0.81rem+0.19vw,1rem)] font-medium leading-[1.177]",

    // Case Card (Our Works) - node 123:416
    "case-title":
      "text-[clamp(1.5rem,1.4rem+0.38vw,1.75rem)] font-medium leading-[1.3]",
    "case-card-title":
      "text-[clamp(1.25rem,1.07rem+0.75vw,1.75rem)] font-medium leading-[1.3] tracking-[-0.02em]",
    "case-section-label": "text-[14px] font-medium leading-[1.3]",
    "case-doctor-name": "text-[18px] font-medium leading-[1.3]",
    "case-service": "text-[16px] font-normal leading-[1.177]",
    "case-clinic": "text-[16px] font-medium leading-[1.18]",

    // Service Hero (article_card 886:4479, nodes 886:4505, 886:4506)
    "service-hero-price-current":
      "text-[clamp(1.25rem,1.18rem+0.19vw,1.75rem)] font-semibold leading-[1.2]",
    "service-hero-price-old": "text-[14px] font-semibold leading-[1.2]",

    // Price Section (node 93:302)
    "price-advantage-headline":
      "text-[clamp(1.125rem,1.081rem+0.19vw,1.25rem)] font-semibold leading-[1.25]",
    "price-table-header": "text-[18px] font-normal leading-[1.25]",
    "price-service-name": "text-[16px] font-normal leading-[1.25]",
    "price-service-excerpt":
      "text-[12px] font-normal leading-[1.25] text-unident-dark",
    "price-our-price": "text-[18px] font-semibold leading-[1.25]",
    "price-city-price": "text-[18px] font-normal leading-[1.25]",
    "price-category-name":
      "text-[clamp(1.125rem,1.06rem+0.19vw,1.25rem)] font-semibold leading-[1.25]",

    // Doctors Section (node 95:2472)
    "doctors-heading":
      "text-[clamp(2.25rem,1.87rem+1.69vw,2.8125rem)] font-semibold leading-[1.193] tracking-[-0.03em]",
    "doctors-description": "text-[18px] font-normal leading-[1.2]",
    "doctors-button": "text-[16px] font-medium leading-[1.1]",

    // Quote Block (node 95:1468) — fluid 16→24px (было text-[24px] max-md:text-[16px])
    "quote-text":
      "text-[clamp(1rem,0.824rem+0.75vw,1.5rem)] font-medium leading-[1.2] tracking-[-0.01em]",
    "quote-author-name":
      "text-[clamp(1.25rem,0.986rem+1.13vw,2rem)] font-semibold leading-[1.0] tracking-[-0.01em]",
    "quote-author-position": "text-[16px] font-medium leading-[1.5]",

    // Header Rating (node 109:132)
    "header-rating-number":
      "text-[clamp(1.5rem,1.27rem+0.94vw,2.125rem)] font-medium leading-[1.176]",

    // Header InfoBlock — fluid 18px/14px (viewport 375–1440)
    "header-info-title":
      "text-[clamp(0.875rem,0.82rem+0.19vw,1.125rem)] font-medium leading-[1.177] tracking-[-0.01em]",
    "header-info-subtitle":
      "text-[clamp(0.75rem,0.72rem+0.09vw,0.875rem)] font-medium leading-[1.177] tracking-[-0.01em]",

    // Footer logo
    "footer-logo":
      "text-[clamp(1.25rem,0.99rem+1.13vw,2rem)] font-bold",

    // Clinic answer (review block)
    "clinic-answer-text":
      "text-[clamp(0.875rem,0.77rem+0.38vw,1.125rem)] font-medium leading-[1.3]",

    // Appointment form title
    "appointment-form-title":
      "text-[clamp(1.25rem,1.1rem+0.56vw,1.75rem)] font-semibold leading-[1.19]",

    // Page hero (our-works, promotions) — 56px desktop
    "page-hero-title":
      "text-[clamp(2.25rem,1.68rem+2.35vw,3.5rem)] font-semibold leading-[1.193] tracking-[-0.03em]",

    // Block content (blog, service pages) — Figma 45px/16px, viewport 375–1440
    "block-content-title":
      "text-[clamp(2.25rem,1.87rem+1.69vw,2.8125rem)] font-semibold leading-[1.19] tracking-[-0.01em]",
    "block-content-body":
      "text-[clamp(0.9375rem,0.915rem+0.094vw,1rem)] font-medium leading-[1.25]",
    "block-list-item":
      "text-[clamp(0.9375rem,0.915rem+0.094vw,1rem)] font-medium leading-[1.25]",
  },
} as const;

// TypeScript типы для автокомплита
export type BodyVariant = keyof typeof typography.body;
export type HeadingVariant = keyof typeof typography.heading;
export type FigmaVariant = keyof typeof typography.figma;
export type TypographyVariant = BodyVariant | HeadingVariant | FigmaVariant;
