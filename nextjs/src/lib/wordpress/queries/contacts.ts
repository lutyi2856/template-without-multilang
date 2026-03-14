import { gql } from '@apollo/client';

/**
 * GraphQL запросы для Contacts Settings Option Page
 *
 * Получение всех данных страницы контактов:
 * - Базовые контакты (телефон, email, соцсети)
 * - Карта клиник (заголовок)
 * - Блок преимуществ (заголовок, описание, карточки с иконками)
 * - Баннер (заголовок, описание, кнопка, изображения)
 */
export const GET_CONTACTS_SETTINGS = gql`
  query GetContactsSettings {
    contactsSettings {
      phone
      email
      socialContacts {
        name
        icon
        iconSvg
        url
      }
      mapTitle
      advTitle
      advDescription
      advItems {
        icon
        iconSvg
        title
        description
      }
      banner {
        heading
        description
        buttonText
        buttonUrl
        logo {
          url
          width
          height
        }
        image {
          url
          width
          height
        }
      }
    }
  }
`;
