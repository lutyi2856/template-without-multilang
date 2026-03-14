import { gql } from '@apollo/client';

/**
 * GraphQL запросы для Footer Settings Option Page и данных футера
 */

/**
 * Получить настройки футера (копирайт, дисклеймер, подпись под телефоном, часы, ссылка на схему)
 */
export const GET_FOOTER_SETTINGS = gql`
  query GetFooterSettings {
    footerSettings {
      logoMode
      logo {
        url
        alt
        width
        height
      }
      logoIcon
      logoIconSvg
      phoneCaption
      addressSchemeUrl
      workingHours {
        weekdays
        weekend
      }
      copyrightLeft
      disclaimerCenter
      socialLinks {
        name
        icon
        iconSvg
        url
      }
    }
  }
`;
