import { gql } from "@apollo/client";
import { REVIEW_CARD_FIELDS } from "./reviews";

/**
 * GraphQL запросы для врачей
 *
 * Используется для получения данных врачей из WordPress через WPGraphQL
 *
 * PERFORMANCE: Используем разные фрагменты для разных случаев:
 * - DOCTOR_CARD_FIELDS: минимум полей для карточки врача (списки)
 * - DOCTOR_FULL_FIELDS: все поля для страницы врача
 */

/**
 * Фрагмент для карточки врача (минимальные поля)
 * Используется в списках, секциях на главной
 *
 * ОПТИМИЗАЦИЯ: ~40-50KB меньше на запрос
 */
export const DOCTOR_CARD_FIELDS = gql`
  fragment DoctorCardFields on Doctor {
    id
    databaseId
    title
    slug
    excerpt
    featuredImage {
      node {
        sourceUrl(size: LARGE)
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    doctorFields {
      experience
      rating
      ratingSource
      videoUrl
    }
    doctorSpecializations {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
    clinic {
      id
      databaseId
      title
      slug
    }
  }
`;

/**
 * Фрагмент для полной страницы врача (все поля)
 * Используется только на странице конкретного врача
 */
export const DOCTOR_FULL_FIELDS = gql`
  ${REVIEW_CARD_FIELDS}
  fragment DoctorFullFields on Doctor {
    id
    databaseId
    title
    slug
    uri
    date
    modified
    content
    featuredImage {
      node {
        id
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    doctorFields {
      experience
      rating
      ratingSource
      specialization {
        specializationItem
      }
      videoUrl
    }
    doctorSpecializations {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
    doctorTypes {
      nodes {
        id
        name
        slug
      }
    }
    doctorPositions {
      nodes {
        id
        name
        slug
      }
    }
    serviceCategories {
      nodes {
        id
        name
        slug
      }
    }
    education {
      year
      place
      educationType
    }
    certificates {
      id
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
    relatedReviews {
      ...ReviewCardFields
    }
    clinic {
      id
      databaseId
      title
      slug
    }
  }
`;

/**
 * @deprecated Используй DOCTOR_CARD_FIELDS или DOCTOR_FULL_FIELDS
 */
export const DOCTOR_FIELDS = DOCTOR_FULL_FIELDS;

/**
 * Получить список всех врачей
 * PERFORMANCE: Использует DOCTOR_CARD_FIELDS (минимум полей)
 */
export const GET_ALL_DOCTORS = gql`
  ${DOCTOR_CARD_FIELDS}
  query GetAllDoctors(
    $first: Int = 10
    $after: String
    $orderBy: PostObjectsConnectionOrderbyEnum = MENU_ORDER
    $order: OrderEnum = ASC
  ) {
    doctors(
      first: $first
      after: $after
      where: { status: PUBLISH, orderby: { field: $orderBy, order: $order } }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...DoctorCardFields
        }
      }
      nodes {
        ...DoctorCardFields
      }
    }
  }
`;

/**
 * Получить врача по slug
 * PERFORMANCE: Использует DOCTOR_FULL_FIELDS (все поля для страницы)
 */
export const GET_DOCTOR_BY_SLUG = gql`
  ${DOCTOR_FULL_FIELDS}
  query GetDoctorBySlug($slug: ID!) {
    doctor(id: $slug, idType: SLUG) {
      ...DoctorFullFields
    }
  }
`;

/**
 * Получить врачей для homepage (лучшие)
 * PERFORMANCE: Использует DOCTOR_CARD_FIELDS (минимум полей)
 */
export const GET_FEATURED_DOCTORS = gql`
  ${DOCTOR_CARD_FIELDS}
  query GetFeaturedDoctors($first: Int = 4) {
    doctors(
      first: $first
      where: { status: PUBLISH, orderby: { field: MENU_ORDER, order: ASC } }
    ) {
      nodes {
        ...DoctorCardFields
      }
    }
  }
`;

/**
 * Получить врачей по специализации (taxonomy term slug)
 * PERFORMANCE: Использует DOCTOR_CARD_FIELDS (минимум полей)
 * Uses specializationSlug (resolved via tax_query in PHP), not taxQuery.
 */
export const GET_DOCTORS_BY_SPECIALIZATION = gql`
  ${DOCTOR_CARD_FIELDS}
  query GetDoctorsBySpecialization($slug: String!, $first: Int = 10) {
    doctors(first: $first, where: { status: PUBLISH, specializationSlug: $slug, orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        ...DoctorCardFields
      }
    }
  }
`;

/**
 * Поиск врачей
 * PERFORMANCE: Использует DOCTOR_CARD_FIELDS (минимум полей)
 */
export const SEARCH_DOCTORS = gql`
  ${DOCTOR_CARD_FIELDS}
  query SearchDoctors($search: String!, $first: Int = 10) {
    doctors(first: $first, where: { status: PUBLISH, search: $search }) {
      nodes {
        ...DoctorCardFields
      }
    }
  }
`;

/**
 * Получить slugs всех врачей для статической генерации
 */
export const GET_ALL_DOCTORS_SLUGS = gql`
  query GetAllDoctorsSlugs {
    doctors(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
      }
    }
  }
`;

/**
 * Получить врачей для sitemap
 */
export const GET_DOCTORS_FOR_SITEMAP = gql`
  query GetDoctorsForSitemap {
    doctors(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        modified
      }
    }
  }
`;

/**
 * Получить врачей с фильтрами (пагинация + specialization + clinic)
 * PERFORMANCE: Использует DOCTOR_CARD_FIELDS
 */
export const GET_DOCTORS_CONNECTION_FILTERED = gql`
  ${DOCTOR_CARD_FIELDS}
  query GetDoctorsConnectionFiltered(
    $first: Int = 10
    $after: String
    $where: RootQueryToDoctorConnectionWhereArgs
  ) {
    doctors(first: $first, after: $after, where: $where) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...DoctorCardFields
        }
      }
      nodes {
        ...DoctorCardFields
      }
    }
  }
`;

/**
 * Получить список специализаций для фильтра и архива (doctor_specializations)
 */
export const GET_DOCTOR_SPECIALIZATIONS = gql`
  query GetDoctorSpecializations {
    doctorSpecializations(first: 100) {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
  }
`;

/**
 * Получить специализацию по slug — для страницы термина /specialization/[slug]
 */
export const GET_SPECIALIZATION_BY_SLUG = gql`
  query GetSpecializationBySlug($slug: ID!) {
    doctorSpecialization(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
    }
  }
`;

/**
 * Все slug специализаций для generateStaticParams
 */
export const GET_ALL_SPECIALIZATIONS_SLUGS = gql`
  query GetAllSpecializationsSlugs {
    doctorSpecializations(first: 100) {
      nodes {
        slug
      }
    }
  }
`;

/**
 * Категории услуг (service_categories), у которых есть хотя бы один врач.
 * Для фильтра архива врачей — не показываем пустые категории.
 */
export const GET_DOCTOR_SERVICE_CATEGORIES = gql`
  query GetDoctorServiceCategories {
    doctorServiceCategories {
      id
      databaseId
      name
      slug
    }
  }
`;

/**
 * Клиники, у которых есть хотя бы один врач.
 * Для фильтра архива врачей — не показываем клиники без врачей.
 */
export const GET_CLINICS_WITH_DOCTORS = gql`
  query GetClinicsWithDoctors {
    clinicsWithDoctors {
      id
      databaseId
      title
      slug
    }
  }
`;

/**
 * Врачи с полями только для построения списков фильтров (категории + клиники).
 * Стандартный GraphQL — из узлов собираем уникальные категории и клиники, без кастомных полей.
 */
export const GET_DOCTORS_FOR_FILTER_OPTIONS = gql`
  query GetDoctorsForFilterOptions($first: Int = 500) {
    doctors(first: $first, where: { status: PUBLISH }) {
      nodes {
        serviceCategories {
          nodes {
            id
            databaseId
            name
            slug
          }
        }
        clinic {
          id
          databaseId
          title
          slug
        }
      }
    }
  }
`;
