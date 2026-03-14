#!/bin/bash
set -e

DB_ROOT_PASS="SUm8JElq7oEUmbdJkpSkV8Kn"
DB_NAME="wp_production"
DB_USER="wp_user"
DB_PASS="c8rKcyVlBTx5GPs2YbapkkJV"

echo "=== Dropping and recreating database ==="
docker exec wp-new-db mariadb -u root -p"$DB_ROOT_PASS" -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "=== Granting privileges ==="
docker exec wp-new-db mariadb -u root -p"$DB_ROOT_PASS" -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%'; FLUSH PRIVILEGES;"

echo "=== Importing database (UTF-8) ==="
docker exec -i wp-new-db mariadb -u root -p"$DB_ROOT_PASS" --default-character-set=utf8mb4 $DB_NAME < /tmp/local_db_direct.sql

echo "=== Verifying import ==="
docker exec wp-new-db mariadb -u root -p"$DB_ROOT_PASS" $DB_NAME -e "SELECT post_title FROM wp_posts WHERE post_type='nav_menu_item' AND post_title != '' LIMIT 5;"

echo "=== Done ==="
