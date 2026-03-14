/**
 * GraphQL Queries для WordPress
 *
 * Централизованный экспорт всех GraphQL запросов
 */

// Меню
export * from "./menu";

// Header Settings (ACF Option Page)
export * from "./header";

// Услуги (CPT: services)
export * from "./services";

// Категории услуг (Taxonomy: service_categories)
export * from "./taxonomies";

// Промо/Акции (CPT: promotions)
export * from "./promotions";

// Цены (CPT: prices)
export * from "./prices";

// Посты блога
export * from "./posts";

// Врачи (если используется)
export * from "./doctors";

// Клиники (CPT: clinics)
export * from "./clinics";

// Страницы (Pages)
export * from "./pages";

// Hero блок (главная страница)
export * from "./hero";

// Отзывы (CPT: reviews)
export * from "./reviews";

// Наши работы (CPT: our-works)
export * from "./our-works";

// Main Page Settings (Option Page)
export * from "./main-page";

// General Settings (timezone и др.)
export * from "./general-settings";

// Footer Settings (Option Page) и меню футера
export * from "./footer";
