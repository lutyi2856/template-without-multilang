export interface Review {
  id: string;
  databaseId: number;
  title: string;
  content: string;
  date: string;
  slug: string;

  // ACF поля (из register-reviews-graphql.php)
  answer?: string;
  authorName?: string;
  rating?: number;

  platformLogo?: {
    sourceUrl: string;
    altText?: string;
  };

  // Relationships
  relatedDoctors?: Array<{
    id: string;
    databaseId: number;
    title: string;
    slug: string;
    featuredImage?: {
      node: {
        sourceUrl: string;
        altText?: string;
      };
    };
    doctorFields?: {
      specialization?: Array<{ specializationItem?: string }>;
    };
    doctorSpecializations?: {
      nodes?: Array<{ name: string }>;
    };
    // КРИТИЧНО: Услуги врача для Level 3 slider
    relatedServices?: Array<{
      id: string;
      title: string;
      slug: string;
    }>;
  }>;
}

export interface ReviewCardProps {
  review: Review;
  className?: string;
}
