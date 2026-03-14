/**
 * Типы для блога — клиент-безопасные (без импорта из wordpress/api).
 * Используются в BlogPostCard, BlogSectionClient, BlogHeroSliderClient и т.д.
 */

export interface BlogPostCard {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText?: string;
      mediaDetails?: { width: number; height: number };
    };
  };
  categories?: {
    nodes: Array<{
      id?: string;
      name: string;
      slug: string;
    }>;
  };
  relatedDoctors?: Array<{
    id: string;
    databaseId: number;
    title: string;
    slug: string;
    featuredImage?: {
      node: {
        sourceUrl: string;
        altText?: string;
        mediaDetails?: { width: number; height: number };
      };
    };
  }>;
  cardStyle?: 'light' | 'dark' | null;
}

export interface PostsPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}
