import { gql } from "@apollo/client";

// Fragment для минимальных данных отзыва
export const REVIEW_CARD_FIELDS = gql`
  fragment ReviewCardFields on Review {
    id
    databaseId
    title
    content
    date
    slug
    answer
    authorName
    rating
    platformLogo {
      sourceUrl
      altText
    }
    relatedDoctors {
      id
      databaseId
      title
      slug
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      doctorFields {
        specialization {
          specializationItem
        }
      }
      doctorSpecializations {
        nodes {
          id
          name
          slug
        }
      }
      # КРИТИЧНО: Услуги врача для Level 3 slider
      relatedServices {
        id
        databaseId
        title
        slug
      }
    }
  }
`;

// Получить все отзывы (для секции)
export const GET_ALL_REVIEWS = gql`
  ${REVIEW_CARD_FIELDS}
  query GetAllReviews($first: Int = 10, $after: String) {
    reviews(first: $first, after: $after) {
      edges {
        node {
          ...ReviewCardFields
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

// Получить отзывы с фильтром по рейтингу (для страницы /reviews)
export const GET_REVIEWS_CONNECTION_FILTERED = gql`
  ${REVIEW_CARD_FIELDS}
  query GetReviewsConnectionFiltered(
    $first: Int = 10
    $after: String
    $where: RootQueryToReviewConnectionWhereArgs
  ) {
    reviews(first: $first, after: $after, where: $where) {
      edges {
        node {
          ...ReviewCardFields
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

// Получить избранные отзывы (для homepage)
export const GET_FEATURED_REVIEWS = gql`
  ${REVIEW_CARD_FIELDS}
  query GetFeaturedReviews($first: Int = 3) {
    reviews(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        ...ReviewCardFields
      }
    }
  }
`;

// Получить платформы для фильтра архива отзывов (только платформы, у которых есть отзывы)
export const GET_REVIEWS_FOR_FILTER_OPTIONS = gql`
  query GetReviewsForFilterOptions($first: Int = 500) {
    reviews(first: $first, where: { status: PUBLISH }) {
      nodes {
        reviewPlatforms {
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

// Получить platformLogo для отзывов по id (для обогащения на странице врача)
// WPGraphQL: where.in принимает [ID] (global id) или [Int] (databaseId)
export const GET_REVIEWS_PLATFORM_LOGOS = gql`
  query GetReviewsPlatformLogos($ids: [ID]!) {
    reviews(where: { in: $ids }, first: 100) {
      nodes {
        id
        platformLogo {
          sourceUrl
          altText
        }
      }
    }
  }
`;
