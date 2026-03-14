# Исправление SSL соединения для WordPress

## Проблема
При попытке установить плагины из WordPress.org возникает ошибка:
```
Не удалось установить защищённое соединение с WordPress.org
```

## Решение

Было реализовано два подхода:

### 1. Установка CA сертификатов
Создан кастомный Dockerfile (`Dockerfile.wordpress`), который устанавливает и обновляет CA сертификаты в контейнере WordPress.

### 2. WordPress фильтры для отключения проверки SSL
Создан must-use плагин (`wp-content/mu-plugins/fix-ssl.php`), который:
- Отключает проверку SSL сертификатов для WordPress.org API
- Отключает проверку SSL для HTTP запросов
- Автоматически загружается WordPress (mu-plugins загружаются автоматически)

## Важно!

⚠️ **Это решение предназначено ТОЛЬКО для локальной разработки!**

В продакшене:
- НЕ используйте отключение проверки SSL
- Убедитесь, что CA сертификаты установлены правильно
- Используйте правильные DNS настройки

## Проверка

После перезапуска контейнера попробуйте:
1. Открыть админку WordPress
2. Перейти в "Плагины" → "Добавить новый"
3. Попробовать установить плагин

Если проблема сохраняется:
1. Проверьте логи: `docker-compose logs wordpress-new`
2. Убедитесь, что плагин загружен: `docker-compose exec wordpress-new ls /var/www/html/wp-content/mu-plugins/`
3. Проверьте CA сертификаты: `docker-compose exec wordpress-new ls /etc/ssl/certs/`

## Откат изменений

Если нужно вернуться к стандартному образу:
1. В `docker-compose.yml` замените `build:` на `image: wordpress:latest`
2. Удалите `Dockerfile.wordpress`
3. Удалите `wp-content/mu-plugins/fix-ssl.php`
4. Пересоберите контейнер: `docker-compose up -d --build wordpress-new`

