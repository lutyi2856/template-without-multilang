import { Review } from "@/lib/wordpress/types/review";

export interface ReviewCardProps {
  review: Review;
  clinicAvatarUrl?: string;
  clinicAvatarBackgroundColor?: string;
  className?: string;
}

export interface ClinicAnswerProps {
  answer: string;
  clinicAvatarUrl?: string;
  clinicAvatarBackgroundColor?: string;
}

export interface AuthorInfoProps {
  authorName: string;
  date: string;
  platformLogoUrl?: string;
}

export interface DoctorsListProps {
  doctors: Array<{
    id: string;
    title: string;
    slug: string;
    imageUrl?: string;
    specialization?: string;
    // КРИТИЧНО: Услуги врача для Level 3 slider
    relatedServices?: Array<{
      id: string;
      title: string;
      slug: string;
    }>;
  }>;
}

export interface ServicesBadgesProps {
  services: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
}
