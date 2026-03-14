#!/bin/bash
set -e
cd /opt/wp-nextjs

echo "=== Stopping Next.js container ==="
docker compose -f docker-compose.production.yml -f /tmp/override.yml stop nextjs

echo ""
echo "=== Rebuilding Next.js with --no-cache ==="
docker compose -f docker-compose.production.yml -f /tmp/override.yml build --no-cache nextjs

echo ""
echo "=== Starting Next.js container ==="
docker compose -f docker-compose.production.yml -f /tmp/override.yml up -d nextjs

echo ""
echo "=== Waiting for startup ==="
sleep 5

echo ""
echo "=== Checking container logs ==="
docker logs --tail 20 wp-new-nextjs

echo ""
echo "=== Done! ==="
