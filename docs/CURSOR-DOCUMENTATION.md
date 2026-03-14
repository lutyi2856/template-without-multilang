# Документация проекта для Cursor

## 📋 Обзор проекта

Headless WordPress + Next.js проект с использованием Faust.js для интеграции.

## 🏗️ Архитектура

- **WordPress**: Docker контейнер на порту 8002 (CMS)
- **Next.js**: Frontend приложение на порту 3000
- **Faust.js**: Интеграция между WordPress и Next.js
- **WPGraphQL**: GraphQL API для WordPress
- **FaustWP**: Плагин WordPress для превью и аутентификации

## 📁 Структура проекта

```
template/
├── docker-compose.yml          # Docker конфигурация
├── Dockerfile.wordpress        # Кастомный образ WordPress с WP-CLI
├── nextjs/                     # Next.js приложение
│   ├── src/app/               # App Router структура
│   ├── faust.config.js        # Конфигурация Faust.js
│   ├── next.config.js         # Конфигурация Next.js
│   ├── package.json           # Зависимости
│   └── .env.local             # Переменные окружения (создать!)
├── wp-content/                 # WordPress контент
│   └── mu-plugins/            # Must-use плагины
├── php/                       # PHP конфигурация
│   └── php.ini                # Настройки PHP (upload_max_filesize и т.д.)
├── db-init/                   # Инициализация БД
│   └── init.sql               # SQL скрипт с utf8mb4
└── scripts/                   # Вспомогательные скрипты
```

## 🔧 Установленные компоненты

### WordPress плагины:
- ✅ **WPGraphQL** (2.5.4) - GraphQL API
- ✅ **FaustWP** (1.8.0) - Интеграция с Next.js
- ✅ **WPGraphQL ACF** (2.4.1) - GraphQL для ACF
- ✅ **WordPress MCP** (0.2.5) - MCP сервер для Cursor
- ✅ **Advanced Custom Fields Pro** (6.5.1)
- ✅ **Rank Math SEO** (1.0.260)
- ✅ **Rank Math SEO Pro** (3.0.103)
- ✅ **Cyr2Lat** (6.6.0)

### Темы:
- ✅ **Headless Theme** (1.0) - Кастомная тема для headless

### Next.js зависимости:
- ✅ **@faustwp/core** - Основной пакет Faust.js
- ✅ **@faustwp/cli** - CLI инструменты
- ✅ **next** (14.0.0) - Next.js фреймворк
- ✅ **react** (18.2.0) - React библиотека

## 🔑 Ключи и секреты

### FaustWP:
- **Secret Key**: `3e42bfd3-7b92-4a0b-8a55-6987f5fb1312`
- **Preview Secret**: Получить из WordPress: Settings → Faust

### WordPress MCP:
- **JWT Token**: Генерируется в WordPress: Settings → MCP → Authentication Tokens
- **URL**: http://localhost:8002

## 🌐 Endpoints

- **WordPress**: http://localhost:8002
- **WordPress Admin**: http://localhost:8002/wp-admin
- **GraphQL**: http://localhost:8002/graphql
- **GraphiQL IDE**: http://localhost:8002/wp-admin/admin.php?page=graphiql-ide
- **Next.js**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8082
- **MariaDB**: localhost:3308

## 🛠️ Полезные команды

### Docker:
```bash
# Запуск контейнеров
docker-compose up -d

# Остановка
docker-compose down

# Логи
docker-compose logs -f wordpress-new

# Перезапуск
docker-compose restart wordpress-new
```

### WordPress (WP-CLI):
```bash
# Список плагинов
docker-compose exec wordpress-new wp plugin list --allow-root --path=/var/www/html

# Активировать плагин
docker-compose exec wordpress-new wp plugin activate plugin-name --allow-root --path=/var/www/html

# Список тем
docker-compose exec wordpress-new wp theme list --allow-root --path=/var/www/html

# Список постов
docker-compose exec wordpress-new wp post list --allow-root --path=/var/www/html
```

### Next.js:
```bash
# Установка зависимостей
cd nextjs && npm install

# Разработка
npm run dev

# Сборка
npm run build

# Продакшн
npm start
```

## 📚 Документация

Все документы проекта находятся в корне проекта:

- **README.md** - Основная документация Docker окружения
- **FAUST-SETUP.md** - Полная инструкция по настройке Faust.js
- **CURSOR-MCP-SETUP.md** - Настройка WordPress MCP для Cursor
- **QUICK-START.md** - Быстрый старт
- **SECURITY.md** - Руководство по безопасности
- **DEVELOPMENT-WORKFLOW.md** - Workflow для разработки
- **SSL-FIX-README.md** - Исправление SSL соединения
- **CURSOR-DOCUMENTATION.md** - Этот файл

## 🔄 Workflow разработки

1. **WordPress**: Создавайте контент в админке
2. **GraphQL**: Используйте GraphQL для получения данных
3. **Next.js**: Разрабатывайте фронтенд с Faust.js
4. **Превью**: Используйте Preview в WordPress для просмотра на Next.js

## ⚙️ Настройки

### PHP (php/php.ini):
- `upload_max_filesize = 64M`
- `post_max_size = 64M`
- `max_execution_time = 300`
- `memory_limit = 256M`

### База данных:
- Кодировка: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- Порт: `3308`

### Docker:
- WordPress порт: `8002`
- MariaDB порт: `3308`
- phpMyAdmin порт: `8082`

## 🐛 Troubleshooting

### Проблемы с Faust.js:
- Проверьте `.env.local` файл
- Убедитесь, что Secret Key правильный
- Проверьте, что WordPress доступен

### Проблемы с GraphQL:
- Убедитесь, что WPGraphQL активирован
- Проверьте endpoint: http://localhost:8002/graphql

### Проблемы с превью:
- Проверьте Preview Secret в `.env.local`
- Убедитесь, что Next.js запущен
- Проверьте настройки FaustWP в WordPress

## 📝 Заметки

- Все плагины и темы синхронизированы между контейнерами
- WP-CLI установлен в контейнере для удобной работы
- CA сертификаты установлены для SSL соединений
- Must-use плагин для исправления SSL проблем

