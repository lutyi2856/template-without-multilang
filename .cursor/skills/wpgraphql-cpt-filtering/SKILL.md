---
name: wpgraphql-cpt-filtering
description: WPGraphQL filtering for Custom Post Types (taxonomy + ACF meta). Use when implementing filters on CPT archive (doctors, services, clinics), debugging "filter not working", GraphQL where args, or Next.js showing wrong/cached data for filtered queries.
---

# WPGraphQL CPT Filtering — УниДент

Фильтрация CPT в WPGraphQL: регистрация where-аргументов, хуки WP_Query, Next.js интеграция, обход кэша.

## When to Use

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
- Реализация фильтров на архиве CPT (врачи, услуги, клиники)
- Debug: фильтр в URL есть, но список не меняется
- GraphQL возвращает данные, Next.js показывает другие
- Добавление custom where-аргументов в WPGraphQL для CPT
- Фильтрация по таксономии или ACF relationship

---

## Quick Reference

| Уровень | Файл | Что делать |
|---------|------|------------|
| PHP | `register-*-graphql.php` | Зарегистрировать где-аргумент, добавить хук `graphql_post_object_connection_query_args` |
| Next.js | `api.ts` | Для запросов с фильтрами — прямой `fetch` с `cache: 'no-store'` |
| Next.js | `page.tsx` | Парсить `searchParams` напрямую (string \| string[]), не полагаться на nuqs parse при сбоях |
| GraphQL | where | НЕ добавлять `orderby` в `RootQueryTo*ConnectionWhereArgs` — формат другой, вызовет ошибку |

---

## Architecture

```
URL (?specialization=gigiena)
  → Next.js page (searchParams)
  → api.getDoctorsConnection(filters)
  → GraphQL POST { where: { status, specializationSlug } }
  → WPGraphQL
  → graphql_post_object_connection_query_args ($args['where'])
  → WP_Query (tax_query, meta_query)
  → doctors
```

---

## Detailed Instructions

### Step 1: PHP — регистрация where-аргументов

```php
// wp-content/mu-plugins/register-doctors-clinics-graphql.php

function unident_register_doctor_connection_where_args() {
    register_graphql_field('RootQueryToDoctorConnectionWhereArgs', 'specializationSlug', [
        'type'        => 'String',
        'description' => 'Filter by taxonomy term slug',
    ]);
    register_graphql_field('RootQueryToDoctorConnectionWhereArgs', 'clinicSlug', [
        'type'        => 'String',
        'description' => 'Filter by clinic slug (ACF relationship)',
    ]);
}
add_action('graphql_register_types', 'unident_register_doctor_connection_where_args', 10);
```

### Step 2: PHP — хук graphql_post_object_connection_query_args

`graphql_map_input_fields_to_wp_query` может не вызываться для CPT. Добавлять `graphql_post_object_connection_query_args` как основной источник:

```php
function unident_doctors_post_object_connection_query_args($query_args, $source, $args, $context, $info) {
    $post_type = $query_args['post_type'] ?? null;
    $is_doctors = (is_string($post_type) && in_array($post_type, ['doctors', 'doctor'], true))
        || (is_array($post_type) && !empty(array_intersect(['doctors', 'doctor'], $post_type)));
    if (!$is_doctors) return $query_args;

    $where = $args['where'] ?? [];
    if (empty($where['specializationSlug']) && empty($where['clinicSlug'])) return $query_args;

    // taxonomy
    if (!empty($where['specializationSlug'])) {
        $term = get_term_by('slug', sanitize_text_field($where['specializationSlug']), 'doctor_specializations');
        if ($term && !is_wp_error($term)) {
            $tax_query = isset($query_args['tax_query']) ? array_filter((array)$query_args['tax_query'], 'is_array') : [];
            $tax_query[] = [
                'taxonomy' => 'doctor_specializations',
                'field'    => 'term_id',
                'terms'    => [(int)$term->term_id],
            ];
            if (count($tax_query) > 1 && empty($tax_query['relation'])) $tax_query['relation'] = 'AND';
            $query_args['tax_query'] = $tax_query;
        }
    }

    // ACF relationship (clinic)
    if (!empty($where['clinicSlug'])) {
        $clinics = get_posts([
            'post_type' => 'clinics', 'name' => sanitize_text_field($where['clinicSlug']),
            'posts_per_page' => 1, 'post_status' => 'publish', 'fields' => 'ids',
        ]);
        if (!empty($clinics)) {
            $clinic_id = (int)$clinics[0];
            $meta_query = isset($query_args['meta_query']) ? array_filter((array)$query_args['meta_query'], 'is_array') : [];
            $meta_query[] = [
                'relation' => 'OR',
                ['key' => 'clinic', 'value' => $clinic_id, 'compare' => '='],
                ['key' => 'clinic', 'value' => '"' . $clinic_id . '"', 'compare' => 'LIKE'],
            ];
            if (count($meta_query) > 1 && empty($meta_query['relation'])) $meta_query['relation'] = 'AND';
            $query_args['meta_query'] = $meta_query;
        }
    }

    return $query_args;
}
add_filter('graphql_post_object_connection_query_args', 'unident_doctors_post_object_connection_query_args', 10, 5);
```

### Step 3: Next.js — buildDoctorsWhere БЕЗ orderby

```ts
function buildDoctorsWhere(filters?: DoctorsFilters) {
  const where: Record<string, unknown> = { status: "PUBLISH" };
  if (filters?.specializationSlug?.trim()) where.specializationSlug = filters.specializationSlug.trim();
  if (filters?.clinicSlug?.trim()) where.clinicSlug = filters.clinicSlug.trim();
  return where;
}
```

Не добавлять `orderby: { field: "MODIFIED", order: "DESC" }` — в `RootQueryToDoctorConnectionWhereArgs` формат другой, GraphQL вернёт ошибку.

### Step 4: Next.js — прямой fetch с cache: 'no-store' для фильтров

Apollo + Next.js fetch кэшируют по URL. Разные `where` — один URL → один закэшированный ответ.

```ts
// api.ts
import { print } from "graphql";

if (hasFilters) {
  const uri = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8002/graphql";
  const res = await fetch(uri, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: print(GET_DOCTORS_CONNECTION_FILTERED),
      variables: { first, after: after ?? undefined, where },
    }),
    cache: "no-store",
  });
  const json = await res.json();
  const doctors = json?.data?.doctors?.nodes ?? [];
  // ...
  return { doctors, pageInfo };
}
```

### Step 5: Next.js — парсинг searchParams напрямую

Nuqs parse / Zod validation могут давать пустые фильтры. Читать `searchParams` напрямую и нормализовать `string | string[]`:

```tsx
// page.tsx
const resolved = await searchParams;
const rawSpec = resolved?.specialization;
const rawClinic = resolved?.clinic;
const specializationSlug =
  typeof rawSpec === "string" ? rawSpec.trim()
  : Array.isArray(rawSpec) ? rawSpec[0]?.trim() : undefined;
const clinicSlug =
  typeof rawClinic === "string" ? rawClinic.trim()
  : Array.isArray(rawClinic) ? rawClinic[0]?.trim() : undefined;
const filters = {
  specializationSlug: specializationSlug?.length ? specializationSlug : undefined,
  clinicSlug: clinicSlug?.length ? clinicSlug : undefined,
};
```

---

## Common Errors

### Error: Фильтр в URL, но список не меняется

**Cause:** Кэш Next.js fetch (по URL) или Apollo; `graphql_map_input_fields_to_wp_query` не вызывается для CPT; неверный парсинг searchParams.

**Fix:**
1. Для запросов с фильтрами — прямой `fetch` с `cache: "no-store"`.
2. Добавить `graphql_post_object_connection_query_args`.
3. Парсить searchParams напрямую, без nuqs/Zod при сбоях.

### Error: "Variable \"$where\" got invalid value \"MODIFIED\" at \"where.orderby.field\""

**Cause:** `orderby` в `RootQueryTo*ConnectionWhereArgs` ожидает другой тип (`PostObjectsConnectionOrderbyInput`), не `{ field, order }`.

**Fix:** Убрать `orderby` из `buildDoctorsWhere`, использовать дефолт WPGraphQL.

### Error: GraphQL возвращает 2 врача, страница показывает 4

**Cause:** Кэш fetch Next.js по URL (POST на `/graphql`) — body не участвует в cache key.

**Fix:** `fetch(uri, { ..., cache: "no-store" })` для filtered queries.

### Error: Фильтры всегда undefined, hasFilters=false

**Cause:** nuqs parse или Zod validation возвращают пустые значения (формат searchParams — массив, или парсер не совместим).

**Fix:** Читать `resolved.specialization` / `resolved.clinic` напрямую, нормализовать `string | string[]`.

### Error: Изменения в PHP не применяются

**Cause:** WordPress не перезагрузил mu-plugins.

**Fix:** `docker compose restart wordpress-new` (или аналог для вашего стека).

---

## Verification

1. GraphQL IDE: `doctors(first: 4, where: { status: PUBLISH, specializationSlug: "gigiena" })` → 2 врача.
2. API: `GET /api/doctors?specialization=gigiena` → 2 врача.
3. Страница: `/doctors?specialization=gigiena` → 2 карточки в HTML.
4. PowerShell: `(Invoke-WebRequest "http://localhost:3000/doctors?specialization=gigiena").Content` — подсчёт уникальных slug врачей.

---

## Best Practices

### DO

1. Использовать `graphql_post_object_connection_query_args` для custom where-аргументов CPT.
2. Для filtered queries — прямой `fetch` с `cache: "no-store"` вместо Apollo.
3. Парсить searchParams с учётом `string | string[]`.
4. Перезапускать WordPress после изменений в mu-plugins.
5. Тестировать GraphQL напрямую (curl/IDE) перед проверкой страницы.

### DON'T

1. Добавлять `orderby` в where для `RootQueryTo*ConnectionWhereArgs` без проверки схемы.
2. Полагаться на Apollo/Next.js fetch cache для запросов с разными переменными.
3. Игнорировать формат `searchParams` (массивы).
4. Пропускать перезапуск WordPress после правок PHP.

---

## Related Skills

- [graphql-wordpress-debugging](../graphql-wordpress-debugging/SKILL.md)
- [wpgraphql-debugging](../wpgraphql-debugging/SKILL.md)
- [nextjs-caching](../nextjs-caching/SKILL.md)
