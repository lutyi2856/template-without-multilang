# WordPress плагины для боевого сайта (headless)

> Список обязательных и рекомендуемых плагинов WPGraphQL для production окружения.
> Дата: 2026-02-10

## Обязательные

### wp-graphql-tax-query

**Назначение:** добавляет поддержку `taxQuery` в GraphQL-запросы — фильтрация по таксономиям (специализации врачей, категории услуг и т.д.).

**Без плагина:** фильтры врачей по специализации и клинике не работают.

**Ссылки:**
- [WPGraphQL Extensions — Tax Query](https://www.wpgraphql.com/extension-plugins/wpgraphql-tax-query)
- [GitHub](https://github.com/wp-graphql/wp-graphql-tax-query)

**Настройки:** не требуются, работает после активации.

---

## Рекомендуемые

### WPGraphQL Smart Cache

**Назначение:** кэширование GraphQL-ответов, автоматическая инвалидация при изменении контента. Снижает нагрузку на WordPress и ускоряет API.

**Полезно для:** headless-сайтов с частыми запросами (врачи, услуги, страницы).

**Ссылки:**
- [WordPress.org](https://wordpress.org/plugins/wpgraphql-smart-cache)
- [WPGraphQL — Introducing Smart Cache](https://wpgraphql.com/2022/12/20/introducing-wpgraphql-smart-cache)
- [GitHub](https://github.com/wp-graphql/wp-graphql-smart-cache)

---

## Для разработки (опционально)

### WPGraphQL IDE

**Назначение:** GraphQL IDE в админке WordPress — тестирование запросов, просмотр схемы, отладка.

**Когда ставить:** при активной разработке и отладке GraphQL-запросов. На боевом сайте не обязателен.

**Ссылки:**
- [WPGraphQL Extensions](https://www.wpgraphql.com/extensions)

---

## Список Extensions WPGraphQL

Полный каталог плагинов: [wpgraphql.com/extensions](https://www.wpgraphql.com/extensions)

---

## Чеклист перед деплоем

- [ ] wp-graphql-tax-query установлен и активен
- [ ] WPGraphQL Smart Cache установлен (рекомендуется)
- [ ] Проверена работа фильтров на странице /doctors
- [ ] Проверена работа фильтра по клиникам
