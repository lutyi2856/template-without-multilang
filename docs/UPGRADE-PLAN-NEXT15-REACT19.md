# План обновления библиотек и технологий

> Документ сохранён из `.cursor/plans/` для долгосрочного хранения.
> Выполнять после выхода совместимой версии FaustWP или по решению команды.

---

## Executive Summary (для AI/разработчика)

**Цель:** Обновить Next.js 14 → 15.3, React 18 → 19, Apollo 3.8 → 3.11 и связанные пакеты без поломки headless WordPress сайта УниДент.

**Критичные изменения:**

- `params` и `searchParams` становятся `Promise` — требуется `await`
- NuqsAdapter обязателен в layout.tsx для nuqs
- fetch по умолчанию не кэшируется (Next.js 15)
- swcMinify удалить из next.config.js
- Tailwind оставить 3.4 (v4 ломает design tokens unident-)

**Порядок действий:** Этап 0 (диагностика) → Этап 1 (React 18.3, NuqsAdapter, типы) → Этап 2 (codemod async params) → Этап 3 (next.config) → Этап 4 (fetch) → Этап 5 (npm install) → Этапы 6–7 (Tailwind 3.4, остальное)

**Критический риск:** FaustWP (@faustwp/core 3.3.4) — последний релиз май 2024, нет подтверждённой совместимости с Next.js 15. **Рекомендация:** дождаться выхода совместимой версии FaustWP, затем выполнить план по документации.

**Проверки после обновления:** `npm run build`, `npm run dev`, маршруты врачей/услуг/блог, фильтры nuqs на /doctors, FaustWP preview, GraphQL, bundle size, Lighthouse, Design System.

---

## 1. Описание проекта (контекст для AI/разработчика)

### 1.1 Назначение проекта

**УниДент** — сайт стоматологической клиники в Москве. Headless архитектура: WordPress (backend) + Next.js (frontend). Контент управляется в WordPress, отображается через Next.js с SEO-оптимизацией, Core Web Vitals и structured data.

**Корневая директория:** `d:\template` (или `D:/template`)

**Структура монорепо:**

```
template/
├── nextjs/          # Next.js 14 приложение (frontend)
├── wp-content/      # WordPress плагины, темы (часть WP, не весь WP)
├── wordpress/       # Доп. WP контент
├── scripts/         # PHP скрипты для наполнения данных
├── docs/            # Документация
├── .cursor/         # Правила Cursor, skills
├── docker-compose.yml
├── Dockerfile.wordpress
└── README.md
```

### 1.2 Архитектура данных

```
WordPress (localhost:8002)
  ├── WPGraphQL (/graphql)
  ├── ACF (Custom Fields для CPT)
  ├── Custom Post Types: doctor, service, clinic, promotion, post, page
  └── FaustWP (preview, auth)
         │
         ▼
Next.js (localhost:3000)
  ├── Apollo Client → GraphQL запросы
  ├── FaustWP withFaust → next.config.js, api/faust/[[...route]]
  ├── Server Components → fetch на сервере
  └── nuqs → URL state (фильтры врачей)
```

### 1.3 Ключевые маршруты Next.js (App Router)

| Путь                                             | Файл                                   | Описание                           |
| ------------------------------------------------ | -------------------------------------- | ---------------------------------- |
| `/`                                              | `app/page.tsx`                         | Главная                            |
| `/doctors`                                       | `app/doctors/page.tsx`                 | Список врачей (фильтры через nuqs) |
| `/doctors/[slug]`                                | `app/doctors/[slug]/page.tsx`          | Страница врача                     |
| `/services`                                      | `app/services/page.tsx`                | Услуги                             |
| `/services/[slug]`                               | `app/services/[slug]/page.tsx`        | Страница услуги                    |
| `/[...slug]`                                     | `app/[...slug]/page.tsx`               | Catch-all для WP страниц           |
| `/blog`, `/blog/[slug]`, `/blog/category/[slug]` | `app/blog/**`                          | Блог                               |
| `/clinics`, `/clinics/[slug]`                    | `app/clinics/**`                       | Клиники                            |
| `/promotions`, `/promotions/[slug]`              | `app/promotions/**`                    | Акции                              |
| `/specialization/[slug]`                         | `app/specialization/[slug]/page.tsx`   | Специализации                      |
| `/service-category/[slug]`                       | `app/service-category/[slug]/page.tsx` | Категории услуг                    |
| `/api/doctors`                                   | `app/api/doctors/route.ts`             | API пагинации врачей               |
| `/api/faust/[[...route]]`                        | `app/api/faust/[[...route]].ts`        | FaustWP API                        |

### 1.4 Критичные файлы для обновления

| Файл                                       | Назначение                         |
| ------------------------------------------ | ---------------------------------- |
| `nextjs/package.json`                      | Зависимости                        |
| `nextjs/next.config.js`                    | Конфиг Next + withFaust            |
| `nextjs/tsconfig.json`                     | TypeScript                         |
| `nextjs/tailwind.config.js`                | Tailwind + unident- цвета          |
| `nextjs/src/app/layout.tsx`                | Root layout, NuqsAdapter           |
| `nextjs/src/lib/wordpress/client.ts`       | Apollo Client singleton            |
| `nextjs/src/lib/doctors-filters-server.ts` | nuqs createSearchParamsCache       |
| `nextjs/src/design-tokens/typography.ts`   | Design tokens                      |
| `nextjs/src/components/design-system/*`   | Button, Text, Heading, Card, Badge |

### 1.5 Структура nextjs/src

```
nextjs/src/
├── app/
│   ├── layout.tsx              # Root layout — добавить NuqsAdapter
│   ├── page.tsx                # Главная
│   ├── [...slug]/page.tsx      # Catch-all WP страницы
│   ├── doctors/
│   │   ├── page.tsx            # Список (nuqs, searchParams Promise)
│   │   └── [slug]/page.tsx     # Страница врача
│   ├── services/page.tsx, services/[slug]/page.tsx
│   ├── blog/page.tsx, blog/[slug]/page.tsx, blog/category/[slug]/page.tsx
│   ├── clinics/, promotions/, specialization/, service-category/
│   ├── api/
│   │   ├── doctors/route.ts     # Пагинация врачей
│   │   └── faust/[[...route]].ts
│   ├── robots.ts, sitemap.ts, manifest.ts
│   └── loading.tsx, error.tsx, not-found.tsx
├── components/
│   ├── design-system/          # Button, Text, Heading, Card, Badge
│   ├── figma/                  # Header, Footer, секции
│   ├── ui/                     # Shadcn (dialog, select, dropdown-menu и т.д.)
│   └── sections/               # doctors-section, promotions-section и т.д.
├── lib/
│   ├── doctors-filters-server.ts  # createSearchParamsCache для nuqs
│   ├── doctors-filters.ts
│   └── wordpress/
│       ├── client.ts           # Apollo Client singleton
│       ├── api.ts, api-header.ts, api-footer.ts
│       └── queries/            # GraphQL запросы
├── design-tokens/typography.ts # Design tokens (Text, Heading variants)
├── types/                      # TypeScript типы
└── styles/globals.css
```

### 1.6 Правила проекта (.cursor/rules), влияющие на обновление

| Файл                         | Что учитывать                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| performance-philosophy.mdc   | Server Components first; Preload Pattern (Promise.all); bundle < 200KB; Lighthouse > 90 |
| design-system-philosophy.mdc | Tailwind 3.4; unident- токены; Text, Heading, Button через design-system                |
| nextjs.mdc                   | nuqs для URL state; prefetch для пагинации; Server Components                           |
| nextjs-caching.mdc           | revalidateTag, fetch tags; Apollo идёт мимо Next.js fetch                               |
| nuqs.mdc                     | createSearchParamsCache на сервере; NuqsAdapter обязателен                              |
| apollo-client.mdc            | getClient() в Server Components; cache policies                                         |
| seo.mdc                      | Core Web Vitals, canonical, structured data                                             |
| port-management.mdc          | Next.js dev на порту 3000                                                              |
| zod-validation.mdc           | safeParse для searchParams после nuqs parse                                             |

---

## 2. Полный стек технологий

### 2.1 Основные фреймворки

| Пакет      | Текущая | Целевая | Назначение                           |
| ---------- | ------- | ------- | ------------------------------------ |
| next       | ^14.0.0 | 15.3.x  | React фреймворк, App Router, SSR/SSG |
| react      | ^18.2.0 | 19.x    | UI библиотека                        |
| react-dom  | ^18.2.0 | 19.x    | DOM рендеринг                        |
| typescript | ^5.0.0  | 5.7.x   | Типизация                            |

### 2.2 Data & API

| Пакет          | Версия | Назначение                                                                                                                |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| @apollo/client | ^3.8.0 | GraphQL клиент для WPGraphQL; используется в `lib/wordpress/client.ts`                                                    |
| @faustwp/core  | ^3.3.4 | Интеграция WP+Next: withFaust(nextConfig), preview, auth                                                                  |
| @faustwp/cli   | ^3.3.4 | CLI для FaustWP                                                                                                           |
| nuqs           | ^2.8.8 | URL search params: фильтры врачей (category, clinic, page); createSearchParamsCache на сервере, useQueryStates на клиенте |
| zod            | ^4.3.6 | Валидация (doctors-filters-server, env, формы)                                                                            |

### 2.3 UI & styling

| Пакет                    | Версия   | Назначение                                                  |
| ------------------------ | -------- | ----------------------------------------------------------- |
| tailwindcss              | ^3.4.0   | Utility CSS; конфиг: unident- цвета, font-gilroy/montserrat |
| tailwindcss-animate      | ^1.0.7   | Анимации                                                    |
| autoprefixer             | ^10.4.23 | PostCSS                                                     |
| postcss                  | ^8.5.6   | CSS обработка                                               |
| class-variance-authority | ^0.7.1   | CVA для вариантов компонентов                               |
| clsx                     | ^2.1.1   | Условные классы                                             |
| tailwind-merge           | ^3.4.0   | Слияние Tailwind классов                                    |

### 2.4 Radix UI / Shadcn

| Пакет                           | Версия  | Назначение         |
| ------------------------------- | ------- | ------------------ |
| @radix-ui/react-avatar          | ^1.1.11 | Аватар             |
| @radix-ui/react-dialog          | ^1.1.15 | Модалки            |
| @radix-ui/react-dropdown-menu   | ^2.1.16 | Выпадающие меню    |
| @radix-ui/react-label           | ^2.1.8  | Label              |
| @radix-ui/react-navigation-menu | ^1.2.14 | Навигация (header) |
| @radix-ui/react-popover         | ^1.1.15 | Popover            |
| @radix-ui/react-select          | ^2.2.6  | Select (фильтры)   |
| @radix-ui/react-separator       | ^1.1.8  | Разделитель        |
| @radix-ui/react-slot            | ^1.2.4  | Slot (compose)     |

### 2.5 Остальные зависимости

| Пакет                   | Версия   | Назначение                                   |
| ----------------------- | -------- | -------------------------------------------- |
| @iconify/react          | ^6.0.2   | Иконки (tree-shaking)                        |
| lucide-react            | ^0.562.0 | Иконки; optimizePackageImports в next.config |
| embla-carousel-react    | ^8.6.0   | Карусели (слайдеры)                          |
| embla-carousel-autoplay | ^8.6.0   | Автоплей для каруселей                       |
| leaflet                 | ^1.9.4   | Карты (клиники)                              |
| react-leaflet           | ^4.2.1   | React обёртка Leaflet                        |
| react-compare-slider    | ^3.1.0   | До/После слайдер (кейсы)                     |
| bvi                     | ^1.0.2   | Доступность                                  |
| @svgr/webpack           | ^8.1.0   | SVG как React компоненты                     |

### 2.6 Design tokens (Tailwind)

В `tailwind.config.js` заданы цвета `unident.*`:

- `unident-primary`, `unident-primaryLight`, `unident-dark`, `unident-white`
- `unident-bgLightBlue`, `unident-bgLightGray`, `unident-bgTopbar`, `unident-bgElements`, `unident-footer`
- `unident-borderGray`, `unident-textGray`

Использование: `bg-unident-primary`, `text-unident-dark`, `border-unident-borderGray` и т.д. Design-system-philosophy запрещает хардкод цветов.

### 2.7 WordPress (backend)

- WordPress + WPGraphQL + ACF + FaustWP plugin
- CPT: doctor, service, clinic, promotion; таксономии для категорий
- mu-plugins в `wp-content/mu-plugins/`: регистрация GraphQL полей для ACF, CPT

### 2.8 Поток данных (пример: врачи и фильтры)

1. **Запрос страницы /doctors?category=therapist&page=2**
   - Next.js передаёт `searchParams: Promise<Record<string, string | string[]>>` в page.tsx
   - `doctors-filters-server.ts`: `doctorsSearchParamsCache.parse(searchParams)` — nuqs парсит URL
   - После Next.js 15: `searchParams` — Promise, нужен `await doctorsSearchParamsCache.parse(searchParams)`
   - `validateDoctorsFilters(parsed)` — Zod безопасно валидирует, дефолты при ошибке

2. **Получение данных**
   - Apollo `getClient()` из `lib/wordpress/client.ts` выполняет GraphQL запрос к WPGraphQL
   - Запрос с `where: { categoryName, clinicId }` — фильтрация по taxQuery/metaQuery
   - Ответ — список врачей + pageInfo (pagination)

3. **Рендер**
   - Server Component отдаёт данные + Client Component для фильтров (nuqs useQueryStates)
   - Фильтры обновляют URL → новый request → новый рендер с новыми searchParams

**Ключевое:** NuqsAdapter в layout обязателен, иначе nuqs не будет работать в App Router.

---

## 3. Текущее состояние версий

| Пакет          | Текущая версия | Актуальная стабильная                                                                       |
| -------------- | -------------- | ------------------------------------------------------------------------------------------- |
| Next.js        | ^14.0.0        | 15.3.x / 16.1.x                                                                             |
| React          | ^18.2.0        | 19.x                                                                                        |
| react-dom      | ^18.2.0        | 19.x                                                                                        |
| @apollo/client | ^3.8.0         | 3.11+ (React 19)                                                                            |
| @faustwp/core  | ^3.3.4         | 3.3.4 (последняя)                                                                           |
| nuqs           | ^2.8.8         | 2.8.x (поддержка Next 15)                                                                   |
| tailwindcss    | ^3.4.0         | 4.0 (breaking) / 3.4 (стабильно)                                                            |
| zod            | ^4.3.6         | Проект использует Zod 4.x (валидно). Альтернатива: zod@^3.23.8 — только при переходе на v3. |
| TypeScript     | ^5.0.0         | 5.7.x                                                                                       |

---

## Критические ограничения

### 1. FaustWP и Next.js 15 — критический риск

- **@faustwp/core 3.3.4** — последний релиз май 2024; peer dependency `next >=12.1.6` — формальная совместимость, но **практическая совместимость с Next.js 15 не подтверждена**.
- Открытые issues: проблемы с `draftMode`, `cookies`, API routes при Next.js 15.
- **Рекомендация:** Дождаться выхода совместимой версии FaustWP. После обновления FaustWP — вернуться к этому плану и выполнить по документации.
- **План А (при выходе совместимой версии):** smoke-тест FaustWP + Next.js 15 в отдельной ветке. Проверить preview, auth, `/api/faust/[[...route]]`.
- **План Б (при несовместимости):** 1) Остаться на Next.js 14.x. 2) **Или** заменить FaustWP на кастомную реализацию. Провести бизнес-анализ.

### 2. CVE в Next.js 15.1.7 и ранее

В Next.js 15.1.7 и ниже есть уязвимость CVE-2025-66478. Обновляться до **15.2+** или **15.3.x**.

---

## Этап 0: Диагностика (перед миграцией)

```bash
cd nextjs
git checkout -b upgrade-next15
git tag v1.0.0-nextjs14
npx @next/codemod@canary next-15-usage
npm outdated
```

Сохранить размеры бандлов: `ANALYZE=true npm run build`. Использовать `npm ci` для воспроизводимости.

---

## Этап 1: Подготовка (без смены Next.js)

### 1.1 React 18.3

```bash
npm install react@18.3 react-dom@18.3
npm install -D @types/react@^18.2 @types/react-dom@^18.2
```

### 1.2 NuqsAdapter в layout.tsx

```tsx
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body>
        <NuqsAdapter>
          <HeaderV2 />
          <main>{children}</main>
          <Footer />
        </NuqsAdapter>
      </body>
    </html>
  );
}
```

---

## Этап 2: Миграция async params (Next.js 15)

```bash
npx @next/codemod@canary upgrade latest
```

Ручная проверка `generateMetadata` во всех страницах с params. В `doctors-filters-server.ts`: `await doctorsSearchParamsCache.parse(searchParams)`.

---

## Этап 3: next.config.js

Удалить: `swcMinify`, `experimental.optimizeServerReact`. Переименовать: `serverComponentsExternalPackages` → `serverExternalPackages`.

---

## Этап 4: Apollo React.cache

```ts
// lib/wordpress/client.ts
import { cache } from "react";
const getClientCached = cache(createApolloClient);
```

---

## Этап 5: Fetch и кэширование

Проверить прямые `fetch()` — для статичного контента добавить `cache: 'force-cache'`. Apollo с `cache: 'no-store'` без изменений. Опционально: `experimental.staleTimes`.

---

## Этап 6: npm install (строгая последовательность)

1. **Сначала** все `@radix-ui/*` до последних
2. `npm install next@15.3 react@19 react-dom@19` (15.3.x, не 16.x)
3. `npm install -D @types/react@latest @types/react-dom@latest eslint-config-next@latest`
4. `npm install @apollo/client@^3.11`
5. `npm install nuqs@latest`

---

## Этап 7: Tailwind

Оставить `tailwindcss@^3.4.0`. НЕ переходить на Turbopack для production.

---

## Непрерывный контроль производительности

| Этап                        | Действия                                              |
| --------------------------- | ----------------------------------------------------- |
| После Этапа 0               | Сохранить эталон bundle size, Lighthouse baseline     |
| После React 18.3            | `ANALYZE=true npm run build` — сравнить с эталоном     |
| После codemod + next.config | Lighthouse на /doctors, /services                     |
| После npm install           | `ANALYZE=true npm run build`, Lighthouse, Core Web Vitals |
| Финальный                   | bundle < 200KB, LCP < 2.5s, FID < 100ms, CLS < 0.1    |

---

## Тестовый отчёт Design System

| Компонент         | Страницы        | Состояния           |
| ----------------- | --------------- | ------------------- |
| Button            | /doctors        | primary, outline    |
| Card, Badge       | /doctors        | —                   |
| Dialog            | модальные окна  | открытие, закрытие  |
| Select            | фильтры /doctors| открытие, выбор    |
| DropdownMenu      | header          | —                   |
| Text, Heading     | все страницы    | typography variants |

---

## Чек-лист выполнения

### Шаг 0: Диагностика
- [ ] `git checkout -b upgrade-next15`
- [ ] `git tag v1.0.0-nextjs14`
- [ ] `npx @next/codemod@canary next-15-usage`
- [ ] `npm outdated`
- [ ] `ANALYZE=true npm run build` — эталон

### Шаг 1: Подготовка
- [ ] React 18.3, NuqsAdapter в layout.tsx
- [ ] `npm run build`, `npm run dev`

### Шаг 2–9: Миграция
- [ ] Codemod async params, ручная проверка generateMetadata
- [ ] next.config.js
- [ ] Apollo React.cache
- [ ] Fetch review
- [ ] npm install (Radix → Next/React → Apollo)
- [ ] Tailwind 3.4, прочие пакеты
- [ ] Полные проверки (маршруты, Design System, API, Lighthouse)

---

## Валидация плана (техническая экспертиза)

Подтверждено: React 18.3, NuqsAdapter, async params, next.config, fetch, Apollo React.cache, порядок npm install, Next.js 15.3.x, Turbopack — не для production, npm ci.

---

## Рекомендации перед production

1. Полный регрессионный тест в staging.
2. Фича-флаги для постепенного включения (если возможно).
3. Скрипт отката: `git checkout v1.0.0-nextjs14`, `npm ci`.
4. Next.js 15.3.x — не переходить на 16.x до стабилизации.
