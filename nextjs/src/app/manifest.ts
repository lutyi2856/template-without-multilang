import { MetadataRoute } from 'next';

/**
 * Web App Manifest для PWA
 * 
 * Позволяет пользователям устанавливать приложение на домашний экран
 * Обеспечивает нативный вид приложения
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'УниДент - Стоматологическая клиника',
    short_name: 'УниДент',
    description: 'Стоматологическая клиника УниДент в Москве. Опытные врачи, современное оборудование, доступные цены. Запись онлайн 24/7.',
    
    start_url: '/',
    scope: '/',
    display: 'standalone',
    
    background_color: '#FFFFFF',
    theme_color: '#526AC2',
    
    orientation: 'portrait-primary',
    
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    
    screenshots: [
      { src: '/screenshots/desktop-1.png', sizes: '1280x720', type: 'image/png' },
      { src: '/screenshots/mobile-1.png', sizes: '750x1334', type: 'image/png' },
    ],
    
    categories: ['health', 'medical', 'lifestyle'],
    
    shortcuts: [
      {
        name: 'Запись на прием',
        short_name: 'Запись',
        description: 'Записаться на прием к врачу',
        url: '/appointment',
        icons: [
          {
            src: '/icons/shortcut-appointment.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Наши врачи',
        short_name: 'Врачи',
        description: 'Посмотреть список врачей',
        url: '/doctors',
        icons: [
          {
            src: '/icons/shortcut-doctors.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Услуги',
        short_name: 'Услуги',
        description: 'Посмотреть список услуг',
        url: '/services',
        icons: [
          {
            src: '/icons/shortcut-services.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Контакты',
        short_name: 'Контакты',
        description: 'Контактная информация',
        url: '/contacts',
        icons: [
          {
            src: '/icons/shortcut-contacts.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
    ],
    
    prefer_related_applications: false,
    
    // Дополнительные поля для улучшенного PWA опыта
    id: '/',
    lang: 'ru',
    dir: 'ltr',
  };
}

