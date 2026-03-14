---
name: nextjs-wordpress-dynamic-routing
description: Create dynamic routes for WordPress CPT in Next.js with proper GraphQL queries, Link components, and SSG. Use when implementing slug-based pages (/doctors/[slug], /services/[slug]), making elements clickable with navigation, or debugging "Page not found" / GraphQL null issues.
---

# Next.js + WordPress Dynamic Routing Implementation

## When to Use

**Use this skill when:**
- Creating dynamic pages for WordPress Custom Post Types (CPT) in Next.js
- Implementing slug-based routing (`/doctors/[slug]`, `/services/[slug]`)
- Making card elements (titles, buttons) clickable with navigation
- Debugging 404 errors on dynamic pages
- Fixing GraphQL queries returning `null` or `undefined`
- Setting up Static Site Generation (SSG) with `generateStaticParams`

## Prerequisites

**Before starting:**
- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
1. ✅ WordPress CPT exists and has posts with slugs
2. ✅ WPGraphQL plugin is active
3. ✅ GraphQL queries are defined in `lib/wordpress/queries/`
4. ✅ API functions exist in `lib/wordpress/api.ts`
5. ✅ Component types are defined (e.g., `DoctorCardProps`)

---

## Step-by-Step Implementation

### Step 1: Verify GraphQL Schema

**CRITICAL: Always check WordPress GraphQL schema first!**

```bash
# Open WordPress GraphiQL
http://localhost:8002/graphql

# Test your query:
query GetDoctorBySlug {
  doctor(id: "novikova-olga-igorevna", idType: SLUG) {
    id
    title
    slug
  }
}
```

**Check what fields actually exist:**
- Open GraphiQL Documentation Explorer
- Find your CPT type (e.g., `Doctor`)
- Find custom fields type (e.g., `DoctorFields`)
- **ONLY request fields that exist in schema!**

**❌ Common mistake:**
```graphql
doctorFields {
  description  # ← Doesn't exist!
  certificates # ← Doesn't exist!
  education    # ← Doesn't exist!
}
```

**✅ Correct:**
```graphql
doctorFields {
  experience
  rating
  ratingSource
  videoUrl
}
```

---

### Step 2: Update GraphQL Fragments

**File:** `nextjs/src/lib/wordpress/queries/[cpt-name].ts`

```typescript
// ✅ ПРАВИЛЬНО - Только существующие поля
export const CPT_FULL_FIELDS = gql`
  fragment CptFullFields on Doctor {
    id
    databaseId
    title
    slug
    uri
    date
    modified
    content
    featuredImage {
      node {
        id
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    doctorFields {
      # Только поля, которые СУЩЕСТВУЮТ в WordPress!
      experience
      rating
      ratingSource
      videoUrl
    }
  }
`;

// ❌ НЕ добавляй SEO блок если полей нет в схеме
export const GET_CPT_BY_SLUG = gql`
  ${CPT_FULL_FIELDS}
  query GetDoctorBySlug($slug: ID!) {
    doctor(id: $slug, idType: SLUG) {
      ...CptFullFields
      # НЕ добавляй seo { } если поля не совпадают!
    }
  }
`;
```

**Pro tip:** Используй только базовые поля для минимальной страницы, расширяй позже.

---

### Step 3: Add Debug Logging

**File:** `nextjs/src/lib/wordpress/api.ts`

```typescript
// ✅ Добавь логирование для отладки
export async function getCptBySlug(slug: string): Promise<Doctor | null> {
  const client = getApolloClient();

  console.log("[getCptBySlug] Запрос с slug:", slug);

  const { data, errors } = await client.query({
    query: GET_CPT_BY_SLUG,
    variables: { slug },
  });

  console.log("[getCptBySlug] GraphQL response data:", data);
  console.log("[getCptBySlug] GraphQL errors:", errors);

  return data?.cpt || null;
}
```

**Why:** GraphQL может возвращать `undefined` при ошибках вместо выброса exception!

---

### Step 4: Create Dynamic Page

**File:** `nextjs/src/app/[cpt-name]/[slug]/page.tsx`

```typescript
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCptBySlug, getAllCptSlugs } from "@/lib/wordpress/api";
import { Heading } from "@/components/design-system";

interface CptPageProps {
  params: { slug: string };
}

/**
 * SSG: Generate static params
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllCptSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("[generateStaticParams] Error:", error);
    return [];
  }
}

/**
 * SEO: Generate metadata
 */
export async function generateMetadata({
  params,
}: CptPageProps): Promise<Metadata> {
  const item = await getCptBySlug(params.slug);

  if (!item) {
    return {
      title: "Не найдено - УниДент",
    };
  }

  return {
    title: `${item.title} - УниДент`,
    description: item.excerpt || `Страница ${item.title}`,
  };
}

/**
 * Динамическая страница (минимальная версия)
 */
export default async function CptPage({ params }: CptPageProps) {
  const item = await getCptBySlug(params.slug);

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <Heading level={1} variant="page-title">
          {item.title}
        </Heading>
      </div>
    </main>
  );
}

// ISR: Revalidate каждый час
export const revalidate = 3600;
```

---

### Step 5: Update Component Types

**File:** `nextjs/src/components/[component]/types.ts`

```typescript
export interface CptCardProps {
  /** Название */
  name?: string;
  /** URL slug для роутинга */
  slug?: string; // ← ДОБАВИТЬ!
  /** Описание */
  description?: string;
  // ... другие поля
}
```

---

### Step 6: Add Link Components

**File:** `nextjs/src/components/[component]/card.tsx`

```typescript
import Link from "next/link";

export function CptCard({
  name,
  slug, // ← Новый проп
  description,
}: CptCardProps) {
  return (
    <div className="...">
      {/* Заголовок - ссылка */}
      {slug ? (
        <Link href={`/cpt-name/${slug}`}>
          <Heading
            level={3}
            variant="card-title"
            className="hover:text-unident-primary transition-colors cursor-pointer"
          >
            {name}
          </Heading>
        </Link>
      ) : (
        <Heading level={3} variant="card-title">
          {name}
        </Heading>
      )}

      <Text variant="description">{description}</Text>

      {/* Кнопка - ссылка */}
      {slug ? (
        <Link href={`/cpt-name/${slug}`} className="w-full">
          <button className="...">Подробнее</button>
        </Link>
      ) : (
        <button className="...">Подробнее</button>
      )}
    </div>
  );
}
```

**Pattern:** Условный рендеринг - если есть `slug`, показываем `Link`, иначе обычный элемент.

---

### Step 7: Pass Slug Through Props

**File:** `nextjs/src/components/sections/cpt-section-client.tsx`

```typescript
<CptCard
  name={item.title}
  slug={item.slug} // ← ПЕРЕДАТЬ!
  description={item.excerpt}
  // ... другие пропсы
/>
```

---

### Step 8: Clear Cache & Test

```powershell
# 1. Остановить Next.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Удалить .next кэш
cd nextjs
Remove-Item -Path .next -Recurse -Force

# 3. Запустить заново
npm run dev
```

**Why:** Next.js кэширует GraphQL запросы и компоненты. После изменений в GraphQL нужна очистка!

---

## Common Errors

### Error 1: "Cannot query field X on type Y"

**Причина:** Запрашиваете поле, которого нет в WordPress GraphQL схеме.

**Решение:**
1. Открой http://localhost:8002/graphql
2. Проверь Documentation Explorer → твой тип → поля
3. Удали несуществующие поля из фрагмента

**Пример из практики:**
```typescript
// ❌ ОШИБКА
doctorFields {
  description    // ← Cannot query field "description"
  certificates   // ← Cannot query field "certificates"
}

// ✅ ИСПРАВЛЕНО
doctorFields {
  experience
  rating
  videoUrl
}
```

---

### Error 2: Page shows "Не найдено" / 404

**Причины:**
1. GraphQL запрос возвращает `null` из-за ошибок
2. Неправильный `idType` в запросе
3. Slug в URL не совпадает со slug в WordPress

**Debugging:**
```typescript
// Добавь логи в getCptBySlug:
console.log("[getCptBySlug] Запрос с slug:", slug);
console.log("[getCptBySlug] GraphQL data:", data);
console.log("[getCptBySlug] GraphQL errors:", errors);
```

**Проверь:**
- `errors` не пустой? → GraphQL запрос неправильный
- `data` undefined? → Есть ошибки в схеме
- `data.cpt` null? → Slug не найден в WordPress

---

### Error 3: Links не работают (элементы не кликабельны)

**Причина:** `slug` не передается через props или страница закэширована.

**Решение:**
1. Проверь `slug={item.slug}` передается в компонент
2. Проверь `slug?` есть в `CptCardProps` интерфейсе
3. Сделай hard refresh (Ctrl+Shift+R)
4. Очисти `.next` кэш

---

### Error 4: Catch-all route перехватывает динамический роут

**Причина:** `app/[...slug]/page.tsx` имеет приоритет над `app/cpt/[slug]/page.tsx`.

**Решение:**
1. Очисти `.next` кэш
2. Перезапусти dev server
3. Next.js автоматически выберет более специфичный роут

**Порядок приоритета Next.js:**
1. Статические роуты (`/doctors/page.tsx`)
2. Динамические роуты (`/doctors/[slug]/page.tsx`)
3. Catch-all роуты (`/[...slug]/page.tsx`)

---

## Debugging Checklist

**Когда страница возвращает 404:**

- [ ] ✅ Открыть Next.js terminal и найти `[getCptBySlug]` логи
- [ ] ✅ Проверить `GraphQL errors:` - есть ошибки?
- [ ] ✅ Открыть GraphiQL и выполнить запрос вручную
- [ ] ✅ Сравнить поля в запросе с Documentation Explorer
- [ ] ✅ Удалить несуществующие поля из фрагмента
- [ ] ✅ Очистить `.next` кэш и перезапустить
- [ ] ✅ Проверить что slug существует в WordPress

**Когда ссылки не работают:**

- [ ] ✅ `slug` передается в компонент?
- [ ] ✅ `slug?` добавлен в интерфейс типов?
- [ ] ✅ `Link` импортирован из `next/link`?
- [ ] ✅ Условный рендеринг `slug ? <Link> : <Element>`?
- [ ] ✅ Hard refresh браузера (Ctrl+Shift+R)?

---

## Best Practices

### DO ✅

1. **Всегда проверяй GraphQL схему** перед написанием запросов
2. **Добавляй debug логи** в API функции для отладки
3. **Используй TypeScript** - типизируй props и return types
4. **Условный рендеринг** - `slug ? <Link> : <Element>` для гибкости
5. **SSG + ISR** - используй `generateStaticParams` + `revalidate`
6. **Очищай кэш** после изменений в GraphQL
7. **Минимальная страница сначала** - добавляй контент постепенно
8. **Тестируй в GraphiQL** перед написанием кода

### DON'T ❌

1. ❌ **НЕ запрашивай поля** без проверки схемы
2. ❌ **НЕ игнорируй GraphQL errors** - они скрывают проблемы
3. ❌ **НЕ забывай очищать** `.next` кэш после изменений
4. ❌ **НЕ используй `export const revalidate = false`** - используй ISR
5. ❌ **НЕ хардкодь slugs** - используй `generateStaticParams`
6. ❌ **НЕ пропускай TypeScript типы** для props
7. ❌ **НЕ создавай полную страницу сразу** - сначала роутинг

---

## Quick Reference

### Minimal Working Setup

```typescript
// 1. GraphQL Query (queries/cpt.ts)
export const GET_CPT_BY_SLUG = gql`
  query GetCptBySlug($slug: ID!) {
    cpt(id: $slug, idType: SLUG) {
      id
      title
      slug
    }
  }
`;

// 2. API Function (api.ts)
export async function getCptBySlug(slug: string) {
  const { data, errors } = await client.query({
    query: GET_CPT_BY_SLUG,
    variables: { slug },
  });
  console.log("Data:", data, "Errors:", errors);
  return data?.cpt || null;
}

// 3. Dynamic Page (app/cpt/[slug]/page.tsx)
export default async function CptPage({ params }) {
  const item = await getCptBySlug(params.slug);
  if (!item) notFound();
  return <h1>{item.title}</h1>;
}

// 4. Component with Link (components/card.tsx)
<Link href={`/cpt/${slug}`}>
  <Heading>{name}</Heading>
</Link>
```

---

## Troubleshooting Examples

### Example 1: GraphQL Returns Null

**Symptom:** Page shows 404, logs show "Врач НЕ найден"

**Terminal logs:**
```
[getCptBySlug] GraphQL response data: undefined
[getCptBySlug] GraphQL errors: [
  { message: 'Cannot query field "description"' }
]
```

**Solution:**
1. Find the error field: `"description"`
2. Remove from GraphQL fragment
3. Clear `.next` cache
4. Restart dev server

---

### Example 2: Links Not Clickable

**Symptom:** Card titles are not links, no hover effect

**Checklist:**
```typescript
// ✅ Check 1: slug in props?
<CptCard slug={item.slug} ... />

// ✅ Check 2: slug in interface?
interface CptCardProps {
  slug?: string;
}

// ✅ Check 3: Link component?
import Link from "next/link";
{slug ? <Link href={...}> : <Element>}

// ✅ Check 4: Clear cache
Remove-Item .next -Recurse -Force
```

---

## Related Skills

- `wpgraphql-debugging` - Debug GraphQL schema issues
- `nextjs-caching` - Understand Next.js caching
- `wordpress-nextjs-cache-clearing` - Multi-level cache clearing
- `typing-components` - TypeScript for React components

---

**Status:** ✅ Production-ready
**Priority:** 🔴 HIGH
**Version:** 1.0.0
**Created:** 2026-02-05
