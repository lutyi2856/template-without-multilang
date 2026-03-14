import { gql } from "@apollo/client";

/**
 * GraphQL запросы для Main Page Settings Option Page
 *
 * Получение настроек главной страницы (Hero блок, Акция, CTA)
 */

/**
 * Получить настройки главной страницы
 */
export const GET_MAIN_PAGE_SETTINGS = gql`
  query GetMainPageSettings {
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
        promotionFields {
          actionIcon
          actionType
          endDate
        }
        actionIconSvg
        promotionFutures {
          text
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
      ctaTitle
      ctaDescription
      ctaPhone
      ctaPrivacyText
      ctaPrivacyLink
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
      ctaDoctorImageMobile {
        url
        width
        height
        alt
      }
      ctaDoctorImage2Mobile {
        url
        width
        height
        alt
      }
      guidanceImage {
        url
        width
        height
        alt
      }
      guidanceContent
      guidanceManagerImage {
        url
        width
        height
        alt
      }
      guidanceSubscribe
      guidancePositions
      guidanceMediaImage {
        url
        width
        height
        alt
      }
      promotionsSectionTitle
      promotionsSectionDescription
      promotionsFallbackImage {
        url
        width
        height
        alt
      }
      reviewsSectionTitle
      reviewsSectionContent
      reviewsSectionImage {
        url
        width
        height
        alt
      }
      reviewsSectionMediumRating
      reviewsSectionBasis
      reviewsSectionItems {
        rating
        image {
          url
          width
          height
          alt
        }
        text
        reviewsCount
        link
      }
      licensesSectionTitle
      licensee {
        licenseTitle
        textLicenzia
        image {
          url
          width
          height
          alt
        }
      }
      preferencesItems {
        icon
        iconSvg
        title
        description
        href
      }
      trustedTitle
      trustedDescription
      trustedItems {
        number
        title
        description
      }
      trustedColumns
      clinicsMapTitle
      selectedPromotion {
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
        relatedServices {
          id
          title
          relatedPrices {
            id
            databaseId
            priceFields {
              regularPrice
              promoPrice
              currency
              period
            }
          }
        }
      }
      blockPriceTitle
      selectedServicesBlockPrice {
        id
        databaseId
        title
        slug
      }
    }
  }
`;
