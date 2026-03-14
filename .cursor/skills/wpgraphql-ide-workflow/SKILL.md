---
name: wpgraphql-ide-workflow
description: Workflow with WPGraphQL IDE for debugging GraphQL queries, schema introspection, and test queries. Use when debugging filters, checking schema fields, verifying taxQuery/where arguments, or when user needs ready-to-paste GraphQL examples.
---

# WPGraphQL IDE Workflow

## When to Use

**Применять когда:**

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
- Нужно проверить GraphQL schema (поля, типы, аргументы)
- Отладка фильтров (doctors, services, taxQuery, metaQuery)
- GraphQL возвращает null/empty — нужно изолировать проблему
- Пользователь установил WPGraphQL IDE — можно дать готовый запрос для вставки
- Проверка формата where/taxQuery/clinicSlug перед исправлением кода

## Quick Reference

**URL IDE (если плагин установлен):** `https://[wordpress-url]/wp-admin` → GraphQL в меню, или типично `https://[site]/graphql` (GraphiQL endpoint).

**Типичный локальный endpoint:** `http://localhost:8002/graphql` (или порт WordPress в проекте).

**Workflow:** AI даёт готовый запрос → пользователь вставляет в IDE → выполняет → присылает результат или описание ошибки.

---

## Detailed Instructions

### Step 1: Определить endpoint GraphQL

- Локальная разработка: обычно `http://localhost:8002/graphql` или порт из `.env`
- Переменная: `NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT` или аналогичная
- WPGraphQL IDE: в админке WordPress → GraphQL (если плагин WPGraphQL IDE установлен)

### Step 2: Дать пользователю готовый запрос

Формат ответа для пользователя:

```
Откройте WPGraphQL IDE (или GraphiQL на [endpoint]) и выполните этот запрос:

\`\`\`graphql
[готовый запрос]
\`\`\`

Пришлите результат (данные или текст ошибки).
```

### Step 3: Примеры запросов под частые задачи

**Проверка doctors с taxQuery (фильтр по специализации):**

```graphql
query TestDoctorsFilter {
  doctors(
    first: 4
    where: {
      status: PUBLISH
      taxQuery: {
        taxArray: [
          {
            taxonomy: DOCTOR_SPECIALIZATIONS
            field: SLUG
            terms: ["terapevt"]
            operator: IN
          }
        ]
      }
    }
  ) {
    nodes {
      id
      title
      slug
      doctorSpecializations {
        nodes {
          slug
          name
        }
      }
    }
  }
}
```

**Проверка doctors с clinicSlug:**

```graphql
query TestDoctorsClinicFilter {
  doctors(
    first: 4
    where: {
      status: PUBLISH
      clinicSlug: "novoslobodskaya"
    }
  ) {
    nodes {
      id
      title
      clinic {
        slug
        title
      }
    }
  }
}
```

**Проверка списка специализаций:**

```graphql
query TestSpecializations {
  doctorSpecializations(first: 50) {
    nodes {
      id
      name
      slug
    }
  }
}
```

**Schema introspection (какие поля есть у Doctor):**

```graphql
query IntrospectDoctor {
  __type(name: "Doctor") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

**Проверка RootQueryToDoctorConnectionWhereArgs (доступные аргументы where):**

```graphql
query IntrospectDoctorWhere {
  __type(name: "RootQueryToDoctorConnectionWhereArgs") {
    name
    inputFields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

**Проверка MediaItemSizeEnum (перед использованием sourceUrl(size: X)):**

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

---

## Common Errors

### Error: "Unknown argument 'taxQuery'"

**Cause:** Плагин wp-graphql-tax-query не установлен или не активен.

**Fix:** Установить [wp-graphql-tax-query](https://github.com/wp-graphql/wp-graphql-tax-query). См. [docs/PRODUCTION-WORDPRESS-PLUGINS.md](../../docs/PRODUCTION-WORDPRESS-PLUGINS.md).

### Error: "Unknown argument 'clinicSlug'"

**Cause:** Кастомный аргумент clinicSlug не зарегистрирован в WordPress (mu-plugin register-doctors-clinics-graphql.php).

**Fix:** Проверить mu-plugins и регистрацию `RootQueryToDoctorConnectionWhereArgs`.

### Error: "Field 'taxArray' requires list of TaxArray"

**Cause:** Передан объект вместо массива. taxArray должен быть `[{ ... }]`, а не `{ ... }`.

**Fix:** Обернуть объект в массив: `taxArray: [{ taxonomy, field, terms, operator }]`.

### Error: "Value \"FULL\" does not exist in \"MediaItemSizeEnum\" enum"

**Cause:** Версия WPGraphQL не поддерживает FULL. Доступны: THUMBNAIL, MEDIUM, MEDIUM_LARGE, LARGE (и кастомные размеры).

**Fix:** Использовать `sourceUrl` без аргумента (возвращает полный URL) или `sourceUrl(size: LARGE)`. См. [wpgraphql-media-item-sizes](../wpgraphql-media-item-sizes/SKILL.md).

---

## Best Practices

### ✅ DO:

1. Давать запросы с минимальным набором полей для быстрой проверки
2. Подставлять реальные slug из проекта (terapevt, novoslobodskaya и т.д.)
3. Включать в ответ инструкцию: «Вставьте в IDE и пришлите результат»
4. Использовать Introspection-запросы для проверки schema при неясных ошибках
5. Перед добавлением `sourceUrl(size: X)` выполнить introspection MediaItemSizeEnum

### ❌ DON'T:

1. Не давать длинные запросы с десятками полей — достаточно 2–5 ключевых
2. Не предполагать порт/URL — уточнять или брать из env проекта
3. Не пропускать проверку schema перед изменением кода — IDE даёт точный ответ

---

## Связанные навыки

- [graphql-wordpress-debugging](../graphql-wordpress-debugging/SKILL.md) — полный workflow отладки GraphQL
- [wpgraphql-media-item-sizes](../wpgraphql-media-item-sizes/SKILL.md) — MediaItem sourceUrl и MediaItemSizeEnum
- [wpgraphql-debugging](../wpgraphql-debugging/SKILL.md) — отладка WPGraphQL и ACF
- [docs/PRODUCTION-WORDPRESS-PLUGINS.md](../../docs/PRODUCTION-WORDPRESS-PLUGINS.md) — плагины для production
