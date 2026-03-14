# Детальный отчёт по проекту УниДент

> Единый документ: описание проекта, технологии, плагины и архитектура фильтрации (Terms, Meta, связи).  
> Структура отчёта выстроена по принципу последовательного изложения: от общего контекста к деталям и к конкретной задаче фильтрации.

---

# Часть I. Общее описание проекта

## 1. Назначение и контекст

**УниДент** — сайт стоматологической клиники (медицинский проект). Реализован как **headless-приложение**: контент и структура данных управляются в **WordPress**, отдача страниц и интерфейс — на **Next.js**. Пользователи видят только фронтенд на Next.js; WordPress выступает в роли CMS и GraphQL API.

Цели проекта с точки зрения продукта:
- Презентация услуг, врачей, клиник, акций и отзывов.
- Запись на приём, контакты, информация для пациентов (FAQ, гарантии, ОМС, рассрочка, налоговый вычет).
- Блог, кейсы (наши работы), лицензии.
- Высокие требования к **скорости загрузки** и **SEO** (медицинская тематика, локальный поиск, Core Web Vitals).

Реализация строится на философии **performance-first** и чётких правилах по SEO (canonical, метаданные, структурированные данные), описанных в `.cursor/rules/`.

---

## 2. Структура репозитория (высокоуровнево)

| Часть | Назначение |
|-------|------------|
| **nextjs/** | Фронтенд: Next.js 14 (App Router), React, TypeScript, UI и дизайн-система. |
| **wp-content/** | Контент и плагины WordPress: mu-plugins (CPT, таксономии, регистрация полей для GraphQL). |
| **wordpress/** | Минимальная обвязка WordPress (если есть). |
| **scripts/** | PHP-скрипты для наполнения данными, проверки ACF/CPT и кэша GraphQL. |
| **docs/** | Документация по развёртыванию, Faust, MCP, API. |
| **.cursor/** | Правила и навыки для Cursor AI (design-system, performance, SEO, WordPress, GraphQL и др.). |

Фронтенд получает данные через **WPGraphQL** (Apollo Client в Next.js). Маршрутизация: App Router с динамическими сегментами (`[slug]`, `[...slug]`), статические и динамические страницы (архивы, сущности, блог, служебные разделы).

---

# Часть II. Технологии

## 1. Frontend (Next.js)

| Технология | Версия / использование |
|------------|------------------------|
| **Next.js** | ^14.0.0, App Router. |
| **React** | ^18.2.0. |
| **TypeScript** | ^5.0.0. |
| **Apollo Client** | ^3.8.0 — запросы к WPGraphQL, кэш, типизация запросов. |
| **Faust.js** | @faustwp/cli ^3.3.4, @faustwp/core ^3.3.4 — интеграция WordPress + Next.js (preview, маршрутизация к WP при необходимости). |

Особенности использования:
- **Server Components по умолчанию**: данные (врачи, услуги, посты и т.д.) запрашиваются на сервере в `page.tsx` или в родительских компонентах.
- **Client Components** только там, где нужна интерактивность: слайдеры (Embla), карты (Leaflet), формы, выпадающие меню, кнопка «Загрузить ещё» в архиве врачей.
- **Динамические маршруты**: `app/doctors/[slug]/page.tsx`, `app/services/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`, `app/[...slug]/page.tsx` и др.
- **API Routes**: `app/api/doctors/route.ts` (пагинация «Загрузить ещё»), `app/api/faust/[[...route]]` (Faust).

## 2. Стили и UI

| Технология | Использование |
|------------|----------------|
| **Tailwind CSS** | ^3.4.0 — утилитарные классы, адаптив, дизайн-токены (цвета unident-*). |
| **Radix UI** | Avatar, Dialog, Dropdown Menu, Label, Navigation Menu, Popover, Select, Separator, Slot — примитивы доступности. |
| **Shadcn UI** | Компоненты на базе Radix (Button, Card, Input, Select, Dialog, Avatar, Badge и др.) в `src/components/ui/`. |
| **Дизайн-система** | Собственные компоненты в `src/components/design-system/`: Text, Heading, Button, Card, Badge, Container, Section, Breadcrumbs; варианты и токены в `src/design-tokens/typography.ts`. |
| **class-variance-authority (cva)** | Варианты кнопок и компонентов. |
| **clsx / tailwind-merge** | Сборка и слияние классов. |
| **tailwindcss-animate** | Анимации. |

Иконки и графика:
- **Lucide React** — часть иконок.
- **@iconify/react** — дополнительные иконки.
- **Inline SVG** (в т.ч. через `src/icons/`) — для соцсетей и мелких иконок (минимум запросов, см. performance-philosophy).
- **next/image** — для фотографий (врачи, клиники, превью); не для мелких иконок.

## 3. Остальные библиотеки фронтенда

| Библиотека | Назначение |
|------------|------------|
| **embla-carousel-react** + **embla-carousel-autoplay** | Слайдеры (акции, отзывы, «наши работы» и т.п.). |
| **leaflet**, **react-leaflet**, **@types/leaflet** | Карты (клиники на карте). |
| **react-compare-slider** | До/после в кейсах. |
| **bvi** | Доступность (версия для слабовидящих). |

## 4. Backend и данные

| Компонент | Роль |
|-----------|------|
| **WordPress** | Хостинг контента, админка, хранение CPT и таксономий. Запуск: Docker (порт 8002). |
| **WPGraphQL** | GraphQL API для WordPress; все запросы фронтенда к контенту идут через него. |
| **Advanced Custom Fields (ACF) Pro** | Произвольные поля у типов записей и опций; связь с WPGraphQL через WPGraphQL ACF. |
| **Apollo Client** | Клиент GraphQL в Next.js: запросы из Server Components и при необходимости из Client; кэш и типы. |

Запросы к данным сосредоточены в `nextjs/src/lib/wordpress/`: `client.ts` (Apollo), `api.ts` (функции высокого уровня: getDoctorsConnection, getServices и т.д.), `queries/` (GraphQL-документы для врачей, услуг, клиник, акций, отзывов, постов, таксономий, настроек).

## 5. Инструменты и окружение

- **Docker / docker-compose** — WordPress, MySQL/MariaDB, phpMyAdmin.
- **Node.js** — сборка и dev-сервер Next.js (порт 3000 по правилам проекта).
- **ESLint** — линтинг Next.js.
- **Figma** — дизайн; в проекте есть кэш Figma (`nextjs/figma-data/FIGMA_CACHE.md`) и компоненты по макетам в `src/components/figma/`.

---

# Часть III. Плагины и расширения

## 1. WordPress (админка / бэкенд)

Устанавливаются в экземпляр WordPress (через админку или копирование в `wp-content/plugins`). Упоминаются в README проекта:

| Плагин | Версия (из README) | Назначение |
|--------|---------------------|------------|
| **WPGraphQL** | 2.5.4 | GraphQL API для WordPress. |
| **FaustWP** | 1.8.0 | Связка WordPress и Next.js (preview, редиректы). |
| **WPGraphQL ACF** | 2.4.1 | Проброс ACF-полей в схему WPGraphQL. |
| **Advanced Custom Fields Pro** | 6.5.1 | Произвольные поля (Relationship, Repeater, Option Pages и т.д.). |
| **WordPress MCP** | 0.2.5 | MCP-сервер для работы с WordPress из Cursor/инструментов. |
| **Rank Math SEO** / **Rank Math SEO Pro** | 1.0.260 / 3.0.103 | SEO в админке WordPress. |
| **Cyr2Lat** | 6.6.0 | Транслитерация (в т.ч. slug'ы). |

Тема: **Headless Theme** (1.0) — минимальная тема для headless-режима.

## 2. Must-Use Plugins (mu-plugins)

Файлы в `wp-content/mu-plugins/` — всегда активны, без установки через админку.

| Файл | Назначение |
|------|------------|
| **unident-structure.php** | Регистрация CPT и таксономий: Услуги (services), Акции (promotions), Цены (prices), Клиники (clinics), Отзывы (reviews), Врачи (doctors), Наши работы (our-works); таксономии: service_categories, cities (у клиник), doctor_specializations (у врачей). Все с `show_in_graphql => true`. |
| **unident-acf-fields.php** | Регистрация/настройка групп ACF и полей для УниДент (врачи, клиники, услуги, акции и т.д.). |
| **fix-ssl.php** | Исправления для работы по SSL в локальном окружении. |
| **register-doctors-clinics-graphql.php** | Регистрация в GraphQL полей/связей врачи ↔ клиники. |
| **register-doctors-services-graphql.php** | Регистрация в GraphQL связей врачи ↔ услуги. |
| **register-our-works-fields-graphql.php** | Регистрация полей «наших работ» для GraphQL. |
| **register-posts-doctors-graphql.php** | Связь постов с врачами в GraphQL. |
| **register-promotions-graphql.php** | Регистрация полей акций для GraphQL. |
| **register-reviews-graphql.php** | Регистрация полей отзывов для GraphQL. |
| **test-graphql-final.php**, **test-promotion-graphql.php** | Вспомогательные/тестовые сценарии для GraphQL. |

Для фильтрации по таксономиям и meta в WPGraphQL могут понадобиться (при необходимости) отдельные расширения, не входящие в текущий репозиторий:
- **wp-graphql-tax-query** — поддержка `taxQuery` в аргументах соединений постов/CPT.
- **wp-graphql-meta-query** — поддержка `metaQuery` для фильтрации по произвольным полям.

В коде Next.js уже используется `taxQuery` в запросе врачей по специализации (GET_DOCTORS_BY_SPECIALIZATION); поддержка на стороне WP может быть встроенной для CPT или через плагин — при внедрении фильтров это стоит уточнить.

---

# Часть IV. Custom Post Types и таксономии (кратко)

Зарегистрированы в `unident-structure.php`:

- **CPT:** services, promotions, prices, clinics, reviews, doctors, our-works.
- **Таксономии:** service_categories (у services), cities (у clinics), doctor_specializations (у doctors).

Связи между сущностями (врач ↔ клиника, врач ↔ услуги, услуга ↔ цены, акция ↔ услуги и т.д.) реализованы через ACF (Relationship и др.) и при необходимости доэкспонированы в GraphQL через mu-plugins в `register-*-graphql.php`.

---

# Часть V. Архитектура фильтрации (Terms, Meta, связи)

Ниже включён полный текст документа **nextjs/docs/FILTERING_ARCHITECTURE.md**: модель фильтров, источник правды (URL), выбор библиотеки (nuqs vs встроенные средства), рекомендуемая архитектура, SEO и скорость загрузки, проверка цепочки выводов (sequential/SQL thinking), практики и план внедрения.

---

## 1. SQL-мышление: как фильтры маппятся на запросы

### 1.1 Модель «как в БД»

| Сущность       | В WordPress / SQL                    | В WPGraphQL (where)           |
|----------------|--------------------------------------|-------------------------------|
| **Terms (таксономия)** | `term_relationships` + `term_taxonomy` | `taxQuery` (нужен плагин или встроенная поддержка CPT) |
| **Meta-поля**  | `wp_postmeta` (meta_key, meta_value) | `metaQuery` (плагин wp-graphql-meta-query) |
| **Связи (bilateral)** | Отдельные таблицы / post_meta (ID связанных постов) | Связь через ноду (clinic, doctorSpecializations); фильтр по связи = фильтр по term slug или по meta (ID клиники) |

Фильтрация по «связям» в итоге сводится к одному из вариантов:

- **Связь через таксономию** (например, «специализация» у врача) → фильтр по term slug/id → `taxQuery`.
- **Связь через ACF Relation** (например, врач → клиника) → в БД хранятся ID постов; фильтр «врачи клиники X» = условие по meta или по кастомному полю в GraphQL (если зарегистрировано).

То есть в «SQL-смысле»:

- **Terms** = JOIN с `term_relationships` / `term_taxonomy` + WHERE по term slug/id.
- **Meta** = JOIN с `wp_postmeta` + WHERE по meta_key/meta_value.
- **Bilateral** = либо та же таксономия, либо JOIN по полю связи (post_id в meta или в своей таблице).

Один «фильтр на странице» = одно логическое условие в WHERE; несколько фильтров = комбинация условий (AND/OR). В GraphQL это один объект `where` с полями `taxQuery`, `metaQuery`, `search` и т.д.

---

## 2. Источник правды: URL (search params)

Почему фильтры должны жить в URL:

- Шаринг ссылки «врачи + конкретные фильтры».
- Работа кнопки «Назад» (история фильтров).
- SEO: при необходимости можно каноникал без query (или с, в зависимости от стратегии).
- Один источник правды для и сервера, и клиента.

В Next.js App Router параметры фильтрации приходят в `searchParams` на сервере. Для типобезопасности, парсинга (число, массив slug'ов, булевы) и синхронизации с клиентом удобно использовать **nuqs** (рекомендация из правил проекта).

---

## 3. Библиотека vs встроенные средства

### 3.1 Только Next.js (без nuqs)

- В **Server Component**: `page.tsx` получает `searchParams: Promise<Record<string, string | string[]>>`, парсите вручную, передаёте в `getDoctorsConnection(searchParams)`.
- Минусы: нет типобезопасности, нет единого парсера для клиента и сервера, клиент должен сам собирать URL при смене фильтра (через `useRouter`/`useSearchParams` и ручной `URLSearchParams`).

### 3.2 nuqs (рекомендуется)

- **Клиент**: `useQueryState` / `useQueryStates` — типобезопасные ключи, парсеры (integer, string, array of strings для slug'ов), опция `shallow: false` для ре-рендера Server Components при смене фильтра.
- **Сервер**: `createSearchParamsCache` + те же парсеры — типобезопасное чтение `searchParams` в любом Server Component (и в `page.tsx`).
- Один набор парсеров (например, `specialization: parseAsArrayOf(parseAsString)`), переиспользование на клиенте и сервере, меньше дублирования и ошибок.

Итог: для «многих страниц с фильтрацией» по terms/meta/связям **предпочтительно использовать nuqs** поверх встроенных `searchParams`.

---

## 4. Рекомендуемая архитектура (одна схема для многих страниц)

### 4.1 Слой URL (nuqs)

- Определить **набор ключей и парсеров** под каждую страницу (или общий набор для «архивов»):
  - пример: `specialization[]`, `clinic`, `experience_min`, `rating_min`, `page`, `sort`.
- Парсеры: `parseAsString`, `parseAsInteger`, `parseAsArrayOf(parseAsString)` для массивов slug'ов, при необходимости кастомный парсер (например, enum сортировки).
- На **сервере**: в `page.tsx` вызвать `searchParamsCache.parse(searchParams)` и передать результат в функцию получения данных.
- На **клиенте**: в компоненте фильтров использовать `useQueryStates(parsers)` и при смене значения вызывать setter — URL обновится, при `shallow: false` уйдёт запрос на сервер и обновится список.

### 4.2 Слой данных (WordPress / WPGraphQL)

- **Один** метод получения данных на тип контента (например, `getDoctorsConnection`), принимающий объект фильтров:
  - `{ first, after, specializationSlugs?, clinicSlug?, experienceMin?, ratingMin?, orderBy? }`.
- Внутри:
  - собрать **один** объект `where` для WPGraphQL:
    - `taxQuery` — по таксономиям (например, специализация);
    - при наличии плагина — `metaQuery` по meta-полям (стаж, рейтинг) и по полю связи «клиника» (если оно в meta);
  - вызвать один GraphQL-запрос с пагинацией (`first`, `after`).

Так вы сохраняете «SQL-подход»: один запрос, один WHERE (составной), без лишних круглых поездок и дублирования логики.

### 4.3 Bilateral (связи)

- **Связь через таксономию** (например, врач ↔ специализация): фильтр по slug термина уже покрывается `taxQuery`; с другой стороны страницы «специализация» могут показывать врачей по этому же slug — та же функция `getDoctorsConnection({ specializationSlugs: [slug] })`.
- **Связь через ACF Relation** (врач → клиника):
  - если в GraphQL есть аргумент типа «врачи, у которых в связи clinic есть запись с slug X», его можно передать в тот же объект фильтров (например, `clinicSlug`) и добавить в `where`;
  - если такого аргумента нет, в WP обычно хранят ID клиники в meta — тогда нужен `metaQuery` (плагин wp-graphql-meta-query) по этому meta_key и значению (ID или slug, в зависимости от того, что поддерживает схема).

То есть «bilateral» не отдельный случай, а способ задать условие в том же `where` (term или meta/relation).

---

## 5. SEO и скорость загрузки (философия проекта)

Правила проекта (**performance-philosophy.mdc**, **seo.mdc**) и документация Next.js/Ref учтены ниже.

### 5.1 Скорость загрузки (performance-first)

- **Server Components — источник данных.** Список врачей/услуг должен получать данные на сервере: `page.tsx` async, читает `searchParams`, вызывает `getDoctorsConnection(..., filters)`. Никакого data fetching в `useEffect` или в клиентском компоненте для первоначального списка — иначе лишний JS и задержка LCP.
- **Один запрос вместо цепочки.** Один GraphQL-запрос с составным `where` (taxQuery + при необходимости metaQuery) соответствует правилу «no request waterfalls» и быстрому TTFB.
- **Минимум Client Components.** Фильтры можно реализовать:
  - **Вариант A (максимальная скорость):** только `<Link href={pathname + '?' + new URLSearchParams(...)}>` для каждого варианта фильтра. Клик = переход по URL = серверный рендер с новыми `searchParams`. Ноль клиентского state для списка, минимум JS.
  - **Вариант B:** небольшой Client Component с `useQueryStates` (nuqs) или `useSearchParams` + `router.push` только для UI фильтров; список по-прежнему рендерится на сервере при `shallow: false` (nuqs) или при навигации (Link/router). Данные списка не запрашиваются с клиента.
- **Кэширование.** Для архива с фильтрами разумно использовать `revalidate` (например 3600) в fetch/GraphQL, чтобы повторные заходы и боты не перегружали WordPress. При смене фильтра сервер отдаёт уже закэшированный ответ для этого набора параметров где возможно.
- **Core Web Vitals.** LCP — контент списка приходит в первом HTML (серверный рендер). CLS — резервировать место под карточки/сетку (skeleton или min-height), не добавлять контент после клиентского fetch.

Итог: архитектура «URL → Server Component читает searchParams → один запрос с where → рендер списка на сервере» полностью совпадает с философией скорости проекта.

### 5.2 SEO (каноникал, индексация, метаданные)

- **Canonical для страниц с фильтрами.** По правилам проекта (seo.mdc) для сущностей задаётся явный canonical. Для архивов с query-параметрами возможны две стратегии:
  - **Рекомендация для УниДент:** canonical = базовый путь без query, например `https://unident.ru/doctors`. Так поисковики индексируют одну страницу «Врачи»; варианты с фильтрами считаются UI-состоянием. Это избегает дублирования и «тонкого» контента по множеству URL с разными комбинациями фильтров.
  - Альтернатива: canonical с query только для отдельных «важных» комбинаций (например, отдельная landing по специализации), если такие URL целенаправленно продвигаются.
- **Метаданные.** Для страницы архива можно в `generateMetadata` использовать `searchParams`, чтобы при наличии фильтров подставлять, например, title «Врачи — Терапевт | УниДент». Опционально; при canonical без query основной индексируемый заголовок — для базового URL.
- **Sitemap.** В sitemap не добавлять все комбинации `?specialization=...&clinic=...` — только статические маршруты и важные сущности (отдельные страницы врачей, услуг и т.д.), как в текущих правилах SEO проекта.
- **Structured data.** Для списка врачей на одной странице достаточно одного типа разметки (например, ItemList или набор Person); не дублировать на каждую комбинацию фильтров.

Итог: фильтрация через searchParams не конфликтует с SEO при canonical на базовый путь и разумном использовании generateMetadata и sitemap.

### 5.3 Поведение Next.js (по документации Ref)

- В App Router **страница получает `searchParams` как prop** (Promise). Официальный пример — фильтрация/сортировка в async Page с чтением `searchParams` и рендером на сервере. Это совпадает с выбранной схемой.
- Использование `searchParams` в page делает маршрут **динамическим** (не статическим при build). Для архива врачей это ожидаемо: контент зависит от запроса.
- Клиентский доступ: через `useSearchParams()` (Next.js) или nuqs. При использовании nuqs с `shallow: false` обновление URL приводит к повторному запросу к серверу и ре-рендеру Server Components — данные списка всегда приходят с сервера, не с клиента.

---

## 6. Sequential / SQL thinking (проверка цепочки выводов)

Краткая проверка логики от «фильтр в UI» до «ответ пользователю»:

1. **Пользователь меняет фильтр** → меняется URL (Link или setState в nuqs/useSearchParams).
2. **Next.js** → новый запрос к серверу (или навигация с тем же origin), page получает новые `searchParams`.
3. **Server Component (page)** → парсит `searchParams` в объект фильтров (вручную или через createSearchParamsCache).
4. **Один вызов API** → `getDoctorsConnection(first, after, filters)` строит один `where` (taxQuery + при необходимости metaQuery) и выполняет один GraphQL-запрос.
5. **WordPress/WPGraphQL** → один SQL-подобный запрос (JOIN с term_relationships, при необходимости wp_postmeta), один результат.
6. **Сервер** → отдаёт HTML с уже подставленным списком (хороший LCP, нет клиентского ожидания данных).
7. **Клиент** → гидратирует только необходимое (например, кнопки фильтров); список уже в DOM.

Выводы из разд. 1–4 остаются верными: один источник правды (URL), один запрос с составным WHERE, минимум клиентского кода, совместимость с SEO и скоростью при правиле canonical на базовый путь и серверном data fetching.

---

## 7. Практики (кратко)

1. **Один источник правды**: URL → парсеры (nuqs или вручную) → объект фильтров → один GraphQL-запрос с составным `where`.
2. **Типобезопасность**: общие парсеры в отдельном модуле (например, `lib/filter-parsers.ts`), переиспользование в `createSearchParamsCache` и в `useQueryStates` при выборе nuqs.
3. **Серверный рендер**: данные списка всегда с сервера; при смене фильтра — навигация по URL (Link или router.push / nuqs с `shallow: false`), без клиентского fetch списка.
4. **Пагинация**: ключ `page` или cursor `after` в URL; при смене фильтров сбрасывать пагинацию (например, `page=1` или убирать `after`).
5. **WPGraphQL**:
   - Поддержка `taxQuery` для CPT — проверить (встроенная или плагин wp-graphql-tax-query).
   - Для meta и фильтра по ACF-связям — при необходимости подключить wp-graphql-meta-query и при необходимости зарегистрировать в схеме фильтр по связи (или использовать meta по ID клиники).
6. **Скорость**: фильтры по возможности через `<Link href={...}>` (без client state); при необходимости интерактивности — минимальный Client Component только для UI фильтров.

---

## 8. Пошаговый план внедрения (пример: страница «Врачи»)

1. **Установить nuqs**, добавить `NuqsAdapter` в `layout.tsx` (см. документацию nuqs для Next.js App Router).
2. **Описать парсеры** для `/doctors`: например, `specialization` (массив slug'ов), `clinic` (один slug), `page` (integer), `sort` (string literal).
3. **Создать `createSearchParamsCache`** с этими парсерами для использования в Server Components.
4. **Расширить `getDoctorsConnection`**: второй аргумент — объект фильтров; построить `where` с `taxQuery` (и при наличии — `metaQuery`), передать в переменные запроса.
5. **В `app/doctors/page.tsx`**: распарсить `searchParams` через кэш, вызвать `getDoctorsConnection(first, after, filters)`, отдать данные и, при необходимости, начальные значения фильтров в клиент.
6. **Клиентский блок фильтров**: компонент с `useQueryStates(parsers)`, при изменении вызывать setter; список врачей рендерить на сервере по уже обновлённому URL (при `shallow: false`).
7. **API route `/api/doctors`** (если используется для «Загрузить ещё»): принимать те же query-параметры фильтрации и передавать их в `getDoctorsConnection`, чтобы пагинация учитывала текущие фильтры.

После этого ту же схему (отдельные парсеры под сущность) можно повторить для страниц услуг, клиник, акций и т.д., с фильтрами по terms, meta и связям.

---

## 9. Ссылки (архитектура фильтрации)

- [Next.js Page — Handling filtering with searchParams](https://nextjs.org/docs/app/api-reference/file-conventions/page) — официальный пример фильтрации в Server Component.
- [Next.js Production checklist — Data fetching and caching](https://nextjs.org/docs/app/guides/production-checklist#data-fetching-and-caching) — Server Components, параллельный fetch, кэш.
- [Next.js useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params) — обновление searchParams через router/Link.
- [nuqs (README)](https://github.com/47ng/nuqs) — типобезопасный state в URL для Next.js/React.
- [nuqs docs](https://nuqs.dev) — адаптеры, парсеры, `createSearchParamsCache`, серверный доступ.
- [wp-graphql-tax-query](https://github.com/wp-graphql/wp-graphql-tax-query) — поддержка `taxQuery` в PostObjectConnectionWhereArgs.
- [wp-graphql-meta-query](https://github.com/wp-graphql/wp-graphql-meta-query) — поддержка `metaQuery` для фильтрации по meta.
- Правила проекта: **performance-philosophy.mdc** (Server Components first, один запрос, минимум 'use client'), **seo.mdc** (canonical, metadata, Core Web Vitals), **nextjs.mdc** (nuqs для URL state).

---

*Конец отчёта. Документ объединяет описание проекта УниДент, используемый стек, плагины WordPress и mu-plugins, а также полную архитектуру фильтрации из nextjs/docs/FILTERING_ARCHITECTURE.md.*
