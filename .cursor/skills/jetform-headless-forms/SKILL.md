---
name: jetform-headless-forms
description: Full workflow for JetFormBuilder forms in headless Next.js - trigger vs content forms, REST endpoint, CallbackForm, DynamicForm, generation from JSON. Use when integrating forms with headless WordPress, creating trigger (callback) or content (review) forms, or automating form creation.
---

# JetFormBuilder Headless Forms (Next.js)

Полный workflow форм JetFormBuilder в headless Next.js: от создания в WordPress до отображения и отправки на фронте.

---

## When to Use

**Используй этот skill когда:**

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
- Интегрируешь формы JetFormBuilder с Next.js (headless)
- Создаёшь триггерные формы (обратный звонок, консультация) или контентные (отзывы, кейсы)
- Настраиваешь REST endpoint для Formless Actions
- Автоматизируешь создание форм через Cursor
- Добавляешь новые формы на главную или другие страницы

---

## Дифференциация форм

| Тип | Примеры | Бэкенд | Фронтенд |
|-----|---------|--------|----------|
| **Trigger** | Обратный звонок, Запись на консультацию | JetFormBuilder REST + Form Records | `/api/jetform-submit` → WP endpoint |
| **Content** | Оставить отзыв, Отправить кейс | CPT + GraphQL mutation | `/api/graphql` → createReview, createCaseStudy |

**Trigger** — цель: собрать контакты, передать в CRM, отправить email. Хранение в Form Records.

**Content** — цель: создать публикуемый контент. Хранение в CPT (pending → published после модерации).

---

## Workflow создания формы

### Шаг 1: Описать в чате

Пример: «Форма обратного звонка: телефон, кнопка Записаться».

### Шаг 2: Создать форму в WordPress

```bash
docker compose exec wordpress-new wp eval-file wp-content/mu-plugins/cli/create-callback-form.php --allow-root
```

Или добавить конфиг в `jetform-create-from-json.php` и вызвать `unident_create_jetform($config)`.

### Шаг 3: Endpoint в WP

JetForm Builder → Endpoints → Add new route:

- Related Form: выбери созданную форму
- Action type: REST API Endpoint
- Namespace: `jet-fb`
- Route: `callback` (или slug формы)

URL: `{WP_URL}/wp-json/jet-fb/v1/callback`

### Шаг 4: Конфиг в forms.json

```json
{
  "callback": {
    "type": "trigger",
    "endpoint": "jet-fb/v1/callback",
    "fields": [
      { "name": "phone", "type": "tel", "label": "Телефон", "required": true },
      { "name": "consent", "type": "checkbox", "label": "Согласие", "required": true }
    ]
  }
}
```

### Шаг 5: Компонент на фронте

Для trigger: `<CallbackForm variant="cta" />` или `<CallbackForm variant="default" />`.

Для content (фаза 2): `<DynamicForm formType="review" />` — GraphQL mutation.

---

## Ключевые файлы

| Файл | Назначение |
|------|------------|
| `wp-content/mu-plugins/jetform-create-from-json.php` | Программное создание форм |
| `wp-content/mu-plugins/cli/create-callback-form.php` | CLI-скрипт для формы обратного звонка |
| `nextjs/src/app/api/jetform-submit/route.ts` | Прокси для триггерных форм |
| `nextjs/src/components/forms/callback-form.tsx` | Client Component формы (телефон + Записаться) |
| `nextjs/src/data/forms.json` | Конфигурация форм |
| `nextjs/src/components/sections/cta-section.tsx` | Использует CallbackForm variant="cta" |
| `nextjs/src/components/figma/price/appointment-form.tsx` | Использует CallbackForm variant="default" |

---

## Использование CallbackForm

```tsx
// CTA-секция (белый input на цветном фоне)
<CallbackForm variant="cta" privacyText="Отправляя заявку..." privacyLink="/privacy" />

// Секция цен / карточка (стандартные стили)
<CallbackForm variant="default" />
```

Компонент использует `react-hook-form` + `zodResolver`, валидирует телефон (минимум 10 цифр) и consent, отправляет на `/api/jetform-submit`.

---

## Блок согласия (Роспатребнадзор, Минздрав)

**Требование:** под каждой кнопкой формы — блок согласия.

- **Checkbox + текст в одну строку** — `flex items-start gap-2`, checkbox слева, текст справа
- **Checkbox по умолчанию** — не нажата (unchecked)
- **Текст:** «Отправляя заявку, вы даете согласие на обработку персональных данных и соглашаетесь с Политикой в отношении обработки и защиты персональных данных»
- **Ссылки:** «Политикой» и/или «персональных данных» — кликабельные, ведут на страницу политики (`privacyLink`)

**Schema (Zod):**

```ts
consent: z.boolean().refine(val => val === true, "Необходимо дать согласие")
```

**defaultValues:** `{ consent: false }`

**forms.json:** поле `consent` (checkbox, required) в конфиге каждой формы.

---

## Form Request Args (опционально)

В JetForm Builder → Settings: Request key (например `20e4XO`) и Request value (например `7P62kYP527nq`). Если endpoint требует — передать в body или query.

---

## См. также

- `.cursor/skills/jetform-builder-acf/SKILL.md` — JetForm + ACF, Formless, Mapping
- `.cursor/rules/wordpress.mdc` — WordPress coding standards
