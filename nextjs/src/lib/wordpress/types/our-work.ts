/**
 * Типы для Our Works (Наши работы)
 */

export interface OurWorkImage {
  sourceUrl: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface OurWorkDoctor {
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
    specialization?: string;
  };
  relatedServices?: Array<{
    id: string;
    databaseId: number;
    title: string;
    slug: string;
  }>;
}

export interface OurWorkClinic {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
}

export interface OurWorkService {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
}

export interface OurWorkServiceCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
}

export interface OurWork {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  // Поля напрямую на OurWork (как в Review)
  photoBefore?: OurWorkImage;
  photoAfter?: OurWorkImage;
  generalPhoto?: OurWorkImage;
  useGeneralPhoto?: boolean;
  relatedDoctors?: OurWorkDoctor[];
  relatedClinics?: OurWorkClinic[];
  relatedServices?: OurWorkService[]; // Добавлено: прямая связь Our Work -> Services
  serviceCategories?: {
    nodes: OurWorkServiceCategory[];
  };
  // Обработанные данные (после API функции)
  doctors?: Array<{
    id: string;
    name: string;
    specialty?: string;
    avatar?: string;
  }>;
  services?: OurWorkService[];
  clinics?: OurWorkClinic[];
}
