import { gql } from '@apollo/client';

/**
 * GraphQL запросы для цен (CPT: prices)
 * 
 * Price содержит:
 * - Обычную цену (regularPrice)
 * - Цену по акции (promoPrice)
 * - Валюту и период оплаты
 * - Связь с Service (bidirectional)
 */

/**
 * Фрагмент базовых полей Price
 */
export const PRICE_FIELDS = gql`
  fragment PriceFields on Price {
    id
    databaseId
    title
    slug
    uri
    regularPrice
    promoPrice
    currency
    period
    installmentTerms
    averagePriceCity
  }
`;

/**
 * Фрагмент Price с связанным Service
 */
export const PRICE_WITH_SERVICE = gql`
  ${PRICE_FIELDS}
  fragment PriceWithService on Price {
    ...PriceFields
    relatedService {
      node {
        id
        databaseId
        title
        slug
        uri
      }
    }
  }
`;

/**
 * Получить все цены
 */
export const GET_ALL_PRICES = gql`
  ${PRICE_FIELDS}
  query GetAllPrices(
    $first: Int = 100
    $after: String
  ) {
    prices(
      first: $first
      after: $after
      where: { status: PUBLISH }
    ) {
      edges {
        node {
          ...PriceFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Получить цену по ID
 */
export const GET_PRICE_BY_ID = gql`
  ${PRICE_WITH_SERVICE}
  query GetPriceById($id: ID!) {
    price(id: $id, idType: DATABASE_ID) {
      ...PriceWithService
    }
  }
`;

/**
 * Получить цены для архива /prices — с категориями, без привязки к услугам
 */
export const GET_PRICES_FOR_ARCHIVE = gql`
  query GetPricesForArchive($first: Int = 500) {
    prices(first: $first, where: { status: PUBLISH }) {
      nodes {
        id
        databaseId
        title
        excerpt
        averagePriceCity
        regularPrice
        promoPrice
        currency
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

/**
 * Получить цены для конкретной услуги
 */
export const GET_PRICES_BY_SERVICE = gql`
  ${PRICE_FIELDS}
  query GetPricesByService($serviceId: ID!) {
    service(id: $serviceId, idType: DATABASE_ID) {
      id
      title
      relatedPrices {
        nodes {
          ...PriceFields
        }
      }
    }
  }
`;
