---
name: graphql-wordpress-debugging
description: Debug GraphQL queries with WordPress + Next.js - schema mismatches, relationship formats, cache issues. Use when GraphQL returns null/empty data, "Cannot query field" errors, or data doesn't update after WordPress changes.
---

# GraphQL + WordPress Debugging Workflow

## When to Use

**Автоматически применять когда:**

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
- GraphQL queries возвращают `null` или пустой массив
- Ошибки "Cannot query field X on type Y"
- Данные не обновляются после изменений в WordPress
- Next.js компоненты не получают данные несмотря на то что они есть в WordPress
- ISR (Incremental Static Regeneration) не обновляет данные

## Quick Debugging Checklist

```bash
# 1. Проверить данные в WordPress (всегда первый шаг!)
docker exec wp-new-wordpress php /var/www/html/scripts/check-data.php

# 2. Проверить GraphQL schema
# Открыть http://localhost:8002/graphql и проверить что поля существуют
# Проверять enum-значения в GraphiQL перед добавлением в код (sourceUrl(size: X), where: { status: X })

# 3. Очистить Next.js cache
Remove-Item -Path "nextjs\.next\cache" -Recurse -Force
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
cd nextjs; npm run dev

# 4. Проверить логи Next.js
Get-Content terminals/[terminal-id].txt | Select-String -Pattern "GraphQL|Error"
```

---

## Problem 1: GraphQL Schema Mismatch

### Symptoms

```typescript
// Next.js logs:
[getPricesByCategories] Services count: 0
GraphQL Error: Cannot query field "serviceFields" on type "Service"
GraphQL Error: Cannot query field "priceFrom" on type "ServiceFields"
```

### Root Cause

Запрашиваются поля которых НЕТ в GraphQL schema (не зарегистрированы в WordPress).

### Solution

**Step 1: Проверить что поля существуют в schema**

Открыть GraphiQL IDE: `http://localhost:8002/graphql`

```graphql
# Тестовый запрос
query TestQuery {
  services(first: 1) {
    nodes {
      id
      title
      # ДОБАВИТЬ ТОЛЬКО ТЕ ПОЛЯ КОТОРЫЕ ВИДНЫ В AUTOCOMPLETE
    }
  }
}
```

**Step 2: Убрать несуществующие поля из queries**

```typescript
// ❌ ПЛОХО - запрашивает несуществующие поля
export const SERVICE_FIELDS = gql`
  fragment ServiceFields on Service {
    serviceFields {
      # ← НЕТ в schema!
      priceFrom
      priceTo
    }
  }
`;

// ✅ ХОРОШО - только реальные поля
export const SERVICE_FIELDS = gql`
  fragment ServiceFields on Service {
    id
    title
    slug
    # Только поля которые есть в GraphiQL autocomplete
  }
`;
```

**Step 3: Зарегистрировать недостающие поля (если нужны)**

```php
// wp-content/mu-plugins/unident-acf-fields.php
register_graphql_field('Service', 'serviceFields', [
    'type' => 'ServiceFieldsType',  // Создать custom type
    'resolve' => function($post) {
        return [
            'priceFrom' => get_field('price_from', $post->ID),
            'priceTo' => get_field('price_to', $post->ID),
        ];
    }
]);
```

---

## Problem 2: Connection vs List Format для Relationships

### Symptoms

```typescript
// Данные приходят но структура неправильная
relatedPrices: [Object, Object]  // Ожидаем массив
relatedPrices: { edges: [...] }  // Получаем connection

// Или наоборот
TypeError: relatedPrices.edges is undefined
```

### Root Cause

ACF отношения могут быть экспортированы в 2 форматах:

1. **Connection format** (auto-registration): `edges { node { ... } }`
2. **List format** (manual registration): прямой массив `[...]`

### Solution

**Step 1: Определить какой формат используется**

Проверить в WordPress:

```php
// scripts/check-relationship-format.php
$service = get_post(125);
$related_prices = get_field('related_prices', $service->ID);

echo "Related prices type: " . gettype($related_prices) . "\n";
echo "Is array: " . (is_array($related_prices) ? 'YES' : 'NO') . "\n";
print_r($related_prices);
```

**Step 2A: Если используется MANUAL registration (list format)**

```php
// wp-content/mu-plugins/unident-acf-fields.php
register_graphql_field('Service', 'relatedPrices', [
    'type' => ['list_of' => 'Price'],  // ← List format!
    'resolve' => function($post) {
        $price_ids = get_field('related_prices', $post->ID);
        if (!$price_ids) return [];

        return array_map(function($price_id) {
            return get_post($price_id);
        }, $price_ids);
    }
]);
```

**GraphQL Query для list format:**

```typescript
query GetServices {
  services {
    nodes {
      relatedPrices {  # ← Прямой массив
        id
        title
        priceFields {
          regularPrice
        }
      }
    }
  }
}
```

**Data processing для list format:**

```typescript
// ✅ ПРАВИЛЬНО для list format
const relatedPrices = service.relatedPrices || [];
```

**Step 2B: Если используется AUTO-REGISTRATION (connection format)**

```graphql
query GetServices {
  services {
    nodes {
      serviceRelationships {
        # ← Field group
        relatedPrices {
          edges {
            # ← Connection format
            node {
              id
              title
            }
          }
        }
      }
    }
  }
}
```

**Data processing для connection format:**

```typescript
// ✅ ПРАВИЛЬНО для connection format
const relatedPrices =
  service.serviceRelationships?.relatedPrices?.edges?.map((e) => e.node) || [];
```

**Step 3: СТАНДАРТИЗИРОВАТЬ на один формат**

**Рекомендация: Использовать LIST FORMAT везде**

Причины:

- Проще код (нет `edges.node`)
- Меньше вложенности
- Легче type-safe типизация

Изменить ВСЕ queries на list format:

```typescript
// nextjs/src/lib/wordpress/queries/*.ts
// Заменить везде:
relatedPrices {
  edges {    # ← УДАЛИТЬ
    node {   # ← УДАЛИТЬ
      ...
    }
  }
}

// На:
relatedPrices {
  id
  title
  ...
}
```

---

## Problem 3: Next.js ISR Cache Not Updating

### Symptoms

- Данные изменены в WordPress
- GraphQL возвращает новые данные (проверено в GraphiQL)
- НО Next.js фронтенд показывает старые данные
- Даже после перезагрузки браузера

### Root Cause

Next.js ISR (Incremental Static Regeneration) кэширует страницы и данные.

### Solution

**Step 1: Проверить что данные есть в WordPress**

```bash
# ВСЕГДА проверять ПЕРЕД отладкой Next.js!
docker exec wp-new-wordpress php /var/www/html/scripts/check-data.php
```

**Step 2: Очистить Next.js cache**

```powershell
# Остановить dev server
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Удалить .next/cache
Remove-Item -Path "d:\template\nextjs\.next\cache" -Recurse -Force -ErrorAction SilentlyContinue

# Перезапустить dev server
cd d:\template\nextjs
npm run dev
```

**Step 3: Использовать fetchPolicy: 'no-cache' для отладки**

```typescript
// nextjs/src/lib/wordpress/api.ts
const { data } = await client.query({
  query: GET_ALL_SERVICES,
  fetchPolicy: "no-cache", // ← Для отладки!
});
```

**Step 4: On-Demand Revalidation (production)**

```typescript
// nextjs/src/app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const { secret, path } = await request.json();

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

```php
// WordPress webhook
add_action('save_post', function($post_id) {
  wp_remote_post('https://your-site.com/api/revalidate', [
    'body' => [
      'secret' => REVALIDATE_SECRET,
      'path' => '/',
    ],
  ]);
});
```

---

## Problem 4: Option Pages Data Not Available

### Symptoms

```typescript
[PriceSection] selectedPromotion: null
[AppointmentForm] contacts: null
```

WordPress Option Pages созданы, но данные NULL.

### Root Cause

Option Pages зарегистрированы, но НЕ заполнены данными.

### Solution

**Step 1: Проверить что Option Pages существуют**

```php
// scripts/check-option-pages.php
<?php
require_once('/var/www/html/wp-load.php');

if (function_exists('acf_get_options_pages')) {
    $pages = acf_get_options_pages();
    foreach ($pages as $slug => $page) {
        echo "✓ {$slug}: {$page['page_title']}\n";
    }
}

// Проверить данные
$selected_promotion = get_field('selected_promotion', 'option');
$phone = get_field('site_phone', 'option');

echo "\nselected_promotion: " . ($selected_promotion ?: "NULL") . "\n";
echo "site_phone: " . ($phone ?: "NULL") . "\n";
```

**Step 2: Заполнить тестовыми данными**

```php
// scripts/fill-option-pages.php
<?php
require_once('/var/www/html/wp-load.php');

// Block Prices Settings
$promotions = get_posts([
    'post_type' => 'promotions',
    'posts_per_page' => 1,
    'post_status' => 'publish',
]);

if (count($promotions) > 0) {
    update_field('selected_promotion', $promotions[0]->ID, 'option');
    echo "✓ Selected promotion: {$promotions[0]->post_title}\n";
}

// Contacts Settings
update_field('site_email', 'info@example.com', 'option');
update_field('site_phone', '+7 (495) 123-45-67', 'option');

$social_contacts = [
    ['social_text' => 'Telegram', 'social_url' => 'https://t.me/example'],
    ['social_text' => 'WhatsApp', 'social_url' => 'https://wa.me/example'],
];
update_field('social_contacts', $social_contacts, 'option');

echo "✓ Contacts filled\n";
```

**Step 3: Проверить GraphQL registration для Option Pages**

```php
// wp-content/mu-plugins/unident-acf-fields.php

// Manual registration для Option Pages
register_graphql_field('RootQuery', 'blockPricesSettings', [
    'type' => 'BlockPricesSettings',
    'resolve' => function() {
        $promotion_id = get_field('selected_promotion', 'option');
        if (!$promotion_id) return null;

        return [
            'selectedPromotion' => get_post($promotion_id)
        ];
    }
]);
```

---

## Problem 5: Empty Data Despite Correct Queries

### Symptoms

```typescript
[getPricesByCategories] Categories count: 7
[getPricesByCategories] Services count: 0  // ← ПРОБЛЕМА!
```

GraphQL query синтаксически правильный, но возвращает пустой массив.

### Root Cause

1. Данные не существуют в WordPress
2. Неправильные фильтры в query (where)
3. Permission issues

### Solution

**Step 1: Проверить РЕАЛЬНОЕ наличие данных в WordPress**

```php
// scripts/check-services-count.php
<?php
require_once('/var/www/html/wp-load.php');

$services = get_posts([
    'post_type' => 'services',
    'post_status' => 'publish',
    'posts_per_page' => -1,
]);

echo "Total services in DB: " . count($services) . "\n";

foreach ($services as $service) {
    echo "  - {$service->post_title}\n";
}
```

**Step 2: Упростить query до минимума**

```graphql
# Начать с самого простого
query TestServices {
  services(first: 10) {
    nodes {
      id
      title
    }
  }
}
```

Если работает → постепенно добавлять поля.

**Step 3: Проверить where filters**

```graphql
# ❌ ПЛОХО - слишком строгий filter
query GetServices {
  services(
    first: 100
    where: {
      status: PUBLISH
      hasPassword: false  # ← Может быть проблема
      categoryName: "exact-match"  # ← Может не найти
    }
  ) {
    nodes { ... }
  }
}

# ✅ ХОРОШО - минимальные filters
query GetServices {
  services(first: 100, where: { status: PUBLISH }) {
    nodes { ... }
  }
}
```

---

## Problem 6: Invalid Enum Value — Query Fails Entirely

### Symptoms

- Секция показывает «Данные не найдены», Works count: 0
- Простой запрос без подозрительного поля возвращает данные
- В логах: GraphQL errors, но не «Cannot query field»

### Root Cause

Аргумент с несуществующим enum-значением (например `sourceUrl(size: FULL)` при отсутствии FULL в MediaItemSizeEnum) вызывает ошибку GraphQL — весь запрос падает, data = null.

### Solution

**Step 1:** Выполнить запрос в GraphiQL с подозрительным полем — увидеть точную ошибку (например «Value FULL does not exist in MediaItemSizeEnum enum»).

**Step 2:** Проверить enum через introspection:

```graphql
query IntrospectEnum {
  __type(name: "MediaItemSizeEnum") {
    enumValues { name }
  }
}
```

**Step 3:** Убрать несуществующее значение или заменить на существующее.

**Step 4:** Для MediaItem sourceUrl: безопасно использовать `sourceUrl` без аргумента (возвращает полный URL).

См. [wpgraphql-media-item-sizes](../wpgraphql-media-item-sizes/SKILL.md).

---

## Complete Debugging Workflow

### Полный workflow при проблемах с данными:

```bash
# 1. ВСЕГДА НАЧИНАТЬ С WORDPRESS
docker exec wp-new-wordpress php /var/www/html/scripts/check-data.php

# 2. Проверить GraphQL schema
# Открыть http://localhost:8002/graphql
# Выполнить тестовый запрос

# 3. Проверить Next.js logs
Get-Content terminals/[id].txt | Select-String -Pattern "Error|GraphQL" -Context 2,5

# 4. Очистить кэш
Remove-Item nextjs\.next\cache -Recurse -Force
Get-Process -Name node | Stop-Process -Force
cd nextjs; npm run dev

# 5. Проверить фронтенд
# Открыть http://localhost:3000
# Проверить browser console для ошибок
```

---

## Common Patterns

### Pattern 1: Создание check-скрипта для новой feature

```php
// scripts/check-[feature-name].php
<?php
require_once('/var/www/html/wp-load.php');

echo "\n=== Checking [Feature Name] ===\n\n";

// 1. Проверить CPT posts
$posts = get_posts(['post_type' => 'your_cpt', 'posts_per_page' => -1]);
echo "Total posts: " . count($posts) . "\n";

// 2. Проверить ACF fields
foreach ($posts as $post) {
    $field_value = get_field('your_field', $post->ID);
    echo "  - {$post->post_title}: {$field_value}\n";
}

// 3. Проверить relationships
// 4. Проверить Option Pages если нужно

echo "\n=== Check Complete ===\n\n";
```

### Pattern 2: Debug GraphQL query step-by-step

```typescript
// 1. Начать с минимума
const TEST_QUERY = gql`
  query Test {
    services(first: 1) {
      nodes {
        id
        title
      }
    }
  }
`;

// 2. Добавлять поля по одному
// 3. Когда ломается → найдена проблема

// 4. Логировать все
console.log("[DEBUG] Query result:", JSON.stringify(data, null, 2));
```

### Pattern 3: Bi-directional relationships check

```php
// scripts/check-bidirectional-relationships.php
<?php
require_once('/var/www/html/wp-load.php');

$service = get_post(125);
$prices_from_service = get_field('related_prices', $service->ID);

echo "Service: {$service->post_title}\n";
echo "Related prices: " . count($prices_from_service) . "\n";

foreach ($prices_from_service as $price_id) {
    $price = get_post($price_id);
    $services_from_price = get_field('related_services', $price_id);

    echo "  - Price: {$price->post_title}\n";
    echo "    Back-reference to service: ";
    echo in_array($service->ID, $services_from_price) ? "✓ OK" : "✗ BROKEN";
    echo "\n";
}
```

---

## Best Practices

### ✅ DO:

1. **ВСЕГДА проверять данные в WordPress ПЕРЕД Next.js**
2. **Создавать check-скрипты для каждой feature**
3. **Стандартизировать на один формат** (list vs connection)
4. **Логировать все этапы** data fetching
5. **Начинать с минимального query** и усложнять постепенно
6. **Очищать cache** после изменений в WordPress
7. **Тестировать GraphQL в GraphiQL** перед Next.js
8. **Проверять enum-значения** (sourceUrl(size: X), where: { status: X }) через introspection перед добавлением в код

### ❌ DON'T:

1. ❌ Не изобретать поля которых нет в schema
2. ❌ Не смешивать connection и list formats
3. ❌ Не забывать про ISR cache
4. ❌ Не предполагать что данные есть — проверять!
5. ❌ Не использовать сложные filters сразу
6. ❌ Не игнорировать GraphQL errors в логах

---

## Troubleshooting Guide

### "Cannot query field X"

→ Поле не зарегистрировано в schema
→ Проверить GraphiQL autocomplete
→ Зарегистрировать вручную или убрать из query

### "Services count: 0"

→ Данные не существуют в WordPress
→ Проверить через PHP скрипт
→ Создать тестовые данные

### "selectedPromotion: null"

→ Option Page не заполнена
→ Создать fill-скрипт
→ Проверить GraphQL registration для Option Page

### "relatedPrices.edges is undefined"

→ Смешаны connection и list formats
→ Стандартизировать на один формат
→ Изменить все queries

### "Value X does not exist in Y enum"

→ Аргумент с несуществующим enum-значением
→ Проверить `__type(name: "Y")` в GraphiQL
→ Использовать только существующие значения или убрать аргумент
→ См. [wpgraphql-media-item-sizes](../wpgraphql-media-item-sizes/SKILL.md)

### Data не обновляется после изменений

→ ISR cache
→ Очистить `.next/cache`
→ Перезапустить dev server
→ Использовать `fetchPolicy: 'no-cache'` для отладки

---

**Статус:** ✅ Production-ready
**Версия:** 1.0.0
**Дата:** 2026-02-04
