import { gql } from '@apollo/client';

/**
 * GraphQL запросы для настроек шапки сайта (Header Settings)
 * 
 * ACF Option Page: header_settings
 * Содержит:
 * - Featured Promotion (с данными о service и price)
 * - Контактная информация (телефон, email)
 * - Часы работы (будни, выходные)
 * - Счетчики (локации, отзывы)
 */

/**
 * Фрагмент для featured promotion с полной цепочкой данных
 */
export const FEATURED_PROMOTION_FIELDS = gql`
  fragment FeaturedPromotionFields on Promotion {
    id
    databaseId
    title
    slug
    uri
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
    relatedPrice {
      id
      databaseId
      regularPrice
      promoPrice
      currency
      period
    }
    # Связанные услуги через field group
    promotionRelationships {
      relatedServices {
        edges {
          node {
            ... on Service {
              id
              databaseId
              title
              slug
              uri
              # Цены для услуги через field group
              serviceRelationships {
                relatedPrices {
                  edges {
                    node {
                      ... on Price {
                        id
                        databaseId
                        title
                        priceFields {
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
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Получить настройки шапки сайта
 * Note: WPGraphQL ACF v2 post_object fields экспонируются через manual registration
 * так как автоматическая регистрация Option Pages не работает
 */
export const GET_HEADER_SETTINGS = gql`
  ${FEATURED_PROMOTION_FIELDS}
  query GetHeaderSettings {
    headerSettings {
      logoMode
      logo {
        url
        alt
        width
        height
      }
      logoIcon
      logoIconSvg
      phone
      phoneSchedule
      email
      workingHours {
        weekdays
        weekend
      }
      locationsCount
      socialLinks {
        name
        icon
        iconSvg
        url
      }
      featuredPromotion {
        ...FeaturedPromotionFields
      }
    }
  }
`;

/**
 * Получить только featured promotion из настроек
 */
export const GET_HEADER_PROMO = gql`
  ${FEATURED_PROMOTION_FIELDS}
  query GetHeaderPromo {
    headerSettings {
      featuredPromotion {
        ...FeaturedPromotionFields
      }
    }
  }
`;

/**
 * Получить только контактную информацию
 */
export const GET_HEADER_CONTACTS = gql`
  query GetHeaderContacts {
    headerSettings {
      phone
      phoneSchedule
      email
      workingHours {
        weekdays
        weekend
      }
    }
  }
`;

/**
 * Получить только счетчики для бейджей
 * Note: reviewsCount удален - теперь счетчики берутся динамически через badgeCount в menu items
 */
export const GET_HEADER_COUNTERS = gql`
  query GetHeaderCounters {
    headerSettings {
      locationsCount
    }
  }
`;
