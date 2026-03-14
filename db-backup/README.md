# Database backup

`template-snapshot.sql` — дамп БД WordPress (MariaDB) для восстановления темплейта.

Восстановление: `docker exec -i wp-new-db mysql -u wp_user -pwp_password wp_new < db-backup/template-snapshot.sql`

## Полный Docker-бэкап (Release)

Полный бэкап (db.sql, wp-content.tar.gz, wp-config.php):  
https://github.com/lutyi2856/template-without-multilang/releases/tag/v1.0.0-docker-backup

Скачать файлы и восстановить wp-content в volume при необходимости.
