---
name: reviews-rating-filter
description: Filter Reviews CPT by rating (above 4.9, below 4) via WPGraphQL meta_query. Use when implementing rating filters on /reviews page, adding ratingMin/ratingMax where args, or debugging reviews filter not working.
---

# Reviews Rating Filter — УниДент

Фильтрация отзывов по рейтингу (ACF meta rating): ratingMin, ratingMax в RootQueryToReviewConnectionWhereArgs.

## When to Use

- Реализация фильтров «Выше 4.9» / «Ниже 4» на странице /reviews
- Добавление where-аргументов для CPT reviews в WPGraphQL
- Фильтрация по ACF Number field (rating)
- Debug: фильтр в URL есть, но отзывы не меняются

---

## Quick Reference

| Уровень | Файл | Что делать |
|---------|------|------------|
| PHP | `register-reviews-filter-graphql.php` | ratingMin, ratingMax в RootQueryToReviewConnectionWhereArgs + meta_query hook |
| GraphQL | `reviews.ts` | GET_REVIEWS_CONNECTION_FILTERED с $where |
| Next.js | `api.ts` | getReviews(ratingFilter) → fetch с cache: 'no-store' при фильтре |
| Next.js | `page.tsx` | Парсить searchParams.rating ('above_49' \| 'below_4') |
| UI | `reviews-filters.tsx` | Чипы + useSearchParams/router.push |

**Маппинг фильтров:**
- `all` (пусто) → без meta_query
- `above_49` → `where: { ratingMin: 4.9 }` → rating >= 4.9
- `below_4` → `where: { ratingMax: 4 }` → rating < 4

---

## Detailed Instructions

### Step 1: PHP — регистрация ratingMin/ratingMax

```php
// wp-content/mu-plugins/register-reviews-filter-graphql.php

register_graphql_field('RootQueryToReviewConnectionWhereArgs', 'ratingMin', [
    'type'        => 'Float',
    'description' => 'Filter reviews with rating >= value',
]);
register_graphql_field('RootQueryToReviewConnectionWhereArgs', 'ratingMax', [
    'type'        => 'Float',
    'description' => 'Filter reviews with rating < value',
]);
```

### Step 2: PHP — meta_query в graphql_post_object_connection_query_args

ACF field rating: meta_key = 'rating'.

```php
if (!empty($where['ratingMin'])) {
    $meta_query[] = [
        'key'     => 'rating',
        'value'   => (string) $where['ratingMin'],
        'compare' => '>=',
        'type'    => 'DECIMAL',
    ];
}
if (!empty($where['ratingMax'])) {
    $meta_query[] = [
        'key'     => 'rating',
        'value'   => (string) $where['ratingMax'],
        'compare' => '<',
        'type'    => 'DECIMAL',
    ];
}
```

### Step 3: Next.js — GraphQL query с where

```graphql
query GetReviewsConnectionFiltered($first: Int, $after: String, $where: RootQueryToReviewConnectionWhereArgs) {
  reviews(first: $first, after: $after, where: $where) {
    edges { node { ...ReviewCardFields } cursor }
    pageInfo { hasNextPage endCursor }
  }
}
```

### Step 4: Next.js — getReviews с ratingFilter

При наличии фильтра — прямой fetch с `cache: 'no-store'`, иначе Apollo (кэш).

```ts
if (ratingFilter === 'above_49') where = { ratingMin: 4.9 };
if (ratingFilter === 'below_4') where = { ratingMax: 4 };
// fetch(uri, { cache: 'no-store', body: JSON.stringify({ query, variables: { where } }) })
```

### Step 5: page.tsx — парсинг searchParams

```ts
const rawRating = resolved?.rating;
const ratingFilter = typeof rawRating === 'string' ? rawRating.trim() : Array.isArray(rawRating) ? rawRating[0]?.trim() : undefined;
const validFilter = ratingFilter === 'above_49' || ratingFilter === 'below_4' ? ratingFilter : undefined;
```

---

## Common Errors

### Error: Фильтр в URL, но список не меняется

**Cause:** Кэш Next.js fetch; where не передаётся в GraphQL; graphql_post_object_connection_query_args не срабатывает для reviews.

**Fix:** fetch с `cache: 'no-store'`; проверить post_type в хуке ('reviews' или 'review'); перезапустить WordPress.

### Error: GraphQL «Cannot query field ratingMin»

**Cause:** RootQueryToReviewConnectionWhereArgs не содержит ratingMin — плагин не загружен.

**Fix:** Проверить что `register-reviews-filter-graphql.php` в mu-plugins; `docker compose restart wordpress`.

### Error: Отзывы без рейтинга не показываются при «Выше 4.9»

**Cause:** meta_query с rating >= 4.9 исключает посты без meta key rating.

**Fix:** Ожидаемое поведение — отзывы без рейтинга исключаются из фильтрованных списков. «Все отзывы» показывает все.

---

## Best Practices

### DO

1. Использовать DECIMAL type в meta_query для числового сравнения
2. Включать status: 'PUBLISH' в where при filtered query
3. Валидировать rating в page: только 'above_49' | 'below_4'
4. Стили чипов как в DoctorsFilters (chipActive, chipInactive)

### DON'T

1. НЕ полагаться на Apollo cache для filtered queries
2. НЕ добавлять orderby в RootQueryToReviewConnectionWhereArgs без проверки схемы
3. НЕ забывать про Load More — передавать те же where при пагинации (after)

---

## Related Skills

- [wpgraphql-cpt-filtering](../wpgraphql-cpt-filtering/SKILL.md) — общий паттерн фильтрации CPT
- [graphql-wordpress-debugging](../graphql-wordpress-debugging/SKILL.md) — отладка GraphQL
