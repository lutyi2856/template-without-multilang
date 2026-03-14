import { MetadataRoute } from 'next';

/**
 * Динамический sitemap для SEO
 * 
 * Генерирует XML sitemap со всеми страницами сайта
 * В будущем нужно добавить динамические страницы из WordPress (врачи, услуги, статьи)
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unident.ru';
  const currentDate = new Date();

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/doctors`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/prices`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // TODO: Добавить динамические страницы из WordPress
  // const doctors = await getDoctorsForSitemap();
  // const services = await getServicesForSitemap();
  // const posts = await getPostsForSitemap();

  // const dynamicPages = [
  //   ...doctors.map(doctor => ({
  //     url: `${baseUrl}/doctors/${doctor.slug}`,
  //     lastModified: new Date(doctor.modifiedAt),
  //     changeFrequency: 'monthly' as const,
  //     priority: 0.7,
  //   })),
  //   ...services.map(service => ({
  //     url: `${baseUrl}/services/${service.slug}`,
  //     lastModified: new Date(service.modifiedAt),
  //     changeFrequency: 'weekly' as const,
  //     priority: 0.8,
  //   })),
  // ];

  return [...staticPages];
}

