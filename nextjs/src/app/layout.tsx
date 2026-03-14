import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { HeaderV2 } from '@/components/figma/header';
import { Footer } from '@/components/figma/footer';
import { OrganizationStructuredData } from '@/components/seo';
import { WebVitals, GoogleAnalytics, YandexMetrika } from '@/components/analytics';
import { AccessibilityScript } from './accessibility-script';
import '@/styles/globals.css';

/**
 * Gilroy - локальный шрифт (gilroyfont.com, free for commercial use)
 * Geometric sans-serif, поддержка кириллицы.
 * 5 начертаний: Light, Regular, Medium, SemiBold, Bold
 */
const gilroy = localFont({
  src: [
    { path: './fonts/Gilroy-Light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/Gilroy-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Gilroy-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Gilroy-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/Gilroy-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

/**
 * Layout с Header/Footer: всегда динамический — данные из WP Option Pages (headerSettings, footerSettings)
 * должны отображаться актуально. force-dynamic отключает кэш layout.
 */
export const dynamic = 'force-dynamic';

/**
 * Viewport configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#526AC2',
};

/**
 * Metadata для SEO оптимизации
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://unident.ru'),
  
  title: {
    default: 'УниДент - Стоматология в Москве | Имплантация, лечение зубов',
    template: '%s | УниДент',
  },
  
  description: 'Стоматологическая клиника УниДент в Москве. Опытные врачи со стажем от 10 лет, современное оборудование. Имплантация зубов, протезирование, лечение кариеса, отбеливание. Запись онлайн 24/7.',
  
  keywords: [
    'стоматология Москва',
    'имплантация зубов',
    'лечение зубов',
    'протезирование зубов',
    'стоматолог Москва',
    'УниДент',
    'отбеливание зубов',
    'лечение кариеса',
    'стоматологическая клиника',
    'зубной врач',
  ],
  
  authors: [{ name: 'УниДент', url: 'https://unident.ru' }],
  creator: 'УниДент',
  publisher: 'УниДент',
  
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://unident.ru',
    siteName: 'УниДент',
    title: 'УниДент - Стоматология в Москве',
    description: 'Здоровье и красота вашей улыбки - наша главная цель. Опытные врачи, современное оборудование, доступные цены.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'УниДент - Стоматологическая клиника в Москве',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'УниДент - Стоматология в Москве',
    description: 'Здоровье и красота вашей улыбки - наша главная цель',
    images: ['/images/og-image.jpg'],
  },
  
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  manifest: '/manifest.webmanifest',
  
  // TODO: Добавить после настройки Google Search Console и Yandex Webmaster
  // verification: {
  //   google: 'ваш-код-google-search-console',
  //   yandex: 'ваш-код-yandex-webmaster',
  // },
  
  alternates: {
    canonical: 'https://unident.ru',
    languages: {
      'ru-RU': 'https://unident.ru',
    },
  },
  
  category: 'healthcare',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ru" className={gilroy.variable}>
      <head>
        {/* Structured Data для SEO */}
        <OrganizationStructuredData
          name="УниДент"
          url="https://unident.ru"
          logo="https://unident.ru/images/unident-logo.svg"
          description="Стоматологическая клиника УниДент в Москве. Опытные врачи, современное оборудование, доступные цены."
          telephone="+7 (999) 999-99-99"
          email="info@unident.ru"
          address={{
            streetAddress: "ул. Чайковского, 1",
            addressLocality: "Москва",
            addressRegion: "Москва",
            postalCode: "125009",
            addressCountry: "RU",
          }}
          openingHours={[
            "Mo-Fr 10:00-22:00",
            "Sa-Su 09:00-16:00",
          ]}
          priceRange="₽₽"
          aggregateRating={{
            ratingValue: 5.0,
            reviewCount: 7842,
          }}
        />
      </head>
      <body className="font-gilroy antialiased">
        <HeaderV2 />
        {children}
        <Footer />
        
        {/* Analytics Scripts - в конце body для оптимизации FCP */}
        <GoogleAnalytics />
        <YandexMetrika />
        <WebVitals />
        
        {/* Accessibility Scripts */}
        <AccessibilityScript />
      </body>
    </html>
  );
}

