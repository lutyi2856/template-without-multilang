# Headless WordPress + Next.js Project

Проект для разработки headless WordPress приложения с Next.js и Faust.js.

## 🔗 GitHub

**Репозиторий**: [https://github.com/lutyi2856/headless-wp-nextjs](https://github.com/lutyi2856/headless-wp-nextjs)

## 📚 Документация

**Облако ссылок:** См. [docs/README.md](docs/README.md) для полного списка документов.

## 🚀 Быстрый старт

### WordPress (Docker)

```bash
docker-compose up -d
```

- WordPress: http://localhost:8002
- phpMyAdmin: http://localhost:8082

### Next.js

```bash
cd nextjs
npm install
npm run dev
```

- Next.js: http://localhost:3000

## 📖 Основные документы

### Работа с Cursor AI

- **[CURSOR.md](CURSOR.md)** — Правила работы для Cursor AI Assistant
- **[CURSOR_USER_RULES.md](CURSOR_USER_RULES.md)** — 📋 User Rules для AI Assistant
- **[CURSOR_OPTIMAL_SETTINGS.json](CURSOR_OPTIMAL_SETTINGS.json)** — 🔧 Оптимальные настройки для проекта
- **[DOCUMENTATION_POLICY.md](DOCUMENTATION_POLICY.md)** — 🚫 Политика документации (запрет избыточных файлов)

### Дизайн и компоненты

- **[nextjs/DESIGN_SYSTEM.md](nextjs/DESIGN_SYSTEM.md)** — ⭐ Дизайн-система (шрифты, цвета)
- **[nextjs/figma-data/FIGMA_CACHE.md](nextjs/figma-data/FIGMA_CACHE.md)** — 🎨 Кэш данных Figma

### Полная документация

- **[docs/README.md](docs/README.md)** — Полный список документации проекта

## 🔧 Технологии

### Backend

- **WordPress** — Headless CMS
- **WPGraphQL** — GraphQL API для WordPress
- **Docker** — Контейнеризация

### Frontend

- **Next.js 14** — React фреймворк с App Router
- **Faust.js** — Интеграция WordPress + Next.js
- **TypeScript** — Строгая типизация

### UI/Design

- **Shadcn UI** — Библиотека компонентов
- **Tailwind CSS** — Utility-first CSS framework
- **Radix UI** — Headless UI primitives

### Figma Integration

- **Figma MCP** — Доступ к дизайнам через MCP сервер
- **Система кэширования** — Локальный кэш для минимизации API запросов
- **Точное воссоздание** — Компоненты по Figma спецификациям
- ⚡ **Кэш** — [nextjs/figma-data/FIGMA_CACHE.md](nextjs/figma-data/FIGMA_CACHE.md)

## 📋 Установленные компоненты

### WordPress плагины:

- WPGraphQL (2.5.4)
- FaustWP (1.8.0)
- WPGraphQL ACF (2.4.1)
- WordPress MCP (0.2.5)
- Advanced Custom Fields Pro (6.5.1)
- Rank Math SEO (1.0.260)
- Rank Math SEO Pro (3.0.103)
- Cyr2Lat (6.6.0)

### Темы:

- Headless Theme (1.0)

### UI Framework:

- Shadcn UI (10 компонентов установлено)
  - Button, Card, Input, Label
  - Select, Dialog, DropdownMenu
  - Avatar, Badge, Separator
- Tailwind CSS (настроен)
- 4 кастомных компонента дизайн-системы
  - Container, Section, Heading, Text

### Воссозданные компоненты из Figma:

- ✅ **Header** — Навигационный header с меню
- ✅ **Footer** — Футер сайта
- ✅ **Doctor Card** — Карточка врача с видео

## 🔗 Быстрые ссылки

- **WordPress Admin**: http://localhost:8002/wp-admin
- **GraphQL**: http://localhost:8002/graphql
- **Next.js**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8082

## 🚀 Развертывание

### Для разработчиков

См. **[docs/MANAGER-SETUP.md](docs/MANAGER-SETUP.md)** для инструкций по локальной установке.

### Для production

- **WordPress**: См. **[docs/HOSTING-SETUP.md](docs/HOSTING-SETUP.md)** — развертывание на shared hosting
- **Общая информация**: См. **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — обзор развертывания

## 🔄 Workflow

### Ветки

- `main` — основная ветка с актуальным кодом
- `feature/*` — ветки для новых функций
- Pull Requests создаются для всех изменений перед merge в `main`

### Синхронизация

- **Локально**: Код из `main` ветки, разработка в Docker
- **Хостинг**: WordPress развертывается из `main` ветки

## 📚 Полная документация

См. **[docs/README.md](docs/README.md)** для полного списка документов и инструкций.
