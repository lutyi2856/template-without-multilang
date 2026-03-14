import { gql } from '@apollo/client';

/**
 * GraphQL запросы для таксономий
 * 
 * Основная таксономия: service_categories (Категории услуг)
 * Используется для мега-меню и фильтрации услуг
 */

/**
 * Фрагмент для категории услуг
 */
export const SERVICE_CATEGORY_FIELDS = gql`
  fragment ServiceCategoryFields on ServiceCategory {
    id
    databaseId
    name
    slug
    description
    count
    uri
    icon
    iconSvg
  }
`;

/**
 * Получить все категории услуг
 */
export const GET_ALL_SERVICE_CATEGORIES = gql`
  ${SERVICE_CATEGORY_FIELDS}
  query GetAllServiceCategories(
    $first: Int = 50
    $hideEmpty: Boolean = true
  ) {
    serviceCategories(
      first: $first
      where: { hideEmpty: $hideEmpty }
    ) {
      nodes {
        ...ServiceCategoryFields
      }
    }
  }
`;

/**
 * Минимальные поля для страницы термина (без seo — надёжный переход)
 */
const SERVICE_CATEGORY_BY_SLUG_FIELDS = gql`
  fragment ServiceCategoryBySlugFields on ServiceCategory {
    id
    databaseId
    name
    slug
    description
    count
    uri
  }
`;

/**
 * Получить категорию услуг по slug — для страницы термина
 */
export const GET_SERVICE_CATEGORY_BY_SLUG = gql`
  ${SERVICE_CATEGORY_BY_SLUG_FIELDS}
  query GetServiceCategoryBySlug($slug: ID!) {
    serviceCategory(id: $slug, idType: SLUG) {
      ...ServiceCategoryBySlugFields
    }
  }
`;

/**
 * Получить категорию с услугами
 */
export const GET_SERVICE_CATEGORY_WITH_SERVICES = gql`
  ${SERVICE_CATEGORY_FIELDS}
  query GetServiceCategoryWithServices(
    $slug: ID!
    $first: Int = 20
  ) {
    serviceCategory(id: $slug, idType: SLUG) {
      ...ServiceCategoryFields
      services(first: $first, where: { status: PUBLISH }) {
        nodes {
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
        }
      }
    }
  }
`;

/**
 * Получить все категории для мега-меню (с количеством услуг)
 */
export const GET_SERVICE_CATEGORIES_FOR_MEGA_MENU = gql`
  ${SERVICE_CATEGORY_FIELDS}
  query GetServiceCategoriesForMegaMenu {
    serviceCategories(
      first: 20
      where: { hideEmpty: true, orderby: NAME, order: ASC }
    ) {
      nodes {
        ...ServiceCategoryFields
        services(first: 1) {
          pageInfo {
            total
          }
        }
      }
    }
  }
`;

/**
 * Получить slugs всех категорий для статической генерации
 */
export const GET_ALL_SERVICE_CATEGORIES_SLUGS = gql`
  query GetAllServiceCategoriesSlugs {
    serviceCategories(first: 100, where: { hideEmpty: true }) {
      nodes {
        slug
      }
    }
  }
`;

/**
 * Получить категории для sitemap
 */
export const GET_SERVICE_CATEGORIES_FOR_SITEMAP = gql`
  query GetServiceCategoriesForSitemap {
    serviceCategories(first: 100, where: { hideEmpty: true }) {
      nodes {
        slug
        count
      }
    }
  }
`;

/**
 * =============================================================================
 * PROBLEMATICS (Проблематика)
 * =============================================================================
 */

/**
 * Фрагмент для проблематики
 */
export const PROBLEMATIC_FIELDS = gql`
  fragment ProblematicFields on Problematic {
    id
    databaseId
    name
    slug
    description
    count
    uri
    icon
  }
`;

/**
 * Получить все проблематики
 */
export const GET_ALL_PROBLEMATICS = gql`
  ${PROBLEMATIC_FIELDS}
  query GetAllProblematics(
    $first: Int = 50
    $hideEmpty: Boolean = true
  ) {
    problematics(
      first: $first
      where: { hideEmpty: $hideEmpty }
    ) {
      nodes {
        ...ProblematicFields
      }
    }
  }
`;

/**
 * Минимальные поля для страницы термина
 */
const PROBLEMATIC_BY_SLUG_FIELDS = gql`
  fragment ProblematicBySlugFields on Problematic {
    id
    databaseId
    name
    slug
    description
    count
    uri
    icon
    relatedServiceCategories {
      nodes {
        id
        slug
        name
      }
    }
  }
`;

/**
 * Получить проблематику по slug — для страницы термина
 */
export const GET_PROBLEMATIC_BY_SLUG = gql`
  ${PROBLEMATIC_BY_SLUG_FIELDS}
  query GetProblematicBySlug($slug: ID!) {
    problematic(id: $slug, idType: SLUG) {
      ...ProblematicBySlugFields
    }
  }
`;

/**
 * Получить slugs всех проблематик для статической генерации
 */
export const GET_ALL_PROBLEMATICS_SLUGS = gql`
  query GetAllProblematicsSlugs {
    problematics(first: 100, where: { hideEmpty: true }) {
      nodes {
        slug
      }
    }
  }
`;
