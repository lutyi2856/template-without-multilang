/**
 * API функции для работы с WordPress данными
 *
 * Высокоуровневые функции для получения данных из WordPress
 * Используются в Server Components и getStaticProps/getServerSideProps
 */

import { print } from "graphql";
import { getApolloClient } from "./client";
import {
  GET_ALL_DOCTORS,
  GET_DOCTOR_BY_SLUG,
  GET_FEATURED_DOCTORS,
  GET_ALL_DOCTORS_SLUGS,
  GET_DOCTORS_FOR_SITEMAP,
  GET_DOCTORS_CONNECTION_FILTERED,
  GET_DOCTOR_SPECIALIZATIONS,
  GET_SPECIALIZATION_BY_SLUG,
  GET_ALL_SPECIALIZATIONS_SLUGS,
  GET_DOCTOR_SERVICE_CATEGORIES,
  GET_CLINICS_WITH_DOCTORS,
  GET_DOCTORS_FOR_FILTER_OPTIONS,
} from "./queries/doctors";
import {
  GET_ALL_SERVICES,
  GET_SERVICE_BY_SLUG,
  GET_SERVICE_PAGES_SETTINGS,
  GET_POPULAR_SERVICES,
  GET_ALL_SERVICES_SLUGS,
  GET_SERVICES_FOR_SITEMAP,
  GET_SERVICES_DROPDOWN_DATA,
  GET_SERVICES_BY_CATEGORY_FOR_SLIDER,
  GET_ALL_SERVICES_FOR_SLIDER,
} from "./queries/services";
import {
  GET_ALL_POSTS,
  GET_POST_BY_SLUG,
  GET_RECENT_POSTS,
  GET_ALL_POSTS_SLUGS,
  GET_POSTS_FOR_SITEMAP,
  GET_POSTS_FOR_BLOG_SECTION,
  GET_POSTS_CONNECTION,
  GET_POSTS_CONNECTION_BY_CATEGORY,
  GET_ALL_CATEGORIES,
  GET_CATEGORY_BY_SLUG,
  GET_POSTS_BY_CATEGORY,
  GET_RELATED_POSTS,
  GET_RELATED_POSTS_FOR_CARDS,
} from "./queries/posts";
import {
  GET_ALL_REVIEWS,
  GET_FEATURED_REVIEWS,
  GET_REVIEWS_PLATFORM_LOGOS,
  GET_REVIEWS_CONNECTION_FILTERED,
  GET_REVIEWS_FOR_FILTER_OPTIONS,
} from "./queries/reviews";
import {
  GET_ALL_SERVICE_CATEGORIES,
  GET_SERVICE_CATEGORY_BY_SLUG,
  GET_ALL_SERVICE_CATEGORIES_SLUGS,
  GET_ALL_PROBLEMATICS,
  GET_PROBLEMATIC_BY_SLUG,
  GET_ALL_PROBLEMATICS_SLUGS,
} from "./queries/taxonomies";
import {
  GET_FEATURED_OUR_WORKS,
  GET_OUR_WORKS_SIMPLE,
  GET_OUR_WORKS_CONNECTION,
  GET_OUR_WORKS_FOR_FILTER_OPTIONS,
} from "./queries/our-works";
import { GET_CONTACTS_SETTINGS } from "./queries/contacts";
import { GET_MAIN_PAGE_SETTINGS } from "./queries/main-page";
import { GET_REVIEWS_ARCHIVE_SETTINGS } from "./queries/reviews-archive";
import { GET_GENERAL_SETTINGS } from "./queries/general-settings";
import {
  GET_ALL_CLINICS,
  GET_CLINIC_BY_SLUG,
  GET_ALL_CLINICS_SLUGS,
  GET_CLINICS_FOR_MAP,
} from "./queries/clinics";
import {
  GET_ALL_PROMOTIONS,
  GET_PROMOTION_BY_SLUG,
  GET_PROMOTIONS_FOR_HOMEPAGE,
  GET_PROMOTIONS_BY_RELATED_SERVICE,
  GET_ALL_PROMOTIONS_SLUGS,
  GET_PROMOTIONS_CONNECTION,
  GET_PROMOTIONS_FOR_FILTER_OPTIONS,
} from "./queries/promotions";
import type { Review } from "./types/review";
import type { ContactsSettings } from "@/types/contacts";
import type { MainPageSettings } from "@/types/main-page";
import type { ReviewsArchiveSettings } from "@/types/reviews-archive";
import type { PriceArchiveSettings } from "@/types/price-archive";
import type { ActionsArchiveSettings } from "@/types/actions-archive";
import type { OurWorksArchiveSettings } from "@/types/our-works-archive";
import { GET_PRICE_ARCHIVE_SETTINGS } from "./queries/price-archive";
import { GET_PRICES_FOR_ARCHIVE } from "./queries/prices";
import { GET_ACTIONS_ARCHIVE_SETTINGS } from "./queries/actions-archive";
import { GET_OUR_WORKS_ARCHIVE_SETTINGS } from "./queries/our-works-archive";
import { GET_PAGE_BY_SLUG, GET_PAGE_BY_URI_MINIMAL, GET_ALL_PAGES_SLUGS } from "./queries/pages";
import type {
  PageBySlugResponse,
  AllPagesSlugsResponse,
} from "@/types/page";
import type { Promotion } from "@/types/promotion";
import type { ServicePagesSettings } from "@/types/services";
export type { Promotion };

// ===================================
// Врачи (Doctors)
// ===================================

export interface Doctor {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails?: {
        width: number;
        height: number;
      };
    };
  };
  doctorFields?: {
    experience?: string; // ISO date string from WordPress
    rating?: number;
    ratingSource?: string;
    reviewCount?: number;
    specialization?: Array<{ specializationItem: string }>;
    videoUrl?: string;
    description?: string;
  };
  doctorSpecializations?: {
    nodes: Array<{
      id: string;
      databaseId: number;
      name: string;
      slug: string;
    }>;
  };
  doctorTypes?: {
    nodes: Array<{ id: string; name: string; slug: string }>;
  };
  doctorPositions?: {
    nodes: Array<{ id: string; name: string; slug: string }>;
  };
  serviceCategories?: {
    nodes: Array<{ id: string; name: string; slug: string }>;
  };
  /** HTML контент из WordPress (о враче) */
  content?: string | null;
  /** Образование (ACF repeater) */
  education?: Array<{
    year?: string | null;
    place?: string | null;
    educationType?: string | null;
  }> | null;
  /** Сертификаты (ACF gallery → MediaItem[]) */
  certificates?: Array<{
    id: string;
    sourceUrl: string;
    altText?: string | null;
    mediaDetails?: { width: number; height: number };
  }> | null;
  /** Отзывы о враче (relationship → Review[]) */
  relatedReviews?: Review[] | null;
  clinic?: Array<{
    id: string;
    databaseId: number;
    title: string;
    slug: string;
  }>;
}

export interface DoctorsPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface DoctorsFilters {
  categorySlug?: string;
  clinicSlug?: string;
  specializationSlug?: string;
}

/**
 * Построить where для doctors connection из фильтров (category, clinic, specialization)
 */
function buildDoctorsWhere(filters?: DoctorsFilters) {
  const where: Record<string, unknown> = {
    status: "PUBLISH",
  };

  if (filters?.categorySlug?.trim()) {
    where.categorySlug = filters.categorySlug.trim();
  }

  if (filters?.clinicSlug?.trim()) {
    where.clinicSlug = filters.clinicSlug.trim();
  }

  if (filters?.specializationSlug?.trim()) {
    where.specializationSlug = filters.specializationSlug.trim();
  }

  return where;
}

/**
 * Получить врачей с пагинацией (для архива и «Загрузить ещё»).
 * Поддерживает фильтры по категории (service_categories) и клинике.
 */
export async function getDoctorsConnection(
  first: number = 12,
  after?: string,
  filters?: DoctorsFilters
): Promise<{ doctors: Doctor[]; pageInfo: DoctorsPageInfo }> {
  const hasFilters = Boolean(
    filters?.categorySlug || filters?.clinicSlug || filters?.specializationSlug
  );
  const where = hasFilters ? buildDoctorsWhere(filters) : undefined;

  if (hasFilters) {
    const uri =
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      "http://localhost:8002/graphql";
    const res = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: print(GET_DOCTORS_CONNECTION_FILTERED),
        variables: { first, after: after ?? undefined, where },
      }),
      cache: "no-store",
    });
    const json = await res.json();
    const doctors = json?.data?.doctors?.nodes ?? [];
    const pageInfo: DoctorsPageInfo = {
      hasNextPage: json?.data?.doctors?.pageInfo?.hasNextPage ?? false,
      endCursor: json?.data?.doctors?.pageInfo?.endCursor ?? null,
    };
    return { doctors, pageInfo };
  }

  const client = getApolloClient();
  const variables = {
    first,
    after: after ?? undefined,
    orderBy: "MENU_ORDER" as const,
    order: "ASC" as const,
  };
  const { data } = await client.query({
    query: GET_ALL_DOCTORS,
    variables,
  });

  const doctors = data?.doctors?.nodes ?? [];
  const pageInfo: DoctorsPageInfo = {
    hasNextPage: data?.doctors?.pageInfo?.hasNextPage ?? false,
    endCursor: data?.doctors?.pageInfo?.endCursor ?? null,
  };

  return { doctors, pageInfo };
}

export interface DoctorSpecialization {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
}

/** Категория услуг (service_categories) с врачами — для фильтра архива врачей */
export interface DoctorServiceCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
}

/**
 * Получить список специализаций (doctor_specializations) для архива и фильтров.
 */
export async function getDoctorSpecializations(): Promise<
  DoctorSpecialization[]
> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_DOCTOR_SPECIALIZATIONS,
    context: {
      fetchOptions: { next: { tags: ["doctors"], revalidate: 3600 } },
    },
  });

  const nodes = data?.doctorSpecializations?.nodes ?? [];
  return nodes;
}

/**
 * Получить специализацию по slug — для страницы термина /specialization/[slug]
 */
export async function getSpecializationBySlug(
  slug: string
): Promise<DoctorSpecialization | null> {
  try {
    const client = getApolloClient();
    const { data } = await client.query({
      query: GET_SPECIALIZATION_BY_SLUG,
      variables: { slug },
      context: {
        fetchOptions: { next: { revalidate: 3600 } },
      },
    });
    return data?.doctorSpecialization ?? null;
  } catch (error: unknown) {
    console.error("[getSpecializationBySlug] Error for slug", slug, error);
    return null;
  }
}

/**
 * Все slug специализаций для generateStaticParams
 */
export async function getAllSpecializationsSlugs(): Promise<string[]> {
  try {
    const list = await getDoctorSpecializations();
    return list.map((s) => s.slug).filter(Boolean);
  } catch (error: unknown) {
    console.error("[getAllSpecializationsSlugs] Error", error);
    return [];
  }
}

/**
 * Получить категории услуг (service_categories), у которых есть хотя бы один врач.
 * Для фильтра архива врачей — пустые категории не показываются.
 */
export async function getDoctorServiceCategories(): Promise<
  DoctorServiceCategory[]
> {
  const client = getApolloClient();

  const { data, errors } = await client.query({
    query: GET_DOCTOR_SERVICE_CATEGORIES,
    context: {
      fetchOptions: { next: { tags: ["doctors"], revalidate: 3600 } },
    },
  });

  if (errors?.length) {
    console.error("[getDoctorServiceCategories] GraphQL errors:", errors);
    return [];
  }

  const nodes = data?.doctorServiceCategories ?? [];
  return Array.isArray(nodes) ? nodes : [];
}

/**
 * Получить клиники, у которых есть хотя бы один врач.
 * Для фильтра архива врачей — клиники без врачей не показываются.
 */
export async function getClinicsWithDoctors(): Promise<Clinic[]> {
  const client = getApolloClient();

  const { data, errors } = await client.query({
    query: GET_CLINICS_WITH_DOCTORS,
    context: {
      fetchOptions: { next: { tags: ["doctors", "clinics"], revalidate: 3600 } },
    },
  });

  if (errors?.length) {
    console.error("[getClinicsWithDoctors] GraphQL errors:", errors);
    return [];
  }

  const nodes = data?.clinicsWithDoctors ?? [];
  return Array.isArray(nodes) ? nodes : [];
}

/**
 * Получить списки категорий и клиник для фильтра архива врачей из запроса врачей.
 * Только категории/клиники, у которых есть врачи. Стандартный GraphQL, без кастомных полей.
 */
export async function getDoctorsFilterOptions(): Promise<{
  categories: DoctorServiceCategory[];
  clinics: Clinic[];
}> {
  const client = getApolloClient();

  const { data, errors } = await client.query({
    query: GET_DOCTORS_FOR_FILTER_OPTIONS,
    variables: { first: 500 },
    context: {
      fetchOptions: { next: { tags: ["doctors"], revalidate: 3600 } },
    },
  });

  if (errors?.length) {
    console.error("[getDoctorsFilterOptions] GraphQL errors:", errors);
    return { categories: [], clinics: [] };
  }

  const nodes = data?.doctors?.nodes ?? [];
  const categoriesBySlug = new Map<string, DoctorServiceCategory>();
  const clinicsBySlug = new Map<string, Clinic>();

  for (const doctor of nodes) {
    const cats = doctor?.serviceCategories?.nodes;
    if (Array.isArray(cats)) {
      for (const c of cats) {
        if (c?.slug && c?.name) {
          categoriesBySlug.set(c.slug, {
            id: c.id,
            databaseId: c.databaseId,
            name: c.name,
            slug: c.slug,
          });
        }
      }
    }
    const clinics = doctor?.clinic;
    if (Array.isArray(clinics)) {
      for (const cl of clinics) {
        if (cl?.slug && cl?.title) {
          clinicsBySlug.set(cl.slug, {
            id: cl.id,
            databaseId: cl.databaseId,
            title: cl.title,
            slug: cl.slug,
          });
        }
      }
    } else if (clinics && typeof clinics === "object" && clinics.slug && clinics.title) {
      clinicsBySlug.set(clinics.slug, {
        id: clinics.id,
        databaseId: clinics.databaseId,
        title: clinics.title,
        slug: clinics.slug,
      });
    }
  }

  const categories = Array.from(categoriesBySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const clinics = Array.from(clinicsBySlug.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return { categories, clinics };
}

/**
 * Получить всех врачей
 */
export async function getDoctors(variables?: {
  first?: number;
  after?: string;
}): Promise<Doctor[]> {
  const { doctors } = await getDoctorsConnection(
    variables?.first ?? 10,
    variables?.after
  );
  return doctors;
}

/**
 * Получить врача по slug
 */
export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_DOCTOR_BY_SLUG,
    variables: { slug },
  });

  return data?.doctor || null;
}

/**
 * Получить избранных врачей для homepage
 * PERFORMANCE: Использует DOCTOR_CARD_FIELDS (минимум полей)
 */
export async function getFeaturedDoctors(first: number = 4): Promise<Doctor[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_FEATURED_DOCTORS,
    variables: { first },
    context: {
      fetchOptions: {
        next: { revalidate: 3600 }, // ISR: кэш на 1 час
      },
    },
  });

  return data?.doctors?.nodes || [];
}

/**
 * Получить связанных врачей (та же категория услуг + та же специализация) для страницы врача.
 * Исключает текущего врача. Используется в секции «Другие специалисты».
 */
export async function getRelatedDoctors(
  doctor: Doctor,
  first: number = 12
): Promise<Doctor[]> {
  const categorySlug = doctor.serviceCategories?.nodes?.[0]?.slug;
  const specializationSlug = doctor.doctorSpecializations?.nodes?.[0]?.slug;

  let doctors: Doctor[] = [];

  if (categorySlug || specializationSlug) {
    const { doctors: raw } = await getDoctorsConnection(first + 5, undefined, {
      categorySlug: categorySlug ?? undefined,
      specializationSlug: specializationSlug ?? undefined,
    });
    doctors = raw;
  } else {
    doctors = await getFeaturedDoctors(first + 5);
  }

  const filtered = doctors.filter((d) => d.slug !== doctor.slug);
  return filtered.slice(0, first);
}

/**
 * Получить slugs всех врачей (для generateStaticParams)
 */
export async function getAllDoctorsSlugs(): Promise<string[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_ALL_DOCTORS_SLUGS,
  });

  return data?.doctors?.nodes?.map((doctor: Doctor) => doctor.slug) || [];
}

/**
 * Получить врачей для sitemap
 */
export async function getDoctorsForSitemap(): Promise<
  Array<{ slug: string; modified: string }>
> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_DOCTORS_FOR_SITEMAP,
  });

  return data?.doctors?.nodes || [];
}

// ===================================
// Клиники (Clinics)
// ===================================

export interface Clinic {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails?: {
        width: number;
        height: number;
      };
    };
  };
  clinicFields?: {
    address?: string;
    phone?: string;
    metroStation?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    workingHours?: {
      weekdays?: string;
      weekend?: string;
    };
  };
}

/**
 * Получить все клиники
 */
export async function getClinics(variables?: {
  first?: number;
  after?: string;
}): Promise<Clinic[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_ALL_CLINICS,
    variables: {
      first: 10,
      ...variables,
    },
  });

  return data?.clinics?.nodes || [];
}

/**
 * Получить клинику по slug
 */
export async function getClinicBySlug(slug: string): Promise<Clinic | null> {
  const client = getApolloClient();

  console.log("[getClinicBySlug] Запрос клиники с slug:", slug);

  const { data, errors } = await client.query({
    query: GET_CLINIC_BY_SLUG,
    variables: { slug },
  });

  console.log("[getClinicBySlug] GraphQL response data:", data);
  console.log("[getClinicBySlug] GraphQL errors:", errors);

  return data?.clinic || null;
}

/**
 * Получить клиники с координатами для секции «Клиники на карте».
 * Возвращает только клиники, у которых заполнены latitude и longitude.
 */
export async function getClinicsForMap(): Promise<Clinic[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_CLINICS_FOR_MAP,
    variables: { first: 50 },
  });

  const nodes = data?.clinics?.nodes || [];
  return nodes.filter(
    (c: Clinic) =>
      c.clinicFields?.coordinates?.latitude != null &&
      c.clinicFields?.coordinates?.longitude != null
  );
}

/**
 * Получить slugs всех клиник (для generateStaticParams)
 */
export async function getAllClinicsSlugs(): Promise<string[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_ALL_CLINICS_SLUGS,
  });

  return data?.clinics?.nodes?.map((clinic: Clinic) => clinic.slug) || [];
}

// ===================================
// Услуги (Services)
// ===================================

export interface Service {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  /** Parsed Gutenberg content blocks with resolved ACF data */
  contentBlocks?: Array<{ name: string; attributes: string }>;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  serviceFields?: {
    price?: number;
    priceFrom?: number;
    priceTo?: number;
    duration?: string;
    description?: string;
    isPopular?: boolean;
  };
  /** Related promotions for service page promo banner */
  relatedPromotions?: Promotion[];
  /** Блоки страницы услуги (ACF, manual GraphQL registration) */
  servicePageBlocks?: {
    doctorsSectionShow?: boolean | null;
    doctorsSectionTitle?: string | null;
    doctorsSectionDescription?: string | null;
    relatedDoctors?: Doctor[] | null;
    showPriceBlock?: boolean | null;
    exactPriceBlockIcon?: string | null;
    exactPriceBlockText?: string | null;
    exactPriceBlockLink?: string | null;
    staTitle?: string | null;
    staDescription?: string | null;
    staPhone?: string | null;
    staPrivacyText?: string | null;
    staPrivacyLink?: string | null;
    staDoctorImage?: { url?: string; width?: number; height?: number; alt?: string } | null;
    staBackgroundImage?: { url?: string; width?: number; height?: number; alt?: string } | null;
    servicesBlockShow?: boolean | null;
    servicesBlockTitle?: string | null;
    blockServices?: ServiceSliderItem[] | null;
  } | null;
}

/**
 * Получить все услуги
 */
export async function getServices(variables?: {
  first?: number;
  after?: string;
}): Promise<Service[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_ALL_SERVICES,
    variables: {
      first: 20,
      ...variables,
    },
  });

  return data?.services?.nodes || [];
}

/**
 * Получить услугу по slug
 *
 * Использует прямой fetch с cache: "no-store" вместо Apollo, чтобы обойти кэш Next.js
 * и гарантировать получение актуальных contentBlocks (ACF блоки).
 */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const uri =
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      "http://localhost:8002/graphql";

    const res = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: print(GET_SERVICE_BY_SLUG),
        variables: { slug },
      }),
      cache: "no-store",
    });

    const json = await res.json();
    if (json?.errors?.length) {
      console.error("[getServiceBySlug] GraphQL errors:", json.errors);
      return null;
    }

    return json?.data?.service ?? null;
  } catch (error) {
    console.error("[getServiceBySlug] GraphQL/network error for slug:", slug, error);
    return null;
  }
}

/**
 * Получить популярные услуги для homepage
 */
export async function getPopularServices(
  first: number = 4
): Promise<Service[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_POPULAR_SERVICES,
    variables: { first },
  });

  return data?.services?.nodes || [];
}

/**
 * Минимальные поля для слайдера услуг (карточка в блоке «Другие услуги»)
 */
export type ServiceSliderItem = {
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  iconSvg?: string | null;
};

export async function getServicesForServicePageSlider(
  currentSlug: string,
  categorySlugs?: string[],
  limit: number = 12
): Promise<ServiceSliderItem[]> {
  const client = getApolloClient();

  const filterBySlug = (nodes: ServiceSliderItem[]): ServiceSliderItem[] =>
    nodes.filter((s) => s.slug !== currentSlug).slice(0, limit);

  if (categorySlugs?.length) {
    for (const catSlug of categorySlugs) {
      try {
        const { data } = await client.query({
          query: GET_SERVICES_BY_CATEGORY_FOR_SLIDER,
          variables: { categorySlug: catSlug, first: limit + 1 },
          context: { fetchOptions: { next: { revalidate: 3600 } } },
        });
        const nodes = (data?.services?.nodes ?? []) as ServiceSliderItem[];
        const filtered = filterBySlug(nodes);
        if (filtered.length > 0) return filtered;
      } catch {
        continue;
      }
    }
  }

  try {
    const { data } = await client.query({
      query: GET_ALL_SERVICES_FOR_SLIDER,
      variables: { first: limit + 1 },
      context: { fetchOptions: { next: { revalidate: 3600 } } },
    });
    const nodes = (data?.services?.nodes ?? []) as ServiceSliderItem[];
    return filterBySlug(nodes);
  } catch (error) {
    console.error("[getServicesForServicePageSlider] Error:", error);
    return [];
  }
}

/**
 * Получить slugs всех услуг (для generateStaticParams)
 */
export async function getAllServicesSlugs(): Promise<string[]> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_ALL_SERVICES_SLUGS,
    });

    return data?.services?.nodes?.map((service: Service) => service.slug) || [];
  } catch (error) {
    console.error("[getAllServicesSlugs] GraphQL/network error:", error);
    return [];
  }
}

/**
 * Получить WordPress Page по URI (fallback для услуг из blog/services/)
 * Используется когда контент хранится как Page, а не Service CPT
 */
export async function getPageByUri(uri: string): Promise<{
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails?: { width?: number; height?: number };
    };
  };
} | null> {
  const client = getApolloClient();
  const normalized = uri.startsWith("/") ? uri : `/${uri}`;
  const uriVariants = [
    normalized.endsWith("/") ? normalized : `${normalized}/`,
    normalized.endsWith("/") ? normalized.slice(0, -1) : normalized,
    normalized.replace(/^\//, ""),
  ];

  for (const slug of uriVariants) {
    try {
      const { data } = await client.query<PageBySlugResponse>({
        query: GET_PAGE_BY_URI_MINIMAL,
        variables: { slug },
      });
      if (data?.page) {
        const page = data.page;
        return {
          title: page.title,
          excerpt: page.excerpt ?? undefined,
          content: page.content,
          featuredImage: page.featuredImage,
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Получить slugs страниц из blog/services/* для generateStaticParams
 * Fallback: когда услуги хранятся как WordPress Pages
 */
export async function getBlogServicesPageSlugs(): Promise<string[]> {
  const client = getApolloClient();
  try {
    const { data } = await client.query<AllPagesSlugsResponse>({
      query: GET_ALL_PAGES_SLUGS,
    });
    const nodes = data?.pages?.nodes ?? [];
    return nodes
      .filter((p) => p.uri?.includes("/blog/services/"))
      .map((p) => {
        const parts = p.uri.replace(/\/$/, "").split("/");
        return parts[parts.length - 1] || p.slug;
      })
      .filter(Boolean);
  } catch (error) {
    console.error("[getBlogServicesPageSlugs] Error:", error);
    return [];
  }
}

/**
 * Типы для Services Dropdown
 */
export interface ServiceCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
  uri?: string;
  icon?: string | null;
  iconSvg?: string | null;
}

/**
 * Получить все категории услуг для homepage секции
 * PERFORMANCE: ISR кэш 1 час
 */
export async function getAllServiceCategories(): Promise<ServiceCategory[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_ALL_SERVICE_CATEGORIES,
    variables: {
      first: 50,
      hideEmpty: true,
    },
    context: {
      fetchOptions: {
        next: { revalidate: 3600 }, // ISR: кэш на 1 час
      },
    },
  });

  return data?.serviceCategories?.nodes || [];
}

/**
 * Получить категорию услуг по slug — для страницы термина /service-category/[slug]
 */
export async function getServiceCategoryBySlug(
  slug: string
): Promise<ServiceCategory | null> {
  try {
    const client = getApolloClient();
    const { data } = await client.query({
      query: GET_SERVICE_CATEGORY_BY_SLUG,
      variables: { slug },
      context: {
        fetchOptions: { next: { revalidate: 3600 } },
      },
    });
    return data?.serviceCategory ?? null;
  } catch (error: unknown) {
    console.error("[getServiceCategoryBySlug] Error for slug", slug, error);
    return null;
  }
}

/**
 * Все slug категорий для generateStaticParams
 */
export async function getAllServiceCategoriesSlugs(): Promise<string[]> {
  try {
    const client = getApolloClient();
    const { data } = await client.query({
      query: GET_ALL_SERVICE_CATEGORIES_SLUGS,
      context: {
        fetchOptions: { next: { revalidate: 3600 } },
      },
    });
    if (!data?.serviceCategories?.nodes) return [];
    return data.serviceCategories.nodes
      .filter((n: { slug?: string }) => n.slug)
      .map((n: { slug: string }) => n.slug);
  } catch (error: unknown) {
    console.error("[getAllServiceCategoriesSlugs] Error", error);
    return [];
  }
}

/**
 * Тип для проблематики (taxonomy problematics)
 */
export interface Problematic {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
  uri?: string;
  icon?: string | null;
  relatedServiceCategories?: {
    nodes: Array<{ id: string; slug: string; name: string }>;
  };
}

/**
 * Получить все проблематики для архива /problematics
 * PERFORMANCE: ISR кэш 1 час
 */
export async function getAllProblematics(): Promise<Problematic[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_ALL_PROBLEMATICS,
    variables: {
      first: 50,
      hideEmpty: false,
    },
    context: {
      fetchOptions: {
        next: { revalidate: 3600 }, // ISR: кэш на 1 час
      },
    },
  });

  return data?.problematics?.nodes || [];
}

/**
 * Получить проблематику по slug — для страницы термина /problematics/[slug]
 */
export async function getProblematicBySlug(
  slug: string
): Promise<Problematic | null> {
  try {
    const client = getApolloClient();
    const { data } = await client.query({
      query: GET_PROBLEMATIC_BY_SLUG,
      variables: { slug },
      context: {
        fetchOptions: { next: { revalidate: 3600 } },
      },
    });
    return data?.problematic ?? null;
  } catch (error: unknown) {
    console.error("[getProblematicBySlug] Error for slug", slug, error);
    return null;
  }
}

/**
 * Все slug проблематик для generateStaticParams
 */
export async function getAllProblematicsSlugs(): Promise<string[]> {
  try {
    const client = getApolloClient();
    const { data } = await client.query({
      query: GET_ALL_PROBLEMATICS_SLUGS,
      context: {
        fetchOptions: { next: { revalidate: 3600 } },
      },
    });
    if (!data?.problematics?.nodes) return [];
    return data.problematics.nodes
      .filter((n: { slug?: string }) => n.slug)
      .map((n: { slug: string }) => n.slug);
  } catch (error: unknown) {
    console.error("[getAllProblematicsSlugs] Error", error);
    return [];
  }
}

export interface ServiceDropdownItem {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  serviceCategories?: {
    nodes: Array<{
      id: string;
      slug: string;
    }>;
  };
}

export interface PriceData {
  id: string;
  databaseId: number;
  title: string;
  regularPrice?: number;
  promoPrice?: number;
  currency?: string;
}

export interface FeaturedServiceData {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  excerpt?: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails?: {
        width: number;
        height: number;
      };
    };
  };
  /** Особенности услуги (repeater) - на верхнем уровне Service */
  serviceFeatures?: Array<{ text: string }> | null;
  /** Связанные цены (list format) */
  relatedPrices?: PriceData[] | null;
}

export interface ServicesDropdownData {
  categories: ServiceCategory[];
  services: ServiceDropdownItem[];
  featuredService?: FeaturedServiceData | null;
}

/**
 * Получить данные для Services Dropdown (категории + услуги + featured)
 * Используется в Navigation для выпадающего меню
 */
export async function getServicesDropdownData(): Promise<ServicesDropdownData> {
  const client = getApolloClient();

  try {
    const result = await client.query({
      query: GET_SERVICES_DROPDOWN_DATA,
      fetchPolicy: "network-only", // Always fetch fresh data from server
      context: {
        fetchOptions: {
          next: { revalidate: 3600 }, // Cache for 1 hour
        },
      },
    });

    console.log(
      "[getServicesDropdownData] Full result:",
      JSON.stringify(result, null, 2)
    );
    console.log("[getServicesDropdownData] Errors:", result.errors);
    console.log(
      "[getServicesDropdownData] Data:",
      JSON.stringify(result.data, null, 2)
    );

    if (result.errors) {
      console.error("[getServicesDropdownData] GraphQL errors:", result.errors);
    }

    return {
      categories: result.data?.serviceCategories?.nodes || [],
      services: result.data?.services?.nodes || [],
      featuredService: result.data?.headerSettings?.featuredService || null,
    };
  } catch (error) {
    console.error("[getServicesDropdownData] Exception:", error);
    if (error instanceof Error) {
      console.error("[getServicesDropdownData] Error message:", error.message);
      console.error("[getServicesDropdownData] Error stack:", error.stack);
    }
    return {
      categories: [],
      services: [],
      featuredService: null,
    };
  }
}

// ===================================
// Посты (Posts)
// ===================================

export interface Post {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  content?: string;
  contentBlocks?: Array<{
    name: string;
    attributes: string;
  }>;
  author?: {
    node: {
      name: string;
      avatar?: {
        url: string;
      };
    };
  };
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  categories?: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
  shareButtons?: Array<{
    icon: string;
    url: string;
    label: string;
  }> | null;
  ctaOverride?: {
    ctaTitle?: string | null;
    ctaDescription?: string | null;
    ctaButtonText?: string | null;
    ctaImage?: {
      sourceUrl: string;
      altText?: string;
      mediaDetails?: { width: number; height: number };
    } | null;
  } | null;
}

/** Пост для карточки в секции блога (главная): + relatedDoctors, фон ACF */
export interface BlogPostCard extends Post {
  relatedDoctors?: Array<{
    id: string;
    databaseId: number;
    title: string;
    slug: string;
    featuredImage?: {
      node: {
        sourceUrl: string;
        altText?: string;
        mediaDetails?: { width: number; height: number };
      };
    };
  }>;
  cardStyle?: 'light' | 'dark' | null;
}

/**
 * Получить посты для секции «Самое интересное в блоге» (главная)
 */
export async function getPostsForBlogSection(first: number = 9): Promise<BlogPostCard[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_POSTS_FOR_BLOG_SECTION,
    variables: { first },
  });

  return data?.posts?.nodes || [];
}

/**
 * Получить все посты
 */
export async function getPosts(variables?: {
  first?: number;
  after?: string;
}): Promise<Post[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_ALL_POSTS,
    variables: {
      first: 10,
      ...variables,
    },
  });

  return data?.posts?.edges?.map((edge: any) => edge.node) || [];
}

/**
 * Получить пост по slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_POST_BY_SLUG,
    variables: { slug },
  });

  return data?.post || null;
}

/**
 * Получить похожие посты (по категориям, исключая текущий)
 */
export async function getRelatedPosts(
  categoryIds: string[],
  excludeIds: string[],
  first: number = 6
): Promise<Post[]> {
  if (!categoryIds.length) return [];
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_RELATED_POSTS,
    variables: { categoryIn: categoryIds, notIn: excludeIds, first },
  });

  return data?.posts?.nodes || [];
}

/**
 * Получить похожие посты для карточек (с relatedDoctors, cardStyle)
 */
export async function getRelatedPostsForCards(
  categoryIds: string[],
  excludeIds: string[],
  first: number = 6
): Promise<BlogPostCard[]> {
  if (!categoryIds.length) return [];
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_RELATED_POSTS_FOR_CARDS,
    variables: { categoryIn: categoryIds, notIn: excludeIds, first },
  });

  return data?.posts?.nodes || [];
}

/**
 * Получить последние посты для homepage
 */
export async function getRecentPosts(first: number = 6): Promise<Post[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_RECENT_POSTS,
    variables: { first },
  });

  return data?.posts?.nodes || [];
}

/**
 * Получить slugs всех постов (для generateStaticParams)
 */
export async function getAllPostsSlugs(): Promise<string[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_ALL_POSTS_SLUGS,
  });

  return data?.posts?.nodes?.map((post: Post) => post.slug) || [];
}

/**
 * Получить все категории
 */
export async function getAllCategories() {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_ALL_CATEGORIES,
  });

  return data?.categories?.nodes || [];
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

/**
 * Получить категорию по slug (для архива /blog/category/[slug])
 */
export async function getCategoryBySlug(
  slug: string
): Promise<PostCategory | null> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_CATEGORY_BY_SLUG,
    variables: { slug },
  });

  return data?.category || null;
}

/**
 * Получить slug всех категорий (для generateStaticParams)
 */
export async function getAllCategoriesSlugs(): Promise<string[]> {
  const nodes = await getAllCategories();
  return nodes.map((c: { slug: string }) => c.slug);
}

/**
 * Получить посты по slug категории
 */
export async function getPostsByCategory(
  categorySlug: string,
  variables?: { first?: number }
): Promise<Post[]> {
  const client = getApolloClient();

  const { data } = await client.query({
    query: GET_POSTS_BY_CATEGORY,
    variables: {
      categorySlug,
      first: variables?.first ?? 10,
    },
  });

  return data?.posts?.nodes || [];
}

export interface PostsPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

/**
 * Получить посты с cursor pagination для архива блога (/blog)
 * Поддерживает фильтр по категории (стандартная WordPress category)
 */
export async function getPostsConnection(
  first: number = 6,
  after?: string,
  filters?: { categorySlug?: string }
): Promise<{ posts: BlogPostCard[]; pageInfo: PostsPageInfo }> {
  const client = getApolloClient();
  const categorySlug = filters?.categorySlug?.trim();

  const query = categorySlug
    ? GET_POSTS_CONNECTION_BY_CATEGORY
    : GET_POSTS_CONNECTION;

  const variables = categorySlug
    ? { first, after: after ?? null, categorySlug }
    : { first, after: after ?? null };

  const { data } = await client.query({
    query,
    variables,
  });

  const edges = data?.posts?.edges ?? [];
  const pageInfo = data?.posts?.pageInfo;

  return {
    posts: edges.map((edge: { node: BlogPostCard }) => edge.node),
    pageInfo: {
      hasNextPage: pageInfo?.hasNextPage ?? false,
      endCursor: pageInfo?.endCursor ?? null,
    },
  };
}

// ===================================
// General Settings (часовой пояс WordPress)
// ===================================

/**
 * Получить часовой пояс сайта из настроек WordPress (Настройки → Общие).
 * Используется для единообразного форматирования дат (сервер и клиент).
 * Возвращает IANA timezone (например "Europe/Moscow") или "UTC" при ошибке.
 */
export async function getWordPressTimezone(): Promise<string> {
  const client = getApolloClient();
  try {
    const { data } = await client.query<{
      generalSettings?: { timezone?: string };
    }>({
      query: GET_GENERAL_SETTINGS,
    });
    const tz = data?.generalSettings?.timezone?.trim();
    return tz && tz.length > 0 ? tz : "UTC";
  } catch {
    return "UTC";
  }
}

// ===================================
// Отзывы (Reviews)
// ===================================

export type ReviewsRatingFilter = "above_49" | "below_4";

export interface ReviewPlatform {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
}

function buildReviewsWhere(options: {
  ratingFilter?: ReviewsRatingFilter;
  platformSlug?: string;
}): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (options.ratingFilter === "above_49") where.ratingMin = 4.9;
  if (options.ratingFilter === "below_4") where.ratingMax = 4;
  if (options.platformSlug?.trim()) where.platformSlug = options.platformSlug.trim();
  return where;
}

/**
 * Получить платформы для фильтра архива отзывов (только платформы, у которых есть отзывы)
 */
export async function getReviewsFilterOptions(): Promise<{
  platforms: ReviewPlatform[];
}> {
  const client = getApolloClient();

  const { data, errors } = await client.query({
    query: GET_REVIEWS_FOR_FILTER_OPTIONS,
    variables: { first: 500 },
    context: {
      fetchOptions: { next: { tags: ["reviews"], revalidate: 3600 } },
    },
  });

  if (errors?.length) {
    console.error("[getReviewsFilterOptions] GraphQL errors:", errors);
    return { platforms: [] };
  }

  const nodes = data?.reviews?.nodes ?? [];
  const platformsBySlug = new Map<string, ReviewPlatform>();

  for (const review of nodes) {
    const platforms = review?.reviewPlatforms?.nodes;
    if (Array.isArray(platforms)) {
      for (const p of platforms) {
        if (p?.slug && p?.name) {
          platformsBySlug.set(p.slug, {
            id: p.id,
            databaseId: p.databaseId,
            name: p.name,
            slug: p.slug,
          });
        }
      }
    }
  }

  const platforms = Array.from(platformsBySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return { platforms };
}

/**
 * Получить все отзывы (с опциональным фильтром по рейтингу и платформе)
 */
export async function getReviews(variables?: {
  first?: number;
  after?: string;
  ratingFilter?: ReviewsRatingFilter;
  platformSlug?: string;
}): Promise<any[]> {
  const where = buildReviewsWhere({
    ratingFilter: variables?.ratingFilter,
    platformSlug: variables?.platformSlug,
  });
  const hasFilters = Object.keys(where).length > 0;

  if (hasFilters) {
    const uri =
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      "http://localhost:8002/graphql";
    const res = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: print(GET_REVIEWS_CONNECTION_FILTERED),
        variables: {
          first: variables?.first ?? 1000,
          after: variables?.after ?? undefined,
          where: { status: "PUBLISH", ...where },
        },
      }),
      cache: "no-store",
    });
    const json = await res.json();
    const edges = json?.data?.reviews?.edges ?? [];
    return edges.map((edge: { node: any }) => edge.node);
  }

  const client = getApolloClient();
  const { data } = await client.query({
    query: GET_ALL_REVIEWS,
    variables: {
      first: variables?.first ?? 1000,
      after: variables?.after ?? undefined,
    },
  });

  return data?.reviews?.edges?.map((edge: any) => edge.node) || [];
}

/**
 * Получить избранные отзывы для homepage
 * PERFORMANCE: Последние 10 отзывов с полным контентом для слайдера
 */
export async function getFeaturedReviews(first: number = 10): Promise<any[]> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_FEATURED_REVIEWS,
      variables: { first },
    });

    // Защита от undefined и обработка данных
    const reviews = data?.reviews?.nodes || [];

    // Обеспечиваем что у каждого врача есть relatedServices (массив)
    // ВАЖНО: Создаем новый объект вместо изменения read-only объекта Apollo
    return reviews.map((review: any) => {
      const processedReview = { ...review };

      if (review.relatedDoctors) {
        processedReview.relatedDoctors = review.relatedDoctors.map(
          (doctor: any) => ({
            ...doctor,
            relatedServices: doctor.relatedServices || [],
          })
        );
      }

      return processedReview;
    });
  } catch (error) {
    console.error("[getFeaturedReviews] Error:", error);
    return [];
  }
}

/**
 * Получить platformLogo для отзывов по id (обогащение для страницы врача)
 * GraphQL иногда не возвращает platformLogo для вложенных relatedReviews
 */
export async function getReviewsPlatformLogos(
  reviewIds: string[]
): Promise<Map<string, { sourceUrl: string; altText?: string }>> {
  if (reviewIds.length === 0) return new Map();
  try {
    const client = getApolloClient();
    const { data } = await client.query({
      query: GET_REVIEWS_PLATFORM_LOGOS,
      variables: { ids: reviewIds },
    });
    const nodes = data?.reviews?.nodes ?? [];
    return new Map(
      nodes
        .filter((n: { platformLogo?: { sourceUrl: string } }) => n.platformLogo?.sourceUrl)
        .map((n: { id: string; platformLogo: { sourceUrl: string; altText?: string } }) => [
          n.id,
          { sourceUrl: n.platformLogo.sourceUrl, altText: n.platformLogo.altText },
        ])
    );
  } catch (error) {
    console.error("[getReviewsPlatformLogos] Error:", error);
    return new Map();
  }
}

// ===================================
// Our Works (Наши работы)
// ===================================

import type { OurWork, OurWorkService } from "./types/our-work";

/**
 * Получить избранные работы для homepage
 * PERFORMANCE: Последние 10 работ с полным контентом для слайдера
 */
export async function getOurWorks(first: number = 10): Promise<OurWork[]> {
  try {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "api.ts:559",
        message: "getOurWorks called",
        data: { first },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion

    const client = getApolloClient();

    // Сначала пробуем простой запрос для проверки базовой работы
    let simpleWorksCount = 0;
    try {
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "api.ts:565",
            message: "Before simple query",
            data: { query: "GET_OUR_WORKS_SIMPLE", first },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H1",
          }),
        }
      ).catch(() => {});
      // #endregion

      const simpleResult = await client.query({
        query: GET_OUR_WORKS_SIMPLE,
        variables: { first },
      });

      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "api.ts:574",
            message: "Simple query response",
            data: {
              hasData: !!simpleResult.data,
              hasOurWorks: !!simpleResult.data?.ourWorks,
              hasNodes: !!simpleResult.data?.ourWorks?.nodes,
              nodesLength: simpleResult.data?.ourWorks?.nodes?.length,
              firstNode: simpleResult.data?.ourWorks?.nodes?.[0],
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H1",
          }),
        }
      ).catch(() => {});
      // #endregion

      simpleWorksCount = simpleResult.data?.ourWorks?.nodes?.length || 0;
      console.log(
        "[getOurWorks] ✅ Simple query (without workFields) found:",
        simpleWorksCount,
        "works"
      );
      if (simpleWorksCount > 0) {
        console.log("[getOurWorks] First work:", {
          id: simpleResult.data?.ourWorks?.nodes[0]?.id,
          title: simpleResult.data?.ourWorks?.nodes[0]?.title,
        });
      }
    } catch (simpleError: any) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "api.ts:594",
            message: "Simple query error",
            data: {
              errorMessage: simpleError.message,
              hasGraphQLErrors: !!simpleError.graphQLErrors,
              graphQLErrors: simpleError.graphQLErrors,
              networkError: simpleError.networkError?.message,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H2",
          }),
        }
      ).catch(() => {});
      // #endregion

      console.error(
        "[getOurWorks] ❌ Simple query failed:",
        simpleError.message
      );
      if (simpleError.graphQLErrors) {
        console.error(
          "[getOurWorks] Simple query GraphQL errors:",
          JSON.stringify(simpleError.graphQLErrors, null, 2)
        );
      }
    }

    // Теперь полный запрос с workFields
    console.log("[getOurWorks] 🔍 Executing full query with workFields...");

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "api.ts:596",
        message: "Before full query",
        data: {
          query: "GET_FEATURED_OUR_WORKS",
          first,
          cacheSize: 0,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H2,H3",
      }),
    }).catch(() => {});
    // #endregion

    const { data, errors } = await client.query({
      query: GET_FEATURED_OUR_WORKS,
      variables: { first },
      errorPolicy: "all", // Получаем данные даже если есть ошибки
      fetchPolicy: "no-cache", // TEMPORARY: Force fetch to bypass cache for debugging
    });

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "api.ts:609",
        message: "Full query response",
        data: {
          hasData: !!data,
          hasErrors: !!errors,
          errorsCount: errors?.length,
          hasOurWorks: !!data?.ourWorks,
          hasNodes: !!data?.ourWorks?.nodes,
          nodesLength: data?.ourWorks?.nodes?.length,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H2",
      }),
    }).catch(() => {});
    // #endregion

    // Логируем ошибки GraphQL если есть
    if (errors && errors.length > 0) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "api.ts:619",
            message: "GraphQL errors detected",
            data: {
              errorsCount: errors.length,
              errors: errors.map((e: any) => ({
                message: e.message,
                path: e.path,
                extensions: e.extensions,
              })),
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H2,H5",
          }),
        }
      ).catch(() => {});
      // #endregion

      console.error("[getOurWorks] GraphQL Errors:", errors);
      errors.forEach((error: any) => {
        console.error("[getOurWorks] Error:", error.message);
        console.error("[getOurWorks] Path:", error.path);
        console.error("[getOurWorks] Extensions:", error.extensions);
      });
    }

    const works = data?.ourWorks?.nodes || [];

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "api.ts:634",
        message: "Works extracted from response",
        data: {
          worksLength: works.length,
          firstWork: works[0]
            ? {
                id: works[0].id,
                title: works[0].title,
                hasPhotoBefore: !!works[0].photoBefore,
                hasPhotoAfter: !!works[0].photoAfter,
              }
            : null,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion

    // Детальное логирование для отладки
    console.log("[getOurWorks] ✅ GraphQL Response:", {
      worksCount: works.length,
      firstWork: works[0]
        ? {
            id: works[0].id,
            title: works[0].title,
            hasPhotoBefore: !!works[0].photoBefore,
            hasPhotoAfter: !!works[0].photoAfter,
            hasGeneralPhoto: !!works[0].generalPhoto,
            useGeneralPhoto: works[0].useGeneralPhoto,
            photoBeforeUrl: works[0].photoBefore?.sourceUrl,
            photoAfterUrl: works[0].photoAfter?.sourceUrl,
            // RAW данные для debug
            rawWork: JSON.stringify(works[0], null, 2),
          }
        : null,
    });

    if (works.length === 0) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "api.ts:634",
            message: "No works found",
            data: {
              simpleWorksCount,
              hasFullQueryData: !!data,
              fullResponse: JSON.stringify(data),
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H1,H4",
          }),
        }
      ).catch(() => {});
      // #endregion

      console.warn(
        "[getOurWorks] No works found. Check WordPress posts and GraphQL query."
      );
      console.warn(
        "[getOurWorks] Full response:",
        JSON.stringify(data, null, 2)
      );
    }

    // Обработка данных: собираем услуги из всех врачей и дедуплицируем
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "api.ts:645",
        message: "Processing works",
        data: { worksToProcess: works.length },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion

    return works.map((work: any) => {
      const processedWork: OurWork = { ...work };

      // Обработка врачей (поля напрямую на work, как в Reviews)
      if (work.relatedDoctors) {
        processedWork.doctors = work.relatedDoctors.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.title,
          specialty:
            doctor.doctorSpecializations?.nodes?.length
              ? doctor.doctorSpecializations.nodes.map((t: { name: string }) => t.name).join(", ")
              : doctor.doctorFields?.specialization
                  ?.map((s: any) => s.specializationItem)
                  .filter(Boolean)
                  .join(", ") ?? "",
          avatar: doctor.featuredImage?.node?.sourceUrl,
        }));
      }

      // Обработка услуг - приоритет у прямой связи Our Work -> Services
      if (work.relatedServices && work.relatedServices.length > 0) {
        // Если есть прямая связь - используем её
        processedWork.services = work.relatedServices.map((service: any) => ({
          id: service.id,
          databaseId: service.databaseId,
          title: service.title,
          slug: service.slug,
        }));
      } else {
        // Если прямой связи нет - собираем услуги из всех врачей
        const allServicesMap = new Map<string, OurWorkService>();
        if (work.relatedDoctors) {
          work.relatedDoctors.forEach((doctor: any) => {
            if (doctor.relatedServices) {
              doctor.relatedServices.forEach((service: any) => {
                if (!allServicesMap.has(service.id)) {
                  allServicesMap.set(service.id, {
                    id: service.id,
                    databaseId: service.databaseId,
                    title: service.title,
                    slug: service.slug,
                  });
                }
              });
            }
          });
        }
        processedWork.services = Array.from(allServicesMap.values());
      }

      // Обработка клиник (поля напрямую на work)
      if (work.relatedClinics) {
        processedWork.clinics = work.relatedClinics.map((clinic: any) => ({
          id: clinic.id,
          databaseId: clinic.databaseId,
          title: clinic.title,
          slug: clinic.slug,
        }));
      }

      return processedWork;
    });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/5b1b7ea7-44e9-4f03-8af3-22e3b20821fd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "api.ts:739",
        message: "Fatal error in getOurWorks",
        data: {
          errorMessage: error instanceof Error ? error.message : String(error),
          hasGraphQLErrors:
            error && typeof error === "object" && "graphQLErrors" in error,
          hasNetworkError:
            error && typeof error === "object" && "networkError" in error,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "H2,H3",
      }),
    }).catch(() => {});
    // #endregion

    console.error("[getOurWorks] GraphQL Error:", error);
    // Логируем детали ошибки для отладки
    if (error instanceof Error) {
      console.error("[getOurWorks] Error message:", error.message);
      console.error("[getOurWorks] Error stack:", error.stack);
    }
    // Логируем GraphQL errors если есть
    if (error && typeof error === "object" && "graphQLErrors" in error) {
      console.error(
        "[getOurWorks] GraphQL Errors:",
        (error as any).graphQLErrors
      );
    }
    if (error && typeof error === "object" && "networkError" in error) {
      console.error(
        "[getOurWorks] Network Error:",
        (error as any).networkError
      );
    }
    return [];
  }
}

/** Фильтры для архива наших работ */
export interface OurWorksFilters {
  categorySlug?: string;
}

function buildOurWorksWhere(filters?: OurWorksFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters?.categorySlug?.trim()) {
    where.categorySlug = filters.categorySlug.trim();
  }
  return where;
}

/**
 * Получить работы с пагинацией (для архива и «Загрузить ещё»).
 * Поддерживает фильтр по категории (service_categories).
 */
export async function getOurWorksConnection(
  first: number = 12,
  after?: string,
  filters?: OurWorksFilters
): Promise<{ works: OurWork[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } }> {
  const hasFilters = Boolean(filters?.categorySlug);
  const where = buildOurWorksWhere(filters);

  const processWorks = (rawWorks: any[]): OurWork[] =>
    rawWorks.map((work: any) => {
      const processedWork: OurWork = { ...work };
      if (work.relatedDoctors) {
        processedWork.doctors = work.relatedDoctors.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.title,
          specialty:
            doctor.doctorSpecializations?.nodes?.length
              ? doctor.doctorSpecializations.nodes
                  .map((t: { name: string }) => t.name)
                  .join(", ")
              : doctor.doctorFields?.specialization
                  ?.map((s: any) => s.specializationItem)
                  .filter(Boolean)
                  .join(", ") ?? "",
          avatar: doctor.featuredImage?.node?.sourceUrl,
        }));
      }
      if (work.relatedServices && work.relatedServices.length > 0) {
        processedWork.services = work.relatedServices.map((service: any) => ({
          id: service.id,
          databaseId: service.databaseId,
          title: service.title,
          slug: service.slug,
        }));
      } else if (work.relatedDoctors) {
        const allServicesMap = new Map<string, OurWorkService>();
        work.relatedDoctors.forEach((doctor: any) => {
          doctor.relatedServices?.forEach((service: any) => {
            if (!allServicesMap.has(service.id)) {
              allServicesMap.set(service.id, {
                id: service.id,
                databaseId: service.databaseId,
                title: service.title,
                slug: service.slug,
              });
            }
          });
        });
        processedWork.services = Array.from(allServicesMap.values());
      }
      if (work.relatedClinics) {
        processedWork.clinics = work.relatedClinics.map((clinic: any) => ({
          id: clinic.id,
          databaseId: clinic.databaseId,
          title: clinic.title,
          slug: clinic.slug,
        }));
      }
      return processedWork;
    });

  if (hasFilters) {
    const uri =
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      "http://localhost:8002/graphql";
    const res = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: print(GET_OUR_WORKS_CONNECTION),
        variables: { first, after: after ?? undefined, where },
      }),
      cache: "no-store",
    });
    const json = await res.json();
    const rawWorks = json?.data?.ourWorks?.nodes ?? [];
    const pageInfo = {
      hasNextPage: json?.data?.ourWorks?.pageInfo?.hasNextPage ?? false,
      endCursor: json?.data?.ourWorks?.pageInfo?.endCursor ?? null,
    };
    return { works: processWorks(rawWorks), pageInfo };
  }

  const client = getApolloClient();
  const variables = { first, after: after ?? undefined, where };
  const { data } = await client.query({
    query: GET_OUR_WORKS_CONNECTION,
    variables,
    context: {
      fetchOptions: { next: { tags: ["our-works"], revalidate: 3600 } },
    },
  });

  const rawWorks = data?.ourWorks?.nodes ?? [];
  const pageInfo = {
    hasNextPage: data?.ourWorks?.pageInfo?.hasNextPage ?? false,
    endCursor: data?.ourWorks?.pageInfo?.endCursor ?? null,
  };
  return { works: processWorks(rawWorks), pageInfo };
}

/**
 * Получить категории услуг, у которых есть хотя бы одна работа (для фильтра архива).
 */
export async function getOurWorksFilterOptions(): Promise<{
  categories: PromotionServiceCategory[];
}> {
  const client = getApolloClient();

  const { data, errors } = await client.query({
    query: GET_OUR_WORKS_FOR_FILTER_OPTIONS,
    variables: { first: 500 },
    context: {
      fetchOptions: { next: { tags: ["our-works"], revalidate: 3600 } },
    },
  });

  if (errors?.length) {
    console.error("[getOurWorksFilterOptions] GraphQL errors:", errors);
    return { categories: [] };
  }

  const nodes = data?.ourWorks?.nodes ?? [];
  const categoriesBySlug = new Map<string, PromotionServiceCategory>();

  for (const work of nodes) {
    const cats = work?.serviceCategories?.nodes;
    if (Array.isArray(cats)) {
      for (const c of cats) {
        if (c?.slug && c?.name) {
          categoriesBySlug.set(c.slug, {
            id: c.id,
            databaseId: c.databaseId ?? 0,
            name: c.name,
            slug: c.slug,
          });
        }
      }
    }
  }

  const categories = Array.from(categoriesBySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return { categories };
}

// ===================================
// Contacts Settings (Option Page)
// ===================================

/**
 * Получить настройки контактов сайта
 */
export async function getContactsSettings(): Promise<ContactsSettings | null> {
  const client = getApolloClient();

  try {
    const { data } = await client.query({
      query: GET_CONTACTS_SETTINGS,
      fetchPolicy: "network-only",
    });

    return data?.contactsSettings || null;
  } catch (error) {
    console.error("[getContactsSettings] GraphQL Error:", error);
    return null;
  }
}

/**
 * Получить настройки страниц услуг (Option Page)
 */
export async function getServicePagesSettings(): Promise<ServicePagesSettings | null> {
  const client = getApolloClient();

  try {
    const { data } = await client.query({
      query: GET_SERVICE_PAGES_SETTINGS,
      context: {
        fetchOptions: { next: { revalidate: 3600 } },
      },
    });

    return data?.servicePagesSettings || null;
  } catch (error) {
    console.error("[getServicePagesSettings] GraphQL Error:", error);
    return null;
  }
}

// ===================================
// Main Page Settings (Option Page)
// ===================================

/**
 * Получить настройки главной страницы (Hero блок, Акция, CTA)
 */
export async function getMainPageSettings(): Promise<MainPageSettings | null> {
  const client = getApolloClient();

  try {
    const { data } = await client.query({
      query: GET_MAIN_PAGE_SETTINGS,
    });

    return data?.mainPageSettings || null;
  } catch (error) {
    console.error("[getMainPageSettings] GraphQL Error:", error);
    return null;
  }
}

/**
 * Получить настройки архива отзывов (CTA блок страницы /reviews)
 */
export async function getReviewsArchiveSettings(): Promise<ReviewsArchiveSettings | null> {
  const client = getApolloClient();

  try {
    const { data } = await client.query({
      query: GET_REVIEWS_ARCHIVE_SETTINGS,
      fetchPolicy: "network-only",
    });

    return data?.reviewsArchiveSettings || null;
  } catch (error) {
    console.error("[getReviewsArchiveSettings] GraphQL Error:", error);
    return null;
  }
}

// ===================================
// Prices by Categories
// ===================================

/**
 * Получить цены сгруппированные по категориям услуг
 * @param selectedServiceIds — при указании показывать только выбранные услуги (databaseId)
 */
export async function getPricesByCategories(
  selectedServiceIds?: number[]
): Promise<any[]> {
  const client = getApolloClient();

  try {
    // Получаем все категории услуг
    const { data: categoriesData } = await client.query({
      query: GET_ALL_SERVICE_CATEGORIES,
    });

    const categories = categoriesData?.serviceCategories?.nodes || [];
    console.log("[getPricesByCategories] Categories count:", categories.length);

    // Получаем все услуги с ценами
    const { data: servicesData, errors } = await client.query({
      query: GET_ALL_SERVICES,
      variables: {
        first: 1000,
      },
    });

    if (errors) {
      console.error(
        "[getPricesByCategories] GraphQL Errors in GET_ALL_SERVICES:"
      );
      errors.forEach((error: any) => {
        console.error("  - Message:", error.message);
        console.error("  - Path:", error.path);
        console.error("  - Extensions:", error.extensions);
      });
    }

    const allServices = servicesData?.services?.nodes || [];
    console.log("[getPricesByCategories] Services count:", allServices.length);
    console.log(
      "[getPricesByCategories] servicesData.services:",
      servicesData?.services ? "exists" : "null"
    );

    // Debug: проверяем структуру данных первой услуги
    if (allServices.length > 0) {
      const firstService = allServices[0];
      console.log("[getPricesByCategories] DEBUG First service:", {
        title: firstService.title,
        hasServiceRelationships: !!firstService.serviceRelationships,
        serviceRelationshipsKeys: firstService.serviceRelationships
          ? Object.keys(firstService.serviceRelationships)
          : [],
        hasRelatedPrices: !!firstService.relatedPrices,
        relatedPricesType: typeof firstService.relatedPrices,
        relatedPricesIsArray: Array.isArray(firstService.relatedPrices),
        serviceRelationshipsRelatedPrices: firstService.serviceRelationships
          ?.relatedPrices
          ? firstService.serviceRelationships.relatedPrices.edges
            ? "connection"
            : Array.isArray(firstService.serviceRelationships.relatedPrices)
            ? "array"
            : "other"
          : "null",
      });
    }

    // Группируем услуги по категориям
    const categoriesMap = new Map<string, any>();

    // Инициализируем карту категорий
    categories.forEach((category: any) => {
      categoriesMap.set(category.id, {
        id: category.id,
        databaseId: category.databaseId,
        name: category.name,
        slug: category.slug,
        services: [],
      });
    });

    // Распределяем услуги по категориям
    let servicesWithPrices = 0;
    allServices.forEach((service: any) => {
      // Получаем цены (list format - manual registration)
      const prices =
        service.relatedPrices && Array.isArray(service.relatedPrices)
          ? service.relatedPrices
          : [];

      const hasPrices = prices.length > 0;

      if (!hasPrices) {
        return;
      }
      servicesWithPrices++;

      // Получаем категории услуги
      const serviceCategories = service.serviceCategories?.nodes || [];

      serviceCategories.forEach((category: any) => {
        const categoryData = categoriesMap.get(category.id);
        if (categoryData) {
          categoryData.services.push({
            id: service.id,
            databaseId: service.databaseId,
            title: service.title,
            slug: service.slug,
            excerpt: service.excerpt || undefined,
            prices: prices.map((price: any) => ({
              id: price.id,
              databaseId: price.databaseId,
              title: price.title,
              regularPrice: price.priceFields?.regularPrice,
              promoPrice: price.priceFields?.promoPrice,
              currency: price.priceFields?.currency,
              period: price.priceFields?.period,
              averagePriceCity:
                price.averagePriceCity ?? price.priceFields?.averagePriceCity,
            })),
          });
        }
      });
    });

    // Фильтр по выбранным услугам (если передан)
    if (selectedServiceIds && selectedServiceIds.length > 0) {
      const idSet = new Set(selectedServiceIds);
      categoriesMap.forEach((categoryData) => {
        categoryData.services = categoryData.services.filter((s: any) =>
          idSet.has(s.databaseId)
        );
      });
    }

    // Конвертируем Map в массив и фильтруем категории с услугами
    const result = Array.from(categoriesMap.values()).filter(
      (category) => category.services.length > 0
    );

    return result;
  } catch (error: any) {
    console.error("[getPricesByCategories] GraphQL Error:", error);
    if (error.graphQLErrors) {
      console.error(
        "[getPricesByCategories] GraphQL Errors:",
        error.graphQLErrors
      );
    }
    if (error.networkError) {
      console.error(
        "[getPricesByCategories] Network Error:",
        error.networkError
      );
    }
    return [];
  }
}

/**
 * Получить цены для архива /prices — сгруппированные по категориям услуг.
 * Источник: Price CPT напрямую (не через Service).
 * Строки таблицы — записи цен без ссылок на услуги.
 */
export async function getPricesByCategoriesForArchive(): Promise<any[]> {
  const client = getApolloClient();

  try {
    const [{ data: categoriesData }, { data: pricesData, errors }] =
      await Promise.all([
        client.query({ query: GET_ALL_SERVICE_CATEGORIES }),
        client.query({
          query: GET_PRICES_FOR_ARCHIVE,
          variables: { first: 500 },
        }),
      ]);

    if (errors) {
      console.error(
        "[getPricesByCategoriesForArchive] GraphQL Errors:",
        errors
      );
      return [];
    }

    const categories = categoriesData?.serviceCategories?.nodes || [];
    const allPrices = pricesData?.prices?.nodes || [];

    const categoriesMap = new Map<string, any>();
    const UNCATEGORIZED_ID = "__uncategorized__";

    categories.forEach((category: any) => {
      categoriesMap.set(category.id, {
        id: category.id,
        databaseId: category.databaseId,
        name: category.name,
        slug: category.slug,
        services: [],
      });
    });

    categoriesMap.set(UNCATEGORIZED_ID, {
      id: UNCATEGORIZED_ID,
      databaseId: 0,
      name: "Прочее",
      slug: "prochee",
      services: [],
    });

    allPrices.forEach((price: any) => {
      const serviceCategories = price.serviceCategories?.nodes || [];
      const regularPrice =
        price.regularPrice ?? price.priceFields?.regularPrice;
      const promoPrice = price.promoPrice ?? price.priceFields?.promoPrice;
      const currency = price.currency ?? price.priceFields?.currency;

      const priceItem = {
        id: price.id,
        databaseId: price.databaseId,
        title: price.title,
        regularPrice,
        promoPrice,
        currency,
        averagePriceCity:
          price.averagePriceCity ?? price.priceFields?.averagePriceCity,
      };

      const item = {
        id: price.id,
        title: price.title,
        excerpt: price.excerpt || undefined,
        slug: undefined,
        prices: [priceItem],
      };

      if (serviceCategories.length > 0) {
        serviceCategories.forEach((category: any) => {
          const categoryData = categoriesMap.get(category.id);
          if (categoryData) {
            categoryData.services.push(item);
          }
        });
      } else {
        const uncategorized = categoriesMap.get(UNCATEGORIZED_ID);
        if (uncategorized) uncategorized.services.push(item);
      }
    });

    const result = Array.from(categoriesMap.values()).filter(
      (category) => category.services.length > 0
    );

    return result.sort((a, b) => {
      if (a.id === UNCATEGORIZED_ID) return 1;
      if (b.id === UNCATEGORIZED_ID) return -1;
      return 0;
    });
  } catch (error: any) {
    console.error("[getPricesByCategoriesForArchive] GraphQL Error:", error);
    return [];
  }
}

// ===================================
// Акции (Promotions)
// ===================================
// Promotion импортируется из @/types/promotion

/**
 * Helper function to extract single value from ACF field that might be returned as array
 */
export function getACFValue<T>(value: T | T[] | undefined): T | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/**
 * Получить акции, у которых в related_services есть данная услуга (Promotion → Service).
 * Используется для двунаправленной связи на странице услуги.
 */
export async function getPromotionsByRelatedService(
  serviceId: number,
  first: number = 8
): Promise<Promotion[]> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_PROMOTIONS_BY_RELATED_SERVICE,
      variables: { serviceId, first },
      context: {
        fetchOptions: { next: { revalidate: 3600 } },
      },
    });

    const promotions = data?.promotionsByServiceId;
    if (!promotions || !Array.isArray(promotions)) {
      return [];
    }
    return promotions;
  } catch (error: unknown) {
    console.error(
      "[getPromotionsByRelatedService] GraphQL error for serviceId:",
      serviceId,
      error
    );
    return [];
  }
}

/**
 * Получить акции для homepage (до 4 штук)
 */
export async function getPromotionsForHomepage(
  first: number = 4
): Promise<Promotion[]> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_PROMOTIONS_FOR_HOMEPAGE,
      variables: { first },
      context: {
        fetchOptions: {
          next: { revalidate: 3600 }, // ISR cache 1 hour
        },
      },
    });

    if (!data?.promotions?.nodes) {
      return [];
    }

    return data.promotions.nodes;
  } catch (error: any) {
    console.error("[getPromotionsForHomepage] ❌ GraphQL Error:", error);
    if (error.graphQLErrors) {
      console.error(
        "[getPromotionsForHomepage] GraphQL Errors:",
        error.graphQLErrors
      );
    }
    if (error.networkError) {
      console.error(
        "[getPromotionsForHomepage] Network Error:",
        error.networkError
      );
    }
    return [];
  }
}

/**
 * Получить все акции
 */
export async function getPromotions(variables?: {
  first?: number;
  after?: string;
}): Promise<Promotion[]> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_ALL_PROMOTIONS,
      variables: {
        first: 10,
        ...variables,
      },
      context: {
        fetchOptions: {
          next: { revalidate: 3600 },
        },
      },
    });

    if (!data?.promotions?.nodes) {
      return [];
    }

    return data.promotions.nodes;
  } catch (error: any) {
    console.error("[getPromotions] GraphQL Error:", error);
    return [];
  }
}

/**
 * Получить акцию по slug
 */
export async function getPromotionBySlug(
  slug: string
): Promise<Promotion | null> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_PROMOTION_BY_SLUG,
      variables: { slug },
      context: {
        fetchOptions: {
          next: { revalidate: 3600 },
        },
      },
    });

    if (!data?.promotion) {
      return null;
    }

    return data.promotion;
  } catch (error: any) {
    console.error(`[getPromotionBySlug] Error for slug "${slug}":`, error);
    return null;
  }
}

export interface PromotionsFilters {
  categorySlug?: string;
}

export interface PromotionsPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

/** Категория услуг (service_categories) с акциями — для фильтра архива */
export interface PromotionServiceCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
}

function buildPromotionsWhere(filters?: PromotionsFilters): Record<string, unknown> {
  const where: Record<string, unknown> = { status: "PUBLISH" };
  if (filters?.categorySlug?.trim()) {
    where.categorySlug = filters.categorySlug.trim();
  }
  return where;
}

/**
 * Получить акции с пагинацией (для архива и «Загрузить ещё»).
 * Поддерживает фильтр по категории (service_categories).
 */
export async function getPromotionsConnection(
  first: number = 12,
  after?: string,
  filters?: PromotionsFilters
): Promise<{ promotions: Promotion[]; pageInfo: PromotionsPageInfo }> {
  const hasFilters = Boolean(filters?.categorySlug);
  const where = buildPromotionsWhere(filters);

  if (hasFilters) {
    const uri =
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      "http://localhost:8002/graphql";
    const res = await fetch(uri, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: print(GET_PROMOTIONS_CONNECTION),
        variables: { first, after: after ?? undefined, where },
      }),
      cache: "no-store",
    });
    const json = await res.json();
    const promotions = json?.data?.promotions?.nodes ?? [];
    const pageInfo: PromotionsPageInfo = {
      hasNextPage: json?.data?.promotions?.pageInfo?.hasNextPage ?? false,
      endCursor: json?.data?.promotions?.pageInfo?.endCursor ?? null,
    };
    return { promotions, pageInfo };
  }

  const client = getApolloClient();
  const variables = { first, after: after ?? undefined, where };
  const { data } = await client.query({
    query: GET_PROMOTIONS_CONNECTION,
    variables,
    context: {
      fetchOptions: { next: { tags: ["promotions"], revalidate: 3600 } },
    },
  });

  const promotions = data?.promotions?.nodes ?? [];
  const pageInfo: PromotionsPageInfo = {
    hasNextPage: data?.promotions?.pageInfo?.hasNextPage ?? false,
    endCursor: data?.promotions?.pageInfo?.endCursor ?? null,
  };

  return { promotions, pageInfo };
}

/**
 * Получить категории услуг, у которых есть хотя бы одна акция (для фильтра архива).
 */
export async function getPromotionFilterOptions(): Promise<{
  categories: PromotionServiceCategory[];
}> {
  const client = getApolloClient();

  const { data, errors } = await client.query({
    query: GET_PROMOTIONS_FOR_FILTER_OPTIONS,
    variables: { first: 500 },
    context: {
      fetchOptions: { next: { tags: ["promotions"], revalidate: 3600 } },
    },
  });

  if (errors?.length) {
    console.error("[getPromotionFilterOptions] GraphQL errors:", errors);
    return { categories: [] };
  }

  const nodes = data?.promotions?.nodes ?? [];
  const categoriesBySlug = new Map<string, PromotionServiceCategory>();

  for (const promotion of nodes) {
    const cats = promotion?.serviceCategories?.nodes;
    if (Array.isArray(cats)) {
      for (const c of cats) {
        if (c?.slug && c?.name) {
          categoriesBySlug.set(c.slug, {
            id: c.id,
            databaseId: c.databaseId ?? 0,
            name: c.name,
            slug: c.slug,
          });
        }
      }
    }
  }

  const categories = Array.from(categoriesBySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return { categories };
}

/**
 * Получить все slugs акций для generateStaticParams
 */
export async function getAllPromotionsSlugs(): Promise<string[]> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_ALL_PROMOTIONS_SLUGS,
      context: {
        fetchOptions: {
          next: { revalidate: false }, // Static
        },
      },
    });

    if (!data?.promotions?.nodes) {
      return [];
    }

    return data.promotions.nodes
      .filter((promotion: any) => promotion.slug)
      .map((promotion: any) => promotion.slug);
  } catch (error: any) {
    console.error("[getAllPromotionsSlugs] GraphQL Error:", error);
    return [];
  }
}

/**
 * Получить настройки страницы цен (Option Page: priceArchiveSettings)
 */
export async function getPriceArchiveSettings(): Promise<PriceArchiveSettings | null> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_PRICE_ARCHIVE_SETTINGS,
      context: {
        fetchOptions: {
          next: { revalidate: 3600 },
        },
      },
    });

    if (!data?.priceArchiveSettings) {
      return null;
    }

    return data.priceArchiveSettings;
  } catch (error: any) {
    console.error("[getPriceArchiveSettings] GraphQL Error:", error);
    return null;
  }
}

/**
 * Получить настройки архива акций (Option Page: actionsArchiveSettings)
 * Страница /promotions
 */
export async function getActionsArchiveSettings(): Promise<ActionsArchiveSettings | null> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_ACTIONS_ARCHIVE_SETTINGS,
      context: {
        fetchOptions: {
          next: { revalidate: 3600 },
        },
      },
    });

    if (!data?.actionsArchiveSettings) {
      return null;
    }

    return data.actionsArchiveSettings;
  } catch (error: unknown) {
    console.error("[getActionsArchiveSettings] GraphQL Error:", error);
    return null;
  }
}

/**
 * Получить настройки архива наших работ (Option Page: ourWorksArchiveSettings)
 * Страница /our-works
 */
export async function getOurWorksArchiveSettings(): Promise<OurWorksArchiveSettings | null> {
  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_OUR_WORKS_ARCHIVE_SETTINGS,
      fetchPolicy: "no-cache",
    });

    if (!data?.ourWorksArchiveSettings) {
      return null;
    }

    return data.ourWorksArchiveSettings;
  } catch (error: unknown) {
    console.error("[getOurWorksArchiveSettings] GraphQL Error:", error);
    return null;
  }
}

/**
 * Получить акции для страницы цен по выбранным ID
 * Если selectedIds === null — возвращает пустой массив
 */
export async function getPromotionsForPriceArchive(
  selectedIds: string[] | null
): Promise<Promotion[]> {
  if (!selectedIds || selectedIds.length === 0) {
    return [];
  }

  try {
    const client = getApolloClient();

    const { data } = await client.query({
      query: GET_PROMOTIONS_FOR_HOMEPAGE,
      variables: { first: 50 },
      context: {
        fetchOptions: {
          next: { revalidate: 3600 },
        },
      },
    });

    if (!data?.promotions?.nodes) {
      return [];
    }

    const idSet = new Set(selectedIds);
    return (data.promotions.nodes as Promotion[]).filter((p) =>
      idSet.has(p.id)
    );
  } catch (error: any) {
    console.error("[getPromotionsForPriceArchive] GraphQL Error:", error);
    return [];
  }
}
