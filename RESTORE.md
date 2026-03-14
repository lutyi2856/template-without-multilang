# Восстановление темплейта

1. `git clone https://github.com/lutyi2856/template-without-multilang.git`
2. `cd template-without-multilang`
3. `docker compose up -d`
4. Восстановить БД: `docker exec -i wp-new-db mysql -u wp_user -pwp_password wp_new < db-backup/template-snapshot.sql`
5. `cd nextjs && npm install && npm run dev`
