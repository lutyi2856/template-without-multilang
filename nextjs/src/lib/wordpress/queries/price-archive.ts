import { gql } from "@apollo/client";

/**
 * GraphQL запросы для Price Archive Settings Option Page
 *
 * Страница /prices — описание, преимущества, акции, PDF, CTA блок
 */

export const GET_PRICE_ARCHIVE_SETTINGS = gql`
  query GetPriceArchiveSettings {
    priceArchiveSettings {
      showAverageInCity
      pricePageDescription
      advantages {
        headline
        image {
          url
          width
          height
          alt
        }
      }
      selectedPromotions {
        id
        databaseId
      }
      priceListPdf {
        url
        id
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
    }
  }
`;
