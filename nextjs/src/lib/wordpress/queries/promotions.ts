import { gql } from '@apollo/client';

/**
 * GraphQL запросы для акций/промо (CPT: promotions)
 * 
 * Используется для:
 * - Топ-бар в шапке (промо-блок)
 * - Страница "Акции"
 * - Виджеты акций на других страницах
 */

/**
 * Фрагмент для карточки промо (PromotionCard) - для homepage slider
 * Включает: content (описание под заголовком), relatedServices с serviceCategories (таксономия услуги) и relatedPrices
 */
export const PROMOTION_CARD_DATA = gql`
  fragment PromotionCardData on Promotion {
    id
    databaseId
    title
    slug
    excerpt
    content
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
    promotionFields {
      actionIcon
      actionType
      endDate
      discountLabelText
      showDiscountPercent
      futures {
        text
      }
    }
    actionIconSvg
    serviceCategories {
      nodes {
        id
        name
        slug
      }
    }
    relatedPrice {
      id
      databaseId
      regularPrice
      promoPrice
      currency
    }
    relatedServices {
      ... on Service {
        id
        title
        slug
        serviceCategories {
          nodes {
            id
            name
            slug
          }
        }
        relatedPrices {
          ... on Price {
            id
            databaseId
            regularPrice
            promoPrice
            currency
          }
        }
      }
    }
  }
`;

/**
 * Фрагмент для промо-поста
 */
export const PROMOTION_FIELDS = gql`
  fragment PromotionFields on Promotion {
    id
    databaseId
    title
    slug
    uri
    date
    modified
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
    promotionFields {
      actionIcon
      actionType
      endDate
      discountLabelText
      showDiscountPercent
      futures {
        text
      }
    }
    actionIconSvg
    serviceCategories {
      nodes {
        id
        name
        slug
      }
    }
    relatedPrice {
      id
      databaseId
      regularPrice
      promoPrice
      currency
      period
    }
    relatedServices {
      ... on Service {
        id
        databaseId
        title
        slug
        uri
        serviceCategories {
          nodes {
            id
            name
            slug
          }
        }
        relatedPrices {
          ... on Price {
            id
            databaseId
            title
            regularPrice
            promoPrice
            currency
            period
            installmentTerms
          }
        }
      }
    }
  }
`;

/**
 * Получить все акции
 */
export const GET_ALL_PROMOTIONS = gql`
  ${PROMOTION_FIELDS}
  query GetAllPromotions(
    $first: Int = 20
    $after: String
  ) {
    promotions(
      first: $first
      after: $after
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...PromotionFields
      }
    }
  }
`;

/**
 * Минимальные поля для страницы акции по slug (без promotionFields/relatedServices — избегаем ошибок схемы)
 */
const PROMOTION_BY_SLUG_FIELDS = gql`
  fragment PromotionBySlugFields on Promotion {
    id
    databaseId
    title
    slug
    excerpt
    content
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
  }
`;

/**
 * Получить акцию по slug — минимальный запрос для надёжного перехода на страницу
 */
export const GET_PROMOTION_BY_SLUG = gql`
  ${PROMOTION_BY_SLUG_FIELDS}
  query GetPromotionBySlug($slug: ID!) {
    promotion(id: $slug, idType: SLUG) {
      ...PromotionBySlugFields
    }
  }
`;

/**
 * Получить последние N акций для виджета
 */
export const GET_LATEST_PROMOTIONS = gql`
  ${PROMOTION_FIELDS}
  query GetLatestPromotions($first: Int = 3) {
    promotions(
      first: $first
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        ...PromotionFields
      }
    }
  }
`;

/**
 * Получить активные акции (можно добавить ACF поле для периода действия)
 */
export const GET_ACTIVE_PROMOTIONS = gql`
  ${PROMOTION_FIELDS}
  query GetActivePromotions($first: Int = 10) {
    promotions(
      first: $first
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        ...PromotionFields
      }
    }
  }
`;

/**
 * Получить slugs всех акций для статической генерации
 */
export const GET_ALL_PROMOTIONS_SLUGS = gql`
  query GetAllPromotionsSlugs {
    promotions(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
      }
    }
  }
`;

/**
 * Получить акции для sitemap
 */
export const GET_PROMOTIONS_FOR_SITEMAP = gql`
  query GetPromotionsForSitemap {
    promotions(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        modified
      }
    }
  }
`;

/**
 * Получить акции для homepage slider
 * Использует упрощенный PromotionCardData fragment
 */
export const GET_PROMOTIONS_FOR_HOMEPAGE = gql`
  ${PROMOTION_CARD_DATA}
  query GetPromotionsForHomepage($first: Int = 10) {
    promotions(
      first: $first
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        ...PromotionCardData
      }
    }
  }
`;

/**
 * Акции, у которых в related_services есть данная услуга (Promotion → Service).
 * Используется для двунаправленной связи на странице услуги.
 */
export const GET_PROMOTIONS_BY_RELATED_SERVICE = gql`
  ${PROMOTION_CARD_DATA}
  query GetPromotionsByRelatedService($serviceId: Int!, $first: Int = 8) {
    promotionsByServiceId(serviceId: $serviceId, first: $first) {
      ...PromotionCardData
    }
  }
`;

/**
 * Connection-запрос для архива акций с пагинацией и фильтром по категории.
 */
export const GET_PROMOTIONS_CONNECTION = gql`
  ${PROMOTION_CARD_DATA}
  query GetPromotionsConnection(
    $first: Int = 12
    $after: String
    $where: RootQueryToPromotionConnectionWhereArgs
  ) {
    promotions(first: $first, after: $after, where: $where) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...PromotionCardData
      }
    }
  }
`;

/**
 * Минимальные поля для поиска (autocomplete, страница поиска)
 */
const PROMOTION_SEARCH_FIELDS = gql`
  fragment PromotionSearchFields on Promotion {
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
 * Поиск акций
 */
export const SEARCH_PROMOTIONS = gql`
  ${PROMOTION_SEARCH_FIELDS}
  query SearchPromotions($search: String!, $first: Int = 10) {
    promotions(first: $first, where: { status: PUBLISH, search: $search }) {
      nodes {
        ...PromotionSearchFields
      }
    }
  }
`;

/**
 * Минимальный запрос для получения категорий из акций (для фильтра).
 */
export const GET_PROMOTIONS_FOR_FILTER_OPTIONS = gql`
  query GetPromotionsForFilterOptions($first: Int = 500) {
    promotions(first: $first, where: { status: PUBLISH }) {
      nodes {
        id
        serviceCategories {
          nodes {
            id
            databaseId
            name
            slug
          }
        }
      }
    }
  }
`;
