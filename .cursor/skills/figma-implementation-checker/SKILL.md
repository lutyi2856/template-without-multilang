---
name: figma-implementation-checker
description: Verify Figma component implementation against Framelink raw data, find and fix inaccuracies. Use when user says "check", "проверь", "verify figma", or when implementation has layout/typography/spacing mismatches.
---

# Figma Implementation Checker

Проверка соответствия реализации данным Figma. Находит и исправляет неточности (размеры, отступы, типографика, цвета).

## MCP Server Identifiers

- **Figma Remote** → `user-Figma` (PRIMARY — без ограничений плана)
- **Figma Desktop** → `user-Figma_Desktop`
- **Framelink** → `user-Framelink MCP for Figma`

⚠️ `plugin-figma-figma` и `plugin-figma-figma-desktop` привязаны к Starter плану (6 вызовов в месяц) — не использовать.

## When to Use

**Триггеры:** «проверь», «check», «verify figma», «устрани неточности», «свери с figma»

Примеры:
- «Проверь doctor-hero-block на соответствие Figma»
- «Check DoctorHeroBlock against design»
- «Figma implementation checker для [компонент]»
- Компонент реализован по Figma, но есть визуальные расхождения
- Нужна проверка перед коммитом

## Sources of truth (три MCP)

| Что нужно | MCP | Инструмент |
|-----------|-----|------------|
| Эталонные layout-числа (dimensions, gap, padding, borderRadius) | **Framelink** | `get_figma_data` |
| Черновик структуры/кода (React+Tailwind) | **Figma Remote** | `get_design_context` |
| Визуальная проверка (скриншот макета) | **Figma Desktop** или **Figma Remote** | `get_screenshot` |

**Важно:** при расхождении чисел между Figma `get_design_context` и Framelink — брать значения из Framelink. Оба вызова (Framelink и Figma) обязательны — всегда иметь и точные данные, и черновик кода, затем сопоставлять.

**Fallback:** если Figma MCP не подключён — использовать только Framelink (эталонные числа будут; черновика кода не будет).

## Quick Reference

1. Получить fileKey + nodeId (из JSDoc компонента, FIGMA_CACHE.md или URL)
2. **Framelink** `get_figma_data(fileKey, nodeId)` — эталонные размеры/отступы/типографика. Обязательно.
3. **Figma Remote** `get_design_context(nodeId, fileKey)` — черновик структуры (React+Tailwind). Обязательно. Layout-числа подменять из Framelink.
4. Прочитать файл компонента, сравнить с Framelink: dimensions, gap, padding, typography, colors, borderRadius
5. Применить исправления (опора на черновик + числа из Framelink)
6. **Figma Desktop** или **Figma Remote** `get_screenshot(nodeId, fileKey)` — сравнить скриншот с браузером

## Detailed Instructions

### Step 1: Определить fileKey и nodeId

**Варианты:**

- **Компонент с JSDoc:** искать `Figma node 401:2848` или `node-id=401-2848`
- **FIGMA_CACHE.md:** `nextjs/figma-data/FIGMA_CACHE.md` — секции с Node ID
- **Figma URL:** `...?node-id=401-2848` → nodeId `401:2848`
- **Проект:** fileKey `JPVOauS3F3bEIy1msJXPeR` (оригинал) или `eEN4I9HdQ3JiW708BuOMRc` (Copy)

### Step 2: Получить raw-данные из Framelink

```
mcp_Framelink_MCP_for_Figma_get_figma_data({
  fileKey: "eEN4I9HdQ3JiW708BuOMRc",  // или JPVOauS3F3bEIy1msJXPeR
  nodeId: "401:2848"  // блок, не вся страница
})
```

**Важно:** запрашивать блок (Hero, Breadcrumbs, Card), не всю страницу.

### Step 3: Извлечь эталонные значения из globalVars

Из YAML-ответа в `globalVars` взять:

| Тип | Где в YAML | Пример |
|-----|------------|--------|
| dimensions | `layout_XXX.dimensions` | `width: 471.81, height: 629.09` |
| gap | `layout_XXX.gap` | `9.714924812316895` |
| padding | `layout_XXX.padding` | `31.08776092529297px 23.31582260131836px` |
| borderRadius | узел `.borderRadius` | `97.14925384521484px` |
| fontSize | `style_XXX.fontSize` | `27.201791763305664` |
| lineHeight | `style_XXX.lineHeight` | `1.1929999457465277em` |
| letterSpacing | `style_XXX.letterSpacing` | `'-4%'` |
| colors | `fills '4'` → `styles['4']` | `#191E35` |
| gradient | `fill_XXX` типа GRADIENT_LINEAR | `linear-gradient(0deg, ...)` |

### Step 4: Сравнить с реализацией

Прочитать TSX/JSX компонента. Для каждого элемента проверить:

- **Размеры:** `w-[...]`, `h-[...]` — соответствуют ли `dimensions`?
- **Отступы:** `gap-`, `p-`, `px-`, `py-` — соответствуют ли `gap`, `padding`?
- **Скругления:** `rounded-` — соответствуют ли `borderRadius`?
- **Типографика:** `text-[...]`, `font-`, `leading-`, `tracking-` — соответствуют ли style_*?
- **Цвета:** `bg-`, `text-` — hex из styles?

### Step 5: Составить отчёт о несоответствиях

Формат:

```
## Inaccuracies Found

| Element | Figma (Framelink) | Current Code | Fix |
|---------|-------------------|--------------|-----|
| Photo   | 471.81×629.09     | 280×350      | w-[472px] h-[629px] |
| Badge   | 106.86×106.86     | 75×75        | w-[107px] h-[107px] |
| gap     | 9.71px            | 10px         | gap-[9.71px] |
```

### Step 6: Применить исправления

**Правила округления:**

- dimensions: `471.81` → `472` или `w-[472px]`
- borderRadius: `97.15` → `97` или `rounded-[97px]`
- fontSize: `27.2` → `27` или design token
- gap/padding: допускается округление до 1px, но лучше точное значение

**Design tokens:** если есть вариант в `design-tokens/typography.ts` — использовать его.

### Step 7: Визуальная проверка (обязательно перед отчётом)

Получить скриншот макета из Figma и сравнить с рендером в браузере:

- **Figma Desktop** (при открытом Figma): `mcp_Figma_Desktop_get_screenshot({ nodeId: "401:2848" })`
- **Figma Remote**: `mcp_Figma_get_screenshot({ nodeId: "401:2848", fileKey: "eEN4I9HdQ3JiW708BuOMRc" })`

Сравнить скриншот с результатом в браузере; при расхождениях — вернуться к Step 4 и исправить по Framelink.

## Checklist перед отчётом

- [ ] Framelink raw data получен для блока (не страницы) — источник layout-чисел
- [ ] Figma get_design_context вызван (черновик структуры); числа подставлены из Framelink при расхождении
- [ ] globalVars извлечены (dimensions, layout, style_*, fills)
- [ ] Компонент прочитан
- [ ] Таблица несоответствий составлена
- [ ] Исправления применены
- [ ] get_screenshot выполнен, скриншот сравнен с браузером
- [ ] Linter без ошибок

## Common Errors

### Error: "используется summarized json"

**Cause:** Брали данные из `doctor-page.json` вместо raw Framelink.  
**Fix:** Всегда вызывать `get_figma_data` для конкретного nodeId блока.

### Error: "неточные размеры"

**Cause:** Округление при первой реализации.  
**Fix:** Заменить на значения из `layout_XXX.dimensions`.

### Error: "Figma API 429"

**Cause:** Rate limit Framelink.  
**Fix:** Использовать кэш `FIGMA_CACHE.md`, full-figma-data YAML или повторить через 1–2 мин.

## Mapping: Компонент → Node ID

| Компонент | Node ID | File Key |
|-----------|---------|----------|
| DoctorHeroBlock | 401:2848 | eEN4I9HdQ3JiW708BuOMRc |
| Breadcrumbs | 259:2439 | JPVOauS3F3bEIy1msJXPeR |
| DoctorCard | 123:909 | JPVOauS3F3bEIy1msJXPeR |

Остальные — в `nextjs/figma-data/FIGMA_CACHE.md`.

## Best Practices

### DO

1. Запрашивать Framelink по nodeId блока (Hero, Card), не всей страницы
2. Использовать raw YAML, а не summarized JSON
3. Сохранять точные значения; округлять только при записи в CSS
4. Обновлять FIGMA_CACHE.md после проверки

### DON'T

1. Не использовать `doctor-page.json` как источник размеров/отступов
2. Не пропускать сравнение gap и padding
3. Не игнорировать letterSpacing и lineHeight
