# Отчёт по отладке фильтрации врачей (Doctors Archive Filters)

> Дата: 2026-02-10  
> Для передачи контекста в другой чат/сессию

---

## 1. Исходная проблема

**Симптомы:**
- При нажатии на кнопку фильтра (специализация или клиника) фильтрация не срабатывает
- Список врачей исчезает полностью
- Фильтры «пропадают» — показываются все врачи
- Клики срабатывают с задержкой (~1 секунда)
- При выборе фильтра список исчезает, но кнопка фильтра становится активной (стили применяются)

**Дополнительные требования:**
- Пустые термины специализации (без slug/name) не должны отображаться в фильтре и не должны участвовать в фильтрации

---

## 2. Архитектура фильтрации (до отладки)

- **URL:** `?specialization=slug&clinic=slug&page=1`
- **Сервер:** `page.tsx` парсит `searchParams` через `doctorsSearchParamsCache` (nuqs), передаёт в `getDoctorsConnection(filters)`
- **Клиент:** `DoctorsFilters` использует `useSearchParams` + `router.push()` для обновления URL
- **Данные:** `buildDoctorsWhere()` формирует `where` с `taxQuery` (специализация) и `clinicSlug` (клиника)
- **GraphQL:** `GET_DOCTORS_CONNECTION_FILTERED` с переменной `$where: RootQueryToDoctorConnectionWhereArgs`

---

## 3. Гипотезы (сформулированы при отладке)

| # | Гипотеза | Статус |
|---|----------|--------|
| H1 | nuqs parse возвращает null для specialization/clinic | Частично — проверено логированием |
| H2 | `updateFilters` формирует неверный URL или router.push сбрасывает параметры | Отклонена |
| H3 | `getDoctorsConnection` получает пустые filters | Отклонена |
| H4 | Неверный формат `taxQuery` — WPGraphQL не понимает | **Подтверждена** |
| H5 | Suspense показывает fallback при навигации — список «исчезает» | **Подтверждена** |

---

## 4. Что делали (шаги отладки)

### 4.1 Инструментирование

Добавлены debug-логи (fetch к debug endpoint):

- **doctors/page.tsx:** логирование `params`, `filters` после parse
- **doctors-filters.tsx:** логирование `updates`, `targetUrl` при клике на фильтр
- **api.ts (getDoctorsConnection):** логирование `hasFilters`, `doctorsCount`, `filters`

**Результат:** Логи в doctors-filters заблокировали обработчики — при клике ничего не происходило (ни навигация, ни смена стилей). Инструментирование в клиентском компоненте удалено.

### 4.2 Анализ кода и документации

- Проверен формат `taxQuery` в wp-graphql-tax-query: `taxArray` должен быть **массивом** объектов, а не одним объектом
- Проверена документация WPGraphQL Tax Query — требуется `taxArray: [{ ... }]`, `operator: "IN"`
- Выявлено: при `router.push()` срабатывает Suspense — пока идёт загрузка RSC, показывается fallback (скелетон), из‑за чего список «исчезает»

### 4.3 Проверка плагинов WordPress

- `wp-graphql-tax-query` — **обязателен** для фильтрации по таксономиям. Без него аргумент `taxQuery` не поддерживается
- Плагин в проекте не был установлен — это основная причина, почему фильтр по специализации не работал

---

## 5. Внесённые исправления

### 5.1 Формат taxQuery (api.ts)

**Было:**
```typescript
taxQuery: {
  taxArray: {
    taxonomy: "DOCTOR_SPECIALIZATIONS",
    field: "SLUG",
    terms: [filters.specializationSlug],
  },
},
```

**Стало:** (идентификатор таксономии в TaxonomyEnum чаще всего совпадает с ключом таксономии в верхнем регистре: `doctor_specializations` → `DOCTOR_SPECIALIZATIONS`)
```typescript
taxQuery: {
  taxArray: [
    {
      taxonomy: "DOCTOR_SPECIALIZATIONS",
      field: "SLUG",
      terms: [filters.specializationSlug],
      operator: "IN",
    },
  ],
},
```

### 5.2 startTransition (doctors-filters.tsx)

Обёрнут `router.push()` в `startTransition()`, чтобы во время навигации отображался текущий контент, а не skeleton. Список не «пропадает» при переключении фильтра.

```typescript
startTransition(() => {
  router.push(target);
});
```

### 5.3 Фильтрация пустых специализаций (page.tsx)

Специализации с пустым `slug` или `name` исключаются перед передачей в `DoctorsFilters`:

```typescript
specializations.filter(
  (s) => (s.slug?.trim() ?? "") !== "" && (s.name?.trim() ?? "") !== ""
)
```

### 5.4 Валидация slug в buildDoctorsWhere (api.ts)

Пустые slug не добавляются в `where`:

```typescript
if (filters?.specializationSlug?.trim()) { ... }
if (filters?.clinicSlug?.trim()) { ... }
```

### 5.5 Удаление инструментирования

Убраны все debug-логи из page.tsx и api.ts.

---

## 6. Требования к WordPress

### Обязательный плагин

- **wp-graphql-tax-query** — для поддержки `taxQuery` в запросах врачей
  - [WPGraphQL Extensions](https://www.wpgraphql.com/extension-plugins/wpgraphql-tax-query)
  - [GitHub](https://github.com/wp-graphql/wp-graphql-tax-query)
  - Настроек не требует, достаточно активации

### Рекомендуемые

- **WPGraphQL Smart Cache** — кэширование GraphQL, инвалидация при изменении контента
- **WPGraphQL IDE** — для отладки запросов в админке WordPress

Подробнее: [docs/PRODUCTION-WORDPRESS-PLUGINS.md](PRODUCTION-WORDPRESS-PLUGINS.md)

---

## 7. Созданные артефакты

| Артефакт | Назначение |
|----------|------------|
| `docs/PRODUCTION-WORDPRESS-PLUGINS.md` | Список плагинов WordPress для production с ссылками |
| `docs/DEBUG-DOCTORS-FILTER-REPORT.md` | Этот отчёт |
| `.cursor/skills/wpgraphql-ide-workflow/SKILL.md` | Skill для работы с WPGraphQL IDE — готовые запросы, introspection, типовые ошибки |
| Ссылка в `CURSOR.md` | На docs/PRODUCTION-WORDPRESS-PLUGINS.md |

---

## 8. Проверка после исправлений

1. Установить и активировать **wp-graphql-tax-query** в WordPress
2. Открыть `/doctors`
3. Нажать фильтр по специализации — список должен отфильтроваться
4. Нажать фильтр по клинике — список должен отфильтроваться
5. Убедиться, что при переключении фильтра список не исчезает (используется startTransition)
6. Проверить, что пустые специализации не отображаются в списке фильтров

---

## 9. Проверка через WordPress MCP

Через инструменты **WordPress MCP** (Cursor Tools & MCP) можно убедиться, что:

- Сайт доступен: `get_site_info` возвращает `site_url` (должен совпадать с `NEXT_PUBLIC_GRAPHQL_ENDPOINT` без `/graphql`, например `http://localhost:8002`).
- В списке `plugins.active` есть **WPGraphQL Tax Query** (slug вида `wp-graphql-tax-query-develop` или `wp-graphql-tax-query`).
- CPT врачи есть и заполнен: `wp_cpt_search` с `post_type: "doctors"` возвращает записи.

Если MCP подключён к тому же WordPress, что и Next.js, а фильтр по специализации всё равно пустой — см. п. 10 (имя таксономии в enum).

## 10. Если проблема остаётся

1. **Проверить в WPGraphQL IDE** — выполнить тестовый запрос с taxQuery (примеры в skill `wpgraphql-ide-workflow`)
2. **Ошибка "Unknown argument 'taxQuery'"** — плагин wp-graphql-tax-query не активен
3. **Пустой результат при фильтре** — проверить slug терминов в WordPress, убедиться что врачи привязаны к специализациям; проверить через MCP список плагинов и CPT doctors
4. **Неверный enum таксономии** — в IDE выполнить introspection по типу `TaxonomyEnum` и подставить в `buildDoctorsWhere()` точное значение для специализаций врачей (часто `DOCTOR_SPECIALIZATIONS` по ключу таксономии `doctor_specializations`)
5. **clinicSlug не работает** — проверить mu-plugin `register-doctors-clinics-graphql.php` и фильтр `unident_doctors_connection_clinic_meta_query`

---

## 11. Ключевые файлы

- `nextjs/src/app/doctors/page.tsx` — парсинг searchParams, вызов getDoctorsConnection
- `nextjs/src/components/sections/doctors-filters.tsx` — UI фильтров, updateFilters, startTransition
- `nextjs/src/components/sections/doctors-archive-client.tsx` — сетка карточек, Load More
- `nextjs/src/lib/wordpress/api.ts` — getDoctorsConnection, buildDoctorsWhere
- `nextjs/src/lib/doctors-filters-server.ts` — doctorsSearchParamsCache (nuqs)
- `wp-content/mu-plugins/register-doctors-clinics-graphql.php` — clinicSlug в RootQueryToDoctorConnectionWhereArgs
