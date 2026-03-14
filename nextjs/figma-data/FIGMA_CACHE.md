# Кэш данных Figma

Этот кэш содержит данные, полученные из Figma через MCP Framelink.
**НЕ запрашивайте повторно данные, которые уже есть в этом кэше!**

## 📁 Путь для сохранения ресурсов

### Framelink `download_figma_images`

**Проблема:** пакет `figma-developer-mcp` отклоняет абсолютные пути (ошибка "Directory traversal"). Относительный путь `nextjs/public/images/figma` разрешается относительно **cwd процесса MCP**, который может быть `C:\Users\[user]`, а не проект.

**Рекомендации:**
- В [.cursor/mcp.json](.cursor/mcp.json) задан `cwd: "${workspaceFolder}"` — MCP должен стартовать из корня проекта, тогда `localPath: "nextjs/public/images/figma"` сохранит файлы в `D:\template\nextjs\public\images\figma`.
- Если файлы попали в `C:\Users\[user]\nextjs\public\images\figma` — скопировать их в `D:\template\nextjs\public\images\figma` вручную.
- Переменная `FIGMA_ASSETS_PATH` в mcp.json **не используется** инструментом `download_figma_images` — он принимает только параметр `localPath` из вызова.

### Figma Desktop `get_design_context` (надёжный способ)

При каждом вызове передавать `dirForAssetWrites: "D:/template/nextjs/public/images/figma"`. Абсолютный путь работает, файлы сохраняются в проект. Ограничение: загружаются только изображения, попавшие в сгенерированный код для выбранного узла. Для batch-загрузки по списку nodeId используется Framelink.

## 📋 Информация о проекте

- **Файл Figma**: Шаблон сайта
- **File Key (оригинал)**: `JPVOauS3F3bEIy1msJXPeR`
- **File Key (Copy, активный)**: `eEN4I9HdQ3JiW708BuOMRc`
- **Последнее обновление**: 2026-02-05

**Layout-числа (dimensions, gap, padding, borderRadius):** брать только из **raw Framelink** (`get_figma_data` по nodeId блока). Файлы вида `components/doctor-page.json` — сокращённая выжимка без числовых значений из globalVars; для pixel-perfect реализации их недостаточно.

## 📐 Original Fixed Heights (backup before removal, 2026-03-01)

**Назначение:** Rollback при необходимости вернуть фиксированные высоты после плана "Remove Fixed Heights".

| File | Line | Original className / value |
|------|------|----------------------------|
| `components/figma/doctor-card/doctor-card.tsx` | 55 | `h-[75.07px]` (badge row) |
| `components/figma/doctor-card/doctor-card.tsx` | 58 | `w-[75.07px] h-[75.07px]` (experience badge) |
| `components/figma/doctor-card/doctor-card.tsx` | 80 | `w-[75.07px] h-[75.07px]` (spacer) |
| `components/figma/doctor-card/doctor-card.tsx` | 84 | `w-[67.26px] h-[67.26px]` (rating badge) |
| `components/figma/doctor-card/doctor-card.tsx` | 175 | `h-[52px]` (button) |
| `components/figma/doctor-card/booking-button.tsx` | 23 | `h-[52px]` (button) |
| `components/figma/header/featured-service-card.tsx` | 43 | `h-[449px]` (card container) |
| `components/figma/header/featured-service-card.tsx` | 99 | `h-[52px]` (button) |
| `components/figma/header/featured-service-card.tsx` | 108 | `h-[196.03px] max-lg:h-[120px]` (image wrapper) |
| `components/figma/promotion/promotion-card.tsx` | 84 | `h-[608px]` (card) |
| `components/figma/promotion/promotion-card.tsx` | 93 | `h-[250px]` (image) |
| `components/figma/promotion/promotion-card.tsx` | 132,142,154 | `h-[30px]` (badges) |
| `components/figma/promotion/promotion-card.tsx` | 211 | `h-[54px]` (button) |
| `components/figma/action-card/action-card.tsx` | 68 | `h-[266px]` (decor) |
| `components/figma/action-card/action-card.tsx` | 84,99 | `h-[35px]` (badges) |
| `components/figma/action-card/action-card.tsx` | 230 | `h-[54px]` (button) |
| `components/figma/case/case-card.tsx` | 74 | `h-[200px] md:h-[280px]` (image) |
| `components/figma/case/case-card.tsx` | 84 | `h-[400px]` (placeholder) |
| `components/figma/header/service-dropdown.tsx` | 111 | `h-[550px]` (dropdown) |
| `components/figma/header/service-dropdown.tsx` | 128 | `max-lg:max-h-[400px]` |
| `components/figma/doctor-page/doctor-hero-block.tsx` | 88,114 | `h-[107px]` (badges) |
| `components/figma/doctor-page/doctor-hero-block.tsx` | 280 | `h-[60px]` (button) |
| `components/figma/doctor-page/doctor-certificates-block.tsx` | 76 | `h-[200px] md:h-[276px]` |
| `components/figma/doctor-page/doctor-certificates-block-client.tsx` | 134 | `h-[276px]` |
| `components/figma/doctor-page/doctor-offer-block.tsx` | 76 | `h-[60px]` (button) |
| `components/sections/hero-section.tsx` | 141 | `h-[54px]` (button) |
| `components/sections/hero-section.tsx` | 175 | `h-[563.71px]` (img) |
| `components/sections/hero-section.tsx` | 183 | `lg:h-[608px]` |
| `components/sections/cta-section.tsx` | 188 | `lg:h-[554px]` |
| `components/sections/cta-section.tsx` | 235,236 | `h-[400px]` (image wrapper) |
| `components/sections/contacts-hero-section.tsx` | 45 | `h-[400px] lg:h-[500px]` |
| `components/sections/reviews-archive-cta-section.tsx` | 59 | `h-[702px]` (decor) |
| `components/sections/reviews-archive-cta-section.tsx` | 76 | `h-[76px]` |
| `components/sections/reviews-archive-section.tsx` | 113 | `h-[54px]` (button) |
| `components/sections/clinics-on-map-section-client.tsx` | 111 | `h-[597px]` |
| `components/forms/callback-form.tsx` | 92 | `h-[54px]` (button) |
| `components/forms/post-sidebar-form.tsx` | 102 | `h-[198px]` (textarea) |
| `components/forms/post-sidebar-form.tsx` | 112 | `h-[66px]` (input) |
| `components/forms/post-sidebar-form.tsx` | 131 | `h-[60px]` (button) |
| `components/design-system/badge.tsx` | 58 | `h-[65px]` |
| `components/figma/price/price-section-with-nav.tsx` | 153 | `max-h-[400px]` |
| `components/figma/header/main-header.tsx` | 79,107 | `h-[44px]` (buttons) |
| `components/figma/header/search-bar.tsx` | 22 | `h-[44px]` |
| `components/sections/reviews-archive-client.tsx` | 55 | `h-[60px]` (button) |
| `components/sections/blog-archive-section-client.tsx` | 97 | `min-h-[60px]` (button) |

**Не трогать (безопасные):** иконки `h-[18px]`-`h-[38px]`, `min-h-[44px]` (touch targets), `h-[1px]` separator, аватары `w-[N] h-[N]` круглые, logo, rating, карты `min-h-[450px]`, skeleton.

## 🎨 Глобальные цвета (из Figma)

```json
{
  "1": "#D9E4F7", // Светлый голубой (бейдж рейтинга)
  "2": "#607BD4", // Accent синий
  "3": "#526AC2", // Основной синий (кнопки, бейджи)
  "4": "#191E35", // Темный текст
  "5": "linear-gradient(180deg, rgba(46, 54, 93, 1) 0%, rgba(70, 85, 157, 1) 100%)", // Градиент
  "6": "#F9F9F9", // Светло-серый фон (advantages блок)
  "7": "#EEF3F9", // Светлый серый (бейдж стажа)
  "8": "#F5F7F9", // Светлый серый (фон элементов)
  "9": "#FFFFFF", // Белый
  "10": "#8F8F8F" // Серый текст
}
```

## 🔤 Шрифты

- **Основной шрифт**: Gilroy
- **Начертания**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Подключение**: CDN fonts.cdnfonts.com

## 📄 Страницы

### Страница услуги «Имплантация зубов» (838:4147) — Шаблон сайта Copy

**Статус**: ✅ Данные из Figma Desktop (get_metadata, get_design_context, get_variable_defs, get_screenshot)  
**Файл**: `components/service-page-838-4147.json`  
**Node ID**: `838:4147`  
**File Key**: `yBZgnbOnRjEiRDRBcz6NtR` (файл «Шаблон сайта - Copy»)  
**Имя в Figma**: `service 1440`  
**Ссылка Figma**: [node 838-4147](https://www.figma.com/design/yBZgnbOnRjEiRDRBcz6NtR/Шаблон-сайта--Copy-?node-id=838-4147&m=dev)  
**Дата получения**: 2026-03-08

**Источники данных:**
- `user-Figma Desktop` get_metadata — структура страницы (XML)
- `user-Figma Desktop` get_design_context — черновик кода для подблоков (886:4479, 838:4347, 838:4192)
- `user-Figma Desktop` get_variable_defs — цвета, типографика
- `user-Figma Desktop` get_screenshot — визуальная референс
- **Framelink** (подключён 2026-03-08): `get_figma_data` — эталонные layout-числа (globalVars); `download_figma_images` — PNG

**Raw Framelink:** `components/service-page-838-4147-framelink.yaml` (7476 строк, dimensions, gap, padding, fills, style)

**Ключевые узлы:**
| Node ID | Название | Описание |
|---------|-----------|----------|
| 838:4148 | Menu | Шапка, навигация |
| 838:4149 | Breadcumbs | Хлебные крошки |
| 838:4192 | info (fixed) | Сайдбар: оглавление + форма |
| 838:4204 | Frame 2131328775 | Основной контент (статьи, этапы, цены, FAQ) |
| 886:4479 | article_card | Hero-карточка услуги |
| 886:4524 | Frame 2131328941 | Промо-баннер |
| 897:4677 | doctors | Секция врачей |
| 838:4347 | cta | CTA баннер |
| 838:4360 | footer | Подвал |
| 838:4361 | blog | Другие услуги |

**Изображения** (PNG, скачаны через Framelink `download_figma_images` 2026-03-08):
| Файл | Node ID | Описание |
|------|---------|----------|
| `hero-article-card.png` / `6bf751dc...png` | 886:4480 | Hero article card |
| `cta-doctor.png` / `44d54fe3...png` | 897:4850 | CTA doctor |
| `surgery-picture.png` | 838:7687 | Picture → Хирургия |
| `quote-image.png` | 838:4306 | 108934 1 (цитата) |
| `promo-people.png` | 887:4407 | Promo image |
| `article-card-icon.png` | 897:4871 | icons8-брекеты |

**Design context metadata:** `components/service-page-838-4147-design-context.txt` (sparse XML, дизайн слишком большой для полного кода)

**Переиспользуемые компоненты:** Menu, footer, doctor_card — instances, уже реализованы в проекте.

---

### Промо-баннер 886:4523 (Frame 2131328940) — «Семейная скидка 10%»

**Статус**: ✅ Реализовано  
**Node ID**: 886:4523 (внутри 886:4524)  
**Родитель**: 886:4524 Frame 2131328941 (Промо-баннер, 1383×313px)  
**Файл**: `components/service-page-838-4147-framelink.yaml` (строки 2579–2690)  
**Ссылка Figma**: [node 886-4523](https://www.figma.com/design/yBZgnbOnRjEiRDRBcz6NtR/Шаблон-сайта--Copy-?node-id=886-4523&m=dev)

**Структура:**
- 887:4398 — Badge «Горячее предложение» (177×35px, fill '2' #607BD4, borderRadius 27px)
- 887:4392 — Текстовый блок (заголовок, «Семейная скидка 10%*», info)
- 887:4407 — Изображение promo-people.png (618.84×435.88px)
- 886:4516 — Pagination dots (5 точек, заполнение актив fill '2', неактив fill_5Q59R0 #D3DAE5)

**Компонент**: `nextjs/src/components/figma/service-page/service-promo-banner.tsx`

---

### Страница «Врачи» (258:1040)

**Статус**: ✅ Данные из полного дампа (full-figma-data-2026-02-04.yaml)  
**Файл**: `components/doctors-page.json`  
**Node ID**: `258:1040`  
**Имя в Figma**: `doctors/ 1440`

**Структура страницы**:

```
258:1040 doctors/ 1440 (FRAME)
├── 258:1474 Menu (INSTANCE, component 109:133) — шапка, навигация, поиск, контакты
├── 259:2439 Breadcumbs (FRAME)
│   ├── 259:2440 Главная (TEXT)
│   ├── 259:2443 Frame 2131328721 (IMAGE-SVG) — разделитель
│   └── 259:2441 Врачи (TEXT)
├── 259:2445 Врачи (TEXT, H2) — заголовок страницы
├── 262:2459 Frame 2131328723 — фильтр по специальности
│   └── Кнопки: Все врачи, Хирург-имплантолог, Стоматолог-ортопед, Ортодент, +5
├── 398:2168 Frame 2131328725 — фильтр по филиалам
│   └── Кнопки: Все филиалы, Название улицы, ...
└── 262:3132 Frame 2131328724 — сетка карточек врачей
    ├── 262:2588 doctor_card (INSTANCE, 123:909)
    ├── 262:2589 doctor_card (INSTANCE, 123:909)
    └── ...
```

**Ключевые узлы**: см. `doctors-page.json` → `keyNodes`  
**Тексты**: см. `doctors-page.json` → `textContent`

---

### Страница «Блог» (414:3935)

**Статус**: ✅ Полные данные из Framelink + user-Figma  
**Node ID**: `414:3935`  
**File Key**: `eEN4I9HdQ3JiW708BuOMRc`  
**Имя в Figma**: `blog/ 1440`  
**Ссылка Figma**: [node 414-3935](https://www.figma.com/design/eEN4I9HdQ3JiW708BuOMRc/?node-id=414-3935&m=dev)  
**Дата получения**: 2026-02-21

**Файл сырых данных**: `components/blog-page-framelink.yaml` (Framelink get_figma_data output)

**Источники данных (2026-02-21):**
- `user-Framelink MCP for Figma` get_figma_data — ✅ layout-числа (dimensions, gap, padding, borderRadius)
- `user-Figma` get_design_context — черновик кода, структура
- `user-Figma` get_screenshot — визуальная проверка

**Layout-числа (из Framelink globalVars):**

| Элемент | Размеры | gap | padding | borderRadius |
|---------|---------|-----|---------|--------------|
| Страница (414:3935) | 1440×2598px | — | — | — |
| Menu | 1440×176.69px | — | — | — |
| Breadcrumbs (414:3937) | — | 10px | — | — |
| Frame 2131328757 (414:3943) | 881×? | 20px | — | — |
| Hero article_card (414:4424) | 1383×487px | — | — | 25px |
| Hero image area | 732.95×486.23px | — | — | — |
| article_card | **451.72×486.6px** | — | — | **25px** |
| tags (фильтры 414:3950) | — | 15px | — | — |
| Кнопка «Все статьи» | 154×48px | 5px | — | 15px |
| Кнопка категории | 186×48px | 5px | — | 15px |
| Кнопка «Загрузить больше» | 250×60px | 10px | — | 15px |
| Баннер промо (topbar) | 254×? | 10px | 5px | 25px |
| Навигация Menu | — | 40px | — | — |
| Поиск | — | 5px | — | 27px |

**Компонент article_card (125:689):**
- Размеры: 451.72×486.6px (≈452×487)
- borderRadius: 25px
- Варианты fills: '2' (градиент), '7' (#EEF3F9), '8' (#F5F7F9)

**Структура страницы:**

```
blog/ 1440 (414:3935) - FRAME 1440×2598px, fills '9'
├── Menu (414:3936) - 1440×176.69px, componentId 109:133
├── Breadcumbs (414:3937) - gap 10px
├── Frame 2131328757 (414:3943) - width 881px, gap 20px
│   ├── 414:3944 Блог (TEXT H2, height 54px)
│   ├── article_card Hero (414:4424) - 1383×487px, borderRadius 25px
│   ├── Frame 2131328474 (414:4364) - сетка 6 article_card
│   │   └── article_card ×6 — 451.72×486.6px каждый
│   ├── tags (414:3950) - gap 15px
│   │   └── Кнопки: Все статьи 154×48, Имплантация/Диагностика 186×48
│   └── Button «Загрузить больше» (414:3946) - 250×60px
└── footer (414:3945) - componentId 131:1618
```

---

### Страница «Акции» (406:4839)

**Статус**: ✅ Данные из `user-Figma` get_design_context + get_screenshot  
**Файл**: `components/promotions-archive-page.json`  
**Node ID**: `406:4839`  
**File Key**: `eEN4I9HdQ3JiW708BuOMRc`  
**Имя в Figma**: `акции/ 1440`  
**Ссылка Figma**: [node 406-4839](https://www.figma.com/design/eEN4I9HdQ3JiW708BuOMRc/?node-id=406-4839&m=dev)  
**Дата получения**: 2026-02-21

**Источники данных (2026-02-21):**
- `user-Figma` get_design_context — черновик кода, структура
- `user-Figma` get_screenshot — визуальная проверка
- Framelink get_figma_data — ⏳ недоступен (MCP не подключён), layout-числа из кэша

**Структура страницы**:

```
акции/ 1440 (406:4839) - FRAME, 1440×3434px
├── Menu (406:4840) - INSTANCE компонента 109:133 — шапка, навигация, поиск, контакты
├── Breadcumbs (406:4842) - FRAME
│   ├── Главная (TEXT)
│   ├── Frame 2131328721 (IMAGE-SVG) — разделитель
│   └── Акции (TEXT)
├── Акции (406:4848) - TEXT, H2 — заголовок страницы
└── Frame 2131328769 (406:5400) - FRAME — сетка карточек акций
    ├── promotion_card (406:5403) - INSTANCE, 448×608px
    ├── promotion_card (406:5404) - INSTANCE
    ├── promotion_card (406:5405) - INSTANCE
    ├── promotion_card (406:5406) - INSTANCE
    ├── promotion_card (406:5407) - INSTANCE
    └── promotion_card (406:5408) - INSTANCE
└── footer (406:5409) - INSTANCE компонента 131:1618
```

**Карточка promotion_card (406:5403)**:

- **Размеры**: 448×608px
- **Border radius**: 25px
- **Фон**: #F5F7F9 (fills '8')
- **Компонент**: 124:793

**Типографика**:

- Заголовок страницы H2: 45px, Gilroy SemiBold, line-height: 1.19, letter-spacing: -1%
- Breadcrumbs: 14px, Gilroy Medium (500), line-height: 1.177, letter-spacing: -1%

**Цвета**:

- Фон страницы: #FFFFFF (fills '9')
- Текст: #191E35 (fills '4')
- Фон карточки: #F5F7F9 (fills '8')

**Layout**:

- Сетка карточек: gap ~20px
- Карточки: 3 колонки на десктопе

**Связанные компоненты**:

- `promotion_card` (124:793) — см. секцию `promotion` (95:2548)
- `footer` (131:1618) — см. секцию 4
- `Menu` (109:133) — см. секцию `header` (109:264)

**IMAGE-SVG для скачивания** (через Framelink `download_figma_images` при подключении MCP):

| Node ID | Описание | fileName |
|---------|----------|----------|
| 124:781 | SVG иллюстрация в promotion_card (image 10) | promotion-illustration.svg |
| 259:2443 | Разделитель breadcrumbs (4×8px) | breadcrumb-separator.svg |

**Примечание**: JSON сохранён в `promotions-archive-page.json`. Framelink MCP не был подключён — для точных layout-чисел (gap, padding из globalVars) повторить `get_figma_data` при подключении.

---

### Страница «Контакты» (412:3463)

**Статус**: ✅ Данные из `user-Figma` get_screenshot + get_variable_defs + full-figma-data YAML  
**Файл**: `components/contacts-archive-page.json`  
**Node ID**: `412:3463`  
**File Key**: `eEN4I9HdQ3JiW708BuOMRc`  
**Имя в Figma**: `сontacts/ 1440`  
**Ссылка Figma**: [node 412-3463](https://www.figma.com/design/eEN4I9HdQ3JiW708BuOMRc/?node-id=412-3463&m=dev)  
**Дата получения**: 2026-02-21

**Источники данных (2026-02-21):**
- `user-Figma` get_screenshot — визуальная проверка
- `user-Figma` get_variable_defs — цвета, H2
- full-figma-data-2026-02-04.yaml — структура узлов
- Framelink get_figma_data — ⏳ недоступен (MCP не подключён), layout-числа при подключении
- Framelink download_figma_images — ⏳ недоступен, IMAGE-SVG при подключении

**Структура страницы**:

```
сontacts/ 1440 (412:3463) - FRAME, fills '9'
├── Menu (412:3464) - INSTANCE компонента 109:133 — шапка, навигация, поиск, контакты
├── Breadcumbs (412:3465) - FRAME
│   ├── Главная (412:3467)
│   ├── Frame 2131328721 (412:3468) - IMAGE-SVG разделитель
│   └── Контакты (412:3470)
├── Frame 2131328757 (412:3471) - блок заголовка
│   └── Контакты (412:3472) - TEXT, H2 — заголовок страницы
├── Frame 2131328763 (412:4384) - основной контент
│   ├── Card (412:4320) - блок контактной информации, fills '8', borderRadius 25px
│   │   ├── Frame 71 (412:4350) — телефон 8 999 999-99-99, «По вопросам ....»
│   │   ├── Frame 73 (412:4366) — email unident@mail.ru
│   │   ├── Frame 74 (412:4373) — email unident@mail.ru
│   │   └── Frame 72 (412:4357) — WhatsApp 8 999 999-99-99, «Написать в WhatsApp»
│   └── Card (412:3886) - IMAGE-SVG карта с маркерами клиник
├── Frame 2131328760 (412:4256) - секция «Клиники и схемы проезда»
│   ├── Клиники и схемы проезда (412:3887) - TEXT H2
│   └── Frame 2131328759 (412:4153) - сетка карточек clinic_card
└── footer - INSTANCE компонента 131:1618
```

**Типографика**:

- Заголовок H2: 45px, Gilroy SemiBold (600), line-height 1.19, letter-spacing -1%
- Breadcrumbs: 14px, Gilroy Medium (500), line-height 1.177, letter-spacing -1%

**Цвета** (get_variable_defs):

- fills '4': #191E35 (текст)
- fills '8': #F5F7F9 (фон карточки контактов)
- fills '9': #FFFFFF (фон страницы)

**IMAGE-SVG для скачивания** (через Framelink `download_figma_images` при подключении MCP):

| Node ID | Описание | fileName |
|---------|----------|----------|
| 412:3468 | Разделитель breadcrumbs | breadcrumb-separator-contacts.svg |
| 412:4351 | Иконка телефона | contacts-phone-icon.svg |
| 412:4367 | Иконка email | contacts-email-icon.svg |
| 412:4374 | Иконка email (дубль) | contacts-email-icon-2.svg |
| 412:4358 | Иконка WhatsApp | contacts-whatsapp-icon.svg |

**Связанные компоненты**:

- `Menu` (109:133) — см. секцию `header` (109:264)
- `breadcrumbs` — см. components/breadcrumbs.json
- `clinic_card` (143:2502) — см. clinics-on-map-section
- `footer` (131:1618) — см. секцию 4

**Примечание**: JSON в `contacts-archive-page.json`. Framelink MCP не был подключён — для точных layout-чисел и скачивания SVG повторить при подключении.

---

### Страница «Кейсы» (406:5648)

**Статус**: ✅ Данные из `user-Figma` get_design_context + get_screenshot + get_variable_defs  
**Файл**: `components/cases-archive-page.json`  
**Node ID**: `406:5648`  
**File Key**: `eEN4I9HdQ3JiW708BuOMRc`  
**Имя в Figma**: `cases/ 1440`  
**Ссылка Figma**: [node 406-5648](https://www.figma.com/design/eEN4I9HdQ3JiW708BuOMRc/?node-id=406-5648&m=dev)  
**Дата получения**: 2026-02-21

**Источники данных (2026-02-21):**
- `user-Figma` get_design_context — черновик кода, структура
- `user-Figma` get_screenshot — визуальная проверка
- `user-Figma` get_variable_defs — переменные (цвета, H2)
- Framelink get_figma_data — ✅ layout-числа (globalVars)
- Framelink download_figma_images — ✅ breadcrumb-separator-cases.svg, load-more-icon.svg

**Структура страницы**:

```
cases/ 1440 (406:5648) - FRAME, fills '9'
├── Menu (406:5649) - INSTANCE компонента 109:133 — шапка, навигация, поиск, контакты
├── Breadcumbs (406:5650) - FRAME
│   └── Frame 2131328722 (406:5651)
│       ├── Главная (406:5652)
│       ├── Frame 2131328721 (406:5653) - IMAGE-SVG разделитель
│       └── Кейсы (406:5655)
├── Frame 2131328757 (406:5656) - блок заголовка
│   └── Наши кейсы (406:5657) - TEXT, H2
├── footer (406:5658) - INSTANCE компонента 131:1618
├── Button (406:5666) - «Загрузить больше»
│   ├── streamline-ultimate:loading-bold (406:5667) - IMAGE-SVG
│   └── Загрузить больше (406:5669)
├── tags (406:5670) - фильтры
│   ├── Все кейсы (406:5671) - active, fills '3'
│   ├── Имплантация (406:5673-406:5674)
│   └── Диагностика (406:5675-406:5676) — inactive, fills '6'
└── cases (406:6019) - FRAME, сетка карточек
    ├── case (406:6217) - COMPONENT 123:416
    └── case (406:6314) - INSTANCE
```

**Карточка case (406:6217)**:
- **Компонент**: 123:416 (см. `components/case.json`)
- **Border radius**: 25px
- **Фон**: #F5F7F9 (fills '8')
- **Слайдер «До/После»**: Frame 2131328600 (406:6169), fills '4'

**Типографика**:
- Заголовок H2: 45px, Gilroy SemiBold (600), line-height 1.19, letter-spacing -1%
- Breadcrumbs: 14px, Gilroy Medium (500)
- Фильтры: 16px, Gilroy Medium (500)
- Кнопка «Загрузить больше»: 16px, Gilroy SemiBold (600)

**Цвета** (get_variable_defs):
- fills '1': #D9E4F7
- fills '2': #607BD4
- fills '3': #526AC2
- fills '4': #191E35
- fills '6': #F9F9F9
- fills '8': #F5F7F9
- fills '9': #FFFFFF
- fills '10': #8F8F8F

**Layout-числа (Framelink, 2026-02-21)**:
- **406:5648** Страница: 1440×2439
- **406:5650** Breadcrumbs: 1440×44, y:179.69; внутренний Frame row, gap 10px, x:29.38 y:14
- **406:5656** Title block: column, gap 20px, width 881px, x:29 y:254.13
- **406:5670** Tags: row, gap 15px, x:26.34 y:328.13
- **406:5671** Кнопка «Все кейсы» (active): 154×48px, gap 5px, borderRadius 15px
- **406:5666** Load More: 250×60px, gap 10px, borderRadius 15px, x:595 y:2036.73
- **406:6019** Cases grid: row wrap, gap 20px, width 1386px, x:26 y:575.72
- **406:6217** Case card: column, gap 20px, width 683px; слайдер height 345.51px

**IMAGE-SVG** (скачаны 2026-02-21):

| Node ID | Описание | fileName | Размер |
|---------|----------|----------|--------|
| 406:5653 | Разделитель breadcrumbs | breadcrumb-separator-cases.svg | 5×8 |
| 406:5667 | Иконка загрузки в кнопке | load-more-icon.svg | 22×22 |

**Связанные компоненты**:
- `case` (123:416) — см. секцию 9 `case`
- `footer` (131:1618) — см. секцию 4
- `Menu` (109:133) — см. секцию `header` (109:264)

**Примечание**: JSON в `cases-archive-page.json`. Layout-числа и SVG получены через Framelink MCP.

---

## 📦 Компоненты

### 1. `doctor_card` (123:909)

**Статус**: ✅ Данные получены и сохранены
**Файл**: `components/doctor_card.json`
**Дата получения**: 2025-12-30

**Структура компонента**:

```
doctor_card (123:909)
├── Frame 2131328615 (95:2356) - Основной контейнер
│   ├── Frame 111 (95:2344) - Информация о враче
│   │   ├── Любимов Павел Олегович (95:2345) - Имя
│   │   └── info (95:2346) - Блок информации
│   │       └── Описание врача (95:2348)
│   ├── Frame 2131328591 (123:887) - Клиника
│   │   ├── Frame 2131328649 (123:894) - ИКОНКА КЛИНИКИ (SVG)
│   │   └── Клиника на Чайковского (123:889) - Название
│   └── Button (95:2349) - Кнопка записи
│       └── Записаться (95:2352)
├── doc-picture (95:2355) - Изображение врача
├── Frame 2131328651 (124:612) - Бейджи
│   ├── experience (95:2364) - Бейдж стажа
│   │   └── 36 лет, стаж
│   └── rating (95:2357) - Бейдж рейтинга
│       ├── 4,7 (95:2360)
│       ├── Frame 411 (95:2361) - ИКОНКА ЗВЕЗДЫ (SVG)
│       └── Doctu.ru (95:2363)
└── Frame 2131328650 (123:906) - КНОПКА ВИДЕО (SVG)
```

**Скачанные изображения/иконки**:

- ✅ `clinic-icon.svg` (123:894) → `public/images/figma/clinic-icon.svg`
- ✅ `star-icon.svg` (95:2361) → `public/images/figma/star-icon.svg`
- ✅ `doctor-figma.png` (95:2355) → `public/images/doctors/doctor-1.png` (+ копии 2,3,4)

**Типографика**:

- Имя: 22px, Gilroy SemiBold (600), line-height: 1.19, letter-spacing: -1%
- Описание: 16px, Gilroy Regular (400), line-height: 1.25
- Клиника: 16px, Gilroy Medium (500), line-height: 1.18
- Кнопка: 16px, Gilroy SemiBold (600), line-height: 1.1
- Стаж (число): 19px, Gilroy Medium (500), letter-spacing: -4%
- Стаж (текст): 8px, Gilroy Medium (500), uppercase, letter-spacing: 2%
- Рейтинг (число): 17px, Gilroy Medium (500), letter-spacing: -4%
- Рейтинг (источник): 8.5px, Gilroy Medium (500)

**Цвета**:

- Фон карточки: #FFFFFF
- Рамка: #D8D8D8 (1px)
- Текст: #191E35
- Кнопка: #526AC2
- Бейдж стажа: #EEF3F9
- Бейдж рейтинга: #D9E4F7
- Border radius: 25px (карточка), 15px (кнопка)

---

### 2. `promotion` (95:2548)

**Статус**: ✅ Данные получены и сохранены  
**Файл**: `components/promotion.json`  
**Дата получения**: 2026-02-05  
**Node ID**: `95:2548`

**Структура компонента**:

```
promotion (95:2548) - FRAME секция с акциями
├── promotion (95:2549) - FRAME контейнер карточек (row layout)
│   ├── promotion_card (124:794) - INSTANCE
│   ├── promotion_card (124:815) - INSTANCE
│   └── ... (другие карточки)
└── promotion_card COMPONENT (124:793) - основной компонент
    ├── Frame 111 (124:772) - Текстовый блок
    │   ├── Название акции (124:773) - TEXT 22px
    │   └── Описание (124:774) - TEXT 16px
    ├── Frame 107 (124:775) - Блок цен и кнопки
    │   └── Frame 115 (124:776)
    │       ├── Frame 114 (124:777) - Цены
    │       │   ├── 21 900Р (124:778) - старая (strikethrough)
    │       │   └── 17 900Р (124:779) - новая
    │       └── записаться (124:780) - кнопка
    ├── image 10 (124:781) - SVG иллюстрация
    ├── Frame 116 (124:782) - Бейдж "Акция"
    │   └── Акция (124:783) - TEXT
    └── Frame 117 (124:784) - Бейдж категории
        └── Имплантация зубов (124:785) - TEXT
```

**Типографика**:

- Название акции: 22px, Gilroy SemiBold (600), line-height: 1.19, letter-spacing: -1%
- Описание: 16px, Gilroy Regular (400), line-height: 1.25
- Цена: 28px, Gilroy Medium (500), line-height: 1.4
- Кнопка: 16px, Gilroy SemiBold (600), line-height: 1.1
- Бейдж "Акция": 14px, Gilroy Medium (500), line-height: 1.18, letter-spacing: -1%
- Бейдж категории: 16px, Gilroy Medium (500), line-height: 1.18

**Цвета**:

- Фон секции: #EEF3F9 (fill '7')
- Фон карточки (темный вариант): #14294E (fill_5YIUPE)
- Фон карточки (светлый): #FFFFFF (fill '9')
- Текст основной: #191E35 (fill '4')
- Текст серый (старая цена): #8F8F8F (fill '10')
- Бейдж "Акция": #607BD4 (fill '2')
- Кнопка: #FFFFFF фон, #FFFFFF текст, #FFFFFF border
- Border radius: 25px (карточка), 10px (кнопка/бейдж)

**Layouts**:

- Секция: mode none, fixed sizing
- Контейнер карточек: mode row, alignItems center, gap 10px
- Карточка: 408px × 608px, fixed sizing

**Реализация**:

- CPT: `promotions` (WordPress)
- Slider: EmblaCarousel с multi-card pattern
- Поля: title, description, priceOld, priceNew, category, image (SVG)
- Компонент: `PromotionCard.tsx`

**Источник данных**: `full-figma-data-2026-02-04.yaml` (кэш)

---

### 3. `blog` (95:2669)

**Статус**: ✅ Данные из кэша (full-figma-data-2026-02-04.yaml)  
**Node ID**: `95:2669`  
**Figma URL**: https://www.figma.com/design/JPVOauS3F3bEIy1msJXPeR/?node-id=95-2669

**Структура секции**:

```
blog (95:2669) - FRAME, column, gap 40px, width 1379.94px
├── Frame 2131328653 (125:759) - шапка секции, layout_32BYQB (height 54px)
│   ├── Самое интересное в блоге ✨ (93:339) - TEXT, style_NPKHXQ
│   ├── Button (125:756) - кнопка "Журнал", stroke '3', borderRadius 15px
│   │   └── Журнал (125:757) - TEXT, style_OQJCVA
│   └── Frame 2131328710 (143:2604) - IMAGE-SVG (декор)
└── Frame 2131328474 (95:2634) - контейнер карточек, row, gap ~11px
    ├── article_card (125:690) - INSTANCE, componentId 125:689, fill '2', 451.72×486.6px, borderRadius 25px
    ├── article_card (125:725) - FRAME, fill '8', с блоком "Отвечает врач" + doctor IMAGE-SVG (125:743)
    └── article_card (125:713) - INSTANCE, fill '7'
```

**Карточка статьи (article_card, 125:689)**:

- **card** (95:2636) — обёртка, borderRadius 22.95px
- **image** (125:686) — RECTANGLE (превью)
- **text** — заголовок (style_BPFRZ3, 22px SemiBold), дата (style_DJKFH4, ~12.85px Regular)
- **tags** — бейджи (Frame 266/267), borderRadius 10px, fill '9', текст style_I8H80U (~14.69px)

**Вариант с врачом** (125:725):

- **Frame 2131328646** → doctor (125:743) IMAGE-SVG, «Отвечает врач» (style_B571IG, 12px), имя (style_HGG5PV, 18px Medium)

**Типографика**:

- Заголовок секции: 45px, Gilroy SemiBold (600), line-height 1.19, letter-spacing -3%
- Кнопка «Журнал»: 16px, Gilroy SemiBold (600), line-height 1.19, letter-spacing -1%
- Заголовок статьи: 22px, Gilroy SemiBold (600), line-height 1.19
- Дата: ~12.85px, Gilroy Regular (400), line-height 1.16
- Тег: ~14.69px, Gilroy Regular (400), line-height 1.4, letter-spacing -1%
- «Отвечает врач»: 12px, Gilroy Medium (500)
- Имя врача: 18px, Gilroy Medium (500), line-height 1.3

**Цвета (fills)**:

- fill '2' — акцент (карточка)
- fill '4' — основной текст (#191E35)
- fill '7' — светло-серый фон карточки (#EEF3F9)
- fill '8' — фон карточки (#F5F7F9)
- fill '9' — белый (#FFFFFF)
- stroke '3' — обводка кнопки (#526AC2)

**Иконки/изображения для скачивания** (если понадобится):

- `143:2604` — Frame 2131328710 (SVG декор в шапке)
- `125:743` — doctor (SVG аватар в карточке с врачом)

**Layouts**:

- layout_0XH8DO: column, gap 40px, width 1379.94px
- layout_32BYQB: height 54px, horizontal fill
- layout_BF5LWP: row, gap 11.02px, alignSelf stretch
- layout_IPQY2Y: 451.72×486.6px (карточка)

---

### 4. `footer` (131:1618)

**Статус**: ✅ Данные получены (частично)
**Node ID**: 131:1618
**Дата получения**: 2025-12-30

**Цвета**:

- Фон: #2F375F
- Текст: #FFFFFF
- Год: 2022

**Компонент реализован**: `nextjs/src/components/figma/footer/footer.tsx`

---

### 4.1. `footer` block instance (392:2371)

**Статус**: ✅ Данные из кэша YAML (full-figma-data-2026-02-04.yaml)
**Node ID**: 392:2371 (instance компонента 131:1618)
**Дата получения**: 2026-02-09
**Файл**: `components/footer-block.json`
**Figma URL**: https://www.figma.com/design/JPVOauS3F3bEIy1msJXPeR/?node-id=392-2371

**Структура блока**:

```
footer (392:2371) - INSTANCE, componentId 131:1618
├── Group 1 (95:1227) - Логотип
│   ├── УниДент (95:1228) - TEXT
│   └── Vector (95:1229) - IMAGE-SVG
├── Frame 46 (95:1230) - Меню колонка 1
│   ├── Frame 47 - Услуги + Frame 66 (95:1232) IMAGE-SVG
│   ├── Frame 49 - О клинике + Vector 39 (95:1240) IMAGE-SVG
│   ├── Врачи (95:1241)
│   ├── Frame 50 - Акции (95:1243)
│   └── Кейсы (95:1248)
├── Frame 2131328630 (96:379) - Меню колонка 2
│   ├── Цены, Отзывы, Frame 48 (Пациентам + Vector 39 (95:1258) IMAGE-SVG), Контакты
├── Frame 2131328667 (131:856) - Правая часть
│   ├── Кнопки Связаться / Записаться на прием
│   ├── Копирайт, disclaimer, Политика
│   ├── Vector 162 (131:857) - IMAGE-SVG разделитель
│   └── social media (131:863)
│       └── Frame 2131328698 - Адрес/Телефон/Часы (Frame 70 x3: 95:1267, 95:1275, 95:1282) + Frame 2131328697 (131:893) IMAGE-SVG соцсети
```

**IMAGE-SVG узлы для скачивания** (batch export при наличии Figma MCP):

| Node ID   | Имя                | Назначение                    | Цвет в Figma |
|-----------|--------------------|-------------------------------|--------------|
| 95:1229   | Vector             | Иконка у логотипа УниДент     | fills '9'    |
| 95:1232   | Frame 66           | Иконка «Услуги» (меню)        | —            |
| 95:1240   | Vector 39          | Стрелка dropdown              | fills '9', strokes '9' |
| 95:1258   | Vector 39          | Стрелка dropdown (дубль)     | fills '9', strokes '9' |
| 131:857   | Vector 162         | Разделительная линия          | strokes '10' |
| 95:1267   | Frame 70           | Иконка Адрес / Схема проезда  | fills '2'    |
| 95:1275   | Frame 70           | Иконка Телефон                | fills '2'    |
| 95:1282   | Frame 70           | Иконка Часы работы            | fills '2'    |
| 131:893   | Frame 2131328697   | Блок соцсетей (группа)        | IMAGE-SVG    |

**Типографика**: style_IYZ3U7 (пункты меню), style_OQJCVA (кнопки), style_4AM294 (копирайт, opacity 0.5).

**Цвета**: фон fill_CV8QNJ (#2F375F), текст fills '9' (white), акцент fills '2' (#607BD4).

---

### 2. `header` (109:264)

**Статус**: ✅ Данные получены и реализованы
**Node ID**: 109:264
**Дата получения**: 2026-01-13

**Структура компонента**:

```
header (109:264) - Menu
├── Frame 64 (109:4) - TopBar (высота 50.69px, фон #F9F9F9)
│   ├── Версия для слабовидящих (109:10-15)
│   ├── Карта сайта (143:981-986)
│   ├── Промо блок (143:1122) - "Имплантация за 3750₽/мес"
│   └── Соц. сети (109:22)
└── Frame 65 (109:47) - MainHeader (высота 126px, white, shadow)
    ├── Логотип "УниДент" (109:48-50)
    ├── Рейтинг 5,0 (109:116-132)
    ├── Информационные блоки (109:86-113)
    │   ├── Клиники + схема проезда (109:87-94)
    │   ├── Телефон + часы (109:95-101)
    │   └── Часы работы Пн-Сб/Вс (109:102-113)
    ├── CTA "Связаться с нами" (109:114-115)
    ├── Separator (109:85, opacity 0.2)
    └── Navigation (109:46-80)
        ├── Меню (109:51-80)
        │   ├── Услуги (dropdown) (109:52-58)
        │   ├── О клинике (dropdown) (109:59-61)
        │   ├── Врачи (109:62)
        │   ├── Акции [badge 3] (109:63-68)
        │   ├── Кейсы (109:69)
        │   ├── Цены (109:70)
        │   ├── Отзывы [badge 1294] (109:71-76)
        │   ├── Пациентам (dropdown) (109:77-79)
        │   └── Контакты (109:80)
        └── Поиск (109:81-84) - 301x44px, #F5F7F9
```

**Использованные иконки** (via @iconify/react):

- Eye (версия для слабовидящих): `iconamoon:eye-thin` (25x25px)
- Map pin (карта/клиники): `bx:map-pin` (25x25px)
- Sparkle (промо): `fluent:sparkle-28-filled` (20x20px)
- Search (поиск): `mynaui:search` (25x25px)
- Phone (телефон): `ph:phone` (24x24px)
- Clock (часы): `ph:clock` (24x24px)
- Dropdown arrow: `chevron-down` (6.1x3.05px)

**Типографика**:

- TopBar links: 15px, Gilroy Medium, #8F8F8F
- Logo text: 28.14px, Gilroy SemiBold, #191E35
- Rating number: 34.23px, Gilroy Medium
- InfoBlock title: 18px, Gilroy Medium, #191E35
- InfoBlock subtitle: 14px, Gilroy Medium, rgba(20,41,78,0.35)
- Navigation items: 18px, Gilroy Medium, #191E35
- Badge (count): 9-12px, Gilroy Medium, #526AC2 bg
- Search placeholder: 16px, Gilroy Medium

**Цвета**:

- TopBar background: #F9F9F9
- MainHeader background: #FFFFFF (white)
- Shadow: 0px 4px 51.1px 0px rgba(181,181,181,0.19)
- Primary (buttons, badges): #526AC2
- Dark text: #191E35
- Gray text: #8F8F8F
- Border separator: opacity 0.2
- Search background: #F5F7F9

**Компоненты реализованы**:

- `nextjs/src/components/figma/header/header-v2.tsx` - Главный компонент
- `nextjs/src/components/figma/header/top-bar.tsx` - TopBar (убран язык, оставлена версия для слабовидящих)
- `nextjs/src/components/figma/header/main-header.tsx` - MainHeader с InfoBlocks
- `nextjs/src/components/figma/header/navigation.tsx` - Navigation с Badge
- `nextjs/src/components/figma/header/info-block.tsx` - **НОВЫЙ** универсальный InfoBlock
- `nextjs/src/components/figma/header/logo.tsx` - Логотип
- `nextjs/src/components/figma/header/rating.tsx` - Рейтинг
- `nextjs/src/components/figma/header/search-bar.tsx` - Поиск
- `nextjs/src/components/figma/header/nav-item.tsx` - Пункт меню с Badge
- `nextjs/src/components/figma/header/social-links.tsx` - Соц. сети

**Удалены избыточные компоненты**:

- `language-select.tsx` - убран переключатель языка
- `menu-badge.tsx` - дублировал ui/badge
- `clinic-info.tsx` - заменен на InfoBlock
- `contact-info.tsx` - заменен на InfoBlock
- `mega-menu.tsx` - не используется в дизайне

**WordPress интеграция**:

- Меню загружается из WordPress (GraphQL)
- Данные: phone, workingHours, locationsCount, reviewsCount
- Badge для акций (count 3) и отзывов (count 1294+)

---

### 5. `hero_block` (95:1356)

**Статус**: ✅ Данные получены (из скриншота) и реализованы
**Node ID**: 95:1356
**Дата получения**: 2026-01-23

**Структура компонента**:

```
hero_block (95:1356) - Главный контейнер
├── info_block - Левая часть (912x608px, gradient)
│   ├── heading - "На 32% доступнее других стоматологий" (50px, white)
│   ├── description - Описание текст (19px, white)
│   ├── button - "Получить консультацию" (outline white)
│   ├── doctor_image - Изображение врача (справа)
│   └── counters - Счётчики внизу (row, gap 5px)
│       ├── "20+ клиник" (badge #607BD4)
│       ├── "50+ врачей" (badge #607BD4)
│       └── "2 клиники в Москве" (badge #607BD4)
└── action_card - Правая часть (347px width)
    ├── badge - "Акция" (#526AC2)
    ├── countdown - "Осталось 64 дн."
    ├── title - "Имплант OSSTEM с установкой" (22px)
    ├── features - Список преимуществ с галочками
    ├── price - "17 900₽" (24px, bold)
    ├── button - "Подробнее" (outline #526AC2)
    └── product_image - Изображение товара
```

**Типографика**:

- Заголовок: 50px, Gilroy SemiBold (600), line-height: 1.193, letter-spacing: -3%
- Описание: 19px, Gilroy Regular (400), line-height: 1.25
- Кнопка: 16px, Gilroy SemiBold (600), letter-spacing: -1%
- Счётчики: 15px, Gilroy Medium (500), line-height: 1.177, letter-spacing: -1%

**Цвета**:

- Фон info block: linear-gradient(180deg, #2E365D 0%, #46559D 100%)
- Бейджи счётчиков: #607BD4
- Текст: #FFFFFF
- Border radius: 25px (block), 41px (badges), 15px (button)

**Компонент реализован**: `nextjs/src/components/sections/hero-section.tsx`

**Кэш файл**: `figma-data/components/hero-block.json`

---

### 3. `social_icons` (inline SVG)

**Статус**: ✅ Inline SVG (performance-first philosophy)
**Дата изменения**: 2026-01-14

**Финальная система (v3.0):**

- ✅ **Inline SVG** - zero HTTP requests, следует performance philosophy проекта
- ✅ **ACF textarea** - админ вставляет SVG код напрямую
- ✅ **Любые иконки** - не ограничено предустановленным списком

**Реализация:**

- Компонент: `nextjs/src/components/figma/header/social-links.tsx`
- Метод: Inline SVG через `dangerouslySetInnerHTML`
- Формат: SVG код (строка)
- Размер: 20x20px (иконка), 37x37px (контейнер с фоном)

**WordPress управление:**

- ACF Option Page: Header Settings → Social Links (repeater)
- Поля:
  - `name` (text) - Название социальной сети
  - `icon` (textarea) - **SVG код иконки (любой SVG)**
  - `url` (url) - Ссылка на страницу
- GraphQL: `headerSettings.socialLinks`
  - `icon` возвращает String (SVG код)

**Как использовать:**

1. **Найти/создать SVG иконку**
   - Скачать из Iconify, Flaticon, или из Figma
   - Открыть SVG в текстовом редакторе
2. **WordPress Admin → Header Settings → Social Links**
3. Добавить запись:
   - Name: "Telegram"
   - Icon: Вставить SVG код (например: `<svg>...</svg>`)
   - URL: https://t.me/unident
4. Сохранить

**Преимущества (Performance-First):**

- ✅ **Zero HTTP requests** - иконки встроены в HTML
- ✅ **Instant rendering** - нет ожидания загрузки
- ✅ **Любые SVG** - можно вставить любой SVG код
- ✅ **Гибкость** - админ может редактировать SVG (цвета, градиенты)
- ✅ **Следует project philosophy** - inline SVG вместо отдельных файлов

**Тестовые данные:**

- ✅ Заполнено 5 соц. сетей с inline SVG и градиентами (#2E365D → #46559D)

---

### 4. `services_dropdown` (109:394)

**Статус**: ✅ Данные получены и реализованы
**Node ID**: 109:394
**Дата получения**: 2026-01-21

**Структура компонента**:

```
open (109:394) - Главный контейнер 1440x550px
├── services (110:396) - Левая колонка 360x550px (табы категорий)
│   ├── Frame 2131328632 - Активный таб (bg #EEF3F9, rounded-l-[5px])
│   └── Неактивные табы (opacity 0.5) x7
└── service_open (141:981) - Правая часть 1077x550px
    ├── Frame 2131328700 - Список услуг (две колонки, 18px)
    ├── promotion (110:399) - Карточка продвигаемой услуги 326x449px
    └── Close (141:1027) - Кнопка закрытия
```

**Скачанные иконки**:

- ✅ `arrow-category.svg` (141:1022) → `public/images/figma/` (11x18px)
- ✅ `point-icon.svg` (110:417) → `public/images/figma/` (15x15px)
- ✅ `close-icon.svg` (141:1030) → `public/images/figma/` (12x12px)

**Типографика**:

- Таб категории: 20px, Gilroy Regular, leading 1.25
- Заголовок категории: 28px, Gilroy SemiBold, leading 1.25
- Элемент услуги: 18px, Gilroy Regular, leading 1.25
- Заголовок промо: 23.6px, Gilroy SemiBold, #526AC2
- Цена: 20.67px, Gilroy SemiBold
- Преимущества: 14.77px, Gilroy Regular
- Кнопка: 14px, Gilroy SemiBold
- Закрыть: 18px, Gilroy Medium

**Цвета**:

- Фон контейнера: #FFFFFF
- Фон левой колонки: #F5F7F9
- Активный таб: #EEF3F9
- Промо карточка: #EEF3F9
- Скроллбар: #526AC2 / #F5F7F9

**Компоненты реализованы**:

- `nextjs/src/components/figma/header/service-dropdown.tsx` - Главный контейнер
- `nextjs/src/components/figma/header/category-tabs.tsx` - Вертикальные табы
- `nextjs/src/components/figma/header/featured-service-card.tsx` - Карточка услуги
- `nextjs/src/components/figma/header/navigation.tsx` - **МОДИФИЦИРОВАН** для поддержки ServiceDropdown

**Design Tokens добавлены**:

- `category-tab`, `category-title`, `service-item`
- `featured-service-title`, `featured-service-price`, `featured-service-feature`
- `featured-service-button`, `close-text`

**Особенности реализации**:

- Список услуг - inline map по массиву ссылок (НЕ отдельный компонент)
- Custom scrollbar для списка услуг (#526AC2)
- Hover trigger на пункте "Услуги" в навигации
- Mock данные для демонстрации (TODO: интеграция с WordPress GraphQL)

---

### 6. `advantages` (93:307)

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 93:307
**Дата получения**: 2026-01-29
**Файл**: `components/advantages.json`

**Структура компонента**:

```
advantages (93:307) - FRAME, 1380x624px, bg #F9F9F9, rounded 25px
├── Frame 2131328582 (95:1422) - Контейнер заголовка и описания
│   ├── "Нам доверили уже 1 204 пациента" (93:308) - TEXT, H2 style
│   └── "Унидент — многопрофильная научная стоматология..." (93:311) - TEXT, style_GM4D8I
├── Button (95:1436) - Кнопка "Подробнее"
│   └── "Подробнее" (95:1437) - TEXT, style_Y5EL9U, outline #526AC2
└── Frame 2131328666 (130:1231) - Контейнер карточек преимуществ
    ├── advantage #1 (130:1204) - INSTANCE, rounded 25px
    │   ├── "01" - badge, style_1WIWLN, gradient fill
    │   ├── "Честные цены, без хитрых уловок" - style_ZJD43E
    │   └── "Фиксируем цены в плане..." - style_W4JCJL
    ├── advantage #2 (130:1213) - INSTANCE
    │   ├── "02" - badge
    │   ├── "Общаемся по-человечески" - style_ZJD43E
    │   └── "Легко и просто: на звонки отвечает..." - style_W4JCJL
    └── advantage #3 (130:1222) - INSTANCE
        ├── "03" - badge
        ├── "Слушаем, объясняем, лечим с умом" - style_ZJD43E
        └── "Не давим, не пугаем и не лечим «на глаз»..." - style_W4JCJL
```

**Типографика**:

- Заголовок H2: 45px, Gilroy SemiBold (600), line-height: 1.193em, letter-spacing: -1%
- Описание: 18px, Gilroy Regular (400), line-height: 1.2em
- Кнопка: 16px, Gilroy SemiBold (600), line-height: 1.193em, letter-spacing: -1%
- Заголовок карточки: 28px, Gilroy Medium (500), line-height: 1.177em, letter-spacing: -1%
- Текст карточки: 16px, Gilroy Regular (400), line-height: 1.25em
- Badge номер: 18px, Gilroy Medium (500), line-height: 1.177em, letter-spacing: -3%

**Цвета**:

- Фон блока: #F9F9F9
- Фон карточек: #FFFFFF
- Фон badge: #EEF3F9
- Текст: #191E35
- Кнопка (outline): #526AC2
- Badge номер: gradient (linear-gradient(180deg, rgba(46, 54, 93, 1) 0%, rgba(70, 85, 157, 1) 100%))
- Border radius: 25px (блок и карточки), 15px (кнопка), 135px (badge)

**Контент**:

- Заголовок: "Нам доверили уже 1 204 пациента"
- Описание: "Унидент — многопрофильная научная стоматология с сертификатом качества Росздравнадзора. Мы стремимся сделать высококачественную стоматологическую помощь доступной."
- Кнопка: "Подробнее"
- 3 карточки преимуществ с номерами 01, 02, 03

**Кэш файл**: `figma-data/components/advantages.json`
**Полный файл**: `figma-data/full-figma-data-2026-01-29.yaml` (1.6MB, 40077 строк)

**Примечание**: Данные получены через запрос всего файла (workaround для 429 rate limit на `/nodes` эндпоинт)

---

### 7. `services_block` (93:697)

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 93:697
**Дата получения**: 2026-01-30
**Файл**: `components/services_block.json`

**Структура компонента**:

```
services_block (93:697) - FRAME, 1380x624px (примерно), bg #EEF3F9, rounded 25px
├── Frame 2131328655 (125:871) - Основной контейнер
│   ├── Frame 2131328656 (125:873) - Заголовок и кнопка
│   │   ├── Frame 2131328621 (95:2678) - Контейнер заголовка
│   │   │   └── "Мы рядом, чтобы помочь" (93:698) - TEXT, H2 style
│   │   └── buttins (125:870) - Контейнер кнопки
│   │       └── Button (96:372) - Кнопка "Все услуги"
│   │           └── "Все услуги" (96:373) - TEXT, style_GOHU8F
│   └── services (125:869) - Сетка карточек услуг
│       ├── service_card (125:777) - INSTANCE компонента 125:776
│       ├── service_card (125:787) - INSTANCE
│       ├── service_card (125:797) - INSTANCE
│       ├── service_card (125:808) - INSTANCE
│       ├── service_card (125:809) - INSTANCE
│       ├── service_card (125:810) - INSTANCE
│       ├── service_card (125:838) - INSTANCE
│       ├── service_card (125:839) - INSTANCE
│       └── service_card (125:840) - INSTANCE
```

**Структура service_card компонента (125:776)**:

```
service_card (125:776)
├── Group 380288 - Группа элементов
│   ├── Rectangle 515 - Фон карточки (white)
│   ├── arrow (125:769) - IMAGE-SVG, стрелка
│   ├── "Стоматология города" - TEXT, название услуги
│   └── Frame 2131328654 (125:772) - IMAGE-SVG, иконка услуги
```

**Скачанные иконки**:

- ✅ `service-arrow.svg` (125:769) → `public/images/figma/service-arrow.svg` (55x55px)
- ✅ `service-icon.svg` (125:772) → `public/images/figma/service-icon.svg` (33x34px)

**Типографика**:

- Заголовок H2: 45px, Gilroy SemiBold (600), line-height: 1.193, letter-spacing: -1%
- Название услуги: 23px, Gilroy Medium (500), line-height: 1.25
- Кнопка "Все услуги": 16px, Gilroy SemiBold (600), line-height: 1.193, letter-spacing: -1%

**Цвета**:

- Фон блока: #EEF3F9 (fills: '7')
- Фон карточек: #FFFFFF (fills: '9')
- Текст: #191E35 (fills: '4')
- Кнопка: #526AC2 (fills: '3')
- Текст кнопки: #FFFFFF (fills: '9')
- Border radius: 25px (блок и карточки), 15px (кнопка)

**Контент**:

- Заголовок: "Мы рядом, чтобы помочь"
- Кнопка: "Все услуги"
- 9 карточек услуг (инстансы компонента service_card)

**Кэш файл**: `figma-data/components/services_block.json`

**Примечание**: Данные получены через запрос всего файла (workaround для 429 rate limit). Component ID 125:776 (service_card) используется для всех карточек услуг.

---

## 🎯 Правила работы с кэшем

### ✅ Когда НЕ нужно запрашивать Figma:

1. Если компонент уже описан в этом файле
2. Если иконка/изображение уже скачано
3. Если нужно изменить существующий компонент (используйте локальные данные)

### ⚠️ Когда НУЖНО запросить Figma:

1. Новый компонент, которого нет в списке
2. Пользователь явно просит обновить данные из Figma
3. Изменения в дизайне (пользователь сообщил)

### 📝 Как работать с компонентами:

1. **Сначала проверь этот файл** - есть ли уже данные?
2. **Если данных нет** - запрашивай через MCP
3. **После получения** - обнови этот файл с новыми данными
4. **Сохрани JSON** в `components/[component_name].json`
5. **Скачай все иконки/изображения** за один раз
6. **Обнови список** скачанных файлов

## 📸 Скачанные изображения

### Иконки (SVG)

| Имя файла                    | Node ID  | Компонент        | Путь                   |
| ---------------------------- | -------- | ---------------- | ---------------------- |
| `clinic-icon.svg`            | 123:894  | doctor_card      | `public/images/figma/` |
| `star-hero.svg`              | 401:3115 | doctor page Hero | `public/images/figma/` |
| `kids-room-icon.svg`         | 440:4234 | doctor page Hero | `public/images/figma/` |
| `star-icon.svg`              | 95:2361  | doctor_card      | `public/images/figma/` |
| `service-arrow.svg`          | 125:769  | services_block | `public/images/figma/` |
| `service-icon.svg`           | 125:772  | services_block | `public/images/figma/` |
| `price-divider.svg`          | 79:95    | price          | `public/images/figma/` |
| `appointment-decoration.svg` | 256:1070 | price          | `public/images/figma/` |
| `menu-dropdown.svg`          | -        | menu           | `public/images/icons/` |
| `close.svg`                  | -        | menu           | `public/images/icons/` |
| `search.svg`                 | -        | menu           | `public/images/icons/` |
| `menu-hamburger.svg`         | -        | menu           | `public/images/icons/` |
| `breadcrumb-separator-cases.svg` | 406:5653 | cases archive  | `public/images/figma/` |
| `load-more-icon.svg`         | 406:5667 | cases archive  | `public/images/figma/` |

### Footer (392:2371) — для скачивания при наличии Figma MCP

| Предполагаемое имя файла     | Node ID  | Описание              |
| ---------------------------- | -------- | --------------------- |
| `footer-logo-icon.svg`       | 95:1229  | Иконка у логотипа     |
| `footer-menu-icon.svg`       | 95:1232  | Иконка «Услуги»       |
| `footer-dropdown-arrow.svg`  | 95:1240  | Стрелка dropdown      |
| `footer-divider.svg`         | 131:857  | Разделитель           |
| `footer-address-icon.svg`    | 95:1267  | Адрес                 |
| `footer-phone-icon.svg`      | 95:1275  | Телефон               |
| `footer-clock-icon.svg`      | 95:1282  | Часы                  |
| `footer-social-block.svg`    | 131:893  | Блок соцсетей         |

### Изображения (PNG)

| Имя файла      | Node ID | Компонент   | Путь                     |
| -------------- | ------- | ----------- | ------------------------ |
| `doctor-1.png` | 95:2355 | doctor_card | `public/images/doctors/` |
| `doctor-2.png` | -       | doctor_card | `public/images/doctors/` |
| `doctor-3.png` | -       | doctor_card | `public/images/doctors/` |
| `doctor-4.png` | -       | doctor_card | `public/images/doctors/` |

### 8. `rating` (143:1782)

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 143:1782
**Дата получения**: 2026-01-30
**Файл**: `components/rating.json`

**Структура компонента**:

```
rating (143:1782) - FRAME, блок отзывов
├── Frame 2131328709 (143:1897) - Основной контейнер
│   ├── Frame 2131328708 (143:1896) - Контейнер заголовка и карточек
│   │   ├── Frame 2131328706 (143:1779) - Заголовок и кнопка
│   │   │   ├── "Отзывы без сахара 👇" (143:1780) - TEXT, H2 style
│   │   │   ├── slider (143:1898) - IMAGE-SVG, навигация слайдера
│   │   │   └── Button (143:2457) - Кнопка "Все отзывы"
│   │   │       └── "Все отзывы" (143:2458) - TEXT, style_Y5EL9U
│   │   └── Review (122:537) - INSTANCE компонента 122:536
│   │       ├── Frame 2131328712 - Контейнер содержимого
│   │       │   ├── Frame 2131328711 - Отзыв и ответ
│   │       │   │   ├── Заголовок отзыва - TEXT, style_B5B05M
│   │       │   │   └── Текст отзыва - TEXT, style_CZ3UNP
│   │       │   └── answer (I122:537;122:516) - Ответ клиники
│   │       │       ├── Frame 2131328635 - IMAGE-SVG, аватар клиники
│   │       │       └── Текст ответа - TEXT, style_9Y9EI9
│   │       └── Frame 2131328713 - Информация об отзыве
│   │           ├── info - Автор и логотип
│   │           │   ├── Group 42342 - IMAGE-SVG, аватар автора
│   │           │   ├── Logo - IMAGE-SVG, логотип платформы
│   │           │   └── "Виктория Н, 25.05.2025" - TEXT, style_JY7OQ5
│   │           └── Frame 2131328648 - Лечащие врачи и услуги
│   │               ├── Лечащие врачи - с фото и слайдером
│   │               └── Оказанные услуги - список услуг
│   └── Frame 2131328641 (122:595) - IMAGE-SVG, декоративное изображение
```

**IMAGE-SVG элементы (иконки стрелок)**:

- ✅ `review-arrow-left.svg` (array1.svg) - Стрелка влево для главного слайдера (15x27px)
- ✅ `review-arrow-right.svg` (array2.svg) - Стрелка вправо для главного слайдера (15x27px)
- ✅ `small-arrow-left.svg` (array4.svg) - Стрелка влево для врачей/услуг (5x9px)
- ✅ `small-arrow-right.svg` (array3.svg) - Стрелка вправо для врачей/услуг (5x9px)

**Остальные элементы** (не критичны для функционала):

- ⏳ `clinic-avatar.svg` (I122:537;122:518) - Аватар клиники в ответе
- ⏳ `user-avatar.svg` (I122:537;122:495) - Аватар автора отзыва
- ⏳ `review-platform-logo.svg` (I122:537;122:506) - Логотип платформы отзывов
- ⏳ `doctor-photo.svg` (I122:537;122:524) - Фото врача (круглое)
- ⏳ `rating-section-bottom-decoration.svg` (122:595) - Декоративное изображение внизу

**Типографика**:

- Заголовок H2: 45px, Gilroy SemiBold (600), line-height: 1.193, letter-spacing: -3%
- Кнопка: 16px, Gilroy SemiBold (600), line-height: 1.193, letter-spacing: -1%
- Заголовок отзыва: 28px, Gilroy Medium (500), line-height: 1.3
- Текст отзыва: 18px, Gilroy Regular (400), line-height: 1.3
- Текст ответа: 18px, Gilroy Medium (500), line-height: 1.3
- Метаданные: 14px, Gilroy Medium (500), line-height: 1.3
- Должность врача: 12px, Gilroy Medium (500), line-height: 1.3
- Названия услуг: 16px, Gilroy Medium (500), line-height: 1.177

**Цвета**:

- Фон карточки: #F5F7F9 (fills: '8')
- Фон ответа: #FFFFFF (fills: '9')
- Текст: #191E35 (fills: '4')
- Кнопка (border): #526AC2 (fills: '3')
- Аватар фон: #526AC2 (fills: '3')
- Метаданные текст: #8F8F8F (fills: '10')
- Border radius: 25px (карточки), 15px (кнопка), 10px (бейджи услуг), 1000px (аватары)

**Контент**:

- Заголовок: "Отзывы без сахара 👇"
- Кнопка: "Все отзывы"
- Пример отзыва включает: заголовок, текст, автора, дату, ответ клиники, врачей, оказанные услуги

**Кэш файл**: `figma-data/components/rating.json`

**Примечание**: Данные извлечены из `full-figma-data-2026-01-29.yaml` (workaround для rate limit). Компонент Review (122:536) используется как база для карточек отзывов.

---

### 9. `case` (123:416) - "movie" component

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 95:1910 (cases section), 123:416 (component definition)
**Дата получения**: 2026-02-04
**Файл**: `components/case.json`

**Структура компонента**:

```
case (123:416) - COMPONENT, карточка выполненной работы
├── Frame 2131328600 (95:1956) - Слайдер "До/После"
│   ├── Vector 24 (95:1957) - IMAGE-SVG, элемент управления слайдером
│   ├── Group 42315 (95:1958) - IMAGE-SVG, группа элементов слайдера
│   ├── Frame 2131328592 (123:409) - Контейнер "До"
│   │   └── "До" (123:411) - TEXT
│   └── Frame 2131328593 (123:413) - Контейнер "После"
│       └── "После" (123:415) - TEXT
└── Frame 2131328718 (143:2620) - Контейнер контента
    └── Frame 2131328719 (143:2712) - Основной контент
        ├── Заголовок (122:610) - "Тотальное преображение улыбки: 28 виниров и коронок"
        └── info (123:398) - Информационный блок
            ├── Лечащие врачи (122:602)
            │   └── Frame 2131328646 (123:408) - Список врачей
            │       ├── Врач 1 (122:604) - аватар (122:605), имя (122:608), должность (122:609)
            │       └── Врач 2 (123:401) - аватар (123:402), имя (123:405), должность (123:406)
            ├── Оказанные услуги (123:583)
            │   └── Frame 2131328640 (123:585) - Список услуг
            │       ├── "Имплантация зубов" (123:586)
            │       └── "Лечение кариеса" (123:589)
            └── Клиника (122:626)
                └── Frame 2131328592 (122:620) - Информация о клинике
                    ├── Ellipse 147 (122:633) - Точка локации
                    └── "Клиника на Чайковского" (122:622)
```

**IMAGE-SVG элементы (иконки)**:

- ⏳ `slider-control.svg` (95:1957) - Элемент управления слайдером "До/После"
- ⏳ `slider-group.svg` (95:1958) - Группа элементов слайдера
- ⏳ `doctor-avatar.svg` (122:605, 123:402) - Аватары врачей

**Типографика**:

- Заголовок: 28px, Gilroy Medium (500), line-height: 1.3
- Метка секции: 14px, Gilroy Medium (500), #8F8F8F
- Имя врача: 16px, Gilroy Medium (500)
- Название услуги: 16px, Gilroy Regular (400)
- Название клиники: 16px, Gilroy Regular (400)

**Цвета**:

- Фон карточки: #FFFFFF (fills: '9')
- Текст: #191E35 (fills: '4')
- Метка секции: #8F8F8F (fills: '10')
- Фон бейджа услуги: #F5F7F9 (fills: '8')
- Точка локации: #526AC2 (fills: '3')
- Border radius: 25px (карточка), 10px (бейджи), 117.98px (аватары)

**Контент**:

- Заголовок: "Тотальное преображение улыбки: 28 виниров и коронок"
- Лечащие врачи: список с аватарами, именами и должностями
- Оказанные услуги: список услуг в виде бейджей
- Клиника: название клиники с точкой локации

**Кэш файл**: `figma-data/components/case.json`

**Примечание**: Данные получены через запрос всего файла без параметра node (workaround для rate limit). Компонент "case" (123:416) используется для карточек выполненных работ в секции "cases" (95:1910).

---

### 10. `price` (93:302)

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 93:302
**Дата получения**: 2026-02-04
**Файл**: `components/price.json`

**Структура компонента**:

```
price (93:302) - FRAME, секция с таблицей цен
├── Заголовок (78:4) - "Сколько стоит забота о себе 🩺"
├── Таблица (93:301) - Frame 2131328566
│   ├── Заголовок таблицы (93:270) - Group 380285
│   │   ├── "Услуга" (78:10) - TEXT, opacity 0.3
│   │   ├── "Наша цена" (78:11) - TEXT, opacity 0.3
│   │   └── "Средняя в городе" (78:12) - TEXT, opacity 0.3
│   └── Карточки категорий (92:167, 188:1040, ...) - несколько карточек
│       ├── Название категории - "Имплантация зубов"
│       ├── Список услуг:
│       │   ├── Название услуги - TEXT
│       │   ├── Наша цена - TEXT, style_XWV3QH (18px, SemiBold)
│       │   └── Средняя цена - TEXT, style_E0IIUV (18px, Regular)
│       └── Vector 153 (79:95) - IMAGE-SVG, пунктирная линия разделитель
├── Карточка акции (78:8) - Frame 2131328544
│   ├── Badge (93:281) - "Горячее предложение" (#607BD4, white text)
│   ├── Заголовок - "Выгодная цена на имплантацию OSSTEM"
│   ├── Описание - TEXT
│   └── Цена - "17 900Р" (24px, Gilroy Bold)
├── Форма записи (93:273) - Frame 2131328558
│   ├── Заголовок - "Запись на консультацию в Унидент"
│   ├── Описание - TEXT с номером телефона
│   ├── Кнопка "Телефон" (93:289) - outline, white bg
│   ├── Кнопка "Записаться" (93:292) - primary, #526AC2 bg
│   └── Decoration (256:1070) - IMAGE-SVG, декоративное изображение
└── Кнопка "Смотреть все цены" (93:271) - primary button
```

**IMAGE-SVG элементы (для скачивания)**:

- ⏳ `price-divider.svg` (79:95) - Пунктирная линия разделитель в таблице
- ⏳ `appointment-decoration.svg` (256:1070) - Декоративное изображение в форме записи

**Типографика**:

- Заголовок H2: 45px, Gilroy SemiBold (style_NPKHXQ)
- Заголовки таблицы: 18px, Gilroy Regular (style_AE2FT0), opacity 0.3
- Заголовок карточки: 28px, Gilroy SemiBold (style_RKLBOB)
- Описание: 16px, Gilroy Regular (style_K0XODS, style_3DPEQ1)
- Цена акции: 24px, Gilroy Bold (style_56952B)
- Наша цена: 18px, Gilroy SemiBold (style_XWV3QH)
- Средняя цена: 18px, Gilroy Regular (style_E0IIUV)
- Категория услуги: 20px, Gilroy SemiBold (style_YJ38WB)
- Название услуги: 16px, Gilroy Regular (style_N55239)
- Текст кнопки primary: 16px, Gilroy SemiBold (style_OQJCVA)
- Текст кнопки outline: 16px, Gilroy Medium (style_DOLR4O)
- Текст бейджа: 14px, Gilroy SemiBold (style_LSCAMY)

**Цвета**:

- Фон секции: По контексту (вероятно белый или светлый)
- Фон карточек категорий: #F5F7F9 (fills: '8')
- Фон карточки акции: #F9F9F9 (fills: '6')
- Фон формы записи: #EEF3F9 (fills: '7')
- Текст: #191E35 (fills: '4')
- Кнопка primary: #526AC2 (fills: '3')
- Кнопка outline: #FFFFFF (fills: '9')
- Текст outline: #8F8F8F (fills: '10')
- Badge акции: #607BD4 (fills: '2')
- Border radius: 25px (карточки), 16px (таблица), 15px (кнопки), 27px (badge)

**Контент**:

- Заголовок: "Сколько стоит забота о себе 🩺"
- Колонки таблицы: Услуга | Наша цена | Средняя в городе
- Пример категории: "Имплантация зубов" с 3 услугами (Osteem, Neodent, Straumann)
- Акция: "Выгодная цена на имплантацию OSSTEM" - 17 900Р
- Форма: "Запись на консультацию в Унидент" с кнопками "Телефон" и "Записаться"

**Кэш файл**: `figma-data/components/price.json`

**Полный файл**: `figma-data/full-figma-data-2026-02-04.yaml` (1.6MB, 39243 строк)

**Примечание**: Данные получены через запрос всего файла без параметра node (workaround для 429 rate limit на `/nodes` эндпоинт). Секция содержит таблицу цен с несколькими категориями услуг, карточку с акцией и форму записи.

---

### 11. `doctors_section` (95:2472) - "Team that helps you"

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 95:2472
**Дата получения**: 2026-02-04
**Файл**: `components/doctors-section.json`

**Структура секции**:

```
doctors (95:2472) - FRAME, секция "Команда, которая помогает вам"
├── Frame 2131328616 (95:2471) - Контейнер заголовка и навигации
│   ├── Frame 2131328609 (95:1989) - Заголовок и описание
│   │   ├── "Команда, которая помогает вам 🫶" (93:329) - TEXT, H2 style
│   │   └── Описание (95:1988) - TEXT, style_NFB4D2
│   ├── Button (95:1990) - Кнопка "Все специалисты"
│   │   └── "Все специалисты" (95:1991) - TEXT, style_DOLR4O
│   └── Frame 2131328710 (143:2612) - IMAGE-SVG, навигация слайдера
└── doctors (95:2011) - Контейнер карточек врачей (слайдер)
    ├── doctor_card (123:910) - INSTANCE компонента 123:909
    ├── doctor_card (123:941) - INSTANCE
    ├── doctor_card (123:973) - INSTANCE
    └── ... (еще карточки врачей)
```

**Типографика**:

- Заголовок H2: 45px, Gilroy SemiBold (600), line-height: 1.193, letter-spacing: -3%
- Описание: 18px, Gilroy Regular (400), line-height: 1.2
- Кнопка "Все специалисты": 16px, Gilroy Medium (500)

**Цвета**:

- Заголовок: #191E35 (fills: '4')
- Описание: #191E35 (fills: '4')
- Кнопка текст: #526AC2 (fills: '3')
- Кнопка border: #526AC2 (strokes: '3')
- Фон карточек: #FFFFFF (fills: '9')
- Border карточек: #D8D8D8 (Borders)

**Контент**:

- Заголовок: "Команда, которая помогает вам 🫶"
- Описание: "Каждый наш доктор — это профессионал, который регулярно повышает свою квалификацию с помощью образовательных программ в России и зарубежом."
- Кнопка: "Все специалисты"

**Компоненты**:

- Используется компонент `doctor_card` (123:909) - см. `components/doctor_card.json`
- Навигация слайдера: Frame 2131328710 (143:2612) - IMAGE-SVG

**Кэш файл**: `figma-data/components/doctors-section.json`

**Примечание**: Данные извлечены из `full-figma-data-2026-02-04.yaml` (workaround для rate limit). Секция содержит заголовок, описание, кнопку и слайдер с карточками врачей.

---

### 12. `cta` (93:336) - Call To Action блок

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 93:336
**Дата получения**: 2026-02-05
**Файл**: `components/cta.json`

**Структура секции**:

```
doctors (95:2472) - FRAME, секция "Команда, которая помогает вам"
├── Frame 2131328616 (95:2471) - Контейнер заголовка и навигации
│   ├── Frame 2131328609 (95:1989) - Заголовок и описание
│   │   ├── "Команда, которая помогает вам 🫶" (93:329) - TEXT, H2 style
│   │   └── Описание (95:1988) - TEXT, style_NFB4D2
│   ├── Button (95:1990) - Кнопка "Все специалисты"
│   │   └── "Все специалисты" (95:1991) - TEXT, style_DOLR4O
│   └── Frame 2131328710 (143:2612) - IMAGE-SVG, навигация слайдера
└── doctors (95:2011) - Контейнер карточек врачей (слайдер)
    ├── doctor_card (123:910) - INSTANCE компонента 123:909
    ├── doctor_card (123:941) - INSTANCE
    ├── doctor_card (123:973) - INSTANCE
    └── ... (еще карточки врачей)
```

**Типографика**:

- Заголовок H2: 45px, Gilroy SemiBold (600), line-height: 1.193, letter-spacing: -3%
- Описание: 18px, Gilroy Regular (400), line-height: 1.2
- Кнопка "Все специалисты": 16px, Gilroy Medium (500)

**Цвета**:

- Заголовок: #191E35 (fills: '4')
- Описание: #191E35 (fills: '4')
- Кнопка текст: #526AC2 (fills: '3')
- Кнопка border: #526AC2 (strokes: '3')
- Фон карточек: #FFFFFF (fills: '9')
- Border карточек: #D8D8D8 (Borders)

**Контент**:

- Заголовок: "Команда, которая помогает вам 🫶"
- Описание: "Каждый наш доктор — это профессионал, который регулярно повышает свою квалификацию с помощью образовательных программ в России и зарубежом."
- Кнопка: "Все специалисты"

**Компоненты**:

- Используется компонент `doctor_card` (123:909) - см. `components/doctor_card.json`
- Навигация слайдера: Frame 2131328710 (143:2612) - IMAGE-SVG

**Кэш файл**: `figma-data/components/doctors-section.json`

**Примечание**: Данные извлечены из `full-figma-data-2026-02-04.yaml` (workaround для rate limit). Секция содержит заголовок, описание, кнопку и слайдер с карточками врачей.

---

### 11.1 `reviews archive` (262:3146) - страница архива отзывов

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 262:3146
**Дата получения**: 2026-02-15
**Файл**: `components/reviews-archive-page.json`
**Ссылка Figma**: [node 262-3146](https://www.figma.com/design/eEN4I9HdQ3JiW708BuOMRc/?node-id=262-3146)

**Структура страницы**:

```
reviews/ 1440 (262:3146) - FRAME, fills '9'
├── Menu (262:3147) - header
├── Breadcumbs (262:3149) - Главная → Отзывы
├── Frame 2131328758 (405:3700) - Заголовок и описание
│   ├── Отзывы (262:3155) - H2
│   └── В нашей стоматологии... (262:3921)
├── Статистика (440:4236) - "За квартал мы получили 263 отзыва..."
├── Общий рейтинг (262:3922) - 4.9 circle + "на основе 10 000 отзывов"
├── rating (262:3931) - 4 карточки платформ (121:302)
├── Кнопки (440:4237) - "Написать отзыв"
├── Фильтр - placeholder
├── Контейнер карточек (262:3916) - Review (122:536)
├── Button (404:3150) - "Загрузить больше"
└── footer
```

**Реализация**: `nextjs/src/app/reviews/page.tsx`, `ReviewsArchiveSection`, `ReviewsArchiveClient`

**Layout-числа (Framelink, 2026-02-15):**
- **262:3149** Breadcrumbs: gap 10px (layout_2U1N8N), style 14px Gilroy 500
- **405:3700** Title block: gap 20px (layout_HWJVX9), H2 45px Semibold, description 18px Regular
- **440:4236** Stats: H2 45px Semibold (letterSpacing -1%)
- **262:3922** Rating block: circle 140.39×140.39, borderRadius 100px
- **262:3931** Rating cards: borderRadius 25px, padding 34px, gap 20px row, gap 40px column
- **404:3150** Load More: 250×60px, borderRadius 15px, border stroke 3, 16px Semibold
- **122:536** ReviewCard: borderRadius 25px, fill #F5F7F9, padding py 41px px 49px, gap 72px columns, gap 5px title-text

**Фильтры отзывов (440:4237, 440:4244)** — pixel-perfect:
- **440:4238** «Все отзывы» (active): fills '3' (#526AC2), text fills '9' (white), layout ~154×48px
- **440:4244** «Оценка выше 4,5» / «Выше 4.9» (inactive): fills '6' (#F9F9F9), text+star fills '10' (#8F8F8F), layout_8QL52W = 168×48px, gap 5px между текстом и звездой
- **440:4258** Star: fills '10', ~16×15px
- **style_510VTA**: Gilroy 500, 16px, lineHeight 1.177, letterSpacing -1%
- Контейнер: gap 15px между кнопками

---

### 11.2 CTA архива отзывов (440:4263) — блок «Оставьте отзыв»

**Статус**: ✅ Данные получены (Framelink + Figma)
**Node ID**: 440:4263
**Имя в Figma**: `cta`
**Ссылка Figma**: [node 440-4263](https://www.figma.com/design/eEN4I9HdQ3JiW708BuOMRc/?node-id=440-4263)

**Структура**:
- **440:4264** Vector — IMAGE-SVG, декоративный overlay (rgba 255,255,255,0.04), 723×702, pos x:700 y:-44
- **440:4265** Frame 2131328652 — контент: column, gap 32px, x:73.83 y:79.2, width 705
  - **440:4279** Frame 2131328765 — IMAGE-SVG иконка 75.59×75.59
  - **440:4266** Frame 2131328619 — текст: gap 20px
    - **440:4267** H2 — «Оставьте отзыв и получите бонус при следующем посещении»
    - **440:4268** Описание — «Ваши замечания и пожелания помогают нам...»
  - **440:4269** Frame 2131328620 — кнопка
    - **440:4272** Button — «Оставить отзыв», fill #191E35, borderRadius 15px
- **440:4278** man-girl 1 — IMAGE, фото людей, 645×530, pos x:752 y:24
- **440:4276** Img — IMAGE, подарок, 384×185, pos x:426 y:369 (crop)

**Layout-числа (Framelink)**:
- Блок: 1380×554px, borderRadius 25px, fills '2' (#607BD4)
- Контент: gap 32px, padding left ~74px top ~79px
- Текст-блок: gap 20px; H2: 45px Semibold, letterSpacing -1%; описание: 18px Regular
- Кнопка: borderRadius 15px, fill #191E35

**Реализация**: `ReviewsArchiveCtaSection`, данные из Option Page «Архив отзывов» (`reviews_archive_options`).
**Fallback assets**: `reviews-cta-people.png`, `reviews-cta-gift-482e00.png`, `reviews-cta-icon.svg`, `reviews-cta-vector.svg` в `public/images/figma/` (скачать через Framelink `download_figma_images` при необходимости).

---

### 12. `cta` (93:336) - Call To Action блок

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 93:336
**Дата получения**: 2026-02-05
**Файл**: `components/cta.json`

**Структура компонента**:

```
cta (93:336) - FRAME, блок Call To Action с формой записи
├── Vector (143:1752) - IMAGE-SVG, декоративный элемент
├── Frame 2131328652 (124:884) - Основной контент
│   ├── Frame 2131328619 (95:2670) - Блок текста
│   │   ├── "Консультация, снимок и план лечения бесплатно" (93:337) - TEXT, H2 style
│   │   └── Описание с телефоном (93:338) - TEXT, style_XDLWRB
│   ├── Frame 2131328620 (95:2672) - Блок кнопок
│   │   ├── Button "Телефон" (95:2673) - FRAME, white bg, gray text
│   │   └── Button "Записаться" (95:2675) - FRAME, outline white border
│   └── "Отправляя заявку..." (124:882) - TEXT, style_H4SRC0
└── ChatGPT Image (276:2100) - RECTANGLE, декоративное изображение
```

**IMAGE-SVG элементы (для скачивания)**:

- ⏳ `cta-decorative-vector.svg` (143:1752) - Декоративный векторный элемент
- ⏳ `cta-decorative-image.png` (276:2100) - Декоративное изображение

**Типографика**:

- Заголовок H2: 45px, Gilroy SemiBold (600), line-height: 1.193, letter-spacing: -3%
- Описание: 18px, Gilroy Regular (400), line-height: 1.2
- Кнопка "Телефон": 16px, Gilroy Medium (500)
- Кнопка "Записаться": 16px, Gilroy SemiBold (600), line-height: 1.193, letter-spacing: -1%
- Текст политики: 14px, Gilroy Regular (400)

**Цвета**:

- Фон блока: linear-gradient(180deg, rgba(46, 54, 93, 1) 0%, rgba(70, 85, 157, 1) 100%) (fills: '5')
- Текст: #FFFFFF (fills: '9')
- Кнопка "Телефон" фон: #FFFFFF (fills: '9')
- Кнопка "Телефон" текст: #8F8F8F (fills: '10')
- Кнопка "Записаться" border: #FFFFFF (strokes: '9', 1px)
- Кнопка "Записаться" текст: #FFFFFF (fills: '9')
- Border radius: 25px (блок), 15px (кнопки)

**Контент**:

- Заголовок: "Консультация, снимок и план лечения бесплатно"
- Описание: "Оставьте свой номер, мы свяжемся и подберём для вас удобное время приёма. Или позвоните нам сами — +7 499 643-44-05"
- Кнопка "Телефон": белая кнопка с серым текстом
- Кнопка "Записаться": outline кнопка с белой рамкой и текстом
- Текст политики: "Отправляя заявку, вы соглашаетесь с политикой конфиденциальности"

**Кэш файл**: `figma-data/components/cta.json`

**Примечание**: Данные извлечены из `full-figma-data-2026-02-04.yaml` (workaround для rate limit). Блок содержит форму записи на консультацию с двумя кнопками и декоративными элементами.

---

### 13. `quote` (95:1468) - Блок с цитатой главного врача

**Статус**: ✅ Данные получены и сохранены
**Node ID**: 95:1468
**Дата получения**: 2026-02-05
**Файл**: `components/quote.json`

**Структура компонента**:

```
quote (95:1468) - FRAME, блок с цитатой главного врача
├── Rectangle 40147 (95:1469) - Фон блока (#F5F7F9)
├── image (143:2899) - IMAGE-SVG, декоративное изображение
├── Цитата (95:1472) - TEXT, текст цитаты главного врача
└── Group 1321317181 (276:2095) - Информация об авторе
    ├── image 2115 (95:1470) - RECTANGLE, фото врача
    ├── Line 34 (95:1476) - LINE, пунктирная линия разделитель (#607BD4)
    └── Frame 2131328728 (276:2094) - Фрейм с аватаром и текстом
        ├── Frame 2131328727 (276:2083) - IMAGE-SVG, аватар врача (круглый)
        └── Group 366 (95:1473) - Имя и должность
            └── Frame 2131328726 (276:2081)
                ├── Фамилия Имя Отчество (95:1474) - TEXT, имя врача
                └── Генеральный директор... (95:1475) - TEXT, должность
```

**IMAGE-SVG элементы (для скачивания)**:

- ⏳ `quote-decorative-image.svg` (143:2899) - Декоративное изображение
- ⏳ `quote-author-avatar.svg` (276:2083) - Аватар врача (круглый, borderRadius 500px)
- ⏳ `quote-author-photo.png` (95:1470) - Фото врача

**Типографика**:

- Текст цитаты: 24px, Gilroy Medium (500), line-height: 1.2, letter-spacing: -1%
- Имя врача: 32px, Gilroy SemiBold (600), line-height: 1.0, letter-spacing: -1%
- Должность: 16px, Gilroy Medium (500), line-height: 1.5, text-align: LEFT

**Цвета**:

- Фон блока: #F5F7F9 (fills: '8')
- Текст цитаты: #222222 (fill_KWX9TJ)
- Имя врача: #222222 (fill_KWX9TJ)
- Должность: #8F8F8F (fills: '10')
- Линия разделитель: #607BD4 (strokes: '2')
- Декоративное изображение: #973838 (fill_UJ3WQQ)
- Border radius: 25px (блок), 500px (аватар)
- Stroke dashes: [4, 4] (пунктирная линия)

**Контент**:

- Цитата: "«Меня зовут [Имя Фамилия], я главный врач стоматологии УниДент в Санкт-Петербурге.\n\nМы создали клинику, чтобы у вас был доступ к честной, современной и действительно качественной стоматологии. Здесь не лечат «на глаз» и не навязывают лишнего — всё по науке и с уважением к людям.\n\nЕсли у вас есть вопросы или идеи, как сделать клинику ещё лучше — я всегда на связи.»"
- Имя врача: "Фамилия\nИмя Отчество"
- Должность: "Генеральный директор сети клиник «Унидент»"

**Кэш файл**: `figma-data/components/quote.json`

**Примечание**: Данные извлечены из `full-figma-data-2026-02-04.yaml` (workaround для rate limit). Блок содержит цитату главного врача с информацией об авторе (фото, аватар, имя, должность) и декоративными элементами.

---

### 14. `clinics-on-map-section` (96:52) — «Наши клиники на карте Москвы»

**Статус**: ✅ Структура из YAML (Figma API 429 при запросе)
**Node ID**: 96:52
**Ссылка Figma**: [Шаблон сайта, node 96-52](https://www.figma.com/design/JPVOauS3F3bEIy1msJXPeR/%D0%A8%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD-%D1%81%D0%B0%D0%B9%D1%82%D0%B0?node-id=96-52)
**Файл**: `components/clinics-on-map-section.json`

**Структура компонента**:

```
Card (96:52) - FRAME, секция «Наши клиники на карте Москвы»
├── Наши клиники на карте Москвы (95:1222) - TEXT, заголовок
├── left-side (95:2723) - IMAGE-SVG, левая панель/декор, borderRadius 25px
├── clinic_card (143:2503) - INSTANCE компонента 143:2502
│   ├── image (I143:2503;143:2478) - IMAGE-SVG, фото здания клиники, borderRadius 25px
│   ├── Frame 2131328662 - контент карточки
│   │   ├── Ellipse 147 + Клиника на Чайковского (143:2482) - название
│   │   ├── Frame 2131328658 - адрес: Чайковского, 21 (143:2489)
│   │   ├── Frame 2131328659 - телефон: +7 4922 77-99-49 (143:2494)
│   │   ├── Frame 2131328660 - часы: Пн-Сб 8:00 - 20:00 Вс 9:00 - 15:00 (143:2499)
│   │   └── Button - Контакты и схема проезда (143:2501)
├── arrow (129:1089) - IMAGE-SVG, стрелка влево слайдера, borderRadius 44px
└── arrow (129:1092) - IMAGE-SVG, стрелка вправо слайдера, borderRadius 40px
```

**IMAGE-SVG / узлы для скачивания** (когда API снова доступен):

- ⏳ `clinics-map-left-side.svg` (95:2723) — левая панель
- ⏳ `clinic-card-image.svg` (I143:2503;143:2478) — фото здания в карточке
- ⏳ `clinics-slider-arrow-left.svg` (129:1089) — стрелка влево
- ⏳ `clinics-slider-arrow-right.svg` (129:1092) — стрелка вправо

**Контент карточки клиники** (пример):

- Название: «Клиника на Чайковского»
- Адрес: «Чайковского, 21»
- Телефон: «+7 4922 77-99-49»
- Часы: «Пн-Сб 8:00 - 20:00», «Вс 9:00 - 15:00»
- Кнопка: «Контакты и схема проезда»

**Цвета**: fills '4' (текст #191E35), '9' (белый фон карточки), '3' (синий кнопка/акцент). Border radius: 25px (карточка, left-side), 15px (кнопка).

**Примечание**: Данные собраны из `full-figma-data-2026-02-04.yaml` из-за 429 при прямом запросе к Figma API. Справа от этого блока в макете — карта (Яндекс.Карты); связка слайдер ↔ карта через общее состояние (activeIndex).

---

### 15. `doctor page` (401:2205) — страница карточки врача

**Статус**: ✅ Данные из кэша YAML (full-figma-data-2026-02-04.yaml)  
**Node ID**: 401:2205  
**Дата получения**: 2026-02-11  
**Файл**: `components/doctor-page.json`  
**Ссылка Figma**: [node 401-2205](https://www.figma.com/design/JPVOauS3F3bEIy1msJXPeR/?node-id=401-2205)

**Структура страницы**:

```
doctor/ 1440 (401:2205) - FRAME, 1440×5886px, fills '9'
├── Menu (401:2206) - INSTANCE componentId 109:133 — шапка
├── Breadcumbs (401:2207) - хлебные крошки
│   └── Главная → Frame SVG → Врачи → Frame SVG → Любимов Павел Олегович
├── Frame 2131328731 (401:2848) - Hero-блок, fill_AAVKNA (gradient)
│   ├── Любимов Павел Олегович (401:2213) - H2
│   ├── 108934 1 (401:3097) - RECTANGLE, фото врача (fill_UWFNB1)
│   ├── experience (401:3105) - 36 лет, стаж
│   ├── rating (401:3111) - 4,7 ★ Рейтинг
│   ├── Button "Записаться на прием" (401:3119)
│   ├── Frame 2131328732 - бейджи: Детский врач, Главный врач, Ортодент
│   ├── Принимает по адресу: Название филиала
│   └── Направления в работе: Реставрации, Лечение кариеса...
├── info (fixed) (402:2392) - sticky панель
│   ├── info (402:2391) - аватар, цены (3500₽), бейджи
│   └── Button "Записаться на прием"
└── Frame 2131328747 (404:2456) - контент
    ├── О враче (401:3154) - текст биографии
    ├── Ключевые направления (403:2389) - список с галочками
    ├── Образование (404:2419) - годы, вузы
    └── ... (другие секции)
```

**Типографика**:

- H2 (имя врача): 45px, Gilroy SemiBold (600), line-height 1.19, letter-spacing -1%
- О враче / Ключевые направления / Образование: 45px, Gilroy SemiBold (style_NPKHXQ)
- Текст биографии: 18px, Gilroy Regular (400), line-height 1.3 (style_KJWZVD)
- Labels (Принимает по адресу): fill_9R7H03 (#717171)
- Кнопки: 16px, Gilroy SemiBold (style_1SJ7K0)

**Цвета**:

- fill_AAVKNA: gradient(0deg, #EEF3F9 5%, #FDFDFD 100%) — фон hero
- fills '4': #191E35 (текст)
- fills '3': #526AC2 (кнопки primary)
- fills '1': #D9E4F7 (бейдж рейтинга)
- fills '7': #EEF3F9 (фон info)
- fill_9R7H03: #717171 (вторичный текст)

**IMAGE-SVG / узлы для скачивания**:

- ⏳ `401:2210`, `401:2844` — разделители хлебных крошек
- ✅ `401:3115` — иконка звезды в rating → `star-hero.svg`
- ✅ `440:4234` — иконка mdi:kids-room («Детский врач») → `kids-room-icon.svg`
- ⏳ `402:2384` — аватар врача (IMAGE-SVG)
- ⏳ `403:2739` (Frame 2131328739) — галочка в списке направлений
- ⏳ `401:3097` — фото врача (IMAGE, fill_UWFNB1)

**Примечание**: Figma API вернул 429; данные извлечены из full-figma-data-2026-02-04.yaml.

#### 15.1 Doctor Hero (401:2848) — layout из Framelink

**Источник**: `get_figma_data(fileKey: eEN4I9HdQ3JiW708BuOMRc, nodeId: 401:2848)` (Framelink).

**Layout-числа (globalVars)**:

- Hero-блок: 1440×580px, градиент `linear-gradient(0deg, rgba(238,243,249,1) 5%, rgba(253,253,253,1) 100%)`
- Фото врача (401:3097): 471.81×629.09px, x:139.12, y:12.59
- Experience (401:3105): 106.86×106.86px, x:101.69, y:54.87, `border-radius: 0 0 97.15px 97.15px`, fill #FFFFFF, padding ~31px 23px, gap ~9.71px
- Rating (401:3111): 106.86×106.86px, x:101.69, y:191.76, `border-radius: 97.15px 0 97.15px 97.15px`, fill #D9E4F7
- Кнопка «Записаться» (401:3119): 258×60px, borderRadius 15px
- Бейджи специализации (Frame 2131328732): gap 15px; «Детский врач» 147×48 (иконка 19.88×19.88), «Главный врач» 127×48, «Ортодент» 112×48, borderRadius 15px
- Имя (401:2213): x:741, y:54.87; H2 45px SemiBold, line-height 1.19, letter-spacing -1%
- Направления / Принимает по адресу: gap 7px, label #717171 16px; контент направлений 18px Medium
- Типографика бейджей experience: число 27.2px 500 -4%, «лет» 11.66px 2% uppercase, «стаж» 13.6px
- Типографика бейджа rating: число 27.2px 500 -4%, «Рейтинг» 13.6px

**Реализация**: `nextjs/src/components/figma/doctor-page/doctor-hero-block.tsx`

---

#### 15.2 Doctor Related Doctors Section (404:2914) — «Другие специалисты»

**Статус**: ✅ Реализовано  
**Node ID**: 404:2914  
**Файл**: `components/doctor-related-doctors-section.json`  
**Ссылка Figma**: [node 404-2914](https://www.figma.com/design/eEN4I9HdQ3JiW708BuOMRc/?node-id=404-2914)

**Структура**:

```
doctors (404:2914) - FRAME, секция на странице врача
├── Frame 2131328616 (404:2915) - Контейнер заголовка
│   └── Frame 2131328609 (404:2916) - Заголовок и описание
│       ├── "Другие специалисты" (404:2917) - TEXT, style_NPKHXQ
│       └── Описание (404:2918) - TEXT, style_NFB4D2
└── doctors (404:2924) - Контейнер карточек (doctor_card 123:909)
```

**Контент**: Заголовок «Другие специалисты», описание как на главной. Кнопка «Все специалисты» и слайдер (4 карточки в ряд, листает по 1 карточке, точки = по одной на карточку).

**Реализация**: `nextjs/src/components/sections/doctor-related-doctors-section.tsx`, `DoctorsSectionClient` с props title/description.

---

### 16. `breadcrumbs` (259:2439) — хлебные крошки

**Статус**: ✅ Данные получены и сохранены  
**Node ID**: 259:2439  
**Файл**: `components/breadcrumbs.json`  
**Дата получения**: 2026-02-10  
**Ссылка Figma**: [node 259-2439](https://www.figma.com/design/JPVOauS3F3bEIy1msJXPeR/?node-id=259-2439)

**Структура компонента**:

```
Breadcumbs (259:2439) - FRAME, 1440×44
└── Frame 2131328722 (259:2444) - row, gap 10px, opacity 0.5, x: 29.37, y: 14
    ├── Главная (259:2440) - TEXT
    ├── Frame 2131328721 (259:2443) - IMAGE-SVG, 4×8 (разделитель/стрелка)
    └── Врачи (259:2441) - TEXT
```

**Типографика**:

- Ссылки: 14px, Gilroy Medium (500), line-height: 1.177, letter-spacing: -1%, выравнивание по левому краю

**Цвета**:

- Текст: #191E35 (fill '4')

**Layout**:

- Контейнер: 1440×44
- Внутренний Frame: row, alignItems: center, gap: 10px, hug content
- Позиция: x 29.37, y 14 от родителя
- Иконка-разделитель: 4×8 px (SVG, скачать при необходимости)

**IMAGE-SVG для скачивания** (при реализации):

- ⏳ `breadcrumb-separator.svg` (259:2443) — разделитель между пунктами (4×8)

---

## 🔄 История изменений

### 2026-02-21

- ✅ Выполнен план сбора данных страницы **«Кейсы»** (406:5648)
- ✅ Создан `components/cases-archive-page.json` (структура, типографика, variableDefs, layout-числа)
- ✅ Получены: user-Figma get_design_context, get_screenshot, get_variable_defs
- ✅ Framelink get_figma_data — layout-числа (gap, dimensions, positions)
- ✅ Framelink download_figma_images — breadcrumb-separator-cases.svg (5×8), load-more-icon.svg (22×22)

- ✅ Выполнен план сбора данных страницы **«Акции»** (406:4839)
- ✅ Создан `components/promotions-archive-page.json` (структура, типографика, IMAGE-SVG узлы)
- ✅ Получен скриншот через `user-Figma` get_screenshot
- ✅ Обновлён FIGMA_CACHE.md (файл JSON, источники данных, таблица IMAGE-SVG)
- ⏳ Framelink MCP недоступен — layout-числа из кэша; скачивание изображений при подключении

- ✅ Выполнен план сбора данных страницы **«Контакты»** (412:3463)
- ✅ Создан `components/contacts-archive-page.json` (структура, типографика, variableDefs)
- ✅ Получены: user-Figma get_screenshot, get_variable_defs
- ✅ Структура из full-figma-data-2026-02-04.yaml
- ⏳ Framelink MCP недоступен — layout-числа и download_figma_images при подключении

### 2026-02-20

- ✅ Добавлена страница **«Акции»** (406:4839) — архивная страница акций
- ✅ Данные получены через `user-Figma` get_design_context (893 строки React+Tailwind)
- ✅ Обновлён FIGMA_CACHE.md (структура, карточки promotion_card, связанные компоненты)
- ⏳ Изображения для скачивания через Framelink при реализации

### 2026-02-11

- ✅ Получены данные для страницы **doctor page** (401:2205) — карточка врача (профиль)
- ✅ Создан `components/doctor-page.json` с полной структурой
- ✅ Данные извлечены из `full-figma-data-2026-02-04.yaml` (Figma API 429)
- ✅ Обновлён FIGMA_CACHE.md (секция 15)
- ⏳ IMAGE-SVG для скачивания при реализации

### 2026-02-10

- ✅ Получены данные для блока **breadcrumbs** (259:2439) — хлебные крошки
- ✅ Создан `components/breadcrumbs.json` с полной структурой
- ✅ Обновлён FIGMA_CACHE.md (секция 15, структура, типографика, IMAGE-SVG 259:2443)

### 2026-02-09

- ✅ Добавлен блок **footer (392:2371)** — данные из full-figma-data-2026-02-04.yaml
- ✅ Создан `components/footer-block.json` (структура, IMAGE-SVG узлы, типографика, цвета)
- ✅ Обновлён FIGMA_CACHE.md: секция 4.1 footer block (392:2371), таблица IMAGE-SVG для batch-скачивания
- ⏳ Скачивание SVG через Figma MCP не выполнялось (MCP в среде недоступен); при подключении Framelink MCP использовать node IDs из таблицы

- ✅ Добавлена секция `clinics-on-map-section` (96:52) — «Наши клиники на карте Москвы»
- ✅ Создан `components/clinics-on-map-section.json` (структура из full-figma-data YAML)
- ✅ Обновлён FIGMA_CACHE.md (описание, дерево узлов, список IMAGE-SVG для скачивания)
- ⚠️ Figma API вернул 429 — данные взяты из локального YAML; изображения скачать позже одним batch-запросом

### 2026-02-05

- ✅ Получены данные для блока `quote` (95:1468) - Блок с цитатой главного врача
- ✅ Создан JSON файл `components/quote.json` с полной структурой компонента
- ✅ Данные извлечены из `full-figma-data-2026-02-04.yaml` (workaround для rate limit)
- ✅ Обновлен FIGMA_CACHE.md с описанием структуры блока
- ✅ Зафиксированы 3 изображения для скачивания (декоративное изображение, аватар, фото врача)

### 2026-02-05

- ✅ Получены данные для блока `cta` (93:336) - Call To Action блок с формой записи
- ✅ Создан JSON файл `components/cta.json` с полной структурой компонента
- ✅ Данные извлечены из `full-figma-data-2026-02-04.yaml` (workaround для rate limit)
- ✅ Обновлен FIGMA_CACHE.md с описанием структуры блока
- ✅ Зафиксированы 2 декоративных элемента для скачивания (vector SVG, decorative image)

### 2026-02-04

- ✅ Получены данные для секции `doctors_section` (95:2472) - "Команда, которая помогает вам"
- ✅ Создан JSON файл `components/doctors-section.json` с полной структурой секции
- ✅ Данные извлечены из `full-figma-data-2026-02-04.yaml` (workaround для rate limit)
- ✅ Обновлен FIGMA_CACHE.md с описанием структуры секции
- ✅ Зафиксирована структура: заголовок, описание, кнопка, навигация слайдера, контейнер карточек врачей

- ✅ Получены данные для компонента `price` (93:302) - секция с таблицей цен
- ✅ Создан JSON файл `components/price.json` с полной структурой компонента
- ✅ Скачан полный файл Figma `full-figma-data-2026-02-04.yaml` (1.6MB, 39243 строк)
- ✅ Обновлен FIGMA_CACHE.md с описанием структуры секции price
- ✅ Зафиксированы 2 IMAGE-SVG элемента для скачивания (divider, decoration)
- ✅ Данные получены через запрос всего файла без параметра node (workaround для 429 rate limit)

- ✅ Получены данные для компонента `case` (123:416) - "movie" component
- ✅ Создан JSON файл `components/case.json` с полной структурой компонента
- ✅ Извлечены "brother god data" (метаданные компонента из metadata.components)
- ✅ Обновлен FIGMA_CACHE.md с описанием структуры компонента
- ✅ Данные получены через запрос всего файла без параметра node (workaround для rate limit)

### 2026-01-30

- ✅ Получены данные для блока `rating` (143:1782)
- ✅ Создан JSON файл `components/rating.json` с полной структурой компонента
- ✅ Зафиксированы 8 IMAGE-SVG элементов для скачивания
- ✅ Обновлен FIGMA_CACHE.md с описанием структуры блока
- ✅ Данные извлечены из full-figma-data-2026-01-29.yaml

- ✅ Получены данные для блока `services_block` (93:697)
- ✅ Создан JSON файл `components/services_block.json`
- ✅ Скачаны иконки: service-arrow.svg, service-icon.svg
- ✅ Обновлен FIGMA_CACHE.md с описанием структуры блока
- ✅ Использован workaround с запросом всего файла для обхода rate limit 429

### 2025-12-30

- ✅ Создан кэш
- ✅ Сохранены данные `doctor_card`
- ✅ Скачаны иконки: clinic, star
- ✅ Скачаны изображения врачей (4 шт)
- ✅ Исправлены пробелы в бейджах
- ✅ Заменена звезда на правильную из Figma
- ✅ Настроена дизайн-система (цвета + шрифты)
- ✅ Созданы базовые иконки для меню (dropdown, close, search, hamburger)

## 🚀 Как добавить новый компонент

1. Запроси данные через MCP:

   ```
   mcp_Framelink_MCP_for_Figma_get_figma_data(fileKey, nodeId)
   ```

2. Сохрани JSON в `components/[name].json`

3. Скачай все изображения/иконки:

   ```
   mcp_Framelink_MCP_for_Figma_download_figma_images(...)
   ```

4. Обнови этот файл:
   - Добавь компонент в список
   - Опиши структуру
   - Добавь скачанные файлы в таблицы

5. Скопируй файлы в проект:
   ```
   C:\Users\Sergey\nextjs\public\... → D:\template\nextjs\public\...
   ```

## 💡 Примеры использования кэша

### Пример 1: Пользователь просит изменить цвет кнопки

❌ **Не нужно**: Запрашивать Figma снова  
✅ **Нужно**: Использовать данные из кэша (кнопка: #526AC2)

### Пример 2: Пользователь просит добавить новый компонент "service_card"

❌ **Не нужно**: Использовать старые данные  
✅ **Нужно**: Запросить Figma, сохранить в кэш, обновить этот файл

### Пример 3: Пользователь просит исправить отступ в карточке врача

❌ **Не нужно**: Запрашивать Figma  
✅ **Нужно**: Использовать данные из кэша (layout данные есть в структуре)
