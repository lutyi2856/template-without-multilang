#!/bin/bash
set -e
VPS_IP="$1"
DB_NAME_REMOTE="$2"
DB_ROOT_PASSWORD="${3:-root_password}"
WP_URL="http://${VPS_IP}:8002"
NEXTJS_URL="http://${VPS_IP}:3000"

echo '=== [3/5] Replacing URLs ==='
sed -i "s|http://localhost:8002|${WP_URL}|g" /tmp/local_db.sql
sed -i "s|http://localhost:3000|${NEXTJS_URL}|g" /tmp/local_db.sql

echo '=== [4/5] Drop/Create DB ==='
cd /opt/wp-nextjs || exit 1
[ -f .env.production ] && set -a && source .env.production && set +a
ROOT_PASS="${DB_ROOT_PASSWORD:-root_password}"

docker exec wp-new-db mariadb -u root -p"$ROOT_PASS" -e "DROP DATABASE IF EXISTS ${DB_NAME_REMOTE}; CREATE DATABASE ${DB_NAME_REMOTE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo '=== [5/5] Importing ==='
docker exec -i wp-new-db mariadb -u root -p"$ROOT_PASS" --default-character-set=utf8mb4 "$DB_NAME_REMOTE" < /tmp/local_db.sql

echo '=== Verifying ==='
docker exec wp-new-db mariadb -u root -p"$ROOT_PASS" "$DB_NAME_REMOTE" -e "SELECT option_value FROM wp_options WHERE option_name IN ('siteurl','home') LIMIT 2;"
echo '=== Done ==='
