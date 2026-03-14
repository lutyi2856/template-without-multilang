# Database backup

`template-snapshot.sql` — дамп БД WordPress (MariaDB) для восстановления темплейта.

Восстановление: `docker exec -i wp-new-db mysql -u wp_user -pwp_password wp_new < db-backup/template-snapshot.sql`
