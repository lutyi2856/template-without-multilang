import { gql } from "@apollo/client";

/**
 * GraphQL запросы для Actions Archive Settings Option Page
 *
 * Страница /promotions — описание, преимущества, CTA блок
 */

export const GET_ACTIONS_ARCHIVE_SETTINGS = gql`
  query GetActionsArchiveSettings {
    actionsArchiveSettings {
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
