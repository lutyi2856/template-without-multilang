# Документация проекта

Полный список актуальной документации проекта.

## 📚 Оглавление

- [Быстрый старт](#быстрый-старт)
- [Архитектура и развертывание](#архитектура-и-развертывание)
- [Cursor и MCP](#cursor-и-mcp)
- [Next.js](#nextjs)
- [Дополнительные ресурсы](#дополнительные-ресурсы)

---

## Быстрый старт

### [QUICK-START.md](QUICK-START.md)

Быстрый старт для разработчиков. Установка Docker, запуск WordPress и Next.js, первые шаги.

### [НАЧАЛО-РАБОТЫ.md](НАЧАЛО-РАБОТЫ.md)

Руководство на русском языке для начала работы с проектом.

### [nextjs-QUICK-START.md](nextjs-QUICK-START.md)

Быстрый старт специфично для Next.js части проекта.

---

## Архитектура и развертывание

### [ARCHITECTURE-EXPLAINED.md](ARCHITECTURE-EXPLAINED.md)

Детальное объяснение архитектуры проекта:

- Headless WordPress + Next.js
- WPGraphQL и Faust.js
- Docker контейнеризация
- Структура компонентов

### [DEPLOYMENT.md](DEPLOYMENT.md)

Общая информация о развертывании проекта:

- Обзор развертывания
- Варианты хостинга
- CI/CD подходы

### [HOSTING-SETUP.md](HOSTING-SETUP.md)

Развертывание WordPress на shared hosting:

- Конфигурация сервера
- Миграция базы данных
- Настройка WPGraphQL
- SSL сертификаты

### [MANAGER-SETUP.md](MANAGER-SETUP.md)

Инструкции для менеджеров проекта:

- Локальная установка
- Управление Docker
- Доступ к сервисам

### [FAUST-SETUP.md](FAUST-SETUP.md)

Настройка Faust.js для интеграции WordPress + Next.js:

- Установка FaustWP плагина
- Конфигурация Next.js
- Настройка GraphQL

### [SSL-FIX-README.md](SSL-FIX-README.md)

Решение проблем с SSL сертификатами и HTTPS.

---

## Cursor и MCP

### [CURSOR-DOCUMENTATION.md](CURSOR-DOCUMENTATION.md)

Документация по работе с Cursor AI в проекте:

- Основные правила
- Best practices
- Workflow

### [CURSOR-MCP-SETUP.md](CURSOR-MCP-SETUP.md)

Настройка MCP (Model Context Protocol) серверов для Cursor:

- WordPress MCP
- Figma MCP
- Другие MCP серверы

### [MCP-SERVERS.md](MCP-SERVERS.md)

Полный список и описание MCP серверов, используемых в проекте.

---

## Next.js

### [nextjs-QUICK-START.md](nextjs-QUICK-START.md)

Быстрый старт для Next.js части проекта:

- Установка зависимостей
- Запуск dev сервера
- Структура проекта

---

## Дополнительные ресурсы

### [SETUP-COMPLETE.md](SETUP-COMPLETE.md)

Checklist завершения настройки проекта:

- Проверка всех компонентов
- Тестирование интеграций
- Финальная конфигурация

### [UPGRADE-PLAN-NEXT15-REACT19.md](UPGRADE-PLAN-NEXT15-REACT19.md)

План миграции Next.js 14 → 15.3, React 18 → 19, Apollo 3.8 → 3.11:

- Описание проекта и стека
- Этапы миграции (диагностика, NuqsAdapter, async params, next.config, Apollo cache, npm install)
- Риски FaustWP, рекомендация дождаться совместимой версии
- Чек-лист выполнения, контроль производительности, Design System

**Статус:** Отложено до выхода совместимой версии FaustWP с Next.js 15.

---

## Связанные документы в корне проекта

### Cursor AI

- [CURSOR.md](../CURSOR.md) - Общие правила для Cursor AI Assistant
- [CURSOR_USER_RULES.md](../CURSOR_USER_RULES.md) - User Rules для AI Assistant
- [CURSOR_OPTIMAL_SETTINGS.json](../CURSOR_OPTIMAL_SETTINGS.json) - Оптимальные настройки

### Дизайн и компоненты

- [nextjs/DESIGN_SYSTEM.md](../nextjs/DESIGN_SYSTEM.md) - Дизайн-система (шрифты, цвета)
- [nextjs/figma-data/FIGMA_CACHE.md](../nextjs/figma-data/FIGMA_CACHE.md) - Кэш данных Figma

### Docker

- [docker-compose.yml](../docker-compose.yml) - Конфигурация Docker контейнеров
- [.env.example](../.env.example) - Пример переменных окружения

---

## Структура документации

```
docs/
├── README.md                    # Этот файл
│
├── Быстрый старт
│   ├── QUICK-START.md
│   ├── НАЧАЛО-РАБОТЫ.md
│   └── nextjs-QUICK-START.md
│
├── Архитектура и развертывание
│   ├── ARCHITECTURE-EXPLAINED.md
│   ├── DEPLOYMENT.md
│   ├── HOSTING-SETUP.md
│   ├── MANAGER-SETUP.md
│   ├── FAUST-SETUP.md
│   └── SSL-FIX-README.md
│
└── Cursor и MCP
    ├── CURSOR-DOCUMENTATION.md
    ├── CURSOR-MCP-SETUP.md
    └── MCP-SERVERS.md
```

---

## Как использовать эту документацию

### Для новых разработчиков:

1. Начните с [QUICK-START.md](QUICK-START.md) или [НАЧАЛО-РАБОТЫ.md](НАЧАЛО-РАБОТЫ.md)
2. Изучите [ARCHITECTURE-EXPLAINED.md](ARCHITECTURE-EXPLAINED.md)
3. Настройте Cursor: [CURSOR-DOCUMENTATION.md](CURSOR-DOCUMENTATION.md)

### Для менеджеров проекта:

1. [MANAGER-SETUP.md](MANAGER-SETUP.md) - локальная установка
2. [DEPLOYMENT.md](DEPLOYMENT.md) - развертывание
3. [SETUP-COMPLETE.md](SETUP-COMPLETE.md) - проверка готовности

### Для работы с Cursor AI:

1. [../CURSOR.md](../CURSOR.md) - основные правила
2. [../CURSOR_USER_RULES.md](../CURSOR_USER_RULES.md) - User Rules
3. [CURSOR-MCP-SETUP.md](CURSOR-MCP-SETUP.md) - настройка MCP

### Для развертывания:

1. [DEPLOYMENT.md](DEPLOYMENT.md) - общий обзор
2. [HOSTING-SETUP.md](HOSTING-SETUP.md) - WordPress на хостинге
3. [SSL-FIX-README.md](SSL-FIX-README.md) - SSL проблемы

---

## Обновление документации

Документация обновляется по мере развития проекта. При добавлении новых документов, обязательно обновите:

1. Этот файл (`docs/README.md`)
2. Корневой [README.md](../README.md)

---

**Версия документации:** 3.0  
**Дата последнего обновления:** 2025-12-30  
**Статус:** ✅ Актуально (очищено от избыточных файлов)
