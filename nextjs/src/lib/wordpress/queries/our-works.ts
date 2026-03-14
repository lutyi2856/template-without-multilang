import { gql } from "@apollo/client";

// Fragment для карточки работы (копия подхода из reviews)
export const OUR_WORK_CARD_FIELDS = gql`
  fragment OurWorkCardFields on OurWork {
    id
    databaseId
    title
    slug
    photoBefore {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
    photoAfter {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
    generalPhoto {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
    useGeneralPhoto
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
      relatedServices {
        id
        databaseId
        title
        slug
      }
    }
    relatedClinics {
      id
      databaseId
      title
      slug
    }
    relatedServices {
      id
      databaseId
      title
      slug
    }
    serviceCategories {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
  }
`;

// Получить избранные работы для homepage
export const GET_FEATURED_OUR_WORKS = gql`
  ${OUR_WORK_CARD_FIELDS}
  query GetFeaturedOurWorks($first: Int = 10) {
    ourWorks(first: $first, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        ...OurWorkCardFields
      }
    }
  }
`;

// Упрощенный запрос для отладки (только базовые поля)
export const GET_OUR_WORKS_SIMPLE = gql`
  query GetOurWorksSimple($first: Int = 10) {
    ourWorks(first: $first) {
      nodes {
        id
        databaseId
        title
        slug
      }
    }
  }
`;

// Получить все работы (для страницы /our-works)
export const GET_ALL_OUR_WORKS = gql`
  ${OUR_WORK_CARD_FIELDS}
  query GetAllOurWorks($first: Int = 10, $after: String) {
    ourWorks(first: $first, after: $after) {
      edges {
        node {
          ...OurWorkCardFields
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
 * Connection-запрос для архива наших работ с пагинацией и фильтром по категории.
 */
export const GET_OUR_WORKS_CONNECTION = gql`
  ${OUR_WORK_CARD_FIELDS}
  query GetOurWorksConnection(
    $first: Int = 12
    $after: String
    $where: RootQueryToOurWorkConnectionWhereArgs
  ) {
    ourWorks(first: $first, after: $after, where: $where) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...OurWorkCardFields
      }
    }
  }
`;

/**
 * Минимальный запрос для получения категорий из работ (для фильтра).
 */
export const GET_OUR_WORKS_FOR_FILTER_OPTIONS = gql`
  query GetOurWorksForFilterOptions($first: Int = 500) {
    ourWorks(first: $first, where: { status: PUBLISH }) {
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
