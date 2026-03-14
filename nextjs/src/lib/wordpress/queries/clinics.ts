import { gql } from "@apollo/client";

/**
 * GraphQL запросы для клиник
 *
 * Используется для получения данных клиник из WordPress через WPGraphQL
 *
 * PERFORMANCE: Используем разные фрагменты для разных случаев:
 * - CLINIC_CARD_FIELDS: минимум полей для карточки клиники (списки)
 * - CLINIC_FULL_FIELDS: все поля для страницы клиники
 */

/**
 * Фрагмент для карточки клиники (минимальные поля)
 * Используется в списках, секциях
 */
export const CLINIC_CARD_FIELDS = gql`
  fragment ClinicCardFields on Clinic {
    id
    databaseId
    title
    slug
    featuredImage {
      node {
        sourceUrl(size: MEDIUM)
        altText
        mediaDetails {
          width
          height
        }
      }
    }
  }
`;

/**
 * Фрагмент для секции «Клиники на карте»: карточка + адрес, телефон, координаты, часы работы
 */
export const CLINIC_MAP_CARD_FIELDS = gql`
  fragment ClinicMapCardFields on Clinic {
    ...ClinicCardFields
    clinicFields {
      address
      phone
      metroStation
      coordinates {
        latitude
        longitude
      }
      workingHours {
        weekdays
        weekend
      }
    }
  }
`;

/**
 * Фрагмент для полной страницы клиники (все поля)
 * Используется только на странице конкретной клиники
 */
export const CLINIC_FULL_FIELDS = gql`
  fragment ClinicFullFields on Clinic {
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
  }
`;

/**
 * Получить список всех клиник
 * PERFORMANCE: Использует CLINIC_CARD_FIELDS (минимум полей)
 */
export const GET_ALL_CLINICS = gql`
  ${CLINIC_CARD_FIELDS}
  query GetAllClinics(
    $first: Int = 10
    $after: String
    $orderBy: PostObjectsConnectionOrderbyEnum = DATE
    $order: OrderEnum = DESC
  ) {
    clinics(
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
          ...ClinicCardFields
        }
      }
      nodes {
        ...ClinicCardFields
      }
    }
  }
`;

/**
 * Получить клинику по slug
 * PERFORMANCE: Использует CLINIC_FULL_FIELDS (все поля для страницы)
 */
export const GET_CLINIC_BY_SLUG = gql`
  ${CLINIC_FULL_FIELDS}
  query GetClinicBySlug($slug: ID!) {
    clinic(id: $slug, idType: SLUG) {
      ...ClinicFullFields
    }
  }
`;

/**
 * Получить клиники для секции «Клиники на карте» (с координатами и полями карточки)
 * PERFORMANCE: отдельный запрос, чтобы не тянуть clinicFields в обычный список
 */
export const GET_CLINICS_FOR_MAP = gql`
  ${CLINIC_CARD_FIELDS}
  ${CLINIC_MAP_CARD_FIELDS}
  query GetClinicsForMap($first: Int = 50) {
    clinics(
      first: $first
      where: { status: PUBLISH, orderby: { field: TITLE, order: ASC } }
    ) {
      nodes {
        ...ClinicMapCardFields
      }
    }
  }
`;

/**
 * Минимальные поля для поиска (autocomplete, страница поиска)
 */
const CLINIC_SEARCH_FIELDS = gql`
  fragment ClinicSearchFields on Clinic {
    id
    databaseId
    title
    slug
    uri
    featuredImage {
      node {
        sourceUrl(size: THUMBNAIL)
        altText
      }
    }
  }
`;

/**
 * Поиск клиник
 */
export const SEARCH_CLINICS = gql`
  ${CLINIC_SEARCH_FIELDS}
  query SearchClinics($search: String!, $first: Int = 10) {
    clinics(first: $first, where: { status: PUBLISH, search: $search }) {
      nodes {
        ...ClinicSearchFields
      }
    }
  }
`;

/**
 * Получить slugs всех клиник для статической генерации
 */
export const GET_ALL_CLINICS_SLUGS = gql`
  query GetAllClinicsSlugs {
    clinics(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
      }
    }
  }
`;
