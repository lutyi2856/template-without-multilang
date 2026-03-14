import { gql } from '@apollo/client';

/**
 * GraphQL запросы для WordPress меню
 * 
 * Используется для получения меню с ACF полями:
 * - Бейджи с счетчиками (badge_count)
 * - Иконки меню (menu_icon)
 * - Флаг мега-меню (has_mega_menu)
 */

/**
 * Фрагмент для ACF полей пункта меню
 */
export const MENU_ITEM_ACF_FIELDS = gql`
  fragment MenuItemACFFields on MenuItem {
    id
    databaseId
    label
    url
    path
    target
    cssClasses
    order
    parentId
    # icon - slug иконки из ACF Select
    icon
    # iconSvg - inline SVG для пользовательских иконок из Media Library
    iconSvg
    # badgeCount - ДИНАМИЧЕСКИЙ счетчик (регистрируется через custom resolver)
    # Автоматически определяется по URL пункта меню:
    # - reviews/отзывы → wp_count_posts('reviews')
    # - promotions/акции → wp_count_posts('promotions')
    # - остальные → ACF badge_count (fallback)
    badgeCount
    # ACF поля для пунктов меню
    menuItemSettings {
      hasMegaMenu
    }
    # Категории для мега-меню (если пусто - показываются все)
    megaMenuCategories {
      id
      databaseId
      name
      slug
    }
  }
`;

/**
 * Получить меню по slug/location
 */
export const GET_MENU_BY_LOCATION = gql`
  ${MENU_ITEM_ACF_FIELDS}
  query GetMenuByLocation($location: MenuLocationEnum!) {
    menu(id: $location, idType: LOCATION) {
      id
      name
      slug
      menuItems(first: 50) {
        nodes {
          ...MenuItemACFFields
          childItems {
            nodes {
              ...MenuItemACFFields
              childItems {
                nodes {
                  ...MenuItemACFFields
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Получить главное меню (primary location)
 */
export const GET_PRIMARY_MENU = gql`
  ${MENU_ITEM_ACF_FIELDS}
  query GetPrimaryMenu {
    menu(id: "primary", idType: LOCATION) {
      id
      name
      slug
      menuItems(first: 50, where: { parentId: 0 }) {
        nodes {
          ...MenuItemACFFields
          childItems {
            nodes {
              ...MenuItemACFFields
            }
          }
        }
      }
    }
  }
`;

/**
 * Получить меню по ID
 */
export const GET_MENU_BY_ID = gql`
  ${MENU_ITEM_ACF_FIELDS}
  query GetMenuById($id: ID!) {
    menu(id: $id, idType: DATABASE_ID) {
      id
      name
      slug
      menuItems(first: 50) {
        nodes {
          ...MenuItemACFFields
          childItems {
            nodes {
              ...MenuItemACFFields
            }
          }
        }
      }
    }
  }
`;

/**
 * Получить левое меню футера (footer_left location)
 */
export const GET_FOOTER_LEFT_MENU = gql`
  ${MENU_ITEM_ACF_FIELDS}
  query GetFooterLeftMenu {
    menu(id: "footer_left", idType: LOCATION) {
      id
      name
      slug
      menuItems(first: 50, where: { parentId: 0 }) {
        nodes {
          ...MenuItemACFFields
          childItems {
            nodes {
              ...MenuItemACFFields
            }
          }
        }
      }
    }
  }
`;

/**
 * Получить правое меню футера (footer_right location)
 */
export const GET_FOOTER_RIGHT_MENU = gql`
  ${MENU_ITEM_ACF_FIELDS}
  query GetFooterRightMenu {
    menu(id: "footer_right", idType: LOCATION) {
      id
      name
      slug
      menuItems(first: 50, where: { parentId: 0 }) {
        nodes {
          ...MenuItemACFFields
          childItems {
            nodes {
              ...MenuItemACFFields
            }
          }
        }
      }
    }
  }
`;

/**
 * Получить все доступные меню
 */
export const GET_ALL_MENUS = gql`
  query GetAllMenus {
    menus(first: 20) {
      nodes {
        id
        databaseId
        name
        slug
        locations
        count
      }
    }
  }
`;
