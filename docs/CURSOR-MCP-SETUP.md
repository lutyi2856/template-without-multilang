# Настройка WordPress MCP в Cursor

## ✅ Статус

- **WordPress MCP плагин**: Установлен и активирован (версия 0.2.5)
- **WP-CLI**: Установлен в контейнере
- **WordPress URL**: http://localhost:8002

## 📋 Конфигурация для Cursor

### Шаг 1: Откройте настройки Cursor

1. Нажмите `Ctrl + ,` (или `Cmd + ,` на Mac)
2. Найдите раздел **"MCP"** или **"Model Context Protocol"**
3. Или откройте файл настроек напрямую

### Шаг 2: Добавьте конфигурацию

Скопируйте содержимое файла `cursor-mcp-config.json` в настройки MCP Cursor:

```json
{
  "mcpServers": {
    "wordpress-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@automattic/mcp-wordpress-remote@latest"
      ],
      "env": {
        "WP_API_URL": "http://localhost:8002",
        "JWT_TOKEN": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDIiLCJpYXQiOjE3NjYyMTczNjcsImV4cCI6MTc2NjIyNDU2NywidXNlcl9pZCI6MSwianRpIjoiNnZlejVmT2twNjJ3SkhRVGttRUZ4cVp1ZXVmZ05xcEoifQ.gtxOGSlOuokOrAFZGlmUmKH3oK-9IjiTPz9LesiM7Og",
        "LOG_FILE": "D:\\template\\wordpress-mcp.log"
      }
    }
  }
}
```

### Шаг 3: Проверьте токен

⚠️ **Важно**: JWT токены истекают через 2 часа (по умолчанию).

Если токен истек:
1. Откройте WordPress админку: http://localhost:8002/wp-admin
2. Перейдите в **Settings → MCP → Authentication Tokens**
3. Создайте новый токен (можно на 24 часа)
4. Обновите `JWT_TOKEN` в конфигурации Cursor

### Шаг 4: Перезапустите Cursor

После добавления конфигурации:
1. Сохраните настройки
2. Полностью перезапустите Cursor (закройте и откройте заново)
3. Дождитесь подключения к MCP серверу

## 🔍 Проверка подключения

После перезапуска Cursor вы должны увидеть:
- **Resources** - ресурсы WordPress (посты, страницы, пользователи и т.д.)
- **Tools** - инструменты для работы с WordPress
- **Prompts** - готовые промпты для работы

## 🛠️ Полезные команды через WP-CLI

Теперь вы можете использовать WP-CLI в контейнере:

```bash
# Список плагинов
docker-compose exec wordpress-new wp plugin list --allow-root --path=/var/www/html

# Активировать плагин
docker-compose exec wordpress-new wp plugin activate plugin-name --allow-root --path=/var/www/html

# Список постов
docker-compose exec wordpress-new wp post list --allow-root --path=/var/www/html

# Создать новый токен (через админку WordPress)
# Settings → MCP → Authentication Tokens → Generate New Token
```

## ❌ Troubleshooting

### Проблема: Нет ресурсов/инструментов в Cursor

**Решения:**
1. Проверьте, что токен не истек (создайте новый)
2. Убедитесь, что WordPress доступен: http://localhost:8002
3. Проверьте логи: `D:\template\wordpress-mcp.log`
4. Перезапустите Cursor полностью
5. Проверьте, что Node.js и npx установлены на вашей системе

### Проблема: Ошибка подключения

**Решения:**
1. Убедитесь, что контейнер WordPress запущен: `docker-compose ps`
2. Проверьте, что плагин WordPress MCP активирован
3. Проверьте URL в конфигурации: `http://localhost:8002` (не `https://`)
4. Создайте новый токен в WordPress админке

## 📝 Текущий токен

Токен в конфигурации:
- **Выдан**: 20.12.2025 (iat: 1766217367)
- **Истекает**: через 2 часа после выдачи (exp: 1766224567)
- **Статус**: Может быть истек, если прошло более 2 часов

**Рекомендация**: Создайте новый токен на 24 часа для стабильной работы.

