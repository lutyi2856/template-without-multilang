import { gql } from "@apollo/client";
import { SERVICE_CATEGORY_FIELDS } from "./taxonomies";
import { PROMOTION_CARD_DATA } from "./promotions";
import { DOCTOR_CARD_FIELDS } from "./doctors";

/**
 * GraphQL запросы для услуг
 *
 * Используется для получения данных услуг из WordPress через WPGraphQL
 */

/**
 * Фрагмент для полей услуги
 */
export const SERVICE_FIELDS = gql`
  fragment ServiceFields on Service {
    id
    databaseId
    title
    slug
    uri
    excerpt
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
    # Категории услуги (taxonomy)
    serviceCategories {
      nodes {
        id
        databaseId
        name
        slug
        uri
      }
    }
    # Связанные цены (bidirectional) - List format (manual registration)
    relatedPrices {
      id
      databaseId
      title
      averagePriceCity
      priceFields {
        regularPrice
        promoPrice
        currency
        period
        installmentTerms
      }
    }
    # Фокусные цены для Hero (manual registration) — приоритет над relatedPrices
    focusPrices {
      id
      databaseId
      title
      averagePriceCity
      priceFields {
        regularPrice
        promoPrice
        currency
        period
        installmentTerms
      }
    }
    # Иконка услуги (ACF, manual GraphQL registration)
    icon
    iconSvg
  }
`;

/**
 * Получить список всех услуг
 */
export const GET_ALL_SERVICES = gql`
  ${SERVICE_FIELDS}
  query GetAllServices($first: Int = 20, $after: String) {
    services(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ServiceFields
      }
    }
  }
`;

/**
 * Получить настройки страниц услуг (Option Page)
 */
export const GET_SERVICE_PAGES_SETTINGS = gql`
  ${DOCTOR_CARD_FIELDS}
  query GetServicePagesSettings {
    servicePagesSettings {
      showPriceBlock
      exactPriceBlockIcon
      exactPriceBlockText
      exactPriceBlockLink
      doctorsSectionTitle
      doctorsSectionDescription
      selectedDoctors {
        ...DoctorCardFields
      }
      staTitle
      staDescription
      staPhone
      staPrivacyText
      staPrivacyLink
      staDoctorImage {
        url
        width
        height
        alt
      }
      staBackgroundImage {
        url
        width
        height
        alt
      }
      servicesBlockShow
      servicesBlockTitle
      selectedServices {
        id
        title
        slug
        icon
        iconSvg
      }
    }
  }
`;

/**
 * Получить услугу по slug (включая relatedPromotions для промо-баннера)
 *
 * При ошибках "Cannot query field" — проверить schema в GraphiQL (http://localhost:8002/graphql).
 * Поля: ServiceFields, relatedPromotions (PromotionCardData), seo, focusPrices.
 */
export const GET_SERVICE_BY_SLUG = gql`
  ${SERVICE_FIELDS}
  ${PROMOTION_CARD_DATA}
  ${DOCTOR_CARD_FIELDS}
  query GetServiceBySlug($slug: ID!) {
    service(id: $slug, idType: SLUG) {
      ...ServiceFields
      contentBlocks {
        name
        attributes
      }
      servicePageBlocks {
        doctorsSectionShow
        doctorsSectionTitle
        doctorsSectionDescription
        relatedDoctors {
          ...DoctorCardFields
        }
        showPriceBlock
        exactPriceBlockIcon
        exactPriceBlockText
        exactPriceBlockLink
        staTitle
        staDescription
        staPhone
        staPrivacyText
        staPrivacyLink
        staDoctorImage {
          url
          width
          height
          alt
        }
        staBackgroundImage {
          url
          width
          height
          alt
        }
        servicesBlockShow
        servicesBlockTitle
        blockServices {
          id
          title
          slug
          icon
          iconSvg
        }
      }
      relatedPromotions {
        ...PromotionCardData
      }
      seo {
        title
        description
        canonicalUrl
        openGraph {
          title
          description
          image {
            secureUrl
          }
        }
      }
    }
  }
`;

/**
 * Получить популярные услуги для homepage
 */
export const GET_POPULAR_SERVICES = gql`
  ${SERVICE_FIELDS}
  query GetPopularServices($first: Int = 4) {
    services(
      first: $first
      where: {
        status: PUBLISH
        metaQuery: { key: "isPopular", value: "1", compare: EQUAL_TO }
      }
    ) {
      nodes {
        ...ServiceFields
      }
    }
  }
`;

/**
 * Получить услуги по категории (через taxonomy)
 */
export const GET_SERVICES_BY_CATEGORY = gql`
  ${SERVICE_FIELDS}
  query GetServicesByCategory($categorySlug: String!, $first: Int = 20) {
    services(
      first: $first
      where: {
        status: PUBLISH
        taxQuery: {
          taxArray: {
            taxonomy: SERVICE_CATEGORY
            field: SLUG
            terms: [$categorySlug]
          }
        }
      }
    ) {
      nodes {
        ...ServiceFields
        serviceCategories {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`;

/**
 * Получить slugs всех услуг для статической генерации
 */
export const GET_ALL_SERVICES_SLUGS = gql`
  query GetAllServicesSlugs {
    services(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
      }
    }
  }
`;

/**
 * Получить услуги для sitemap
 */
export const GET_SERVICES_FOR_SITEMAP = gql`
  query GetServicesForSitemap {
    services(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        modified
      }
    }
  }
`;

/**
 * Минимальные поля для слайдера услуг на странице услуги
 */
const SERVICE_SLIDER_FIELDS = gql`
  fragment ServiceSliderFields on Service {
    id
    title
    slug
    icon
    iconSvg
  }
`;

/**
 * Получить услуги по категории (для слайдера)
 */
export const GET_SERVICES_BY_CATEGORY_FOR_SLIDER = gql`
  ${SERVICE_SLIDER_FIELDS}
  query GetServicesByCategoryForSlider($categorySlug: String!, $first: Int = 12) {
    services(
      first: $first
      where: {
        status: PUBLISH
        orderby: { field: TITLE, order: ASC }
        taxQuery: {
          taxArray: {
            taxonomy: SERVICE_CATEGORY
            field: SLUG
            terms: [$categorySlug]
          }
        }
      }
    ) {
      nodes {
        ...ServiceSliderFields
      }
    }
  }
`;

/**
 * Получить все услуги (для слайдера, fallback)
 */
export const GET_ALL_SERVICES_FOR_SLIDER = gql`
  ${SERVICE_SLIDER_FIELDS}
  query GetAllServicesForSlider($first: Int = 12) {
    services(
      first: $first
      where: { status: PUBLISH, orderby: { field: TITLE, order: ASC } }
    ) {
      nodes {
        ...ServiceSliderFields
      }
    }
  }
`;

/**
 * Минимальные поля для поиска (autocomplete, страница поиска)
 */
const SERVICE_SEARCH_FIELDS = gql`
  fragment ServiceSearchFields on Service {
    id
    databaseId
    title
    slug
    uri
    excerpt
    featuredImage {
      node {
        sourceUrl(size: THUMBNAIL)
        altText
      }
    }
  }
`;

/**
 * Поиск услуг
 */
export const SEARCH_SERVICES = gql`
  ${SERVICE_SEARCH_FIELDS}
  query SearchServices($search: String!, $first: Int = 10) {
    services(first: $first, where: { status: PUBLISH, search: $search }) {
      nodes {
        ...ServiceSearchFields
      }
    }
  }
`;

/**
 * Получить данные для Services Dropdown (все категории + услуги)
 * Используется в Navigation для выпадающего меню
 */
export const GET_SERVICES_DROPDOWN_DATA = gql`
  query GetServicesDropdownData {
    # Все категории услуг
    serviceCategories(
      first: 20
      where: { hideEmpty: true, orderby: NAME, order: ASC }
    ) {
      nodes {
        id
        databaseId
        name
        slug
      }
    }

    # Все услуги (для распределения по категориям на фронте)
    services(
      first: 100
      where: { status: PUBLISH, orderby: { field: TITLE, order: ASC } }
    ) {
      nodes {
        id
        databaseId
        title
        slug
        uri
        serviceCategories {
          nodes {
            id
            slug
          }
        }
      }
    }

    # Featured service (продвигаемая услуга) из header settings
    headerSettings {
      featuredService {
        id
        databaseId
        title
        slug
        uri
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        serviceFeatures {
          text
        }
        # Связанные цены (list format, не connection)
        relatedPrices {
          id
          databaseId
          title
          regularPrice
          promoPrice
          currency
        }
      }
    }
  }
`;
