# Развертывание проекта

## Общая информация

Этот проект представляет собой headless WordPress приложение с Next.js frontend. Проект использует Docker для локальной разработки и может быть развернут на различных платформах для production.

## Архитектура развертывания

```
┌─────────────────┐
│  GitHub (main)   │ ← Единый источник кода
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
    ▼         ▼              ▼
┌────────┐ ┌──────────┐ ┌──────────┐
│ Local  │ │ Hosting  │ │ Manager  │
│ Docker │ │ Shared   │ │ Local    │
│        │ │ Hosting  │ │          │
└────────┘ └──────────┘ └──────────┘
```

## Компоненты проекта

### WordPress (Headless CMS)
- **Локально**: Docker контейнер (порт 8002)
- **Production**: Shared hosting или VPS
- **API**: WPGraphQL endpoint (`/graphql`)

### Next.js (Frontend)
- **Локально**: Development server (порт 3000)
- **Production**: Node.js хостинг (по необходимости)
- **Интеграция**: Faust.js для связи с WordPress

### База данных
- **Локально**: MariaDB в Docker (порт 3308)
- **Production**: База данных от хостинг-провайдера

## Требования к хостингу

### Для WordPress (Shared Hosting)
- PHP 8.0 или выше
- MySQL/MariaDB 10.3 или выше
- Минимум 512MB RAM
- Поддержка SSL/HTTPS
- Доступ к файловой системе (FTP/SFTP)
- Опционально: Git для автоматического деплоя

### Для Next.js (Node.js хостинг)
- Хостинг с поддержкой Node.js
- Настроенные переменные окружения

## Быстрый старт

### Для разработчика (локально)
1. Клонировать репозиторий: `git clone https://github.com/lutyi2856/headless-wp-nextjs.git`
2. Перейти в директорию: `cd headless-wp-nextjs`
3. Скопировать `env.example` → `.env` и настроить переменные
4. Запустить Docker: `docker-compose up -d`
5. Установить зависимости Next.js: `cd nextjs && npm install`
6. Запустить Next.js: `npm run dev`

### Для менеджера
См. [MANAGER-SETUP.md](MANAGER-SETUP.md) для подробных инструкций.

### Для production
- **WordPress**: См. [HOSTING-SETUP.md](HOSTING-SETUP.md)

## Workflow синхронизации

### Разработка
1. Создать feature ветку: `git checkout -b feature/название`
2. Внести изменения
3. Коммитить: `git commit -m "Описание изменений"`
4. Push: `git push origin feature/название`
5. Создать Pull Request в GitHub
6. После ревью: merge в `main`

### Деплой на production
- **WordPress**: Обновление через Git pull или FTP загрузку

## Переменные окружения

### Локально (Docker)
См. `env.example` для списка переменных.

### Production WordPress
- `DB_NAME` - имя базы данных
- `DB_USER` - пользователь БД
- `DB_PASSWORD` - пароль БД
- `DB_HOST` - хост БД (обычно `localhost`)
- `WP_DEBUG` - режим отладки (false для production)

## Безопасность

- Никогда не коммитить реальные пароли в Git
- Использовать `.env.example` для шаблонов
- На production использовать переменные окружения
- Настроить SSL/HTTPS для всех окружений
- Регулярно обновлять зависимости

## Поддержка

При возникновении проблем:
1. Проверить документацию в папке `docs/`
2. Проверить логи Docker: `docker-compose logs`
3. Проверить настройки переменных окружения
4. Обратиться к команде разработки

