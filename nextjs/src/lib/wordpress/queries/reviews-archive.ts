import { gql } from "@apollo/client";

/**
 * GraphQL запросы для Reviews Archive Settings Option Page
 *
 * CTA блок страницы /reviews (Figma 440:4263)
 */

export const GET_REVIEWS_ARCHIVE_SETTINGS = gql`
  query GetReviewsArchiveSettings {
    reviewsArchiveSettings {
      ctaTitle
      ctaDescription
      ctaButtonText
      ctaBackground {
        url
        width
        height
        alt
      }
      ctaIcon {
        url
        width
        height
        alt
      }
      ctaContentImage {
        url
        width
        height
        alt
      }
      ctaGiftImage {
        url
        width
        height
        alt
      }
      clinicLogoReviewCard {
        url
        width
        height
        alt
      }
      clinicLogoReviewCardBackgroundColor
    }
  }
`;
