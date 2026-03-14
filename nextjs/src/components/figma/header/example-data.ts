/**
 * Примерные данные для Header компонента
 */

import type { HeaderProps } from './types';

export const exampleHeaderData: HeaderProps = {
  // Языки
  languages: [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ],
  currentLanguage: 'ru',

  // Социальные сети
  socialLinks: [
    { name: 'Telegram', url: '#', icon: 'telegram', ariaLabel: 'Telegram' },
    { name: 'WhatsApp', url: '#', icon: 'whatsapp', ariaLabel: 'WhatsApp' },
    { name: 'VK', url: '#', icon: 'vk', ariaLabel: 'VK' },
    { name: 'Instagram', url: '#', icon: 'instagram', ariaLabel: 'Instagram' },
    { name: 'Одноклассники', url: '#', icon: 'ok', ariaLabel: 'Одноклассники' },
  ],

  // Контактная информация
  contactInfo: {
    phone: '8 999 999-99-99',
    email: 'info@unident.ru',
    workingHours: {
      weekdays: '10:00 - 22:00',
      weekend: '9:00 - 16:00',
    },
  },

  // Промо текст
  promoText: 'Имплантация за 3750 ₽/мес.',

  // Клиники
  clinics: [
    {
      id: '1',
      name: 'УниДент на Невском',
      address: 'Невский проспект, д. 100',
      metro: 'Площадь Восстания',
      metroLine: 'red',
      phone: '8 999 999-99-99',
    },
    {
      id: '2',
      name: 'УниДент на Московской',
      address: 'Московский проспект, д. 200',
      metro: 'Московская',
      metroLine: 'blue',
      phone: '8 999 999-99-98',
    },
    {
      id: '3',
      name: 'УниДент на Василеостровской',
      address: 'Средний проспект В.О., д. 50',
      metro: 'Василеостровская',
      metroLine: 'green',
      phone: '8 999 999-99-97',
    },
  ],

  // Рейтинг
  rating: {
    value: 5.0,
    maxValue: 5,
    source: 'Google Карты',
    reviewCount: 7842,
  },

  // Навигация
  navigation: [
    {
      id: '1',
      label: 'Услуги',
      href: '/services',
      icon: 'list',
      children: [
        { id: '1-1', label: 'Имплантация', href: '/services/implantation' },
        { id: '1-2', label: 'Протезирование', href: '/services/prosthetics' },
        { id: '1-3', label: 'Лечение зубов', href: '/services/treatment' },
        { id: '1-4', label: 'Отбеливание', href: '/services/whitening' },
      ],
    },
    {
      id: '2',
      label: 'О клинике',
      href: '/about',
      children: [
        { id: '2-1', label: 'О нас', href: '/about/us' },
        { id: '2-2', label: 'Наша команда', href: '/about/team' },
        { id: '2-3', label: 'Оборудование', href: '/about/equipment' },
      ],
    },
    {
      id: '3',
      label: 'Врачи',
      href: '/doctors',
    },
    {
      id: '4',
      label: 'Акции',
      href: '/promotions',
      badge: '3',
      badgeVariant: 'new', // С синим фоном
    },
    {
      id: '5',
      label: 'Кейсы',
      href: '/our-works',
    },
    {
      id: '6',
      label: 'Цены',
      href: '/prices',
    },
    {
      id: '7',
      label: 'Отзывы',
      href: '/reviews',
      badge: '1294',
      badgeVariant: 'count', // Без фона, только число
    },
    {
      id: '8',
      label: 'Пациентам',
      href: '/patients',
      children: [
        { id: '8-1', label: 'Подготовка к приему', href: '/patients/preparation' },
        { id: '8-2', label: 'Часто задаваемые вопросы', href: '/patients/faq' },
        { id: '8-3', label: 'Гарантии', href: '/patients/warranty' },
      ],
    },
    {
      id: '9',
      label: 'Контакты',
      href: '/contacts',
    },
  ],

  // Логотип
  logo: { url: '/logo.svg' },

  // CTA кнопка
  ctaText: 'Связаться с нами',
  ctaHref: '/contacts',

  // Ссылки
  showAccessibilityLink: true,
  showSiteMap: true,
};
