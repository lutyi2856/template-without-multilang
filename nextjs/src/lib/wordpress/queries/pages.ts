import { gql } from '@apollo/client';

/**
 * GraphQL запросы для WordPress страниц (Pages)
 * 
 * Используется для динамического роутинга в Next.js
 */

/**
 * Фрагмент для базовых полей страницы
 */
export const PAGE_FIELDS = gql`
  fragment PageFields on Page {
    id
    databaseId
    title
    excerpt
    content
    slug
    uri
    date
    modified
    parent {
      node {
        id
        slug
        uri
      }
    }
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
`;

/**
 * Получить страницу по slug/URI
 */
export const GET_PAGE_BY_SLUG = gql`
  ${PAGE_FIELDS}
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      ...PageFields
      seo {
        title
        description
        openGraph {
          title
          description
          image {
            url
          }
        }
      }
    }
  }
`;

/**
 * Минимальный запрос для getPageByUri (fallback услуг)
 */
export const GET_PAGE_BY_URI_MINIMAL = gql`
  query GetPageByUriMinimal($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      title
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
    }
  }
`;

/**
 * Получить все slugs страниц для generateStaticParams
 */
export const GET_ALL_PAGES_SLUGS = gql`
  query GetAllPagesSlugs {
    pages(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        uri
        parent {
          node {
            slug
          }
        }
      }
    }
  }
`;

/**
 * Получить страницу с дочерними страницами
 */
export const GET_PAGE_WITH_CHILDREN = gql`
  ${PAGE_FIELDS}
  query GetPageWithChildren($slug: ID!) {
    page(id: $slug, idType: URI) {
      ...PageFields
      children(first: 50) {
        nodes {
          ...PageFields
        }
      }
    }
  }
`;

/**
 * Минимальные поля для поиска (autocomplete, страница поиска)
 */
const PAGE_SEARCH_FIELDS = gql`
  fragment PageSearchFields on Page {
    id
    databaseId
    title
    slug
    uri
    excerpt
    featuredImage {
      node {
        sourceUrl(size: THUMBNAIL)
        altText
      }
    }
  }
`;

/**
 * Поиск страниц
 */
export const SEARCH_PAGES = gql`
  ${PAGE_SEARCH_FIELDS}
  query SearchPages($search: String!, $first: Int = 10) {
    pages(first: $first, where: { status: PUBLISH, search: $search }) {
      nodes {
        ...PageSearchFields
      }
    }
  }
`;

/**
 * Получить страницу по ID
 */
export const GET_PAGE_BY_ID = gql`
  ${PAGE_FIELDS}
  query GetPageById($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      ...PageFields
    }
  }
`;
