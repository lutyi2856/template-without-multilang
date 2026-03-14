import { gql } from "@apollo/client";

/**
 * GraphQL запросы для Hero блока на главной странице
 *
 * Включает:
 * - Динамические счетчики (клиники, врачи)
 * - Данные для Action Card (последняя акция с endDate)
 */

/**
 * Фрагмент для Action Card данных из Promotion
 */
export const ACTION_CARD_FIELDS = gql`
  fragment ActionCardFields on Promotion {
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
    promotionFields {
      actionIcon
      actionType
      endDate
    }
    actionIconSvg
    promotionFutures {
      text
    }
    relatedPrice {
      id
      databaseId
      regularPrice
      promoPrice
      currency
    }
    relatedServices {
      id
      databaseId
      title
      relatedPrices {
        id
        databaseId
        promoPrice
        regularPrice
        currency
      }
    }
  }
`;

/**
 * Получить данные для Hero блока
 *
 * Включает:
 * - Счетчики клиник и врачей из headerSettings
 * - Настройки главной страницы (heroImage, heroTitle, heroSubtitle, featuredAction)
 * - Fallback: последняя акция если featuredAction не выбрана
 */
export const GET_HERO_DATA = gql`
  ${ACTION_CARD_FIELDS}
  query GetHeroData {
    headerSettings {
      locationsCount
      doctorsCount
    }
    # Настройки главной страницы (Hero блок + Акция + CTA)
    mainPageSettings {
      heroImage {
        url
        width
        height
        alt
      }
      heroVectorImage {
        url
        width
        height
        alt
      }
      heroTitle
      heroSubtitle
      heroBadges {
        text
      }
      featuredAction {
        ...ActionCardFields
      }
      ctaTitle
      ctaDescription
      ctaPhone
      ctaPrivacyText
      ctaDoctorImage {
        url
        width
        height
        alt
      }
      ctaBackgroundImage {
        url
        width
        height
        alt
      }
      ctaDoctorImage2 {
        url
        width
        height
        alt
      }
    }
    # Fallback: последняя акция если в настройках не выбрана
    promotions(
      first: 1
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        ...ActionCardFields
      }
    }
  }
`;

/**
 * Получить только счетчики для Hero блока
 */
export const GET_HERO_COUNTERS = gql`
  query GetHeroCounters {
    headerSettings {
      locationsCount
      doctorsCount
    }
  }
`;

/**
 * Получить только Action Card данные
 */
export const GET_ACTION_CARD = gql`
  ${ACTION_CARD_FIELDS}
  query GetActionCard {
    promotions(
      first: 1
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        ...ActionCardFields
      }
    }
  }
`;
