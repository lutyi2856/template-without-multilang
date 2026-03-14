import { gql } from '@apollo/client';

/**
 * GraphQL запросы для постов (блог/новости)
 * 
 * Используется для получения данных постов из WordPress через WPGraphQL
 */

/**
 * Фрагмент для полей поста
 */
export const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    databaseId
    title
    slug
    uri
    date
    modified
    excerpt
    content
    contentBlocks {
      name
      attributes
    }
    author {
      node {
        name
        firstName
        lastName
        avatar {
          url
        }
      }
    }
    featuredImage {
      node {
        id
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    categories {
      nodes {
        id
        name
        slug
      }
    }
    tags {
      nodes {
        id
        name
        slug
      }
    }
    shareButtons {
      icon
      url
      label
    }
    ctaOverride {
      ctaTitle
      ctaDescription
      ctaButtonText
      ctaImage {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
  }
`;

/**
 * Получить список всех постов
 */
export const GET_ALL_POSTS = gql`
  ${POST_FIELDS}
  query GetAllPosts(
    $first: Int = 10
    $after: String
  ) {
    posts(
      first: $first
      after: $after
      where: { status: PUBLISH }
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          ...PostFields
        }
      }
    }
  }
`;

/**
 * Получить пост по slug
 */
export const GET_POST_BY_SLUG = gql`
  ${POST_FIELDS}
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ...PostFields
    }
  }
`;

/**
 * Получить последние посты для homepage
 */
export const GET_RECENT_POSTS = gql`
  ${POST_FIELDS}
  query GetRecentPosts($first: Int = 6) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        ...PostFields
      }
    }
  }
`;

/**
 * Получить посты по категории
 */
export const GET_POSTS_BY_CATEGORY = gql`
  ${POST_FIELDS}
  query GetPostsByCategory(
    $categorySlug: String!
    $first: Int = 10
  ) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        categoryName: $categorySlug
      }
    ) {
      nodes {
        ...PostFields
      }
    }
  }
`;

/**
 * Поиск постов
 */
export const SEARCH_POSTS = gql`
  ${POST_FIELDS}
  query SearchPosts($search: String!, $first: Int = 10) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        search: $search
      }
    ) {
      nodes {
        ...PostFields
      }
    }
  }
`;

/**
 * Получить похожие посты
 */
export const GET_RELATED_POSTS = gql`
  ${POST_FIELDS}
  query GetRelatedPosts(
    $categoryIn: [ID!]
    $notIn: [ID!]
    $first: Int = 3
  ) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        categoryIn: $categoryIn
        notIn: $notIn
      }
    ) {
      nodes {
        ...PostFields
      }
    }
  }
`;

/**
 * Получить slugs всех постов для статической генерации
 */
export const GET_ALL_POSTS_SLUGS = gql`
  query GetAllPostsSlugs {
    posts(first: 10000, where: { status: PUBLISH }) {
      nodes {
        slug
      }
    }
  }
`;

/**
 * Получить посты для sitemap
 */
export const GET_POSTS_FOR_SITEMAP = gql`
  query GetPostsForSitemap {
    posts(first: 10000, where: { status: PUBLISH }) {
      nodes {
        slug
        modified
      }
    }
  }
`;

/**
 * Фрагмент для карточки поста в секции блога (главная)
 * Включает: title, date, featuredImage, categories, relatedDoctors, фон (ACF)
 */
export const POST_BLOG_CARD_FIELDS = gql`
  fragment PostBlogCardFields on Post {
    id
    databaseId
    title
    slug
    date
    excerpt
    featuredImage {
      node {
        id
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    categories {
      nodes {
        id
        name
        slug
      }
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
          mediaDetails {
            width
            height
          }
        }
      }
    }
    cardStyle
  }
`;

/**
 * Получить похожие посты для карточек (с relatedDoctors, cardStyle)
 */
export const GET_RELATED_POSTS_FOR_CARDS = gql`
  ${POST_BLOG_CARD_FIELDS}
  query GetRelatedPostsForCards(
    $categoryIn: [ID!]
    $notIn: [ID!]
    $first: Int = 6
  ) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        categoryIn: $categoryIn
        notIn: $notIn
      }
    ) {
      nodes {
        ...PostBlogCardFields
      }
    }
  }
`;

/**
 * Получить посты для секции «Самое интересное в блоге» (главная)
 */
export const GET_POSTS_FOR_BLOG_SECTION = gql`
  ${POST_BLOG_CARD_FIELDS}
  query GetPostsForBlogSection($first: Int = 9) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        ...PostBlogCardFields
      }
    }
  }
`;

/**
 * Получить все категории
 */
export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories(first: 100, where: { hideEmpty: true }) {
      nodes {
        id
        name
        slug
        count
        description
      }
    }
  }
`;

/**
 * Получить посты с cursor pagination (без фильтра по категории)
 */
export const GET_POSTS_CONNECTION = gql`
  ${POST_BLOG_CARD_FIELDS}
  query GetPostsConnection($first: Int = 6, $after: String) {
    posts(
      first: $first
      after: $after
      where: {
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...PostBlogCardFields
        }
      }
    }
  }
`;

/**
 * Получить посты с cursor pagination и фильтром по категории
 */
export const GET_POSTS_CONNECTION_BY_CATEGORY = gql`
  ${POST_BLOG_CARD_FIELDS}
  query GetPostsConnectionByCategory(
    $first: Int = 6
    $after: String
    $categorySlug: String!
  ) {
    posts(
      first: $first
      after: $after
      where: {
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
        categoryName: $categorySlug
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...PostBlogCardFields
        }
      }
    }
  }
`;

/**
 * Получить категорию по slug (для архива /blog/category/[slug])
 */
export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      count
    }
  }
`;

