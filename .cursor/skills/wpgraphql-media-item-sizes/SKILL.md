---
name: wpgraphql-media-item-sizes
description: WPGraphQL MediaItem sourceUrl and MediaItemSizeEnum. Use when querying image URLs from GraphQL, improving image quality, or encountering "Value X does not exist in MediaItemSizeEnum" errors.
---

# WPGraphQL MediaItem Sizes

## When to Use

**Применять когда:**

- Запрашиваешь `sourceUrl` для изображений в GraphQL (photoBefore, photoAfter, featuredImage и т.д.)
- Улучшаешь качество изображений через GraphQL
- Ошибка «Value FULL does not exist in MediaItemSizeEnum enum»
- Секция показывает «Данные не найдены» после добавления `sourceUrl(size: X)`

## Quick Reference

**Безопасный вариант:** `sourceUrl` без аргумента — возвращает полный URL оригинала.

**Перед использованием `sourceUrl(size: X)`:** Выполнить introspection MediaItemSizeEnum в GraphiQL.

---

## Problem: MediaItemSizeEnum зависит от версии WPGraphQL

### Root Cause

Не все версии WPGraphQL содержат `FULL` в `MediaItemSizeEnum`. Типичные значения: THUMBNAIL, MEDIUM, MEDIUM_LARGE, LARGE + кастомные размеры из `add_image_size()`.

Если использовать несуществующее значение (например `sourceUrl(size: FULL)`), GraphQL возвращает ошибку и **весь запрос падает** — data = null.

### Solution

**Step 1: Проверить доступные значения через introspection**

```graphql
query IntrospectMediaItemSizeEnum {
  __type(name: "MediaItemSizeEnum") {
    name
    enumValues {
      name
    }
  }
}
```

Выполнить в GraphiQL (`http://localhost:8002/graphql`). Результат покажет список допустимых значений.

**Step 2: Использовать только существующие значения**

- Если `FULL` есть в enum — можно использовать `sourceUrl(size: FULL)`
- Если `FULL` нет — использовать `sourceUrl` без аргумента (возвращает полный URL) или `sourceUrl(size: LARGE)`

**Step 3: Безопасный fallback**

```graphql
# ✅ Безопасно — всегда работает
photoBefore {
  sourceUrl
  altText
  mediaDetails { width height }
}
```

`sourceUrl` без аргумента возвращает URL оригинального файла (full size).

---

## Image Quality Workflow

### Для улучшения качества изображений

1. **WordPress:** Убедиться, что в Media Library загружены полноразмерные изображения (не 768×432). При необходимости переимпортировать из источника.
2. **GraphQL:** Использовать `sourceUrl` без аргумента — WordPress отдаст полный URL.
3. **next/image:** `quality={90}`, `sizes` для подсказки браузеру.

```tsx
<Image
  src={photoBefore.sourceUrl}
  alt={photoBefore.altText}
  fill
  quality={90}
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
  className="object-cover"
/>
```

---

## Common Errors

### Error: "Value \"FULL\" does not exist in \"MediaItemSizeEnum\" enum"

**Cause:** Версия WPGraphQL не поддерживает FULL. Доступны: THUMBNAIL, MEDIUM, MEDIUM_LARGE, LARGE (и кастомные размеры).

**Fix:** Использовать `sourceUrl` без аргумента (возвращает полный URL) или `sourceUrl(size: LARGE)`.

---

## Best Practices

### ✅ DO:

1. Проверять MediaItemSizeEnum через introspection перед использованием `sourceUrl(size: X)`
2. Использовать `sourceUrl` без аргумента для полного размера — безопасно и работает везде
3. Для качества: переимпорт full-size в WordPress + sourceUrl без size + next/image quality/sizes

### ❌ DON'T:

1. Не использовать `sourceUrl(size: FULL)` без проверки schema
2. Не предполагать, что enum одинаков во всех версиях WPGraphQL

---

## Related Skills

- [graphql-wordpress-debugging](../graphql-wordpress-debugging/SKILL.md) — Problem 6: Invalid Enum Value
- [wpgraphql-ide-workflow](../wpgraphql-ide-workflow/SKILL.md) — introspection запросы
- [inline-svg-vs-images](../inline-svg-vs-images/SKILL.md) — next/image для фото
