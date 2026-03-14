/**
 * Поиск по сайту — единая точка для autocomplete и страницы поиска
 *
 * Параллельные запросы к WPGraphQL по всем типам контента
 */

import { getApolloClient } from "./client";
import {
  SEARCH_DOCTORS,
  SEARCH_POSTS,
  SEARCH_SERVICES,
  SEARCH_CLINICS,
  SEARCH_PROMOTIONS,
  SEARCH_PAGES,
} from "./queries";

export type SearchContentType =
  | "doctor"
  | "post"
  | "service"
  | "clinic"
  | "promotion"
  | "page";

export interface SearchResultItem {
  id: string;
  title: string;
  slug: string;
  uri: string;
  type: SearchContentType;
  excerpt?: string;
  featuredImage?: {
    sourceUrl: string;
    altText?: string;
  };
}

export interface SearchResults {
  doctors: SearchResultItem[];
  posts: SearchResultItem[];
  services: SearchResultItem[];
  clinics: SearchResultItem[];
  promotions: SearchResultItem[];
  pages: SearchResultItem[];
}

function mapDoctor(node: {
  id: string;
  title: string;
  slug: string;
  uri?: string;
  excerpt?: string;
  featuredImage?: {
    node?: { sourceUrl: string; altText?: string };
  };
}): SearchResultItem {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    uri: node.uri || `/doctors/${node.slug}`,
    type: "doctor",
    excerpt: node.excerpt,
    featuredImage: node.featuredImage?.node
      ? {
          sourceUrl: node.featuredImage.node.sourceUrl,
          altText: node.featuredImage.node.altText,
        }
      : undefined,
  };
}

function mapPost(node: {
  id: string;
  title: string;
  slug: string;
  uri: string;
  excerpt?: string;
  featuredImage?: {
    node?: { sourceUrl: string; altText?: string };
  };
}): SearchResultItem {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    uri: node.uri || `/blog/${node.slug}`,
    type: "post",
    excerpt: node.excerpt,
    featuredImage: node.featuredImage?.node
      ? {
          sourceUrl: node.featuredImage.node.sourceUrl,
          altText: node.featuredImage.node.altText,
        }
      : undefined,
  };
}

function mapService(node: {
  id: string;
  title: string;
  slug: string;
  uri: string;
  excerpt?: string;
  featuredImage?: {
    node?: { sourceUrl: string; altText?: string };
  };
}): SearchResultItem {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    uri: node.uri || `/services/${node.slug}`,
    type: "service",
    excerpt: node.excerpt,
    featuredImage: node.featuredImage?.node
      ? {
          sourceUrl: node.featuredImage.node.sourceUrl,
          altText: node.featuredImage.node.altText,
        }
      : undefined,
  };
}

function mapClinic(node: {
  id: string;
  title: string;
  slug: string;
  uri?: string;
  featuredImage?: {
    node?: { sourceUrl: string; altText?: string };
  };
}): SearchResultItem {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    uri: node.uri || `/clinics/${node.slug}`,
    type: "clinic",
    featuredImage: node.featuredImage?.node
      ? {
          sourceUrl: node.featuredImage.node.sourceUrl,
          altText: node.featuredImage.node.altText,
        }
      : undefined,
  };
}

function mapPromotion(node: {
  id: string;
  title: string;
  slug: string;
  uri: string;
  excerpt?: string;
  featuredImage?: {
    node?: { sourceUrl: string; altText?: string };
  };
}): SearchResultItem {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    uri: node.uri || `/promotions/${node.slug}`,
    type: "promotion",
    excerpt: node.excerpt,
    featuredImage: node.featuredImage?.node
      ? {
          sourceUrl: node.featuredImage.node.sourceUrl,
          altText: node.featuredImage.node.altText,
        }
      : undefined,
  };
}

function mapPage(node: {
  id: string;
  title: string;
  slug: string;
  uri: string;
  excerpt?: string;
  featuredImage?: {
    node?: { sourceUrl: string; altText?: string };
  };
}): SearchResultItem {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    uri: node.uri || `/${node.slug}`,
    type: "page",
    excerpt: node.excerpt,
    featuredImage: node.featuredImage?.node
      ? {
          sourceUrl: node.featuredImage.node.sourceUrl,
          altText: node.featuredImage.node.altText,
        }
      : undefined,
  };
}

/**
 * Поиск по всем типам контента (врачи, посты, услуги, клиники, акции, страницы)
 *
 * @param search - поисковый запрос
 * @param first - лимит на каждый тип (5 для autocomplete, 10 для страницы)
 */
export async function searchAllContentTypes(
  search: string,
  first: number = 5
): Promise<SearchResults> {
  const client = getApolloClient();
  const trimmed = search.trim();
  if (!trimmed) {
    return {
      doctors: [],
      posts: [],
      services: [],
      clinics: [],
      promotions: [],
      pages: [],
    };
  }

  const [doctorsRes, postsRes, servicesRes, clinicsRes, promotionsRes, pagesRes] =
    await Promise.all([
      client.query({
        query: SEARCH_DOCTORS,
        variables: { search: trimmed, first },
      }),
      client.query({
        query: SEARCH_POSTS,
        variables: { search: trimmed, first },
      }),
      client.query({
        query: SEARCH_SERVICES,
        variables: { search: trimmed, first },
      }),
      client.query({
        query: SEARCH_CLINICS,
        variables: { search: trimmed, first },
      }),
      client.query({
        query: SEARCH_PROMOTIONS,
        variables: { search: trimmed, first },
      }),
      client.query({
        query: SEARCH_PAGES,
        variables: { search: trimmed, first },
      }),
    ]);

  return {
    doctors: (doctorsRes.data?.doctors?.nodes ?? []).map(mapDoctor),
    posts: (postsRes.data?.posts?.nodes ?? []).map(mapPost),
    services: (servicesRes.data?.services?.nodes ?? []).map(mapService),
    clinics: (clinicsRes.data?.clinics?.nodes ?? []).map(mapClinic),
    promotions: (promotionsRes.data?.promotions?.nodes ?? []).map(mapPromotion),
    pages: (pagesRes.data?.pages?.nodes ?? []).map(mapPage),
  };
}
