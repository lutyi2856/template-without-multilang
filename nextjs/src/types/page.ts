/**
 * TypeScript типы для WordPress Pages
 */

export interface WordPressPage {
  id: string;
  databaseId: number;
  title: string;
  excerpt?: string;
  content: string;
  slug: string;
  uri: string;
  date: string;
  modified: string;
  parent?: {
    node: {
      id: string;
      slug: string;
      uri: string;
    };
  };
  children?: {
    nodes: WordPressPage[];
  };
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    };
  };
  seo?: {
    title: string;
    description: string;
    openGraph?: {
      title: string;
      description: string;
      image?: {
        url: string;
      };
    };
  };
}

export interface PageBySlugResponse {
  page: WordPressPage | null;
}

export interface AllPagesSlugsResponse {
  pages: {
    nodes: Array<{
      slug: string;
      uri: string;
      parent?: {
        node: {
          slug: string;
        };
      };
    }>;
  };
}
