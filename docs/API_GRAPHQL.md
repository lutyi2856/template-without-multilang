# GraphQL API документация - УниДент

> Документация всех GraphQL запросов для headless WordPress + Next.js проекта
> Дата создания: 2026-01-14

## 📋 Содержание

- [Меню](#меню)
- [Header данные](#header-данные)
- [Врачи](#врачи)
- [Услуги](#услуги)
- [Акции](#акции)
- [Кейсы](#кейсы)
- [Отзывы](#отзывы)
- [Страницы](#страницы)

---

## Меню

### Получить главное меню (Primary Menu)

**Query:**

```graphql
query GetPrimaryMenu {
  menu(id: "primary", idType: LOCATION) {
    id
    name
    slug
    menuItems(first: 50, where: { parentId: 0 }) {
      nodes {
        id
        databaseId
        label
        url
        path
        target
        cssClasses
        order
        parentId
        menuItemSettings {
          badgeCount
          icon
          hasMegaMenu
        }
        childItems {
          nodes {
            id
            databaseId
            label
            url
            path
            menuItemSettings {
              icon
            }
          }
        }
      }
    }
  }
}
```

**Пример ответа:**

```json
{
  "data": {
    "menu": {
      "id": "dGVybTo2",
      "name": "Primary Menu",
      "slug": "primary-menu",
      "menuItems": {
        "nodes": [
          {
            "id": "cG9zdDoxMjM=",
            "databaseId": 123,
            "label": "Услуги",
            "url": "https://unident.com/services",
            "path": "/services",
            "target": null,
            "cssClasses": [],
            "order": 1,
            "parentId": null,
            "menuItemSettings": {
              "badgeCount": null,
              "icon": "<svg width=\"20\" height=\"20\">...</svg>",
              "hasMegaMenu": true
            },
            "childItems": {
              "nodes": [
                {
                  "id": "cG9zdDoxMjQ=",
                  "databaseId": 124,
                  "label": "Все услуги",
                  "url": "https://unident.com/services",
                  "path": "/services",
                  "menuItemSettings": {
                    "icon": null
                  }
                }
              ]
            }
          },
          {
            "id": "cG9zdDoxMjU=",
            "databaseId": 125,
            "label": "Акции",
            "url": "https://unident.com/promotions",
            "path": "/promotions",
            "target": null,
            "cssClasses": [],
            "order": 4,
            "parentId": null,
            "menuItemSettings": {
              "badgeCount": 3,
              "icon": "<svg>...</svg>",
              "hasMegaMenu": false
            },
            "childItems": {
              "nodes": []
            }
          }
        ]
      }
    }
  }
}
```

**TypeScript типы:**

```typescript
interface Menu {
  id: string;
  name: string;
  slug: string;
  menuItems?: {
    nodes: MenuItem[];
  };
}

interface MenuItem {
  id: string;
  databaseId: number;
  label: string;
  url: string;
  path?: string;
  target?: string | null;
  cssClasses?: string[] | null;
  order?: number;
  parentId?: number | null;
  menuItemSettings?: MenuItemSettings | null;
  childItems?: {
    nodes: MenuItem[];
  };
}

interface MenuItemSettings {
  badgeCount?: number | null;
  icon?: string | null; // Inline SVG код
  hasMegaMenu?: boolean | null;
}
```

**Использование в коде:**

```typescript
// src/lib/wordpress/queries/menu.ts
import { GET_PRIMARY_MENU } from '@/lib/wordpress/queries/menu';
import { apolloClient } from '@/lib/wordpress/apollo-client';

const { data } = await apolloClient.query({
  query: GET_PRIMARY_MENU,
});

const menu = data.menu;
```

---

## Header данные

### Получить все данные для header

**Query:**

```graphql
query GetHeaderData {
  # Меню
  menu(id: "primary", idType: LOCATION) {
    id
    name
    menuItems(first: 50, where: { parentId: 0 }) {
      nodes {
        id
        databaseId
        label
        path
        menuItemSettings {
          badgeCount
          icon
        }
        childItems {
          nodes {
            id
            databaseId
            label
            path
            menuItemSettings {
              icon
            }
          }
        }
      }
    }
  }

  # Header Settings (ACF Option Page)
  headerSettings {
    phone
    email
    workingHours {
      weekdays
      weekend
    }
    locationsCount
    reviewsCount
    featuredPromotion {
      id
      databaseId
      title
      promotionRelationships {
        relatedServices {
          edges {
            node {
              id
              title
              serviceRelationships {
                relatedPrices {
                  edges {
                    node {
                      id
                      priceFields {
                        promoPrice
                        currency
                        period
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    socialLinks {
      name
      icon
      url
    }
  }
}
```

**Пример ответа:**

```json
{
  "data": {
    "menu": { ... },
    "headerSettings": {
      "phone": "+7 (495) 123-45-67",
      "email": "info@unident.ru",
      "workingHours": {
        "weekdays": "Пн-Сб 10:00-22:00",
        "weekend": "Вс 9:00-16:00"
      },
      "locationsCount": 3,
      "reviewsCount": 1294,
      "featuredPromotion": {
        "id": "cG9zdDo0NTY=",
        "databaseId": 456,
        "title": "Имплантация со скидкой",
        "promotionRelationships": {
          "relatedServices": {
            "edges": [
              {
                "node": {
                  "id": "cG9zdDo3ODk=",
                  "title": "Имплантация",
                  "serviceRelationships": {
                    "relatedPrices": {
                      "edges": [
                        {
                          "node": {
                            "id": "cG9zdDoxMjM0",
                            "priceFields": {
                              "promoPrice": 3750,
                              "currency": "₽",
                              "period": "мес"
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      },
      "socialLinks": [
        {
          "name": "Telegram",
          "icon": "<svg>...</svg>",
          "url": "https://t.me/unident"
        },
        {
          "name": "WhatsApp",
          "icon": "<svg>...</svg>",
          "url": "https://wa.me/74951234567"
        }
      ]
    }
  }
}
```

**TypeScript типы:**

```typescript
interface HeaderData {
  menu: Menu;
  settings: HeaderSettings;
}

interface HeaderSettings {
  phone?: string;
  email?: string;
  workingHours?: {
    weekdays: string;
    weekend: string;
  };
  locationsCount?: number;
  reviewsCount?: number;
  featuredPromotion?: Promotion;
  socialLinks?: SocialLink[];
}

interface SocialLink {
  name: string;
  icon: string; // Inline SVG
  url: string;
}
```

**Использование в коде:**

```typescript
// src/lib/wordpress/api-header.ts
export async function getHeaderData() {
  const { data } = await apolloClient.query({
    query: GET_HEADER_DATA,
  });

  return {
    menu: data.menu,
    settings: data.headerSettings,
  };
}
```

---

## Врачи

### Получить список врачей

**Query:**

```graphql
query GetDoctors($first: Int = 50, $after: String) {
  doctors(first: $first, after: $after) {
    edges {
      node {
        id
        databaseId
        title
        slug
        excerpt
        featuredImage {
          node {
            sourceUrl
            mediaDetails {
              width
              height
            }
          }
        }
        doctorFields {
          specialty
          experience
          rating
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Variables:**

```json
{
  "first": 50,
  "after": null
}
```

---

## Услуги

### Получить список услуг

**Query:**

```graphql
query GetServices($first: Int = 50, $after: String) {
  services(first: $first, after: $after) {
    edges {
      node {
        id
        databaseId
        title
        slug
        excerpt
        content
        serviceCategories {
          nodes {
            id
            name
            slug
          }
        }
        serviceRelationships {
          relatedPrices {
            edges {
              node {
                id
                priceFields {
                  regularPrice
                  promoPrice
                  currency
                  period
                }
              }
            }
          }
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

## Акции

### Получить список акций

**Query:**

```graphql
query GetPromotions($first: Int = 50) {
  promotions(first: $first) {
    edges {
      node {
        id
        databaseId
        title
        slug
        excerpt
        content
        featuredImage {
          node {
            sourceUrl
            mediaDetails {
              width
              height
            }
          }
        }
        promotionRelationships {
          relatedServices {
            edges {
              node {
                id
                title
                slug
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Кейсы

### Получить список кейсов

**Query:**

```graphql
query GetCases($first: Int = 50) {
  cases(first: $first) {
    edges {
      node {
        id
        databaseId
        title
        slug
        excerpt
        content
        featuredImage {
          node {
            sourceUrl
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
}
```

---

## Отзывы

### Получить список отзывов

**Query:**

```graphql
query GetReviews($first: Int = 50, $after: String) {
  reviews(first: $first, after: $after) {
    edges {
      node {
        id
        databaseId
        title
        content
        date
        reviewFields {
          rating
          authorName
          source
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

## Страницы

### Получить страницу по URI

**Query:**

```graphql
query GetPageByUri($uri: String!) {
  pageBy(uri: $uri) {
    id
    databaseId
    title
    content
    slug
    date
    modified
    featuredImage {
      node {
        sourceUrl
        mediaDetails {
          width
          height
        }
      }
    }
    seo {
      title
      metaDesc
      canonical
      opengraphTitle
      opengraphDescription
      opengraphImage {
        sourceUrl
      }
    }
  }
}
```

**Variables:**

```json
{
  "uri": "/about"
}
```

**Пример ответа:**

```json
{
  "data": {
    "pageBy": {
      "id": "cG9zdDoxMjM=",
      "databaseId": 123,
      "title": "О клинике",
      "content": "<h1>О клинике</h1><p>...</p>",
      "slug": "about",
      "date": "2026-01-14T10:00:00",
      "modified": "2026-01-14T12:00:00",
      "featuredImage": null,
      "seo": {
        "title": "О клинике - УниДент",
        "metaDesc": "Информация о стоматологической клинике УниДент",
        "canonical": "https://unident.com/about",
        "opengraphTitle": "О клинике - УниДент",
        "opengraphDescription": "Информация о стоматологической клинике УниДент",
        "opengraphImage": null
      }
    }
  }
}
```

---

## Общие рекомендации

### Пагинация

Используйте cursor-based pagination для больших списков:

```graphql
query GetDoctors($first: Int = 50, $after: String) {
  doctors(first: $first, after: $after) {
    edges {
      node { ... }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Фильтрация

Используйте `where` параметры для фильтрации:

```graphql
query GetPublishedPosts {
  posts(where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
    nodes { ... }
  }
}
```

### Кэширование

- Используйте Apollo Client `fetchPolicy` для кэширования
- Server Components: используйте `next: { revalidate: 3600 }` для ISR
- Client Components: используйте SWR с `dedupingInterval`

### Performance

- Запрашивайте только нужные поля (не используйте `...FullFragment`)
- Используйте GraphQL fragments для переиспользования
- Избегайте N+1 queries - используйте `edges` и `nodes`
- Ограничивайте глубину вложенности (max 5 levels)

---

## Endpoints

**GraphQL Endpoint:**
- Development: `http://localhost:8000/graphql`
- Production: `https://unident.com/graphql`

**GraphiQL IDE:**
- Development: `http://localhost:8000/graphql`
- Production: Отключен в production (безопасность)

---

## Аутентификация

Для запросов, требующих аутентификации (preview, drafts):

```typescript
const client = new ApolloClient({
  uri: process.env.WORDPRESS_GRAPHQL_ENDPOINT,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## Troubleshooting

### Проблема: "Cannot query field X"

**Причина:** Поле не зарегистрировано в GraphQL схеме.

**Решение:**
1. Проверить ACF field group: `show_in_graphql: 1`
2. Проверить `graphql_field_name`
3. Очистить кэш WPGraphQL

### Проблема: Null values для ACF полей

**Причина:** ACF Option Pages требуют manual registration.

**Решение:** Проверить `unident-acf-fields.php` → `register_graphql_field()`

### Проблема: Медленные запросы

**Решение:**
- Добавить индексы в базу данных
- Использовать pagination (`first: 50`)
- Уменьшить глубину вложенности
- Включить Query Complexity limit

---

**Дата обновления:** 2026-01-14  
**Версия:** 1.0.0
