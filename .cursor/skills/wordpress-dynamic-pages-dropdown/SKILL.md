---
name: wordpress-dynamic-pages-dropdown
description: Create WordPress dynamic pages with dropdown menu navigation. Use when implementing menu items with sub-pages, creating catch-all routing, or adding hover-based dropdown menus.
---

# WordPress Dynamic Pages & Dropdown Menu

## When to Use

**Use this skill when:**
- Creating new menu section with sub-pages (e.g., "О клинике", "Для пациентов")
- Implementing dropdown menu with hover functionality
- Setting up dynamic routing for WordPress pages
- Need to create parent page with children pages
- Integrating GraphQL queries for pages with RankMath SEO

**This skill covers:**
1. Backend: Creating WordPress pages via MCP
2. Frontend: Catch-all dynamic routing `[...slug]/page.tsx`
3. Navigation: Hover-based dropdown menu
4. SEO: RankMath metadata integration
5. Git workflow: Branch, commit, PR, merge

---

## Quick Reference

### 1. Create WordPress Pages (MCP)

```typescript
// Create parent page
await CallMcpTool({
  server: 'user-wordpress-mcp',
  toolName: 'wp_add_page',
  arguments: {
    title: 'О клинике',
    content: '<p>Главная страница раздела...</p>',
    status: 'publish'
  }
});

// Create child pages with parent_id
await CallMcpTool({
  server: 'user-wordpress-mcp',
  toolName: 'wp_add_page',
  arguments: {
    title: 'История клиники',
    content: '<p>История нашей клиники...</p>',
    status: 'publish',
    parent_id: 71 // ID родительской страницы
  }
});
```

### 2. Catch-all Route Structure

```
nextjs/src/app/
  [...slug]/
    page.tsx         # Динамический роутинг для всех WordPress страниц
```

### 3. Hover Dropdown Component

```typescript
// nav-dropdown.tsx
'use client';
import { useState } from 'react';

export function NavDropdown({ item }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Parent link - кликабелен */}
      <a href={item.href}>{item.label}</a>
      
      {/* Dropdown - показывается при hover */}
      {isOpen && (
        <div className="absolute pt-2">
          {item.children?.map(child => (
            <a href={child.href}>{child.label}</a>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Step-by-Step Implementation

### Phase 1: Backend - WordPress Pages

#### Step 1.1: Find Parent Page ID & Check for Duplicates

**КРИТИЧНО:** Всегда проверяй существующие страницы перед созданием новых!

```bash
# Через WordPress MCP
CallMcpTool('user-wordpress-mcp', 'wp_pages_search', {
  search: 'О клинике'
})
```

**Сценарий 1: Одна страница найдена ✅**
```json
{
  "id": 71,
  "title": "О клинике",
  "slug": "about"
}
```
→ Используй ID: 71 для создания дочерних страниц

**Сценарий 2: Несколько страниц найдено ⚠️**
```json
[
  {
    "id": 28,
    "title": "О клинике",
    "slug": "o-klinike"
  },
  {
    "id": 71,
    "title": "О клинике",
    "slug": "about"
  }
]
```

**Проблема:** Дубликаты! Нужно выбрать правильную страницу.

**Решение:**

1. **Проверь меню** - какая страница используется в PRIMARY menu?
   ```graphql
   query {
     menu(id: "PRIMARY", idType: LOCATION) {
       menuItems {
         nodes {
           label
           path
           databaseId
         }
       }
     }
   }
   ```

2. **Проверь дочерние страницы** - какая parent_id у существующих детей?
   ```bash
   CallMcpTool('user-wordpress-mcp', 'wp_pages_search', {
     search: 'История клиники'
   })
   # Смотри parent_id
   ```

3. **Выбери правильную страницу:**
   - ✅ Предпочитай английский slug (`/about/`) - лучше для SEO
   - ✅ Используй ту, что в меню
   - ✅ Используй ту, к которой привязаны дочерние страницы

4. **Удали дубликат:**
   ```bash
   # Удалить лишнюю страницу (например, ID: 28)
   docker exec wp-new-wordpress wp post delete 28 --force --allow-root
   ```

5. **Очисти кэш:**
   ```bash
   docker exec wp-new-wordpress wp cache flush --allow-root
   Remove-Item -Path "nextjs\.next" -Recurse -Force
   ```

**Итого:** Используй ID только ОДНОЙ правильной страницы.

#### Step 1.2: Create Child Pages

**ВАЖНО:** Создавай страницы с `parent_id` чтобы они были дочерними:

```typescript
// История клиники
await CallMcpTool({
  server: 'user-wordpress-mcp',
  toolName: 'wp_add_page',
  arguments: {
    title: 'История клиники',
    content: '<h2>Наша история</h2><p>С 1990 года...</p>',
    status: 'publish',
    parent_id: 71 // Родитель: "О клинике"
  }
});

// Наша команда
await CallMcpTool({
  server: 'user-wordpress-mcp',
  toolName: 'wp_add_page',
  arguments: {
    title: 'Наша команда',
    content: '<h2>Команда врачей</h2><p>Наши специалисты...</p>',
    status: 'publish',
    parent_id: 71
  }
});
```

#### Step 1.3: Add to WordPress Menu

**ВРУЧНУЮ через WordPress админку:**

1. Зайти в "Внешний вид" → "Меню"
2. Выбрать PRIMARY menu
3. Добавить созданные страницы как подпункты к "О клинике"
4. Сохранить меню

**Почему вручную?** WordPress MCP не поддерживает `wp_add_menu_item`, проще через админку.

---

### Phase 2: Frontend - Dynamic Routing

#### Step 2.1: Create GraphQL Queries

**Создать файл:** `nextjs/src/lib/wordpress/queries/pages.ts`

```typescript
import { gql } from '@apollo/client';

/**
 * Фрагмент базовых полей страницы
 */
export const PAGE_FIELDS = gql`
  fragment PageFields on Page {
    id
    databaseId
    title
    content
    slug
    uri
    date
    modified
    parent {
      node {
        id
        slug
        uri
      }
    }
    featuredImage {
      node {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
  }
`;

/**
 * Получить страницу по slug/URI
 */
export const GET_PAGE_BY_SLUG = gql`
  ${PAGE_FIELDS}
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      ...PageFields
      seo {
        title
        description
        openGraph {
          title
          description
          image {
            url
          }
        }
      }
    }
  }
`;

/**
 * Получить все slugs для generateStaticParams
 */
export const GET_ALL_PAGES_SLUGS = gql`
  query GetAllPagesSlugs {
    pages(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        uri
        parent {
          node {
            slug
          }
        }
      }
    }
  }
`;
```

**КРИТИЧНО:** 
- RankMath SEO использует `seo { title, description, openGraph { ... } }`
- **НЕТ** поля `excerpt` для `Page` типа!
- Используй `URI` (например: `/o-klinike/`) для запросов

#### Step 2.2: Create TypeScript Types

**Создать файл:** `nextjs/src/types/page.ts`

```typescript
export interface WordPressPage {
  id: string;
  databaseId: number;
  title: string;
  content: string;
  slug: string;
  uri: string;
  date: string;
  modified: string;
  parent?: {
    node: {
      id: string;
      slug: string;
      uri: string;
    };
  };
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    };
  };
  seo?: {
    title: string;
    description: string;
    openGraph?: {
      title: string;
      description: string;
      image?: {
        url: string;
      };
    };
  };
}

export interface PageBySlugResponse {
  page: WordPressPage | null;
}

export interface AllPagesSlugsResponse {
  pages: {
    nodes: Array<{
      slug: string;
      uri: string;
      parent?: {
        node: {
          slug: string;
        };
      };
    }>;
  };
}
```

#### Step 2.3: Create Catch-all Route

**Создать файл:** `nextjs/src/app/[...slug]/page.tsx`

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getApolloClient } from '@/lib/wordpress/client';
import { GET_PAGE_BY_SLUG, GET_ALL_PAGES_SLUGS } from '@/lib/wordpress/queries';
import type { PageBySlugResponse, AllPagesSlugsResponse } from '@/types/page';
import { Container } from '@/components/design-system/container';
import Link from 'next/link';

// ISR: Revalidate каждый час
export const revalidate = 3600;

/**
 * Статические роуты - НЕ обрабатывать через catch-all
 */
const STATIC_ROUTES = [
  'doctors',
  'services',
  'contacts',
  'reviews',
  'promotions',
  'prices',
  'patients',
  'cases',
];

interface PageProps {
  params: {
    slug: string[];
  };
}

/**
 * generateStaticParams - SSG для всех WordPress Pages
 */
export async function generateStaticParams() {
  const client = getApolloClient();

  try {
    const { data } = await client.query<AllPagesSlugsResponse>({
      query: GET_ALL_PAGES_SLUGS,
      fetchPolicy: 'network-only',
    });

    return data.pages.nodes.map((page) => {
      // /o-klinike/istoriya/ → ['o-klinike', 'istoriya']
      const slugParts = page.uri
        .split('/')
        .filter((part) => part.length > 0);
      
      return { slug: slugParts };
    });
  } catch (error) {
    console.error('[generateStaticParams] Error:', error);
    return [];
  }
}

/**
 * generateMetadata - SEO через RankMath
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const client = getApolloClient();
  const uri = `/${params.slug.join('/')}/`;

  try {
    const { data } = await client.query<PageBySlugResponse>({
      query: GET_PAGE_BY_SLUG,
      variables: { slug: uri },
      fetchPolicy: 'network-only',
    });

    if (!data.page) {
      return {
        title: 'Страница не найдена - УниДент',
      };
    }

    const page = data.page;
    const seoTitle = page.seo?.title || page.title;
    const seoDescription = page.seo?.description || '';

    return {
      title: `${seoTitle} - УниДент`,
      description: seoDescription,
      openGraph: {
        title: page.seo?.openGraph?.title || seoTitle,
        description: page.seo?.openGraph?.description || seoDescription,
        images: page.seo?.openGraph?.image?.url
          ? [{ url: page.seo.openGraph.image.url }]
          : page.featuredImage?.node.sourceUrl
            ? [{ url: page.featuredImage.node.sourceUrl }]
            : [],
      },
    };
  } catch (error) {
    console.error('[generateMetadata] Error:', error);
    return {
      title: 'Страница не найдена - УниДент',
    };
  }
}

/**
 * PageComponent - рендеринг страницы
 */
export default async function PageComponent({ params }: PageProps) {
  const client = getApolloClient();
  const uri = `/${params.slug.join('/')}/`;

  // Защита от конфликта со статическими роутами
  if (params.slug.length === 1 && STATIC_ROUTES.includes(params.slug[0])) {
    notFound();
  }

  try {
    const { data } = await client.query<PageBySlugResponse>({
      query: GET_PAGE_BY_SLUG,
      variables: { slug: uri },
      fetchPolicy: 'network-only',
    });

    if (!data.page) {
      notFound();
    }

    const page = data.page;
    const isNestedPage = params.slug.length > 1;

    return (
      <Container size="xl" className="py-16">
        {/* Breadcrumbs для вложенных страниц */}
        {isNestedPage && page.parent && (
          <nav className="mb-6 font-gilroy text-sm text-gray-600">
            <Link href="/" className="hover:text-unident-primary">
              Главная
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/${params.slug[0]}/`}
              className="hover:text-unident-primary"
            >
              {params.slug[0]}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-unident-dark">{page.title}</span>
          </nav>
        )}

        {/* Заголовок */}
        <h1 className="mb-8 font-gilroy text-4xl font-bold text-unident-dark md:text-5xl">
          {page.title}
        </h1>

        {/* Featured Image */}
        {page.featuredImage && (
          <div className="mb-8">
            <img
              src={page.featuredImage.node.sourceUrl}
              alt={page.featuredImage.node.altText || page.title}
              width={page.featuredImage.node.mediaDetails.width}
              height={page.featuredImage.node.mediaDetails.height}
              className="h-auto w-full rounded-[20px] object-cover"
            />
          </div>
        )}

        {/* Контент из WordPress */}
        <div
          className="prose prose-lg max-w-none font-gilroy prose-headings:font-gilroy prose-headings:text-unident-dark prose-p:text-gray-700 prose-a:text-unident-primary"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Дата обновления */}
        <div className="mt-12 border-t border-gray-200 pt-6">
          <p className="font-gilroy text-sm text-gray-500">
            Последнее обновление:{' '}
            {new Date(page.modified).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Кнопка "Назад" */}
        {isNestedPage && page.parent && (
          <div className="mt-8">
            <Link
              href={`/${params.slug[0]}/`}
              className="inline-flex items-center gap-2 font-gilroy text-unident-primary hover:underline"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Назад к разделу "{params.slug[0]}"
            </Link>
          </div>
        )}
      </Container>
    );
  } catch (error) {
    console.error('[PageComponent] Error:', error);
    notFound();
  }
}
```

#### Step 2.4: Export Queries

**Обновить:** `nextjs/src/lib/wordpress/queries/index.ts`

```typescript
// ... existing exports
export * from './pages'; // Добавить!
```

---

### Phase 3: Navigation - Hover Dropdown

#### Step 3.1: Create NavDropdown Component

**Обновить:** `nextjs/src/components/figma/header/nav-dropdown.tsx`

**КРИТИЧНО:** Используй custom state management для hover, чтобы избежать проблемы с закрытием dropdown при наведении на подпункты.

```typescript
'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavDropdownProps } from './types';

export function NavDropdown({ 
  className, 
  item 
}: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger - кликабельная ссылка + стрелка */}
      <div className="flex items-center gap-1">
        {/* Icon (inline SVG) */}
        {item.icon && (
          <div 
            className="h-[24px] w-[24px]"
            dangerouslySetInnerHTML={{ __html: item.icon }} 
          />
        )}
        
        {/* Parent link - кликабелен */}
        <a 
          href={item.href || '#'}
          className="font-gilroy text-[18px] font-medium tracking-[-0.18px] text-unident-dark transition-colors hover:text-unident-primary"
        >
          {item.label}
        </a>
        
        {/* Стрелка */}
        <ChevronDown 
          className={`h-3 w-3 text-unident-dark transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
      
      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <div className="w-[240px] rounded-md border border-gray-200 bg-white p-2 shadow-lg">
            <ul className="space-y-1">
              {item.children?.map((child) => (
                <li key={child.id}>
                  <a
                    href={child.href || '#'}
                    className="block rounded-md p-3 text-sm font-medium text-unident-dark transition-colors hover:bg-gray-100 hover:text-unident-primary"
                  >
                    {child.icon && (
                      <div 
                        className="mr-2 inline-block h-[20px] w-[20px]"
                        dangerouslySetInnerHTML={{ __html: child.icon }} 
                      />
                    )}
                    <span>{child.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Почему custom state, а не Radix UI NavigationMenu?**

❌ **Radix UI NavigationMenu:**
- Dropdown закрывается при перемещении мыши от parent к content
- Сложно кастомизировать поведение hover
- Больше overhead для простого dropdown

✅ **Custom useState:**
- Полный контроль над hover state
- `onMouseEnter`/`onMouseLeave` на всём контейнере
- `pt-2` создаёт "мост" между parent и dropdown (не закрывается)
- Минимальный код, максимальная производительность

#### Step 3.2: Update Navigation Component

**Проверить:** `nextjs/src/components/figma/header/navigation.tsx`

```typescript
'use client';

import { Container } from '@/components/design-system/container';
import { SearchBar } from './search-bar';
import { NavItem } from './nav-item';
import { NavDropdown } from './nav-dropdown';
import type { NavigationProps } from './types';

export function Navigation({
  className,
  items = [],
  showSearch = true,
  searchPlaceholder,
}: NavigationProps) {
  return (
    <nav className={`hidden md:block ${className}`}>
      <Container size="xl">
        <div className="flex min-h-[60px] items-center justify-between py-2">
          {/* Пункты навигации */}
          <div className="flex items-center gap-[40px]">
            {items.map((item) => {
              // Если есть children - dropdown
              if (item.children && item.children.length > 0) {
                return <NavDropdown key={item.id} item={item} />;
              }
              // Иначе обычная ссылка
              return <NavItem key={item.id} item={item} />;
            })}
          </div>

          {/* Поиск */}
          {showSearch && <SearchBar placeholder={searchPlaceholder} />}
        </div>
      </Container>
    </nav>
  );
}
```

---

## Phase 4: Testing & Verification

### Step 4.1: Check GraphQL Data

**Проверь что меню содержит childItems:**

```bash
# Через WordPress GraphQL IDE (http://localhost:8000/graphql)
query {
  menu(id: "PRIMARY", idType: LOCATION) {
    menuItems {
      nodes {
        id
        label
        path
        childItems {
          nodes {
            id
            label
            path
          }
        }
      }
    }
  }
}
```

Должно вернуть:
```json
{
  "label": "О клинике",
  "path": "/o-klinike/",
  "childItems": {
    "nodes": [
      {
        "label": "История клиники",
        "path": "/o-klinike/istoriya-kliniki/"
      },
      {
        "label": "Наша команда",
        "path": "/o-klinike/nasha-komanda/"
      }
    ]
  }
}
```

### Step 4.2: Check Routes

```bash
# Проверь что страницы доступны
http://localhost:3000/o-klinike/                    # Родительская
http://localhost:3000/o-klinike/istoriya-kliniki/   # Дочерняя 1
http://localhost:3000/o-klinike/nasha-komanda/      # Дочерняя 2
```

### Step 4.3: Test Hover Behavior

**Вручную в браузере:**

1. ✅ Наведи курсор на "О клинике" → dropdown открывается
2. ✅ Переведи курсор на dropdown → dropdown НЕ закрывается
3. ✅ Кликни на "О клинике" → переход на `/o-klinike/`
4. ✅ Кликни на "История клиники" → переход на `/o-klinike/istoriya-kliniki/`
5. ✅ Убери курсор с dropdown → dropdown закрывается

---

## Phase 5: Git Workflow

### Step 5.1: Create Feature Branch

```bash
git checkout -b feature/patient-menu-submenu
```

### Step 5.2: Commit Changes

```bash
# Stage files
git add nextjs/src/app/[...slug]/page.tsx
git add nextjs/src/lib/wordpress/queries/pages.ts
git add nextjs/src/types/page.ts
git add nextjs/src/components/figma/header/nav-dropdown.tsx
git add nextjs/src/lib/wordpress/queries/index.ts

# Commit
git commit -m "feat: add patient menu with dynamic pages and dropdown

## Backend
- Create WordPress pages for Patient section via MCP
- Add pages to menu as submenu items

## Frontend
- Add catch-all route [slug]/page.tsx
- Add GraphQL queries for pages
- Update nav-dropdown.tsx with hover functionality
- Fix dropdown closing issue

## Testing
- Dropdown opens on hover
- All links work correctly
- SEO metadata from RankMath"
```

### Step 5.3: Push & Create PR

```bash
# Push branch
git push -u origin feature/patient-menu-submenu
```

**Через GitHub MCP:**

```typescript
// Create PR
await CallMcpTool({
  server: 'user-github',
  toolName: 'create_pull_request',
  arguments: {
    owner: 'lutyi2856',
    repo: 'headless-wp-nextjs',
    title: 'feat: add patient menu with dynamic pages and dropdown',
    head: 'feature/patient-menu-submenu',
    base: 'main',
    body: `## Goal
Implement patient menu section with sub-pages and hover dropdown.

## Changes
- WordPress pages created via MCP
- Dynamic routing via [slug]/page.tsx
- Hover-based dropdown navigation
- RankMath SEO integration

## Testing
- ✅ Dropdown opens on hover
- ✅ Links work correctly
- ✅ SEO metadata loads`
  }
});

// Merge PR
await CallMcpTool({
  server: 'user-github',
  toolName: 'merge_pull_request',
  arguments: {
    owner: 'lutyi2856',
    repo: 'headless-wp-nextjs',
    pullNumber: 6, // номер созданного PR
    merge_method: 'squash'
  }
});
```

### Step 5.4: Cleanup

```bash
# Переключиться на main
git checkout main

# Подтянуть изменения
git pull origin main

# Удалить локальную feature ветку
git branch -d feature/patient-menu-submenu

# Удалить remote feature ветку
git push origin --delete feature/patient-menu-submenu
```

---

## Common Errors & Fixes

### Error 1: `Cannot query field "excerpt" on type "Page"`

**Причина:** `Page` тип в GraphQL не имеет поля `excerpt` (есть только у `Post`)

**Fix:**
```typescript
// ❌ НЕПРАВИЛЬНО
const seoDescription = page.seo?.description || page.excerpt;

// ✅ ПРАВИЛЬНО
const seoDescription = page.seo?.description || '';
```

### Error 2: `Cannot query field "opengraphTitle" on type "RankMathPageObjectSeo"`

**Причина:** RankMath использует другую структуру для SEO полей

**Fix:**
```graphql
# ❌ НЕПРАВИЛЬНО
seo {
  opengraphTitle
  opengraphDescription
}

# ✅ ПРАВИЛЬНО
seo {
  title
  description
  openGraph {
    title
    description
    image {
      url
    }
  }
}
```

### Error 3: Dropdown закрывается при наведении на подпункты

**Причина:** `onMouseLeave` срабатывает между parent и dropdown

**Fix:**
```typescript
// ❌ НЕПРАВИЛЬНО - отдельные onMouseEnter/Leave
<div onMouseEnter={() => setIsOpen(true)}>
  <a>Parent</a>
</div>
{isOpen && (
  <div onMouseEnter={() => setIsOpen(true)}>
    Dropdown
  </div>
)}

// ✅ ПРАВИЛЬНО - один контейнер для всего + pt-2 "мост"
<div 
  onMouseEnter={() => setIsOpen(true)}
  onMouseLeave={() => setIsOpen(false)}
>
  <div>
    <a>Parent</a>
  </div>
  {isOpen && (
    <div className="absolute pt-2">
      <div>Dropdown</div>
    </div>
  )}
</div>
```

### Error 4: Next.js роутинг конфликт

**Причина:** Несколько динамических роутов с разными параметрами

**Fix:**
```
❌ НЕПРАВИЛЬНО - конфликт
app/[slug]/page.tsx
app/[parent]/[slug]/page.tsx

✅ ПРАВИЛЬНО - один catch-all
app/[...slug]/page.tsx
```

### Error 5: `Command failed to spawn: path should be relative`

**Причина:** PowerShell не поддерживает `cd && command` синтаксис

**Fix:**
```typescript
// ❌ НЕПРАВИЛЬНО
Shell('cd nextjs && npm run dev');

// ✅ ПРАВИЛЬНО
Shell('npm run dev', { working_directory: 'd:/template/nextjs' });
```

### Error 6: Duplicate Pages with Different Slugs

**Проблема:** Созданы две страницы с одинаковым названием, но разными slugs (например: `/o-klinike/` и `/about/` для "О клинике")

**Причина:**
- Страница создана вручную через WordPress админку с автоматическим slug (кириллица → транслит)
- Затем создана через MCP с другим slug (английским)
- Меню ссылается на одну страницу, но дочерние страницы привязаны к другой
- Возникает несоответствие в навигации

**Симптомы:**
```
Menu Item "О клинике" → /o-klinike/ (ID: 28)
Child page "История" → /about/history/ (parent_id: 71)
Child page "Команда" → /about/team/ (parent_id: 71)

❌ Клик на "О клинике" → открывает страницу без детей
❌ Дочерние страницы имеют другой parent_id
```

**Fix - Вариант 1: Удалить дубликат и исправить связи**

```bash
# 1. Определить какую страницу оставить (по slug)
# Лучше оставить английский slug для SEO: /about/

# 2. Проверить ID обеих страниц
CallMcpTool('user-wordpress-mcp', 'wp_pages_search', {
  search: 'О клинике'
})
# Результат:
# - ID: 28, slug: 'o-klinike'  ← удалить
# - ID: 71, slug: 'about'      ← оставить

# 3. Проверить parent_id у дочерних страниц
# Должны быть привязаны к ID: 71

# 4. Удалить лишнюю страницу через WP-CLI
docker exec wp-new-wordpress wp post delete 28 --force --allow-root

# 5. Очистить кэш
docker exec wp-new-wordpress wp cache flush --allow-root
Remove-Item -Path "nextjs\.next" -Recurse -Force
```

**Fix - Вариант 2: Изменить parent_id у дочерних страниц**

```bash
# Если хочешь оставить /o-klinike/ (ID: 28)
# Нужно изменить parent_id у дочерних страниц с 71 на 28

# Через WP-CLI
docker exec wp-new-wordpress wp post update 82 --post_parent=28 --allow-root
docker exec wp-new-wordpress wp post update 81 --post_parent=28 --allow-root

# Удалить /about/ (ID: 71)
docker exec wp-new-wordpress wp post delete 71 --force --allow-root
```

**Как избежать:**

```typescript
// ✅ ВСЕГДА проверяй существование страницы ПЕРЕД созданием
async function createPageSafely(title: string, parentId?: number) {
  // 1. Поиск существующих страниц
  const existing = await CallMcpTool({
    server: 'user-wordpress-mcp',
    toolName: 'wp_pages_search',
    arguments: { search: title }
  });
  
  // 2. Проверка дубликатов
  if (existing && existing.length > 0) {
    console.log(`⚠️ Страница "${title}" уже существует:`, existing);
    
    // Найти правильную страницу (по parent_id или slug)
    const correctPage = existing.find(p => 
      parentId ? p.parent_id === parentId : true
    );
    
    if (correctPage) {
      console.log(`✅ Используем существующую страницу ID: ${correctPage.id}`);
      return correctPage.id;
    }
  }
  
  // 3. Создание только если не существует
  const newPage = await CallMcpTool({
    server: 'user-wordpress-mcp',
    toolName: 'wp_add_page',
    arguments: {
      title,
      content: '<p>Контент...</p>',
      status: 'publish',
      parent_id: parentId
    }
  });
  
  return newPage.id;
}
```

**Best Practice: Проверка перед созданием меню**

```graphql
# Проверь GraphQL ПЕРЕД добавлением в меню
query CheckPageStructure {
  pages(where: { title: "О клинике" }) {
    nodes {
      id
      databaseId
      title
      slug
      uri
      parent {
        node {
          id
          databaseId
        }
      }
      children {
        nodes {
          id
          title
          slug
          uri
        }
      }
    }
  }
}
```

**Результат должен быть:**
- ✅ Одна родительская страница
- ✅ Все дочерние страницы имеют одинаковый `parent_id`
- ✅ URL структура консистентна (`/about/history/`, `/about/team/`)

---

## Best Practices

### 1. Server Components First

✅ **DO:**
```typescript
// Server Component - data fetching на сервере
export default async function PageComponent({ params }: PageProps) {
  const page = await fetchPage(params.slug);
  return <PageContent page={page} />;
}
```

❌ **DON'T:**
```typescript
// ❌ Client Component - fetch на клиенте
'use client';
export default function PageComponent() {
  const [page, setPage] = useState(null);
  useEffect(() => {
    fetchPage().then(setPage);
  }, []);
}
```

### 2. Performance-First Dropdown

✅ **DO:**
```typescript
// Custom state - минимальный код, максимальная производительность
const [isOpen, setIsOpen] = useState(false);
```

❌ **DON'T:**
```typescript
// ❌ Radix UI NavigationMenu - overkill для простого dropdown
import { NavigationMenu, NavigationMenuTrigger } from '@radix-ui/react-navigation-menu';
```

### 3. GraphQL Query Optimization

✅ **DO:**
```graphql
# Запрашивай только нужные поля
query GetPage($slug: ID!) {
  page(id: $slug, idType: URI) {
    id
    title
    content
    seo {
      title
      description
    }
  }
}
```

❌ **DON'T:**
```graphql
# ❌ Запрашивать всё подряд
query GetPage($slug: ID!) {
  page(id: $slug, idType: URI) {
    ...AllFields
    seo {
      ...AllSeoFields
    }
    featuredImage {
      ...AllImageFields
    }
  }
}
```

### 4. ISR для динамических страниц

✅ **DO:**
```typescript
// ISR: revalidate каждый час
export const revalidate = 3600;

// + generateStaticParams для SSG
export async function generateStaticParams() {
  const pages = await fetchAllPages();
  return pages.map(p => ({ slug: p.slug }));
}
```

### 5. Always Check for Duplicates Before Creating

✅ **DO:**
```typescript
// Всегда проверяй существование страницы перед созданием
const existingPages = await CallMcpTool({
  server: 'user-wordpress-mcp',
  toolName: 'wp_pages_search',
  arguments: { search: 'О клинике' }
});

if (existingPages && existingPages.length > 0) {
  console.log('⚠️ Страница уже существует:', existingPages);
  // Использовать существующую или удалить дубликат
}
```

❌ **DON'T:**
```typescript
// ❌ Создавать страницу без проверки
await CallMcpTool({
  server: 'user-wordpress-mcp',
  toolName: 'wp_add_page',
  arguments: { title: 'О клинике', ... }
});
// Может создать дубликат!
```

**Почему важно:**
- ⚠️ WordPress может создать страницу с транслитерированным slug (`/o-klinike/`)
- ⚠️ Может уже существовать страница с английским slug (`/about/`)
- ⚠️ Меню может ссылаться на одну страницу, а дочерние - на другую
- ⚠️ Несоответствие в навигации → сломанные ссылки

**Алгоритм проверки:**
1. Поиск по названию через `wp_pages_search`
2. Проверка slug у найденных страниц
3. Проверка parent_id у дочерних страниц
4. Решение: использовать существующую или удалить дубликат

### 6. Consistent URL Structure

✅ **DO:**
```
/about/                # Parent page
/about/history/        # Child page 1
/about/team/           # Child page 2
```

❌ **DON'T:**
```
/o-klinike/            # Parent page (кириллица)
/about/history/        # Child page (английский slug) ← НЕСООТВЕТСТВИЕ!
/about/team/           # Child page (английский slug) ← НЕСООТВЕТСТВИЕ!
```

**Prefer английские slugs для SEO:**
- ✅ `/about/`, `/services/`, `/contacts/` - хорошо для SEO
- ❌ `/o-klinike/`, `/uslugi/`, `/kontakty/` - транслит плохо для SEO

### 7. Git Workflow

✅ **DO:**
```bash
# Feature branch для каждой новой фичи
git checkout -b feature/patient-menu-submenu

# Осмысленный commit message
git commit -m "feat: add patient menu with dynamic pages

- Create WordPress pages
- Add dropdown navigation
- Configure routing"

# PR → Review → Merge → Cleanup
```

---

## Checklist

**Перед началом:**
- [ ] Определить название раздела (e.g., "Для пациентов")
- [ ] Определить список подстраниц (e.g., "Вопросы-ответы", "Отзывы")
- [ ] **Проверить существующие страницы через `wp_pages_search`**
- [ ] **Проверить нет ли дубликатов с разными slugs (e.g., `/o-klinike/` vs `/about/`)**
- [ ] Выбрать правильный slug (предпочтительно английский для SEO)

**Backend (WordPress):**
- [ ] Найти ID родительской страницы через `wp_pages_search`
- [ ] **Убедиться что нет дубликатов родительской страницы**
- [ ] **Проверить slug родительской страницы (должен быть английским)**
- [ ] Создать дочерние страницы с `parent_id` (только если не существуют)
- [ ] **Проверить что parent_id у всех дочерних страниц одинаковый**
- [ ] Добавить страницы в меню через WordPress админку
- [ ] Проверить GraphQL query возвращает `childItems`
- [ ] **Проверить что меню ссылается на правильную родительскую страницу**

**Frontend (Next.js):**
- [ ] Создать `queries/pages.ts` с GraphQL queries
- [ ] Создать `types/page.ts` с TypeScript типами
- [ ] Создать `[...slug]/page.tsx` с catch-all routing
- [ ] Обновить `queries/index.ts` для экспорта
- [ ] Обновить `nav-dropdown.tsx` с hover функциональностью

**Testing:**
- [ ] Dropdown открывается при hover
- [ ] Dropdown НЕ закрывается при переходе на подпункты
- [ ] Клик на родительский пункт → переход на страницу
- [ ] Клик на подпункты → переход на соответствующие страницы
- [ ] SEO metadata загружается (проверить через View Source)
- [ ] Breadcrumbs работают для вложенных страниц
- [ ] Кнопка "Назад" работает

**Git:**
- [ ] Создать feature branch
- [ ] Закоммитить изменения с осмысленным message
- [ ] Запушить в remote
- [ ] Создать PR через GitHub MCP
- [ ] Смержить PR
- [ ] Cleanup: удалить feature ветку

---

## Resources

- **WordPress MCP:** `C:\Users\Sergey\.cursor\projects\d-template\mcps\user-wordpress-mcp\tools\`
- **GitHub MCP:** `C:\Users\Sergey\.cursor\projects\d-template\mcps\user-github\tools\`
- **Next.js Dynamic Routes:** https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- **RankMath GraphQL:** Via GraphQL IDE at `http://localhost:8000/graphql`

---

**Version:** 1.0.0  
**Created:** 2026-01-15  
**Based on:** Chat "About Clinic dropdown menu implementation"  
**Status:** ✅ Ready to use
