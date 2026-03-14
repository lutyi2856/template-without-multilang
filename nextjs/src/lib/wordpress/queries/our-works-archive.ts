import { gql } from "@apollo/client";

/**
 * GraphQL запросы для Our Works Archive Settings Option Page
 *
 * Страница /our-works — описание, преимущества, CTA блок
 */

export const GET_OUR_WORKS_ARCHIVE_SETTINGS = gql`
  query GetOurWorksArchiveSettings {
    ourWorksArchiveSettings {
      actionPageDescription
      advantages {
        headline
        image {
          url
          width
          height
          alt
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
    }
  }
`;
